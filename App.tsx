import React from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Calendar from './components/Calendar';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import Signup from './components/Signup';
import Payment from './components/Payment';
import SuccessPage from './components/SuccessPage';
import FailPage from './components/FailPage';
import { useAuth } from './contexts/AuthContext';
import { scheduleData } from './data/scheduleData.ts';
import { manualData } from './data/manualData.ts';
import { ApiKeyProvider } from './contexts/ApiKeyContext';
import ApiKeyModal from './components/ApiKeyModal';

const HowToUsePanel: React.FC = () => (
  <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-700 h-full flex flex-col">
    <h2 className="text-lg sm:text-xl font-semibold text-cyan-400 mb-3 sm:mb-4 flex-shrink-0">
      스마트캘린더 사용법
    </h2>
    <div className="flex-grow overflow-y-auto min-h-0 scrollbar-thin pr-1">
      <ul className="space-y-3 text-sm text-slate-300">
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1 flex-shrink-0">&#8227;</span>
          <span><strong>캘린더 탐색:</strong> 이전/다음 달 버튼으로 월을 이동하세요. 오늘 날짜는 강조 표시됩니다.</span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1 flex-shrink-0">&#8227;</span>
          <span><strong>일정 확인:</strong> 날짜 칸의 일정을 클릭하면 상세 내용을 보고 AI 설명을 받을 수 있습니다.</span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1 flex-shrink-0">&#8227;</span>
          <span><strong>AI 설명 기능:</strong> 일정 상세 팝업에서 Gemini AI가 업무 설명, K-에듀파인 가이드, 그리고 관련 학교행정업무매뉴얼 내용을 제공합니다.</span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1 flex-shrink-0">&#8227;</span>
          <span><strong>더 많은 일정:</strong> 날짜 칸에 "+N개 더보기" 버튼으로 모든 일정을 펼치거나 "간략히 보기"로 접을 수 있습니다.</span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1 flex-shrink-0">&#8227;</span>
          <span><strong>AI 챗봇:</strong> 우측 패널에서 AI 챗봇을 통해 학교 행정 관련 질문을 하고 답변을 받을 수 있습니다. (Google Search 및 제공된 학교행정업무매뉴얼 기반)</span>
        </li>
      </ul>
    </div>
  </div>
);


const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center p-4 bg-slate-900 text-white">
      <h1 className="text-xl font-bold text-cyan-400">마음ON 학교행정 스마트캘린더</h1>
      <div>
        {isAuthenticated && user ? (
          <div className="flex items-center">
            <span className="mr-4">환영합니다, {user.displayName || user.email}님!</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => navigate('/login')}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors mr-2"
            >
              로그인
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              회원가입
            </button>

          </div>
        )}
      </div>
    </header>
  );
};


const MainLayout = () => (
  <div className="min-h-screen flex flex-col bg-slate-950 antialiased">
    <Header />
    <main className="flex-grow p-4 sm:p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 w-full max-w-screen-2xl mx-auto">
        <div className="md:w-[20%] w-full order-1 md:order-1 flex flex-col h-[400px] sm:h-[500px] md:h-[650px]">
          <HowToUsePanel />
        </div>
        <div className="md:w-[55%] w-full order-2 md:order-2 flex flex-col md:min-h-0">
          <div className="w-full md:flex-grow">
            <Calendar scheduleText={scheduleData} manualContextText={manualData} />
          </div>
        </div>
        <div className="md:w-[25%] w-full order-3 md:order-3 flex flex-col h-[400px] sm:h-[500px] md:h-[650px]">
          <Chatbot manualContextText={manualData} />
        </div>
      </div>
    </main>
  </div>
);

const App: React.FC = () => {
  return (
    <ApiKeyProvider>
      <ApiKeyModal />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/fail" element={<FailPage />} />
        <Route path="/" element={<MainLayout />} />
      </Routes>
    </ApiKeyProvider>
  );
};

export default App;
