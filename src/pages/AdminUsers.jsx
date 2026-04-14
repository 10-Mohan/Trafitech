import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, User, Mail, Calendar, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`, {
                headers: {
                    'x-auth-token': token
                }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-brand-purple" size={32} />
                        USER ADMINISTRATION
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage system access and roles</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-brand-blue transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border  rounded-2xl py-3 pl-12 pr-6 text-slate-800 dark:text-white w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue/40 transition-all backdrop-blur-md"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="glass-card p-6 h-48 animate-pulse bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-3xl border border-slate-100 dark:border-white/5" />
                    ))
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card p-6 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-brand-purple/30 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-brand-purple/10 text-brand-purple rounded-xl hover:bg-brand-purple/20 transition-all">
                                    Edit Role
                                </button>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${user.role === 'admin' ? 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple' : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'}`}>
                                    {user.role === 'admin' ? <Shield size={28} /> : <User size={28} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate">{user.username}</h3>
                                        {user.role === 'admin' && (
                                            <span className="text-[10px] bg-brand-purple/20 text-brand-purple px-2 py-0.5 rounded-full border border-brand-purple/30 font-black uppercase">Admin</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                                        <Mail size={12} /> {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                <div className="text-[10px] text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={12} /> Joined {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-brand-blue/20 flex items-center justify-center text-[8px] text-brand-blue">A</div>
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-brand-purple/20 flex items-center justify-center text-[8px] text-brand-purple">S</div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-lg">No users found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
