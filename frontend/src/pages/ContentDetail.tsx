import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ApprovalRequestButton from '../components/ApprovalRequestButton';
import { Content, Media } from '../types';
import './ContentDetail.css';

const API_URL = 'http://localhost:5001/api';

const ContentDetail: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // 실제 서비스에서는 approverId를 조직 내 의료진/관리자 등에서 선택하도록 구현 필요(여기선 2로 예시)
  const approverId = 2; // 예시 ID, 실제로는 인증된 사용자 또는 선택 로직 필요

  useEffect(() => {
    const fetchContent = async () => {
      setError('');
      setContent(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/content/${contentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setContent(data);
        } else {
          const errorData = await res.json().catch(() => ({ msg: '컨텐츠를 불러올 수 없습니다.' }));
          setError(errorData.msg || '컨텐츠를 불러올 수 없습니다.');
        }
      } catch (err) {
        setError('서버에 연결할 수 없거나 응답이 없습니다.');
        console.error('Fetch content detail error:', err);
      }
    };
    fetchContent();
  }, [contentId]);

  const handleDelete = async () => {
    if (!contentId || !window.confirm('정말로 이 컨텐츠를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/content/${contentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert('컨텐츠가 삭제되었습니다.');
        navigate('/content');
      } else {
        const errorData = await res.json();
        setError(errorData.msg || '삭제에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류로 인해 삭제에 실패했습니다.');
    }
  };

  if (error) return <div className="error-message-detail">{error}</div>;
  if (!content) return <div className="loading-message">로딩 중...</div>;

  // content.status가 없으므로 임시로 '작성 완료' 표시
  const status = '작성 완료';

  return (
    <div className="content-detail-container">
      <div className="content-detail-header">
      <h1>{content.title}</h1>
      </div>

      <div className="content-meta-info">
        <p className="meta-item"><strong>상태:</strong> {status}</p>
        {content.medical_specialty && <p className="meta-item"><strong>진료과목:</strong> {content.medical_specialty}</p>}
        {content.target_audience && <p className="meta-item"><strong>타겟:</strong> {content.target_audience}</p>}
        <p className="meta-item score-badge seo"><strong>SEO 점수:</strong> {content.seo_score ?? 'N/A'}</p>
        <p className="meta-item score-badge compliance"><strong>준수도:</strong> {content.compliance_score ?? 'N/A'}</p>
      </div>

      <div className="content-body" dangerouslySetInnerHTML={{ __html: content.body.replace(/\n/g, '<br />') }} />

      {content.associated_media && content.associated_media.length > 0 && (
        <div className="content-image-gallery">
          <h3>관련 이미지</h3>
          <div className="gallery-grid">
            {content.associated_media.map((media: Media) => (
              <div key={media.media_id} className="gallery-item">
                <img 
                  src={media.url} 
                  alt={media.alt_text || content.title} 
                  className="content-image" 
                />
                <p>{media.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="content-actions">
        <Link to={`/content/edit/${content.content_id}`} className="link-button button-secondary">수정</Link>
        <ApprovalRequestButton contentId={content.content_id} approverId={approverId} />
        <button onClick={handleDelete} className="button-danger">삭제</button>
      </div>
    </div>
  );
};

export default ContentDetail;
