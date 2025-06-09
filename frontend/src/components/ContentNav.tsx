import React from 'react';
import { Link } from 'react-router-dom';

const ContentNav: React.FC = () => (
  <nav style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
    <Link to="/content">내 컨텐츠</Link>
    <Link to="/content/create">새 컨텐츠 생성</Link>
  </nav>
);

export default ContentNav;
