import { Bell, Search, User, ShieldCheck, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useApp } from '../../context/AppContext';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { toggleMobileMenu } = useApp();

    return (
        <header className="h-16 w-full flex items-center justify-between px-4 md:px-6 bg-slate-50/90 dark:bg-brand-dark/50 backdrop-blur-md border-b border-slate-100 dark:border-white/5 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>

                {/* Search Bar (Hidden on mobile searching, or simplified) */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-full border border-slate-100 dark:border-white/5 md:w-96 focus-within:border-brand-blue/50 transition-colors">
                    <Search size={18} className="text-slate-500 dark:text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search cameras, zones, or sensors..."
                        className="bg-transparent border-none outline-none text-sm text-slate-800 dark:text-white placeholder-slate-500 w-full"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white transition-colors bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/10"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={20} className="text-brand-yellow" /> : <Moon size={20} />}
                </button>


                {/* Notifications */}
                <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-brand-blue rounded-full"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-white/10">
                    <div className="text-right hidden md:block">
                        <div className="flex items-center gap-2 justify-end">
                            <ShieldCheck size={14} className="text-brand-blue" />
                            <p className="text-sm font-medium text-slate-800 dark:text-white">Admin Control</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Chief Operator (Secured)</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-blue to-brand-purple p-[1px]">
                        <div className="w-full h-full rounded-full bg-slate-50 dark:bg-brand-dark flex items-center justify-center">
                            <User size={20} className="text-slate-800 dark:text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
