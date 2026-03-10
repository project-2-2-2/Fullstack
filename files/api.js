// ─── API Base ─────────────────────────────────────────────────────────────────
const API_BASE = '/api';

// ─── Token helpers ────────────────────────────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('tm_token'),
  getUser:  () => {
    try { return JSON.parse(localStorage.getItem('tm_user')); } catch { return null; }
  },
  setSession: (token, user) => {
    localStorage.setItem('tm_token', token);
    localStorage.setItem('tm_user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
  },
  isLoggedIn: () => !!localStorage.getItem('tm_token'),
  requireAuth: () => {
    if (!Auth.isLoggedIn()) {
      window.location.href = '/';
    }
  },
  redirectIfLoggedIn: () => {
    if (Auth.isLoggedIn()) {
      window.location.href = '/dashboard';
    }
  }
};

// ─── API Request Helper ───────────────────────────────────────────────────────
async function apiRequest(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body && method !== 'GET') config.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (res.status === 401) {
    Auth.clearSession();
    if (!window.location.pathname.includes('index') && window.location.pathname !== '/') {
      window.location.href = '/?expired=1';
    }
  }

  return { ok: res.ok, status: res.status, data };
}

const api = {
  get:    (ep)         => apiRequest('GET',    ep),
  post:   (ep, body)   => apiRequest('POST',   ep, body),
  put:    (ep, body)   => apiRequest('PUT',    ep, body),
  patch:  (ep, body)   => apiRequest('PATCH',  ep, body),
  delete: (ep, body)   => apiRequest('DELETE', ep, body)
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ'}</span>
    <span class="toast-msg">${msg}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateInput(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(dateStr);
}

function statusBadge(status) {
  const map = {
    'todo':        ['badge-todo',        'TODO'],
    'in-progress': ['badge-inprogress',  'IN PROGRESS'],
    'review':      ['badge-review',      'REVIEW'],
    'done':        ['badge-done',        'DONE']
  };
  const [cls, label] = map[status] || ['badge-todo', status.toUpperCase()];
  return `<span class="badge ${cls}">${label}</span>`;
}

function priorityBadge(priority) {
  const map = {
    'low':      ['badge-low',      '▽ LOW'],
    'medium':   ['badge-medium',   '◇ MEDIUM'],
    'high':     ['badge-high',     '△ HIGH'],
    'critical': ['badge-critical', '▲ CRITICAL']
  };
  const [cls, label] = map[priority] || ['badge-medium', priority.toUpperCase()];
  return `<span class="badge ${cls}">${label}</span>`;
}

function getInitials(name) {
  return (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Populate nav user info ───────────────────────────────────────────────────
function populateNavUser() {
  const user = Auth.getUser();
  if (!user) return;

  const nameEl = document.getElementById('nav-user-name');
  const roleEl = document.getElementById('nav-user-role');
  const avatarEl = document.getElementById('nav-avatar');
  const topbarUserEl = document.getElementById('topbar-user');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role;
  if (avatarEl) {
    if (user.avatar) {
      avatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
    } else {
      avatarEl.textContent = getInitials(user.name);
    }
  }
  if (topbarUserEl) topbarUserEl.textContent = user.name;
}

// ─── Active nav link ──────────────────────────────────────────────────────────
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && path.includes(href.replace('/', ''))) {
      item.classList.add('active');
    }
  });
}

// ─── Mobile sidebar toggle ────────────────────────────────────────────────────
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  if (!hamburger || !sidebar) return;

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== hamburger) {
      sidebar.classList.remove('open');
    }
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────
async function logout() {
  try { await api.post('/auth/logout'); } catch {}
  Auth.clearSession();
  window.location.href = '/';
}
