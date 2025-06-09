// API 연동 유틸리티 (예시)
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
  });
  return res.json();
}

export async function apiPost(path: string, data: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return res.json();
}
