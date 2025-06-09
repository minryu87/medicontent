import React, { useState } from 'react';

interface Props {
  onResult: (url: string, alt: string) => void;
  imageType: string;
  medicalContext: string;
  brandColors: string[];
  dimensions: { width: number; height: number };
  style: string;
}

const AIImageGenerateButton: React.FC<Props> = ({
  onResult,
  imageType,
  medicalContext,
  brandColors,
  dimensions,
  style
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image_type: imageType,
          medical_context: medicalContext,
          brand_colors: brandColors,
          dimensions,
          style
        })
      });
      const data = await res.json();
      if (res.ok && data.image_url) {
        onResult(data.image_url, data.alt_text);
      } else {
        setError(data.msg || 'AI 이미지 생성 실패');
      }
    } catch {
      setError('서버 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: '8px 0' }}>
      <button type="button" onClick={handleClick} disabled={loading}>
        {loading ? 'AI 이미지 생성 중...' : 'AI로 이미지 생성'}
      </button>
      {error && <span style={{ color: 'red', marginLeft: 8 }}>{error}</span>}
    </div>
  );
};

export default AIImageGenerateButton;
