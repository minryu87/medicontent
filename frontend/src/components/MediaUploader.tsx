import React, { useRef, useState } from 'react';
import './MediaUploader.css';

interface MediaData {
  media_id: number;
  url: string;
  alt_text: string;
}

interface Props {
  onUpload: (media: MediaData) => void;
}

const MediaUploader: React.FC<Props> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }
    const file = e.target.files[0];
    setSelectedFile(file);
    setError('');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt_text', file.name);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.media_id) {
        onUpload({ media_id: data.media_id, url: data.url, alt_text: data.alt_text || file.name });
        setSelectedFile(null);
      } else {
        setError(data.msg || '파일 업로드에 실패했습니다.');
      }
    } catch (err) {
      setError('업로드 중 서버 오류가 발생했습니다.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="media-uploader-container">
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        disabled={loading} 
        id="file-input"
      />
      <label htmlFor="file-input" className={`file-input-label ${loading ? 'loading' : ''}`}>
        {loading ? '업로드 중...' : '이미지 파일 선택'}
      </label>
      
      {selectedFile && !loading && (
        <div className="selected-file-name">선택된 파일: {selectedFile.name}</div>
      )}
      
      {error && (
        <span className="upload-status-message upload-error-message">{error}</span>
      )}
    </div>
  );
};

export default MediaUploader;
