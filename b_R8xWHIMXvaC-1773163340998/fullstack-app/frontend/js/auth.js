// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get current user from localStorage
const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Login user
const loginUser = async (email, password) => {
  try {
    const response = await apiAuth.login(email, password);

    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { success: true, user: response.user };
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    return { success: false, message: 'Login failed: ' + error.message };
  }
};

// Register user
const registerUser = async (name, email, password) => {
  try {
    const response = await apiAuth.register(name, email, password);

    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { success: true, user: response.user };
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    return { success: false, message: 'Registration failed: ' + error.message };
  }
};

// Logout user
const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/frontend/login.html';
};

// Protect routes
const protectRoute = () => {
  if (!isAuthenticated()) {
    window.location.href = '/frontend/login.html';
  }
};

// Show alert message
const showAlert = (message, type = 'danger') => {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  const container = document.querySelector('.container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);

  setTimeout(() => alertDiv.remove(), 5000);
};

// Validate email
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate form
const validateForm = (formData) => {
  const errors = [];

  if (!formData.name || formData.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!formData.email || !validateEmail(formData.email)) {
    errors.push('Valid email is required');
  }

  if (formData.password && formData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return errors;
};
