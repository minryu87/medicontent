import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Content } from '../types';
import './ContentList.css';

const ContentList: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContents = async () => {
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/content/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setContents(data);
        } else {
          const errorData = await res.json().catch(() => ({ msg: '컨텐츠 목록을 불러올 수 없습니다.' }));
          setError(errorData.msg || '컨텐츠 목록을 불러올 수 없습니다.');
        }
      } catch (err) {
        setError('서버에 연결할 수 없거나 응답이 없습니다.');
        console.error('Fetch error:', err);
      }
    };
    fetchContents();
  }, []);

  if (error) return <div className="error-message-list">{error}</div>;

  return (
    <div className="content-list-container">
      <h1>내 컨텐츠 목록</h1>
      <div className="add-content-link-container">
        <Link to="/content/create" className="link-button button-primary">+ 새 컨텐츠 생성</Link>
      </div>
      {contents.length === 0 && !error && <p>생성된 컨텐츠가 없습니다.</p>}
      <div className="content-cards-container">
        {contents.map((content) => (
          <div key={content.content_id} className="content-card">
            <Link to={`/content/${content.content_id}`} className="card-link">
              <div className="card-header">
                <h3>{content.title}</h3>
              </div>
              <div className="card-body">
                <p><strong>진료과목:</strong> {content.medical_specialty || 'N/A'}</p>
                 <p><strong>생성일:</strong> {new Date(content.created_at).toLocaleDateString()}</p>
              </div>
              <div className="card-footer">
                <span className="score-badge list-seo">SEO: {content.seo_score ?? 'N/A'}</span>
                <span className="score-badge list-compliance">준수: {content.compliance_score ?? 'N/A'}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentList;
