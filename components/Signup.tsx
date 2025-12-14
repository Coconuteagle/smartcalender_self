import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const success = await signup(email, password, displayName);
      if (success) {
        navigate('/'); // 회원가입 성공 시 메인 페이지로 이동
      } else {
        setError('회원가입에 실패했습니다. 다른 이메일을 사용하거나 잠시 후 다시 시도해주세요.');
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">회원가입</h1>
        <div className="mb-4">
          <label className="block text-slate-400 mb-2" htmlFor="displayName">
            이름
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 bg-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-slate-400 mb-2" htmlFor="email">
            이메일
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-slate-400 mb-2" htmlFor="password">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors"
        >
          회원가입
        </button>
        <p className="text-center text-slate-400 mt-4">
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="text-cyan-400 hover:underline">
            로그인
          </a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
