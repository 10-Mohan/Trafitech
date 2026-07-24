import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../ThemeContext';
import { Sun, Moon } from 'lucide-react';

const DashboardLayout = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-800 dark:text-slate-200 font-sans selection:bg-brand-blue/30 overflow-x-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 relative">
                    {/* Background Ambient Glow */}
                    <div className="fixed top-20 right-20 w-96 h-96 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
                    <div className="fixed bottom-20 left-64 w-96 h-96 bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

                    <div className="relative z-10">
                        <Outlet />
                    </div>

                    {/* Floating Global Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        title="Toggle System Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} className="text-brand-yellow" /> : <Moon size={20} className="text-brand-purple" />}
                    </button>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
