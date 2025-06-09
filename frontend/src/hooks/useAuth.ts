import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<any>(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const navigate = useNavigate();

  const login = (token: string, user: any) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  // fetch wrapper: JWT 만료/에러 시 자동 로그아웃
  const authFetch = async (input: RequestInfo, init?: RequestInit) => {
    const res = await fetch(input, init);
    if (res.status === 401 || res.status === 403) {
      logout();
      return null;
    }
    return res;
  };

  return { token, user, login, logout, hasRole, authFetch };
}
