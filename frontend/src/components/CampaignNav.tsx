import React from 'react';
import { Link } from 'react-router-dom';

const CampaignNav: React.FC = () => (
  <nav style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
    <Link to="/campaigns">캠페인 목록</Link>
  </nav>
);

export default CampaignNav;
