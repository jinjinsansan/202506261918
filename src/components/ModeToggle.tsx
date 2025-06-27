import React from 'react';
import { User, Shield } from 'lucide-react';

interface ModeToggleProps {
  isAdminMode: boolean;
  onToggle: (isAdmin: boolean) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ isAdminMode, onToggle }) => {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 p-1 flex">
        <button
          onClick={() => onToggle(false)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
            !isAdminMode
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="ユーザーモード"
        >
          <User className="w-4 h-4" />
          <span className="text-xs font-jp-medium">ユーザー</span>
        </button>
        
        <button
          onClick={() => onToggle(true)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
            isAdminMode
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="カウンセラーモード"
        >
          <Shield className="w-4 h-4" />
          <span className="text-xs font-jp-medium">カウンセラー</span>
        </button>
      </div>
    </div>
  );
};

export default ModeToggle;