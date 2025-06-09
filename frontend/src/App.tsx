import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ContentEditor from './pages/ContentEditor';
import CampaignsRouter from './pages/CampaignsRouter';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ApprovalList from './pages/ApprovalList';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <div className="App"> 
    <Router>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/content/*" element={<AuthGuard><ContentEditor /></AuthGuard>} />
          <Route path="/approval" element={<AuthGuard><ApprovalList /></AuthGuard>} />
          <Route path="/campaigns/*" element={<AuthGuard><CampaignsRouter /></AuthGuard>} />
          <Route path="/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
          
          <Route path="/" element={<AuthGuard><Navigate to="/dashboard" /></AuthGuard>} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
