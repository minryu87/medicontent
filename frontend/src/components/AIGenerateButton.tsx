import React, { useState } from 'react';

interface Props {
  onResult: (text: string) => void;
  contentType: string;
  medicalSpecialty: string;
  targetAudience: string;
  tone: string;
  keywords: string[];
  contentLength: string;
}

const AIGenerateButton: React.FC<Props> = ({
  onResult,
  contentType,
  medicalSpecialty,
  targetAudience,
  tone,
  keywords,
  contentLength
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/ai/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content_type: contentType,
          medical_specialty: medicalSpecialty,
          target_audience: targetAudience,
          tone,
          keywords,
          content_length: contentLength
        })
      });
      const data = await res.json();
      if (res.ok && data.generated_text) {
        onResult(data.generated_text);
      } else {
        setError(data.msg || 'AI 생성 실패');
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
        {loading ? 'AI 생성 중...' : 'AI로 초안 생성'}
      </button>
      {error && <span style={{ color: 'red', marginLeft: 8 }}>{error}</span>}
    </div>
  );
};

export default AIGenerateButton;
