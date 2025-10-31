import React from 'react';
import type { ChatLimitModalProps } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const ChatLimitModal: React.FC<ChatLimitModalProps> = ({ onSave, onDelete }) => {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className={`${theme === 'dark' ? 'bg-[#2D2D2D] border-[#727272]' : 'bg-[#FFFFFF] border-[#E2E5DE]'} border rounded-lg shadow-xl p-8 max-w-md w-full text-center`}>
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-[#E3E3E3]' : 'text-black'} mb-4`}>Chat History Limit Reached</h2>
        <p className={`${theme === 'dark' ? 'text-[#BDBDBD]' : 'text-gray-600'} mb-8`}>
          You have reached the 100-chat limit. To continue, please save and clear your current history, or delete it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onSave}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-colors ${theme === 'dark' ? 'bg-[#E3E3E3] hover:bg-[#BDBDBD] text-[#1E2021]' : 'bg-[#E2E5DE] hover:bg-opacity-80 text-gray-800'}`}
          >
            Save & Clear History
          </button>
          <button
            onClick={onDelete}
            className={`w-full ${theme === 'dark' ? 'bg-[#1E2021] hover:bg-[#2D2D2D] text-[#E3E3E3] border-[#727272]' : 'bg-[#F2F3F2] hover:bg-[#E2E5DE] text-black border-[#E2E5DE]'} font-bold py-3 px-6 rounded-lg transition-colors border`}
          >
            Delete History
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatLimitModal;