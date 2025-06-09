import React, { useState } from 'react';

interface Props {
  contentId: number;
  approverId: number;
}

const ApprovalRequestButton: React.FC<Props> = ({ contentId, approverId }) => {
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/approval/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content_id: contentId, approver_id: approverId })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('승인 요청 완료');
      } else {
        setMsg(data.msg || '요청 실패');
      }
    } catch {
      setMsg('서버 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <span>
      <button type="button" onClick={handleRequest} disabled={loading}>
        {loading ? '요청 중...' : '승인 요청'}
      </button>
      {msg && <span style={{ marginLeft: 8, color: 'green' }}>{msg}</span>}
    </span>
  );
};

export default ApprovalRequestButton;
