let users = [];
let currentEditUserId = null;

// Load all users
const loadUsers = async () => {
  showLoader();
  try {
    const response = await apiUsers.getAll();
    if (response.success) {
      users = response.users;
      displayUsers();
    } else {
      showAlert(response.message || 'Failed to load users', 'danger');
    }
  } catch (error) {
    showAlert('Error loading users: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

// Display users in table
const displayUsers = () => {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const currentUser = getCurrentUser();

  users.forEach(user => {
    const row = createUserRow(user, currentUser.id);
    tbody.appendChild(row);
  });
};

// Delete user
const deleteUser = async (userId) => {
  if (!confirm('Are you sure you want to delete this user?')) return;

  showLoader();
  try {
    const response = await apiUsers.delete(userId);
    if (response.success) {
      showAlert('User deleted successfully', 'success');
      loadUsers();
    } else {
      showAlert(response.message || 'Failed to delete user', 'danger');
    }
  } catch (error) {
    showAlert('Error deleting user: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

// Open edit user modal
const openEditUserModal = (userId) => {
  currentEditUserId = userId;
  const user = users.find(u => u._id === userId);

  if (user) {
    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-email').value = user.email;
    document.getElementById('edit-phone').value = user.phone || '';
    document.getElementById('edit-bio').value = user.bio || '';
    document.getElementById('edit-modal').style.display = 'block';
  }
};

// Close edit modal
const closeEditModal = () => {
  document.getElementById('edit-modal').style.display = 'none';
  currentEditUserId = null;
};

// Save user
const saveUser = async (e) => {
  e.preventDefault();

  const userData = {
    name: document.getElementById('edit-name').value,
    email: document.getElementById('edit-email').value,
    phone: document.getElementById('edit-phone').value,
    bio: document.getElementById('edit-bio').value
  };

  const errors = validateForm(userData);
  if (errors.length > 0) {
    showAlert(errors.join(', '), 'danger');
    return;
  }

  showLoader();
  try {
    const response = await apiUsers.update(currentEditUserId, userData);
    if (response.success) {
      showAlert('User updated successfully', 'success');
      closeEditModal();
      loadUsers();
    } else {
      showAlert(response.message || 'Failed to update user', 'danger');
    }
  } catch (error) {
    showAlert('Error updating user: ' + error.message, 'danger');
  } finally {
    hideLoader();
  }
};

// Search users
const searchUsers = () => {
  const query = document.getElementById('search-input').value.toLowerCase();
  const filtered = users.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );

  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = '';
  const currentUser = getCurrentUser();

  filtered.forEach(user => {
    const row = createUserRow(user, currentUser.id);
    tbody.appendChild(row);
  });
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  protectRoute();
  loadUsers();

  // Close modal when clicking outside
  const modal = document.getElementById('edit-modal');
  if (modal) {
    window.onclick = function(event) {
      if (event.target === modal) {
        closeEditModal();
      }
    };
  }
});
