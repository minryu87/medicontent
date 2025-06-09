import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ContentNav from '../components/ContentNav';
import ContentList from './ContentList';
import ContentCreate from './ContentCreate';
import ContentDetail from './ContentDetail';

const ContentEditor: React.FC = () => {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <ContentNav />
      <Routes>
        <Route path="/" element={<ContentList />} />
        <Route path="/create" element={<ContentCreate />} />
        <Route path=":contentId" element={<ContentDetail />} />
      </Routes>
    </div>
  );
};

export default ContentEditor;
