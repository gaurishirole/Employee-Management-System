const API_BASE = 'http://localhost:5000/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('TDTL-token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const apiFetch = async (endpoint, options = {}) => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'API request failed');
  }
  return response.json();
};

export const getRolePrefix = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'hr') return '/hr';
  if (role === 'manager' || role === 'leaders' || role === 'leader') return '/leader';
  return '/employee';
};
