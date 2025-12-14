import React, { useState } from 'react';
import Calendar from './components/Calendar';
import Chatbot from './components/Chatbot';
import { scheduleData } from './data/scheduleData';
import { manualData } from './data/manualData';
import ApiKeyModal from './components/ApiKeyModal';
import { useApiKey } from './contexts/ApiKeyContext';

const HowToUsePanel: React.FC = () => (
  <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-700 h-full flex flex-col">
    <h2 className="text-lg sm:text-xl font-semibold text-cyan-400 mb-3 sm:mb-4 flex-shrink-0">스마트캘린더 사용법</h2>
    <div className="flex-grow overflow-y-auto min-h-0 scrollbar-thin pr-1">
      <ul className="space-y-3 text-sm text-slate-300">
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1 flex-shrink-0">&#8227;</span>
          <span>
            <strong>캘린더 이동:</strong> 이전/다음 버튼으로 월을 이동하고, 오늘 날짜가 강조됩니다.
          </span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1 flex-shrink-0">&#8227;</span>
          <span>
            <strong>일정 확인:</strong> 날짜/일정을 클릭하면 AI 보고서(업무 설명·처리절차)를 볼 수 있습니다.
          </span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1 flex-shrink-0">&#8227;</span>
          <span>
            <strong>AI 기능:</strong> Gemini API Key를 설정하면 일정 설명/챗봇이 동작합니다.
          </span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1 flex-shrink-0">&#8227;</span>
          <span>
            <strong>API 키 발급:</strong> 상단 <strong>API Key 설정</strong> → <strong>키 발급받기</strong> 버튼 → Google 로그인 후 키를 만들고 복사해 붙여넣으세요.
          </span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1 flex-shrink-0">&#8227;</span>
          <span>
            <strong>일정 추가:</strong> 달력 칸에 마우스를 올리면 왼쪽 상단에 <strong>＋</strong> 버튼이 보입니다. 칸/버튼을 클릭해 일정을 추가하세요.
          </span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 mr-2 mt-1 flex-shrink-0">&#8227;</span>
          <span>
            <strong>업무 분류/날짜 이동:</strong> 일정 추가/수정 창에서 업무 분류(예: 예산·급여·지출 등)를 고르고, 날짜 드롭다운으로 다른 날짜로 옮길 수 있습니다. 또는 일정을 드래그&드롭으로 다른 날짜로 옮길 수 있습니다. (수정: 일정 클릭 → AI 보고서 상단 <strong>수정</strong>)
          </span>
        </li>
      </ul>
    </div>
  </div>
);

const Header: React.FC = () => {
  const { apiKey, setApiKey, clearApiKey } = useApiKey();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  return (
    <header className="flex justify-between items-center p-4 bg-slate-900 text-white">
      <h1 className="text-xl font-bold text-cyan-400">마음ON 학교행정 스마트캘린더</h1>
      <div className="flex items-center gap-2">
        <div className="hidden sm:block text-xs text-slate-300">API Key: {apiKey ? '설정됨' : '미설정'}</div>
        <button
          onClick={() => setIsApiKeyModalOpen(true)}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          API Key 설정
        </button>
      </div>
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSave={setApiKey}
        onClear={clearApiKey}
      />
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
  return <MainLayout />;
};

export default App;
