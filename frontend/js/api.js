/**
 * REST API Helper Module
 * Provides unified Fetch API wrapper with automatic JWT Bearer token injection
 */

const API = {
  // Retrieve saved JWT token from localStorage
  getToken() {
    return localStorage.getItem('jwt_token');
  },

  // Save authentication session
  setAuth(token, user) {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_profile', JSON.stringify(user));
  },

  // Clear authentication session
  clearAuth() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_profile');
  },

  // Get current logged in user profile object
  getCurrentUser() {
    const raw = localStorage.getItem('user_profile');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  // Core fetch wrapper
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error;
    }
  },

  // HTTP convenience helpers
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};
