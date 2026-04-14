import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { authAPI } from '../../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            await authAPI.register(formData.username, formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#000510] relative overflow-hidden px-4">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md glass-panel p-8 relative z-10 border border-slate-200 dark:border-white/10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 rounded-2xl mb-4 border border-purple-500/30">
                        <UserPlus className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Create Account</h1>
                    <p className="text-blue-200/60">Join the smart parking revolution</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-blue-200/60 mb-2 ml-1">Username</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400/50 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border  rounded-xl py-4 pl-12 pr-4 text-slate-800 dark:text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                placeholder="johndoe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-200/60 mb-2 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400/50 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border  rounded-xl py-4 pl-12 pr-4 text-slate-800 dark:text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-200/60 mb-2 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400/50 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border  rounded-xl py-4 pl-12 pr-4 text-slate-800 dark:text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-200/60 mb-2 ml-1">Confirm Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400/50 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:border-white/10 border  rounded-xl py-4 pl-12 pr-4 text-slate-800 dark:text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Creating Account...' : (
                            <>
                                Sign Up
                                <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-blue-200/60 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Sign in instead
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
