
import React, { useState, useEffect } from 'react';
import { getUsers, addUser, updateUserPassword, removeUser } from '../services/db';
import { User, UserRole } from '../types';
import { DEPARTMENTS } from '../constants';
import { ArrowLeft, UserPlus, Key, Trash2, UserCog } from 'lucide-react';
import { Label, Input, Select } from '../components/FormComponents';

interface UserManagementProps {
    onBack: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isAddMode, setIsAddMode] = useState(false);
    
    // Form States
    const [newUser, setNewUser] = useState<Partial<User>>({ role: UserRole.APPLICANT });
    const [editingPasswordUser, setEditingPasswordUser] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        setUsers(getUsers());
    }, []);

    const refresh = () => {
        setUsers(getUsers());
        setMsg('');
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password || !newUser.name || !newUser.role) {
            setMsg('Error: 请填写所有必填字段');
            return;
        }

        const success = addUser(newUser as User);
        if (success) {
            setIsAddMode(false);
            setNewUser({ role: UserRole.APPLICANT });
            refresh();
            setMsg('成功: 用户已添加');
        } else {
            setMsg('Error: 用户名已存在');
        }
    };

    const handlePasswordChange = (username: string) => {
        if (!newPassword) return;
        updateUserPassword(username, newPassword);
        setEditingPasswordUser(null);
        setNewPassword('');
        refresh();
        setMsg(`成功: ${username} 的密码已修改`);
    };

    const handleDelete = (username: string) => {
        if (window.confirm(`确定要删除用户 ${username} 吗?`)) {
            removeUser(username);
            refresh();
        }
    }

    const roles = [
        { val: UserRole.MARKET_DEPT, label: '市场部 (超级管理员)' },
        { val: UserRole.TECH_DEPT, label: '技术部' },
        { val: UserRole.APPLICANT, label: '申请业务员' },
        { val: UserRole.BUSINESS_MANAGER, label: '业务部主管' },
        { val: UserRole.TECH_SUPPORT, label: '技术支持' },
        { val: UserRole.AFTER_SALES_CLERK, label: '福士营业' },
        { val: UserRole.REPAIR_TECH, label: '维修员' },
        { val: UserRole.INTERNAL_AFFAIRS, label: '内务部' },
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 pb-20">
            <div className="flex items-center mb-8">
                <button onClick={onBack} className="p-3 mr-4 rounded-xl hover:bg-white bg-white/50 shadow-sm transition-all">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <UserCog className="mr-3 text-purple-600"/> 账号权限管理
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">管理系统用户及其对应的角色权限</p>
                </div>
                <button 
                    onClick={() => setIsAddMode(true)}
                    className="bg-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center text-sm font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 hover:shadow-purple-300 transition-all active:scale-95"
                >
                    <UserPlus size={18} className="mr-2" /> 新增账号
                </button>
            </div>

            {msg && (
                <div className={`p-4 mb-6 rounded-xl border flex items-center ${msg.startsWith('Error') ? 'bg-red-50 text-red-800 border-red-100' : 'bg-green-50 text-green-800 border-green-100'}`}>
                    <div className={`w-2 h-2 rounded-full mr-3 ${msg.startsWith('Error') ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    {msg}
                </div>
            )}

            {isAddMode && (
                <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-purple-100 animate-fade-in-down">
                    <h3 className="font-bold text-lg mb-6 text-gray-800 border-b pb-2">添加新用户</h3>
                    <form onSubmit={handleAddUser}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="账号 (用户名)" value={newUser.username || ''} onChange={e => setNewUser({...newUser, username: e.target.value})} required placeholder="例如: tech_zhang" />
                            <Input label="姓名" value={newUser.name || ''} onChange={e => setNewUser({...newUser, name: e.target.value})} required placeholder="真实姓名" />
                            <Input label="初始密码" value={newUser.password || ''} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                            
                            <div className="mb-4">
                                <Label required>角色权限</Label>
                                <div className="relative">
                                    <select 
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                                        value={newUser.role}
                                        onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                                    >
                                        {roles.map(r => <option key={r.val} value={r.val}>{r.label}</option>)}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {newUser.role === UserRole.BUSINESS_MANAGER && (
                                <Select label="所属部门" options={DEPARTMENTS} value={newUser.department || ''} onChange={e => setNewUser({...newUser, department: e.target.value})} required />
                            )}
                            
                            {newUser.role === UserRole.TECH_SUPPORT && (
                                <Select label="负责区域" options={['husu', 'qingdao', 'south', 'zhejiang']} value={newUser.region || ''} onChange={e => setNewUser({...newUser, region: e.target.value})} required />
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button type="button" onClick={() => setIsAddMode(false)} className="px-6 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors font-medium">取消</button>
                            <button type="submit" className="bg-purple-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-purple-700 shadow-md">保存账号</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-5 pl-8">姓名 / 账号</th>
                            <th className="p-5">角色权限</th>
                            <th className="p-5">归属</th>
                            <th className="p-5 text-right pr-8">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map(u => (
                            <tr key={u.username} className="hover:bg-purple-50/30 transition-colors group">
                                <td className="p-5 pl-8">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold mr-3 text-lg">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800 text-base">{u.name}</div>
                                            <div className="text-gray-400 text-xs">{u.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
                                        {roles.find(r => r.val === u.role)?.label || u.role}
                                    </span>
                                </td>
                                <td className="p-5 text-gray-500 font-medium">
                                    {u.department || u.region ? (
                                        <span className="flex items-center">
                                            {u.department || u.region}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td className="p-5 text-right pr-8">
                                    <div className="flex justify-end gap-2 items-center opacity-80 group-hover:opacity-100 transition-opacity">
                                        {editingPasswordUser === u.username ? (
                                            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                                                <input 
                                                    type="text" 
                                                    placeholder="新密码"
                                                    className="bg-gray-50 border-none rounded p-1.5 w-24 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={newPassword}
                                                    onChange={e => setNewPassword(e.target.value)}
                                                    autoFocus
                                                />
                                                <button onClick={() => handlePasswordChange(u.username)} className="bg-green-500 text-white px-2 py-1.5 rounded text-xs font-bold hover:bg-green-600">OK</button>
                                                <button onClick={() => setEditingPasswordUser(null)} className="text-gray-400 hover:text-gray-600 p-1"><span className="text-xs">✕</span></button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setEditingPasswordUser(u.username)}
                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                                            >
                                                <Key size={14} /> 改密
                                            </button>
                                        )}
                                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                        <button 
                                            onClick={() => handleDelete(u.username)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            title="删除"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
