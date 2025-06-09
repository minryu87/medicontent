import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [hospitalId, setHospitalId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setError('모든 필수 필드를 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, hospital_id: hospitalId || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('회원가입이 완료되었습니다. 로그인 페이지로 이동하여 로그인해주세요.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('staff');
        setHospitalId('');
      } else {
        setError(data.msg || '회원가입에 실패했습니다. 입력 정보를 확인해주세요.');
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다. 서버 연결 상태를 확인하세요.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 32 }}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>이메일</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>비밀번호</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>역할</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="admin">관리자</option>
            <option value="manager">마케팅 매니저</option>
            <option value="staff">일반 직원</option>
            <option value="viewer">뷰어</option>
          </select>
        </div>
        <div>
          <label>병원 ID(선택)</label>
          <input type="text" value={hospitalId} onChange={e => setHospitalId(e.target.value)} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {success && <div style={{ color: 'green' }}>{success}</div>}
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default Register;
