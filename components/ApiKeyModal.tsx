import React, { useMemo, useState } from 'react';

type ApiKeyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (nextKey: string) => void;
  onClear: () => void;
};

const GOOGLE_AI_STUDIO_API_KEY_URL = 'https://aistudio.google.com/app/apikey';

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, apiKey, onSave, onClear }) => {
  const [draft, setDraft] = useState(apiKey);
  const [isVisible, setIsVisible] = useState(false);

  const masked = useMemo(() => {
    if (!apiKey) return '';
    if (apiKey.length <= 8) return '*'.repeat(apiKey.length);
    return `${apiKey.slice(0, 4)}${'*'.repeat(apiKey.length - 8)}${apiKey.slice(-4)}`;
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const handleClear = () => {
    onClear();
    setDraft('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-cyan-400">Gemini API Key 설정</h2>
            <p className="text-xs text-slate-400 mt-1">
              키는 브라우저의 로컬 저장소(localStorage)에만 저장됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800"
            aria-label="닫기"
          >
            닫기
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-sm text-slate-200 block" htmlFor="api-key-input">
            API Key
          </label>
          <input
            id="api-key-input"
            type={isVisible ? 'text' : 'password'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="AIza... 형태의 키를 붙여넣으세요"
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm placeholder-slate-500"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsVisible((v) => !v)}
              className="text-xs text-slate-300 hover:text-white"
              type="button"
            >
              {isVisible ? '숨기기' : '보이기'}
            </button>
            {apiKey && (
              <div className="text-xs text-slate-500" title={apiKey}>
                저장됨: {masked}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100">API 키가 없나요?</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Google AI Studio에서 로그인 후 키를 발급받아 붙여넣으면 됩니다.
              </p>
            </div>
            <a
              href={GOOGLE_AI_STUDIO_API_KEY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
            >
              키 발급받기
            </a>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
            안내 화면은 계정 상태에 따라 약관 동의/프로젝트 선택이 한 번 나올 수 있습니다.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={handleClear}
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            type="button"
          >
            삭제
          </button>
          <button
            onClick={handleSave}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            type="button"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
