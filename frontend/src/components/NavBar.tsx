import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './NavBar.css';

const NavBar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/dashboard">대시보드</Link>
      <Link to="/content">컨텐츠</Link>
      <Link to="/campaigns">캠페인</Link>
      <Link to="/analytics">분석</Link>
      <Link to="/settings">설정</Link>
      {hasRole(['admin', 'medical']) && <Link to="/approval">승인</Link>}
      <div className="navbar-user-section">
      {user ? (
          <>
            <span>{user.email} ({user.role})</span>
            <button onClick={logout}>로그아웃</button>
          </>
      ) : (
          <Link to="/login">로그인</Link>
      )}
      </div>
    </nav>
  );
};

export default NavBar;
