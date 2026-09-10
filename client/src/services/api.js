// Centralized API client utility with authentication token handling

const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  let token = localStorage.getItem('bts_auth_token');
  if (!token) {
    token = 'demo-token';
    try {
      localStorage.setItem('bts_auth_token', 'demo-token');
    } catch (e) {}
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  // If body is FormData (e.g. image upload), let the browser set Content-Type
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // Handle HTTP 401 Unauthorized
    if (response.status === 401) {
      // Don't wipe session if on demo token
      if (token !== 'demo-token' && endpoint !== '/auth/me') {
        localStorage.removeItem('bts_auth_token');
        localStorage.removeItem('bts_user');
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Graceful error logging
    console.warn(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
}

export default apiRequest;
