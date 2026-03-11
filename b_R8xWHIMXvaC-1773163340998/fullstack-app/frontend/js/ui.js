// Update navbar based on authentication
const updateNavbar = () => {
  const user = getCurrentUser();
  const navbarMenu = document.getElementById('navbar-menu');

  if (!navbarMenu) return;

  navbarMenu.innerHTML = '';

  if (isAuthenticated()) {
    const isAdmin = user && user.role === 'admin';
    navbarMenu.innerHTML = `
      <a href="index.html">Home</a>
      <a href="dashboard.html">Dashboard</a>
      ${isAdmin ? `<a href="users.html">Users</a>` : ''}
      <a href="posts.html">Posts</a>
      <a href="products.html">Products</a>
      <a href="tasks.html">Tasks</a>
      <a href="reports.html">Reports</a>
      <a href="profile.html">Profile</a>
      <a href="about.html">About</a>
      <button class="logout-btn" onclick="logoutUser()">Logout</button>
    `;
  } else {
    navbarMenu.innerHTML = `
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
    `;
  }
};

// Create user row in table
const createUserRow = (user, currentUserId) => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${user._id}</td>
    <td>${user.name}</td>
    <td>${user.email}</td>
    <td>${user.phone || 'N/A'}</td>
    <td>${user.role}</td>
    <td>
      <div class="action-buttons">
        <button class="btn btn-primary btn-small" onclick="openEditUserModal('${user._id}')">Edit</button>
        ${currentUserId === user._id || getCurrentUser().role === 'admin' ? `<button class="btn btn-danger btn-small" onclick="deleteUser('${user._id}')">Delete</button>` : ''}
      </div>
    </td>
  `;
  return row;
};

// Create post row in table
const createPostRow = (post, currentUserId) => {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${post._id}</td>
    <td>${post.title}</td>
    <td>${post.author.name}</td>
    <td>${post.status}</td>
    <td>${post.views}</td>
    <td>${post.likes}</td>
    <td>
      <div class="action-buttons">
        <button class="btn btn-primary btn-small" onclick="openEditPostModal('${post._id}')">Edit</button>
        ${currentUserId === post.author._id || getCurrentUser().role === 'admin' ? `<button class="btn btn-danger btn-small" onclick="deletePost('${post._id}')">Delete</button>` : ''}
      </div>
    </td>
  `;
  return row;
};

// Create post card
const createPostCard = (post) => {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.innerHTML = `
    <h3>${post.title}</h3>
    <div class="post-meta">
      <span>By ${post.author.name}</span> | 
      <span>${new Date(post.createdAt).toLocaleDateString()}</span>
    </div>
    <p>${post.description}</p>
    <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: #7f8c8d;">
      <span>Views: ${post.views}</span>
      <span>Likes: ${post.likes}</span>
    </div>
  `;
  return card;
};

// Format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Show loading spinner
const showLoader = () => {
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.className = 'spinner';
  document.body.appendChild(loader);
};

// Hide loading spinner
const hideLoader = () => {
  const loader = document.getElementById('loader');
  if (loader) loader.remove();
};

// Escape HTML
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

// Trim text to length
const truncateText = (text, length = 100) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Initialize color changing element
const initColorChange = () => {
  const element = document.querySelector('.color-change');
  if (element) {
    element.addEventListener('click', function() {
      const colors = ['#3498db', '#e74c3c', '#27ae60', '#f39c12'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      this.style.backgroundColor = randomColor;
    });
  }
};

// Initialize moving box
const initMovingBox = () => {
  const box = document.querySelector('.moving-box');
  if (box) {
    box.addEventListener('click', function() {
      this.style.animationPlayState = this.style.animationPlayState === 'paused' ? 'running' : 'paused';
    });
  }
};

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', function() {
  updateNavbar();
  initColorChange();
  initMovingBox();
});
