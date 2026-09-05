// In dev, VITE_API_URL is empty and Vite's proxy forwards /api/* to localhost:5005.
// In production (Render), VITE_API_URL is set to the deployed backend URL.
const BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, options);
  return res;
}
