import React, { useEffect, useState } from 'react';
import './ApprovalList.css'; // CSS 파일 import

// 승인 항목 인터페이스 정의
interface PendingItem {
  workflow_id: number;
  content_id: number;
  title: string;
  created_at: string; // ISO 문자열 형태의 날짜
  // 필요에 따라 다른 필드 추가 (예: 요청자 정보 등)
}

const ApprovalList: React.FC = () => {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const fetchPending = async () => {
    setError('');
    setActionMsg(''); // 목록 새로고침 시 이전 액션 메시지 초기화
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/approval/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPending(data);
      } else {
        const errorData = await res.json().catch(() => ({ msg: '승인 대기 목록을 불러올 수 없습니다.' }));
        setError(errorData.msg || '승인 대기 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없거나 응답이 없습니다.');
      console.error('Fetch pending approvals error:', err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (workflow_id: number, action: 'approve' | 'reject') => {
    setActionMsg(''); // 이전 메시지 초기화
    setError(''); // 이전 오류 초기화
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/approval/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ workflow_id, action })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`항목 ID ${workflow_id}: ${action === 'approve' ? '승인' : '거부'} 처리 완료`);
        fetchPending(); // 목록 새로고침
      } else {
        setActionMsg(''); // 성공 메시지 초기화
        setError(data.msg || '처리 실패');
      }
    } catch (err) {
      setActionMsg(''); // 성공 메시지 초기화
      setError('작업 처리 중 서버 오류가 발생했습니다.');
      console.error('Approval action error:', err);
    }
  };

  return (
    <div className="approval-list-container">
      <h2>승인 대기 컨텐츠</h2>
      
      {actionMsg && <div className="message-area action-message">{actionMsg}</div>}
      {error && <div className="message-area error-message-approval">{error}</div>}

      {pending.length === 0 && !error && (
        <div className="no-pending-message">승인 대기 중인 컨텐츠가 없습니다.</div>
      )}

      <ul className="approval-items-list">
        {pending.map(item => (
          <li key={item.workflow_id} className="approval-item">
            <div className="approval-item-info">
              <strong>{item.title}</strong> (컨텐츠 ID: {item.content_id})
            </div>
            <div className="approval-item-meta">
              요청일: {new Date(item.created_at).toLocaleString()}
            </div>
            <div className="approval-item-actions">
              <button 
                onClick={() => handleAction(item.workflow_id, 'approve')} 
                className="approve-button"
              >
                승인
              </button>
              <button 
                onClick={() => handleAction(item.workflow_id, 'reject')} 
                className="reject-button"
              >
                거부
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApprovalList;
