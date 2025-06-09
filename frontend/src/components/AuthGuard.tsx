import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactElement;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    // 사용자가 로그인하지 않았으면 로그인 페이지로 리디렉션합니다.
    return <Navigate to="/login" />;
  }

  // 사용자가 로그인했으면 요청된 컴포넌트를 렌더링합니다.
  return children;
};

export default AuthGuard; 