import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
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
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
