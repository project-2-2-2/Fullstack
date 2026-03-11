// Same-origin API (works in dev + when deployed behind one domain)
const API_BASE_URL = '/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set auth header
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// API calls for Auth
const apiAuth = {
  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password })
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  }
};

// API calls for Users
const apiUsers = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  }
};

// API calls for Posts
const apiPosts = {
  getAll: async (query = '') => {
    const url = query ? `${API_BASE_URL}/posts?${query}` : `${API_BASE_URL}/posts`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  },

  getUserPosts: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/posts/user/${userId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  like: async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}/like`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return response.json();
  }
};

// API calls for Products
const apiProducts = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  }
};

// API calls for Tasks
const apiTasks = {
  getAll: async (query = '') => {
    const url = query ? `${API_BASE_URL}/tasks?${query}` : `${API_BASE_URL}/tasks`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  }
};
