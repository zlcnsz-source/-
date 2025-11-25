import React from 'react';
import { User } from '../types';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, title = "艾而特售后服务" }) => {
  return (
    <header className="bg-blue-600 text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <div>
          <h1 className="text-lg font-bold">{title}</h1>
          {user && <p className="text-xs text-blue-100 opacity-90">{user.name} ({user.role})</p>}
        </div>
        {user && (
          <button 
            onClick={onLogout}
            className="p-2 bg-blue-700 rounded hover:bg-blue-800 transition-colors"
            title="退出登录"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  );
};