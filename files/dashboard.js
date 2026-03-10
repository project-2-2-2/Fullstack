// ─── Auth guard ───────────────────────────────────────────────────────────────
Auth.requireAuth();

// ─── State ────────────────────────────────────────────────────────────────────
let state = {
  currentSection: 'dashboard',
  tasks: [],
  stats: null,
  pagination: { page: 1, pages: 1, total: 0, limit: 10 },
  sort: { field: 'createdAt', order: 'desc' },
  deleteTarget: null,
  selectedIds: new Set()
};

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populateNavUser();
  setActiveNav();
  initMobileNav();
  setGreeting();

  // Route by hash
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  showSection(hash);

  // Hash change
  window.addEventListener('hashchange', () => {
    const sec = window.location.hash.replace('#', '') || 'dashboard';
    showSection(sec);
  });

  // Global search debounce
  let searchTimer;
  document.getElementById('global-search').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (state.currentSection === 'tasks') loadTasks();
    }, 400);
  });

  // Progress range → fill bar
  document.getElementById('task-progress').addEventListener('input', function() {
    document.getElementById('modal-progress-fill').style.width = this.value + '%';
  });

  loadStats();
});

// ─── Section routing ──────────────────────────────────────────────────────────
function showSection(sec) {
  const sections = { dashboard: 'sec-dashboard', tasks: 'sec-tasks', analytics: 'sec-analytics', embed: 'sec-embed' };
  const titles   = { dashboard: 'Dashboard', tasks: 'Tasks', analytics: 'Analytics', embed: 'Embed View' };

  Object.values(sections).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const target = sections[sec] || 'sec-dashboard';
  const el = document.getElementById(target);
  if (el) el.style.display = 'block';

  state.currentSection = sec || 'dashboard';
  document.getElementById('section-title').textContent = titles[sec] || 'Dashboard';

  // Update active nav
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const activeNav = document.getElementById('nav-' + sec);
  if (activeNav) activeNav.classList.add('active');

  // Lazy-load section data
  if (sec === 'tasks') loadTasks();
  if (sec === 'analytics') loadAnalytics();
  if (sec === 'dashboard') loadStats();
}

