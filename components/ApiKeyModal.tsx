import React, { useState } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import { Key, ExternalLink } from 'lucide-react';

const ApiKeyModal: React.FC = () => {
    const { apiKey, setApiKey } = useApiKey();
    const [inputKey, setInputKey] = useState('');
    const [error, setError] = useState('');

    if (apiKey) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputKey.trim()) {
            setError('API Key를 입력해주세요.');
            return;
        }
        if (!inputKey.startsWith('AIza')) {
            setError('올바른 Google Cloud API Key 형식이 아닌 것 같습니다. (AIza로 시작)');
            // Proceed safely even if warning, or block? Let's block for basic validation.
            // But user said "AI Studio", keys there usually start with AIza.
            // Let's just warn but allow if they insist? No, simple validation is better.
        }
        setApiKey(inputKey.trim());
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-md w-full p-6 space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-cyan-900/50 text-cyan-400 mb-2">
                        <Key size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">API Key 설정</h2>
                    <p className="text-slate-400">
                        앱을 사용하려면 Google Gemini API Key가 필요합니다.<br />
                        브라우저에 로컬 저장되며 서버로 전송되지 않습니다.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Google Gemini API Key</label>
                        <input
                            type="password"
                            value={inputKey}
                            onChange={(e) => {
                                setInputKey(e.target.value);
                                setError('');
                            }}
                            placeholder="AIza..."
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                        />
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-cyan-900/20"
                    >
                        시작하기
                    </button>
                </form>

                <div className="pt-4 border-t border-slate-700">
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                    >
                        <span>Google AI Studio에서 키 발급받기</span>
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
