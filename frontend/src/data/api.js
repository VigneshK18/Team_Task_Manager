const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('ttm_token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) localStorage.setItem('ttm_token', data.token);
  return { ok: res.ok, data };
};

export const signup = async (name, email, password, isInvite = false) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (res.ok && !isInvite) localStorage.setItem('ttm_token', data.token);
  return { ok: res.ok, data };
};

export const logout = () => localStorage.removeItem('ttm_token');

// Users
export const getUsers = async () => {
  const res = await fetch(`${API_URL}/users`, { headers: headers() });
  return res.ok ? res.json() : [];
};
export const deleteUser = async (id) => {
  await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: headers() });
};

// Projects
export const getProjects = async () => {
  const res = await fetch(`${API_URL}/projects`, { headers: headers() });
  return res.ok ? res.json() : [];
};
export const createProject = async (data) => {
  const res = await fetch(`${API_URL}/projects`, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
  return res.ok ? res.json() : null;
};

// Tasks
export const getTasks = async () => {
  const res = await fetch(`${API_URL}/tasks`, { headers: headers() });
  return res.ok ? res.json() : [];
};
export const createTask = async (data) => {
  const res = await fetch(`${API_URL}/tasks`, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
  return res.ok ? res.json() : null;
};
export const updateTask = async (id, data) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) });
  return res.ok ? res.json() : null;
};
export const deleteTask = async (id) => {
  await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE', headers: headers() });
};
