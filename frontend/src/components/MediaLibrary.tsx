import React, { useEffect, useState } from 'react';
import './MediaLibrary.css'; // CSS 파일 import

interface MediaItem {
  media_id: number;
  url: string;
  alt_text: string;
  // 필요한 경우 파일명, 업로드 날짜 등 추가 필드 정의
}

interface Props {
  onSelect: (media: MediaItem) => void;
}

const MediaLibrary: React.FC<Props> = ({ onSelect }) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [error, setError] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchMedia = async () => {
    setError('');
    setDeleteMsg(''); // 목록 로드 시 이전 메시지 초기화
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/media/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      } else {
        const errorData = await res.json().catch(() => ({ msg: '미디어 목록을 불러올 수 없습니다.' }));
        setError(errorData.msg || '미디어 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('미디어 목록 로딩 중 서버 오류가 발생했습니다.');
      console.error('Fetch media error:', err);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleDelete = async (media_id: number) => {
    setDeleteMsg('');
    setError('');
    if (!window.confirm('정말로 이 미디어를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/media/delete/${media_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteMsg('미디어가 성공적으로 삭제되었습니다.');
        fetchMedia(); // 목록 새로고침
      } else {
        setError(data.msg || '미디어 삭제에 실패했습니다.');
      }
    } catch (err) {
      setError('미디어 삭제 중 서버 오류가 발생했습니다.');
      console.error('Delete media error:', err);
    }
  };

  return (
    <div className="media-library-container">
      <h4>내 미디어 라이브러리</h4>
      {error && <div className="media-library-message-area media-library-error">{error}</div>}
      {deleteMsg && <div className="media-library-message-area media-library-success">{deleteMsg}</div>}
      
      {mediaList.length === 0 && !error && (
        <div className="no-media-message">업로드된 미디어가 없습니다.</div>
      )}

      <div className="media-grid">
        {mediaList.map(media => (
          <div key={media.media_id} className="media-item">
            <img 
              src={`http://localhost:5001${media.url}`} 
              alt={media.alt_text} 
              className="media-item-thumbnail"
              onClick={() => onSelect(media)} // 썸네일 클릭 시 선택
            />
            <div className="media-item-alt">{media.alt_text || '(캡션 없음)'}</div>
            <div className="media-item-actions">
              <button onClick={() => onSelect(media)} className="button-select">선택</button>
              <button onClick={() => handleDelete(media.media_id)} className="button-delete">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
