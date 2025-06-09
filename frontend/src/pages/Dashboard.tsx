import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/dashboard/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        } else {
          let errorMsg = '대시보드 데이터를 불러올 수 없습니다.';
          try {
            const errorData = await res.json();
            console.error('Dashboard API Error:', res.status, errorData);
            if (errorData && errorData.msg) {
              errorMsg = `오류: ${errorData.msg} (상태 코드: ${res.status})`;
            } else {
              errorMsg = `오류: ${res.statusText} (상태 코드: ${res.status})`;
            }
          } catch (e) {
            console.error('Failed to parse error JSON or unknown error:', e);
            errorMsg = `오류: ${res.statusText} (상태 코드: ${res.status}), 응답 파싱 실패`;
          }
          setError(errorMsg);
        }
      } catch {
        setError('서버 오류');
      }
    };
    fetchSummary();
  }, []);

  if (error) return <div className="error-text">{error}</div>;
  if (!summary) return <div className="loading-text">로딩 중...</div>;

  return (
    <div className="dashboard-container">
      <h1>메인 대시보드</h1>
      
      <div className="dashboard-section">
      <h2>오늘의 성과</h2>
      <ul>
        <li>조회수: {summary.today.views}</li>
        <li>참여도: {summary.today.engagement}</li>
        <li>문의수: {summary.today.inquiries}</li>
      </ul>
      </div>

      <div className="dashboard-section">
      <h2>진행 중인 프로젝트</h2>
      <ul>
        {summary.campaigns.map((c: any) => (
          <li key={c.name}>{c.name} (진행률: {c.progress}%, 상태: {c.status})</li>
        ))}
      </ul>
      </div>

      <div className="dashboard-section">
      <h2>승인 대기 컨텐츠</h2>
      <ul>
        {summary.pending.map((p: any) => (
          <li key={p.content_id}>{p.title}</li>
        ))}
      </ul>
      </div>
    </div>
  );
};

export default Dashboard;
