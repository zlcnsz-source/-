
import React, { useState, useEffect } from 'react';
import { STATUS_LABELS } from '../constants';
import { User, UserRole } from '../types';
import { getTicketById, getUsers } from '../services/db';
import { Wrench, Search, Lock, User as UserIcon, ArrowRight, Activity, PlusCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigate: (view: 'login' | 'public_create') => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [mode, setMode] = useState<'login' | 'search'>('login');
  const [users, setUsers] = useState<User[]>([]);
  
  // Login State
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Search State
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
      const loadedUsers = getUsers();
      // Filter out 'applicant' role from the login list since they use the public form now
      const staffUsers = loadedUsers.filter(u => u.role !== UserRole.APPLICANT);
      setUsers(staffUsers);
      
      if (staffUsers.length > 0) {
          setSelectedUsername(staffUsers[0].username);
      }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === selectedUsername);
    if (user && user.password === password) {
        onLogin(user);
    } else {
        setError('密码错误，请重试');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setSearchResult(null);
      setSearchError('');
      
      if (!searchId.trim()) return;

      const ticket = getTicketById(searchId.trim());
      if (ticket) {
          setSearchResult({
              id: ticket.id,
              product: ticket.step1.productName,
              user: ticket.step1.endUserName,
              status: ticket.status,
              statusLabel: STATUS_LABELS[ticket.status]
          });
      } else {
          setSearchError('未找到该工单号，请确认输入是否正确');
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex flex-col justify-center items-center p-4">
      
      <div className="text-white text-center mb-8 animate-fade-in-down">
          <div className="bg-white/20 p-4 rounded-full inline-flex mb-4 backdrop-blur-sm">
            <Wrench size={48} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight shadow-black">艾而特售后服务</h1>
          <p className="text-blue-100 mt-2 text-sm opacity-90">高效 · 专业 · 透明</p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up transition-all duration-300 relative z-10">
        
        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 p-2 bg-gray-50">
            <button 
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200/50'}`}
                onClick={() => setMode('login')}
            >
                内部登录
            </button>
            <button 
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${mode === 'search' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200/50'}`}
                onClick={() => setMode('search')}
            >
                进度查询
            </button>
        </div>

        <div className="p-8">
            {mode === 'login' ? (
                <form onSubmit={handleLogin} className="animate-fade-in">
                    <div className="mb-5">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">选择账号</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={18} />
                            <select 
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                                value={selectedUsername}
                                onChange={e => setSelectedUsername(e.target.value)}
                            >
                                {users.map(u => (
                                    <option key={u.username} value={u.username}>
                                        {u.name} ({u.department || u.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">密码</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={18} />
                            <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="请输入密码"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">默认密码: 123</p>
                    </div>

                    {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center"><Activity size={16} className="mr-2"/>{error}</div>}

                    <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] flex justify-center items-center">
                        登录系统 <ArrowRight size={18} className="ml-2" />
                    </button>
                </form>
            ) : (
                <div className="animate-fade-in">
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">请输入工单号</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={searchId}
                                onChange={e => setSearchId(e.target.value)}
                                placeholder="例如: TK-2024-..."
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSearch} 
                        className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] mb-6"
                    >
                        查询进度
                    </button>

                    {searchError && (
                         <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                             {searchError}
                         </div>
                    )}

                    {searchResult && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500 font-mono">{searchResult.id}</span>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">{searchResult.statusLabel}</span>
                            </div>
                            <div className="font-bold text-gray-800 text-lg mb-1">{searchResult.user}</div>
                            <div className="text-gray-600 text-sm">{searchResult.product}</div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Guest Application Button Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-4">
             <button 
                onClick={() => onNavigate('public_create')}
                className="w-full border-2 border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 py-3 rounded-xl font-bold transition-all flex items-center justify-center group"
             >
                 <PlusCircle size={18} className="mr-2 group-hover:rotate-90 transition-transform" />
                 业务员免登录申请入口
             </button>
        </div>
      </div>
      
      <p className="mt-8 text-blue-200/60 text-xs">© 2024 Airte After-Sales Workflow System</p>
    </div>
  );
};
