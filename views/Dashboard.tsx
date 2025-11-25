
import React, { useEffect, useState, useMemo } from 'react';
import { Ticket, User, UserRole, TicketStatus } from '../types';
import { getTicketsForUser } from '../services/db';
import { STATUS_LABELS } from '../constants';
import { Plus, ChevronRight, Clock, Shield, Users, Search, Filter, Inbox } from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (view: 'dashboard' | 'create' | 'detail' | 'users', ticketId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'pending'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setTickets(getTicketsForUser(user));
  }, [user]);

  // Derived state for filtering
  const filteredTickets = useMemo(() => {
    let result = tickets;

    // 1. Text Search
    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        result = result.filter(t => 
            t.id.toLowerCase().includes(lowerQ) ||
            t.step1.endUserName.toLowerCase().includes(lowerQ) ||
            t.step1.productName.toLowerCase().includes(lowerQ) ||
            t.step1.salesman.toLowerCase().includes(lowerQ)
        );
    }

    // 2. Tab Filter (Pending vs All)
    // "Pending" means not closed and generally requires action
    if (filterType === 'pending') {
         // Simple heuristic: If I am an applicant, I want to see everything I applied for (History).
         // If I am a worker, I mostly care about what I need to do NOW.
         // But for simplicity, let's say 'pending' filters out CLOSED tickets.
         result = result.filter(t => t.status !== TicketStatus.CLOSED);
    }

    return result;
  }, [tickets, searchQuery, filterType]);


  const getStatusStyle = (status: TicketStatus) => {
    if (status === TicketStatus.CLOSED) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-l-gray-400' };
    if (status === TicketStatus.DRAFT) return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-l-gray-300' };
    
    // Workflow logic colors
    if (status.includes('PENDING_BUSINESS')) return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-l-indigo-500' };
    if (status.includes('TECH')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-l-blue-500' };
    if (status.includes('REPAIR') || status.includes('RECEIVE')) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-l-orange-500' };
    if (status.includes('MARKET') || status.includes('INTERNAL')) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-l-purple-500' };
    
    return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-l-blue-500' };
  };

  return (
    <div className="max-w-5xl mx-auto p-4 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                工作台
                {user.role === UserRole.MARKET_DEPT && (
                    <span className="ml-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center shadow-sm">
                        <Shield size={10} className="mr-1"/> 超级管理员
                    </span>
                )}
            </h2>
            <p className="text-gray-500 text-sm mt-1">欢迎回来, {user.name}</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            {user.role === UserRole.MARKET_DEPT && (
                <button
                    onClick={() => onNavigate('users')}
                    className="flex-1 md:flex-none bg-white text-purple-700 border border-purple-200 px-4 py-2 rounded-xl flex items-center justify-center shadow-sm hover:bg-purple-50 transition-colors font-medium text-sm"
                >
                    <Users size={16} className="mr-2" />
                    账号管理
                </button>
            )}

            {user.role === UserRole.APPLICANT && (
            <button
                onClick={() => onNavigate('create')}
                className="flex-1 md:flex-none bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 active:scale-95 transition-all font-medium"
            >
                <Plus size={18} className="mr-1" />
                新建申请
            </button>
            )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="搜索工单号、客户、产品..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
            />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
             <button 
                onClick={() => setFilterType('pending')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterType === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                 待办/进行中
             </button>
             <button 
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                 全部历史
             </button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
                <Inbox size={32} className="text-gray-300" />
            </div>
            <p>暂无相关工单</p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
             const style = getStatusStyle(ticket.status);
             return (
                <div 
                  key={ticket.id} 
                  onClick={() => onNavigate('detail', ticket.id)}
                  className={`group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-0 overflow-hidden cursor-pointer transition-all duration-200 border-l-[4px] ${style.border}`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                             <span className="text-xs text-gray-400 mb-0.5 font-mono">{ticket.id}</span>
                             <span className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{ticket.step1.endUserName}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg ${style.bg} ${style.text} tracking-wide`}>
                          {STATUS_LABELS[ticket.status]}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg truncate">
                            <span className="text-gray-400 text-xs mr-1">产品:</span> {ticket.step1.productName}
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg truncate">
                            <span className="text-gray-400 text-xs mr-1">SN:</span> {ticket.step1.snCode}
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-gray-50 mt-2">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                <Users size={10} className="mr-1"/> {ticket.step1.department}
                            </span>
                            <span className="flex items-center">
                                <Clock size={10} className="mr-1"/>
                                {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <span className="flex items-center text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                            查看详情 <ChevronRight size={14} />
                        </span>
                    </div>
                  </div>
                </div>
            )
          })
        )}
      </div>
    </div>
  );
};
