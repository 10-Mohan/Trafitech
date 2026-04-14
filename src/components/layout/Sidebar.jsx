import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Car, CircleParking, BarChart3, Settings, ShieldAlert, History, PieChart, LogOut, User as UserIcon, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const { isMobileMenuOpen, closeMobileMenu } = useApp();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        authAPI.logout();
        navigate('/login');
    };
    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/' },
        { icon: Car, label: 'Traffic Control', path: '/traffic' },
        { icon: CircleParking, label: 'Smart Parking', path: '/parking' },
        { icon: History, label: 'Booking History', path: '/booking-history' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: PieChart, label: 'Parking Analytics', path: '/parking-analytics' },
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: ShieldAlert, label: 'User Admin', path: '/admin-users', adminOnly: true },
    ];

    const filteredNavItems = navItems.filter(item => !item.adminOnly || user.role === 'admin');

    const [deferredPrompt, setDeferredPrompt] = React.useState(null);

    React.useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMobileMenu}
                        className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-[55] md:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={clsx(
                "fixed left-0 top-0 h-screen w-64 bg-slate-50 border-r border-slate-200 dark:bg-brand-dark/95 dark:border-white/5 backdrop-blur-xl z-[60] flex flex-col items-center py-6 transition-transform duration-300 md:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <button
                    onClick={closeMobileMenu}
                    className="absolute top-4 right-4 p-2 text-slate-500 md:hidden"
                >
                    <X size={20} />
                </button>

                <div className="mb-10 text-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent tracking-widest">
                        TRAFI<span className="text-slate-800 dark:text-white"> TECH</span>
                    </h1>
                    <div className="flex items-center gap-2 justify-center mt-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 tracking-[0.2em]">MANAGEMENT</p>
                        <span className="px-1.5 py-0.5 rounded bg-brand-blue/10 text-[10px] text-brand-blue border border-brand-blue/20 font-bold flex items-center gap-1">
                            <ShieldAlert size={8} /> SECURE
                        </span>
                    </div>
                </div>

                <nav className="w-full px-4 space-y-2">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                                clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                                    isActive
                                        ? "bg-brand-blue/10 text-brand-blue shadow-[0_0_15px_rgba(0,243,255,0.2)]"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 hover:text-slate-800 dark:text-white"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="relative z-10 flex items-center gap-3">
                                        <item.icon
                                            size={20}
                                            className={clsx("transition-transform group-hover:scale-110", isActive && "text-brand-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]")}
                                        />
                                        <span className="font-medium tracking-wide">{item.label}</span>
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav"
                                            className="absolute inset-0 bg-brand-blue/5 rounded-xl border border-brand-blue/20"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto px-6 w-full space-y-4">
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                            if (deferredPrompt) {
                                handleInstallClick();
                            } else {
                                alert("PWA Installation is not ready yet.\n\nMake sure you are accessing the site via 'localhost' natively, and not a network IP. The browser must fully register the Service Worker before this button activates!");
                            }
                        }}
                        className={clsx(
                            "w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg",
                            deferredPrompt
                                ? "bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-brand-blue/20 hover:shadow-brand-blue/40"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-70"
                        )}
                    >
                        {deferredPrompt ? "Install App" : "App Install Pending..."}
                    </motion.button>

                    <div className="glass-card p-4 rounded-xl border-slate-100 dark:border-white/5 space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                                <UserIcon size={20} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.username || 'User'}</p>
                                    {user.role === 'admin' && (
                                        <span className="text-[8px] bg-brand-purple/20 text-brand-purple px-1 rounded border border-brand-purple/30 font-black uppercase">Admin</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email || 'user@example.com'}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full py-2 flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-lg text-xs font-bold transition-all border border-red-500/10 hover:border-red-500/30"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>

                    <div className="glass-card p-4 rounded-xl text-center border-brand-green/20">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">System Status</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-green"></span>
                            </span>
                            <span className="text-sm font-bold text-brand-green tracking-wider shadow-green-500/50">ONLINE</span>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col items-center gap-2">
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1">
                            <ShieldAlert size={10} /> Encrypted Session
                        </p>
                        <div className="flex gap-4">
                            <button className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white transition-colors">Privacy</button>
                            <button className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white transition-colors">Ethics</button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
