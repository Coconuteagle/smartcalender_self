import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  const handleLogin = () => {
    navigate('/login');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-bold text-white mb-4">로그인이 필요합니다</h2>
        <p className="text-slate-300 mb-6">이 기능을 사용하려면 로그인이 필요합니다.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleLogin}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            로그인
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
