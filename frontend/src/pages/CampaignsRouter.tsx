import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CampaignNav from '../components/CampaignNav';
import Campaigns from './Campaigns';
import CampaignDetail from './CampaignDetail';

const CampaignsRouter: React.FC = () => {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <CampaignNav />
      <Routes>
        <Route path="/" element={<Campaigns />} />
        <Route path=":campaignId" element={<CampaignDetail />} />
      </Routes>
    </div>
  );
};

export default CampaignsRouter;
