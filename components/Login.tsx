import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const success = await signInWithGoogle();
      if (success) {
        navigate('/');
      } else {
        setError('Google 로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('Google 로그인 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('이메일 또는 비밀번호가 잘못되었습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">로그인</h1>
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
          로그인
        </button>
        <p className="text-center text-slate-400 mt-4">
          계정이 없으신가요?{' '}
          <a href="/signup" className="text-cyan-400 hover:underline">
            회원가입
          </a>
        </p>
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-slate-600"></div>
          <span className="mx-4 text-slate-400">또는</span>
          <div className="flex-grow border-t border-slate-600"></div>
        </div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
        >
          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.03,4.73 15.1,5.5 15.71,6.15L17.82,4.12C16.14,2.5 14.03,1.73 12.19,1.73C7.03,1.73 3,6.14 3,12C3,17.86 7.03,22.27 12.19,22.27C17.6,22.27 21.9,18.36 21.9,12.27C21.9,11.63 21.68,11.1 21.35,11.1Z"/></svg>
          Google 계정으로 로그인
        </button>
      </form>
    </div>
  );
};

export default Login;