function setGreeting() {
  const h = new Date().getHours();
  const el = document.getElementById('greeting-time');
  if (el) el.textContent = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

// ─── Stats ────────────────────────────────────────────────────────────────────
async function loadStats() {
  try {
    const { ok, data } = await api.get('/tasks/stats');
    if (!ok) return;
    state.stats = data.data;
    renderStats(data.data);
    renderRecentTasks(data.data.recent);
    renderPriorityChart(data.data.byPriority);
    renderStatusBoard(data.data.byStatus);

    // Badge
    const badge = document.getElementById('task-count-badge');
    if (badge) badge.textContent = data.data.total;
  } catch (err) {
    console.error('Stats error:', err);
  }
}

function renderStats(s) {
  document.getElementById('stat-total').textContent   = s.total;
  document.getElementById('stat-progress').textContent = s.byStatus['in-progress'] || 0;
  document.getElementById('stat-done').textContent    = s.byStatus['done'] || 0;
  document.getElementById('stat-overdue').textContent = s.overdue;
}

function renderRecentTasks(recent) {
  const el = document.getElementById('recent-tasks-list');
  if (!recent || recent.length === 0) {
    el.innerHTML = '<p style="padding:20px; text-align:center; color:var(--text3); font-size:0.8rem;">No tasks yet.</p>';
    return;
  }
  el.innerHTML = `
    <table style="width:100%;">
      <thead><tr>
        <th>Title</th>
        <th>Status</th>
        <th>Priority</th>
      </tr></thead>
      <tbody>
        ${recent.map(t => `
          <tr onclick="openEditModal('${t._id}')" style="cursor:pointer;">
            <td style="font-weight:600; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${escHtml(t.title)}
            </td>
            <td>${statusBadge(t.status)}</td>
            <td>${priorityBadge(t.priority)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderPriorityChart(byPriority) {
  const el = document.getElementById('priority-chart');
  const total = Object.values(byPriority).reduce((a, b) => a + b, 0);
  if (total === 0) {
    el.innerHTML = '<p style="text-align:center; color:var(--text3); font-size:0.8rem;">No data yet.</p>';
    return;
  }
  const colors = { low: 'var(--text3)', medium: 'var(--info)', high: 'var(--warning)', critical: 'var(--danger)' };
  el.innerHTML = Object.entries(byPriority).map(([k, v]) => {
    const pct = total > 0 ? Math.round((v / total) * 100) : 0;
    return `
      <div style="margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; font-family:var(--mono); font-size:0.7rem; margin-bottom:5px;">
          <span style="color:${colors[k] || 'var(--text)'}; text-transform:uppercase;">${k}</span>
          <span style="color:var(--text3);">${v} (${pct}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%; background:${colors[k] || 'var(--accent)'};"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderStatusBoard(byStatus) {
  const el = document.getElementById('status-board');
  const labels = { todo: 'Todo', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
  const colors = { todo: 'var(--text3)', 'in-progress': 'var(--info)', review: 'var(--warning)', done: 'var(--success)' };
  el.innerHTML = Object.entries(labels).map(([k, label]) => `
    <div style="background:var(--bg3); border:1px solid var(--border); border-radius:var(--radius); padding:16px; text-align:center; cursor:pointer;"
         onclick="filterByStatus('${k}')">
      <div style="font-size:1.6rem; font-weight:800; font-family:var(--mono); color:${colors[k]};">${byStatus[k] || 0}</div>
      <div style="font-size:0.68rem; font-family:var(--mono); color:var(--text3); text-transform:uppercase; margin-top:4px;">${label}</div>
    </div>
  `).join('');
}

function filterByStatus(status) {
  document.getElementById('filter-status').value = status;
  showSection('tasks');
  window.location.hash = 'tasks';
}

// ─── Tasks Table ──────────────────────────────────────────────────────────────
async function loadTasks(page) {
  if (page !== undefined) state.pagination.page = page;

  const status   = document.getElementById('filter-status')?.value   || '';
  const priority = document.getElementById('filter-priority')?.value || '';
  const category = document.getElementById('filter-category')?.value || '';
  const limit    = document.getElementById('filter-limit')?.value    || 10;
  const search   = document.getElementById('global-search')?.value   || '';

  state.pagination.limit = parseInt(limit);

  const params = new URLSearchParams({
    page:      state.pagination.page,
    limit:     state.pagination.limit,
    sortBy:    state.sort.field,
    sortOrder: state.sort.order
  });
  if (status)   params.set('status', status);
  if (priority) params.set('priority', priority);
  if (category) params.set('category', category);
  if (search)   params.set('search', search);

  const tbody = document.getElementById('tasks-tbody');
  tbody.innerHTML = '<tr><td colspan="9" class="table-empty"><div class="spinner" style="margin:0 auto;"></div></td></tr>';

  try {
    const { ok, data } = await api.get(`/tasks?${params}`);
    if (!ok) { showToast(data.message || 'Failed to load tasks.', 'error'); return; }

    state.tasks = data.data;
    state.pagination = data.pagination;
    state.selectedIds.clear();
    updateBulkDeleteBtn();
    renderTasksTable(data.data);
    renderPagination(data.pagination);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="9" class="table-empty">Network error. Is the server running?</td></tr>';
  }
}

function renderTasksTable(tasks) {
  const tbody = document.getElementById('tasks-tbody');
  const total = state.pagination.total;
  const limit = state.pagination.limit;
  const page  = state.pagination.page;

  document.getElementById('task-total-label').textContent = `${total} task${total !== 1 ? 's' : ''}`;
  document.getElementById('pagination-info').textContent =
    `Showing ${Math.min((page-1)*limit+1, total)}–${Math.min(page*limit, total)} of ${total}`;

  if (tasks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="table-empty">No tasks found. Create your first task!</td></tr>';
    return;
  }

  tbody.innerHTML = tasks.map(t => {
    const isOverdue = t.dueDate && t.status !== 'done' && new Date() > new Date(t.dueDate);
    const dueCls    = isOverdue ? 'text-danger' : '';
    return `
      <tr id="row-${t._id}" class="${state.selectedIds.has(t._id) ? 'selected' : ''}">
        <td><input type="checkbox" class="row-check" onchange="toggleRowSelect(this,'${t._id}')"
            ${state.selectedIds.has(t._id) ? 'checked' : ''}></td>
        <td>
          <div style="font-weight:600; max-width:200px;">
            ${escHtml(t.title)}
            ${t.tags && t.tags.length ? `<div style="margin-top:4px;">${t.tags.map(tag => `<span class="tag">${escHtml(tag)}</span>`).join(' ')}</div>` : ''}
          </div>
        </td>
        <td>${statusBadge(t.status)}</td>
        <td>${priorityBadge(t.priority)}</td>
        <td><span style="font-family:var(--mono); font-size:0.72rem; color:var(--text3); text-transform:uppercase;">${t.category}</span></td>
        <td class="${dueCls}" style="font-family:var(--mono); font-size:0.78rem;">
          ${t.dueDate ? formatDate(t.dueDate) : '—'}
          ${isOverdue ? '<br><span class="badge badge-overdue">OVERDUE</span>' : ''}
        </td>
        <td style="min-width:100px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <div class="progress-bar" style="flex:1;">
              <div class="progress-fill" style="width:${t.progress || 0}%;"></div>
            </div>
            <span style="font-family:var(--mono); font-size:0.65rem; color:var(--text3); min-width:28px;">${t.progress || 0}%</span>
          </div>
        </td>
        <td style="font-family:var(--mono); font-size:0.72rem; color:var(--text3);">${timeAgo(t.createdAt)}</td>
        <td>
          <div style="display:flex; gap:4px;">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="openEditModal('${t._id}')" title="Edit">✎</button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="quickStatusCycle('${t._id}','${t.status}')" title="Cycle Status">↻</button>
            <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--danger);" onclick="openDeleteModal('${t._id}')" title="Delete">✕</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function sortBy(field) {
  if (state.sort.field === field) {
    state.sort.order = state.sort.order === 'desc' ? 'asc' : 'desc';
  } else {
    state.sort.field = field;
    state.sort.order = 'desc';
  }

  // Update header icon
  document.querySelectorAll('thead th').forEach(th => th.classList.remove('sorted'));
  event.currentTarget.classList.add('sorted');

  loadTasks(1);
}

function clearFilters() {
  document.getElementById('filter-status').value   = '';
  document.getElementById('filter-priority').value = '';
  document.getElementById('filter-category').value = '';
  document.getElementById('global-search').value   = '';
  state.sort = { field: 'createdAt', order: 'desc' };
  loadTasks(1);
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function renderPagination({ page, pages }) {
  const el = document.getElementById('pagination');
  if (pages <= 1) { el.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="loadTasks(1)" ${page === 1 ? 'disabled' : ''}>«</button>`;
  html += `<button class="page-btn" onclick="loadTasks(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹</button>`;

  const range = 2;
  for (let i = Math.max(1, page - range); i <= Math.min(pages, page + range); i++) {
    html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="loadTasks(${i})">${i}</button>`;
  }

  html += `<button class="page-btn" onclick="loadTasks(${page + 1})" ${page === pages ? 'disabled' : ''}>›</button>`;
  html += `<button class="page-btn" onclick="loadTasks(${pages})" ${page === pages ? 'disabled' : ''}>»</button>`;
  el.innerHTML = html;
}

// ─── Row selection ────────────────────────────────────────────────────────────
function toggleSelectAll(cb) {
  state.tasks.forEach(t => {
    cb.checked ? state.selectedIds.add(t._id) : state.selectedIds.delete(t._id);
    const row = document.getElementById('row-' + t._id);
    if (row) {
      row.classList.toggle('selected', cb.checked);
      const rowCb = row.querySelector('.row-check');
      if (rowCb) rowCb.checked = cb.checked;
    }
  });
  updateBulkDeleteBtn();
}

function toggleRowSelect(cb, id) {
  cb.checked ? state.selectedIds.add(id) : state.selectedIds.delete(id);
  document.getElementById('row-' + id)?.classList.toggle('selected', cb.checked);
  updateBulkDeleteBtn();
}

function updateBulkDeleteBtn() {
  const count = state.selectedIds.size;
  const btn   = document.getElementById('bulk-delete-btn');
  const label = document.getElementById('selected-count');
  btn.style.display = count > 0 ? 'flex' : 'none';
  label.textContent = count > 0 ? `${count} selected` : '';
}

async function bulkDelete() {
  if (state.selectedIds.size === 0) return;
  const msg = document.getElementById('delete-modal-msg');
  msg.textContent = `Delete ${state.selectedIds.size} selected task(s)? This cannot be undone.`;
  state.deleteTarget = '__bulk__';
  document.getElementById('delete-modal-overlay').classList.add('open');
}

// ─── Task Modal ───────────────────────────────────────────────────────────────
function openTaskModal() {
  state.editingId = null;
  document.getElementById('modal-title').textContent = 'New Task';
  document.getElementById('task-form').reset();
  document.getElementById('task-id').value = '';
  document.getElementById('progress-val').textContent = '0';
  document.getElementById('modal-progress-fill').style.width = '0%';
  document.getElementById('modal-alert').innerHTML = '';
  document.getElementById('save-task-btn').textContent = 'Save Task';
  document.getElementById('task-modal-overlay').classList.add('open');
}

async function openEditModal(taskId) {
  // Fetch task data
  try {
    const { ok, data } = await api.get(`/tasks/${taskId}`);
    if (!ok) { showToast(data.message, 'error'); return; }
    const t = data.data;

    document.getElementById('modal-title').textContent = 'Edit Task';
    document.getElementById('task-id').value        = t._id;
    document.getElementById('task-title').value     = t.title;
    document.getElementById('task-desc').value      = t.description || '';
    document.getElementById('task-status').value    = t.status;
    document.getElementById('task-priority').value  = t.priority;
    document.getElementById('task-category').value  = t.category;
    document.getElementById('task-due').value       = formatDateInput(t.dueDate);
    document.getElementById('task-tags').value      = (t.tags || []).join(', ');
    document.getElementById('task-progress').value  = t.progress || 0;
    document.getElementById('progress-val').textContent = t.progress || 0;
    document.getElementById('modal-progress-fill').style.width = (t.progress || 0) + '%';
    document.getElementById('modal-alert').innerHTML = '';
    document.getElementById('save-task-btn').textContent = 'Update Task';
    document.getElementById('task-modal-overlay').classList.add('open');
  } catch (err) {
    showToast('Could not load task.', 'error');
  }
}

function closeTaskModal() {
  document.getElementById('task-modal-overlay').classList.remove('open');
}

async function saveTask() {
  const titleErr = document.getElementById('title-error');
  titleErr.textContent = '';
  document.getElementById('modal-alert').innerHTML = '';

  const title = document.getElementById('task-title').value.trim();
  if (!title) {
    titleErr.textContent = 'Title is required.';
    return;
  }

  const payload = {
    title,
    description: document.getElementById('task-desc').value.trim(),
    status:      document.getElementById('task-status').value,
    priority:    document.getElementById('task-priority').value,
    category:    document.getElementById('task-category').value,
    dueDate:     document.getElementById('task-due').value || null,
    tags:        document.getElementById('task-tags').value,
    progress:    parseInt(document.getElementById('task-progress').value) || 0
  };

  const btn = document.getElementById('save-task-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;"></span>';

  try {
    const id = document.getElementById('task-id').value;
    const { ok, data } = id
      ? await api.put(`/tasks/${id}`, payload)
      : await api.post('/tasks', payload);

    if (ok && data.success) {
      showToast(data.message, 'success');
      closeTaskModal();
      loadTasks();
      loadStats();
    } else {
      document.getElementById('modal-alert').innerHTML = `<div class="alert alert-error">${data.message}</div>`;
    }
  } catch (err) {
    document.getElementById('modal-alert').innerHTML = '<div class="alert alert-error">Network error.</div>';
  } finally {
    btn.disabled = false;
    btn.textContent = document.getElementById('task-id').value ? 'Update Task' : 'Save Task';
  }
}

// Quick status cycle: todo → in-progress → review → done → todo
async function quickStatusCycle(id, current) {
  const cycle = ['todo', 'in-progress', 'review', 'done'];
  const next  = cycle[(cycle.indexOf(current) + 1) % cycle.length];
  const { ok, data } = await api.patch(`/tasks/${id}/status`, { status: next });
  if (ok) {
    showToast(`Status → ${next}`, 'success');
    loadTasks();
    loadStats();
  } else {
    showToast(data.message, 'error');
  }
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function openDeleteModal(id) {
  state.deleteTarget = id;
  document.getElementById('delete-modal-msg').textContent = 'Are you sure you want to delete this task? This cannot be undone.';
  document.getElementById('delete-modal-overlay').classList.add('open');
}

function closeDeleteModal() {
  document.getElementById('delete-modal-overlay').classList.remove('open');
  state.deleteTarget = null;
}

async function confirmDelete() {
  const btn = document.getElementById('confirm-delete-btn');
  btn.disabled = true;

  try {
    if (state.deleteTarget === '__bulk__') {
      const ids = Array.from(state.selectedIds);
      const { ok, data } = await api.delete('/tasks', { ids });
      if (ok) { showToast(data.message, 'success'); state.selectedIds.clear(); updateBulkDeleteBtn(); }
      else showToast(data.message, 'error');
    } else {
      const { ok, data } = await api.delete(`/tasks/${state.deleteTarget}`);
      if (ok) showToast(data.message, 'success');
      else showToast(data.message, 'error');
    }
    loadTasks();
    loadStats();
  } catch (err) {
    showToast('Delete failed.', 'error');
  } finally {
    btn.disabled = false;
    closeDeleteModal();
  }
}

// ─── Analytics ────────────────────────────────────────────────────────────────
async function loadAnalytics() {
  if (!state.stats) {
    const { ok, data } = await api.get('/tasks/stats');
    if (ok) state.stats = data.data;
  }
  if (!state.stats) return;

  renderAnalyticsStatus(state.stats.byStatus);
  renderAnalyticsPriority(state.stats.byPriority);
  renderAnalyticsTable(state.stats);
}

function renderAnalyticsStatus(byStatus) {
  const el = document.getElementById('analytics-status');
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const colors = { todo: 'var(--text3)', 'in-progress': 'var(--info)', review: 'var(--warning)', done: 'var(--success)' };
  const labels = { todo: 'Todo', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
  el.innerHTML = Object.entries(byStatus).map(([k, v]) => {
    const pct = total > 0 ? Math.round((v / total) * 100) : 0;
    return `
      <div style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:6px;">
          <span style="font-weight:600;">${labels[k] || k}</span>
          <span style="font-family:var(--mono); color:var(--text3);">${v} / ${pct}%</span>
        </div>
        <div class="progress-bar" style="height:8px;">
          <div class="progress-fill" style="width:${pct}%; background:${colors[k]};"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderAnalyticsPriority(byPriority) {
  const el = document.getElementById('analytics-priority');
  const total = Object.values(byPriority).reduce((a, b) => a + b, 0);
  const colors = { low: 'var(--text3)', medium: 'var(--info)', high: 'var(--warning)', critical: 'var(--danger)' };
  el.innerHTML = Object.entries(byPriority).map(([k, v]) => {
    const pct = total > 0 ? Math.round((v / total) * 100) : 0;
    return `
      <div style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:6px;">
          <span style="font-weight:600; text-transform:capitalize;">${k}</span>
          <span style="font-family:var(--mono); color:var(--text3);">${v} / ${pct}%</span>
        </div>
        <div class="progress-bar" style="height:8px;">
          <div class="progress-fill" style="width:${pct}%; background:${colors[k]};"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderAnalyticsTable(stats) {
  const tbody = document.getElementById('analytics-tbody');
  const total = stats.total;
  const rows = [
    { label: 'Total Tasks',    count: total,                         color: 'var(--accent)' },
    { label: 'Todo',           count: stats.byStatus.todo,           color: 'var(--text3)' },
    { label: 'In Progress',    count: stats.byStatus['in-progress'], color: 'var(--info)' },
    { label: 'Review',         count: stats.byStatus.review,         color: 'var(--warning)' },
    { label: 'Done',           count: stats.byStatus.done,           color: 'var(--success)' },
    { label: 'Overdue',        count: stats.overdue,                 color: 'var(--danger)' },
    { label: 'Low Priority',   count: stats.byPriority.low,          color: 'var(--text3)' },
    { label: 'Medium Priority',count: stats.byPriority.medium,       color: 'var(--info)' },
    { label: 'High Priority',  count: stats.byPriority.high,         color: 'var(--warning)' },
    { label: 'Critical',       count: stats.byPriority.critical,     color: 'var(--danger)' }
  ];

  tbody.innerHTML = rows.map(r => {
    const pct = total > 0 ? Math.round(((r.count || 0) / total) * 100) : 0;
    return `
      <tr>
        <td style="font-weight:600;">${r.label}</td>
        <td style="font-family:var(--mono); font-weight:700; color:${r.color};">${r.count || 0}</td>
        <td style="font-family:var(--mono); color:var(--text3);">${r.label === 'Total Tasks' ? '100%' : pct + '%'}</td>
        <td style="min-width:140px;">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${r.label === 'Total Tasks' ? 100 : pct}%; background:${r.color};"></div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Embed / iFrame ───────────────────────────────────────────────────────────
function setEmbed(url) {
  document.getElementById('embed-url-input').value = url;
  loadEmbedUrl();
}

function loadEmbedUrl() {
  const url = document.getElementById('embed-url-input').value.trim();
  const height = document.getElementById('embed-height').value || 600;
  if (!url) return;

  const iframe   = document.getElementById('main-iframe');
  const display  = document.getElementById('iframe-url-display');
  const openLink = document.getElementById('iframe-open-link');

  iframe.height  = height;
  iframe.src     = url;
  display.textContent = url;
  openLink.href  = url;
  showToast('Embed loaded.', 'info');
}

function reloadIframe() {
  const iframe = document.getElementById('main-iframe');
  iframe.src   = iframe.src;
}

// ─── Refresh all data ─────────────────────────────────────────────────────────
function refreshData() {
  loadStats();
  if (state.currentSection === 'tasks')     loadTasks();
  if (state.currentSection === 'analytics') loadAnalytics();
  showToast('Data refreshed.', 'info');
}

// ─── Escape HTML ──────────────────────────────────────────────────────────────
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// Close modals on overlay click
document.getElementById('task-modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeTaskModal();
});
document.getElementById('delete-modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeDeleteModal();
});
