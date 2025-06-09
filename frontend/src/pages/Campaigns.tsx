import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Campaigns.css';

interface Campaign {
  campaign_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  budget?: number;
  status: string;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchCampaigns = async () => {
    setError('');
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/campaign/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      } else {
        const errorData = await res.json().catch(() => ({ msg: '캠페인 목록을 불러올 수 없습니다.' }));
        setError(errorData.msg || '캠페인 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없거나 응답이 없습니다.');
      console.error('Fetch campaigns error:', err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/campaign/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          budget: budget ? Number(budget) : null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('캠페인이 성공적으로 생성되었습니다.');
        setName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setBudget('');
        fetchCampaigns();
      } else {
        setError(data.msg || '캠페인 생성에 실패했습니다.');
      }
    } catch (err) {
      setError('캠페인 생성 중 서버 오류가 발생했습니다.');
      console.error('Create campaign error:', err);
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'active') return 'status-active';
    if (status === 'pending') return 'status-pending';
    if (status === 'ended') return 'status-ended';
    return '';
  };

  return (
    <div className="campaigns-container">
      <h2>캠페인 관리</h2>

      <form onSubmit={handleCreate} className="create-campaign-form">
        <h3>새 캠페인 등록</h3>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="campaignName">캠페인 이름</label>
            <input id="campaignName" type="text" placeholder="예: 봄맞이 피부과 할인" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="campaignDesc">설명 (선택)</label>
            <input id="campaignDesc" type="text" placeholder="예: 1개월간 진행되는 프로모션" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="startDate">시작일</label>
            <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="endDate">종료일</label>
            <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="budget">예산 (원, 선택)</label>
            <input id="budget" type="number" placeholder="예: 1000000" value={budget} onChange={e => setBudget(e.target.value)} />
          </div>
        </div>
        <button type="submit">+ 새 캠페인 생성</button>
      </form>

      {msg && <div className="campaign-message-area campaign-success-message">{msg}</div>}
      {error && <div className="campaign-message-area campaign-error-message">{error}</div>}

      <h3 className="campaigns-list-title">캠페인 목록</h3>
      {campaigns.length === 0 && !error && (
        <div className="no-campaigns-message">등록된 캠페인이 없습니다.</div>
      )}
      <ul className="campaigns-list">
        {campaigns.map(c => (
          <li key={c.campaign_id} className="campaign-item">
            <div className="campaign-item-header">
              <strong>{c.name}</strong>
              <span className={`campaign-status ${getStatusClass(c.status)}`}>{c.status}</span>
            </div>
            {c.description && <p className="campaign-item-meta">설명: {c.description}</p>}
            <p className="campaign-item-meta">
              기간: {new Date(c.start_date).toLocaleDateString()} ~ {new Date(c.end_date).toLocaleDateString()}
            </p>
            {c.budget && <p className="campaign-item-meta">예산: {c.budget.toLocaleString()}원</p>}
            <div className="campaign-item-actions">
              <Link to={`/campaigns/${c.campaign_id}`} className="link-button button-secondary">상세 보기</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Campaigns;
