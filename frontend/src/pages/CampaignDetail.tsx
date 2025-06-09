import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './CampaignDetail.css'; // CSS 파일 import

// Campaign 상세 정보 인터페이스
interface CampaignDetailData {
  campaign_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  budget?: number;
  status: string;
  // 추가될 수 있는 상세 정보 필드들 (예: 연결된 컨텐츠 목록, 성과 데이터 등)
}

const CampaignDetail: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<CampaignDetailData | null>(null);
  const [pageError, setPageError] = useState(''); // 페이지 로딩 에러

  // 스케줄 폼 상태
  const [contentIdForSchedule, setContentIdForSchedule] = useState('');
  const [channelIdForSchedule, setChannelIdForSchedule] = useState('');
  const [scheduledTimeForSchedule, setScheduledTimeForSchedule] = useState('');
  const [scheduleFormMsg, setScheduleFormMsg] = useState('');
  const [scheduleFormError, setScheduleFormError] = useState('');

  useEffect(() => {
    const fetchCampaign = async () => {
      setPageError('');
      setCampaign(null); // 이전 데이터 클리어
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5001/api/campaign/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCampaign(data);
        } else {
          const errorData = await res.json().catch(() => ({ msg: '캠페인 정보를 불러올 수 없습니다.' }));
          setPageError(errorData.msg || '캠페인 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        setPageError('서버에 연결할 수 없거나 응답이 없습니다.');
        console.error('Fetch campaign detail error:', err);
      }
    };
    if (campaignId) {
    fetchCampaign();
    }
  }, [campaignId]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleFormMsg('');
    setScheduleFormError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/campaign/${campaignId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          content_id: Number(contentIdForSchedule),
          channel_id: Number(channelIdForSchedule),
          scheduled_time: scheduledTimeForSchedule
        })
      });
      const data = await res.json();
      if (res.ok) {
        setScheduleFormMsg('스케줄이 성공적으로 등록되었습니다.');
        // 성공 후 폼 초기화 또는 다른 UI 업데이트
        setContentIdForSchedule('');
        setChannelIdForSchedule('');
        setScheduledTimeForSchedule('');
      } else {
        setScheduleFormError(data.msg || '스케줄 등록에 실패했습니다.');
      }
    } catch (err) {
      setScheduleFormError('스케줄 등록 중 서버 오류가 발생했습니다.');
      console.error('Schedule content error:', err);
    }
  };

  // 상태에 따른 CSS 클래스 반환 함수 (Campaigns.tsx의 것과 유사)
  const getStatusClass = (status: string) => {
    if (status === 'active') return 'status-active';
    if (status === 'pending') return 'status-pending';
    if (status === 'ended') return 'status-ended';
    if (status === 'draft') return 'status-draft';
    return '';
  };

  if (pageError) return <div className="page-error-message">{pageError}</div>;
  if (!campaign) return <div className="page-loading-message">캠페인 정보를 불러오는 중...</div>;

  return (
    <div className="campaign-detail-container">
      <h2>캠페인 상세 정보</h2>

      <div className="campaign-info-section">
        <div className="campaign-info-header">
          <h3>{campaign.name}</h3>
          <span className={`campaign-status ${getStatusClass(campaign.status)}`}>
            {campaign.status}
          </span>
        </div>
        <p className="info-item">
          <strong>기간:</strong> 
          {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
        </p>
        {campaign.budget && (
          <p className="info-item">
            <strong>예산:</strong> {campaign.budget.toLocaleString()}원
          </p>
        )}
        {campaign.description && (
          <p className="info-item">
            <strong>설명:</strong> {campaign.description}
          </p>
        )}
        {/* 여기에 추가적인 캠페인 상세 정보 표시 가능 */}
      </div>

      <div className="schedule-form-section">
      <h3>컨텐츠 배포/스케줄 등록</h3>
      <form onSubmit={handleSchedule}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="contentIdForSchedule">컨텐츠 ID</label>
              <input 
                id="contentIdForSchedule" 
                type="number" 
                placeholder="배포할 컨텐츠의 ID"
                value={contentIdForSchedule} 
                onChange={e => setContentIdForSchedule(e.target.value)} 
                required 
              />
            </div>
            <div className="form-field">
              <label htmlFor="channelIdForSchedule">채널 ID</label>
              <input 
                id="channelIdForSchedule" 
                type="number" 
                placeholder="배포할 채널의 ID"
                value={channelIdForSchedule} 
                onChange={e => setChannelIdForSchedule(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="scheduledTimeForSchedule">배포 예정 시간</label>
              <input 
                id="scheduledTimeForSchedule" 
                type="datetime-local" 
                value={scheduledTimeForSchedule} 
                onChange={e => setScheduledTimeForSchedule(e.target.value)} 
                required 
              />
            </div>
          </div>
        <button type="submit">스케줄 등록</button>
      </form>
        {scheduleFormMsg && <div className="campaign-detail-message-area campaign-detail-success-message">{scheduleFormMsg}</div>}
        {scheduleFormError && <div className="campaign-detail-message-area campaign-detail-error-message">{scheduleFormError}</div>}
      </div>
      
      {/* 
        향후 추가될 섹션들:

        연결된 컨텐츠 섹션:
        <div className="linked-contents-section">
          <h3>연결된 컨텐츠</h3>
          { 캠페인에 연결된 컨텐츠 목록 표시 ... }
        </div>

        캠페인 성과 섹션:
        <div className="performance-metrics-section">
          <h3>캠페인 성과</h3>
          { 캠페인 성과 지표 (클릭률, 전환율 등) 표시 ... }
        </div>
      */}
    </div>
  );
};

export default CampaignDetail;
