import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    LogIn,
    Mail,
    Lock,
    AlertCircle,
    Eye,
    EyeOff,
    Car,
    ShieldCheck,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import { authAPI } from '../../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');

    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // =========================================
    // EMAIL VALIDATION
    // =========================================

    const validateEmail = (value) => {
        const trimmedEmail = value.trim();

        if (!trimmedEmail) {
            return 'Email address is required.';
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            return 'Please enter a valid email address.';
        }

        return '';
    };

    // =========================================
    // PASSWORD VALIDATION
    // =========================================

    const validatePassword = (value) => {
        if (!value) {
            return 'Password is required.';
        }

        return '';
    };

    // =========================================
    // FORM VALIDATION
    // =========================================

    const validateForm = () => {
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);

        setEmailError(emailValidation);
        setPasswordError(passwordValidation);
        setError('');

        return !emailValidation && !passwordValidation;
    };

    // =========================================
    // FORM SUBMIT
    // =========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authAPI.login(email.trim(), password, role);

            navigate('/');
        } catch (err) {
            setError(
                err?.message ||
                    'Unable to sign in. Please check your credentials and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // EMAIL CHANGE
    // =========================================

    const handleEmailChange = (e) => {
        const value = e.target.value;

        setEmail(value);
        setError('');

        if (value.trim()) {
            setEmailError(validateEmail(value));
        } else {
            setEmailError('');
        }
    };

    // =========================================
    // PASSWORD CHANGE
    // =========================================

    const handlePasswordChange = (e) => {
        const value = e.target.value;

        setPassword(value);
        setError('');

        if (value) {
            setPasswordError('');
        }
    };

    return (
        <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4 py-8 relative overflow-hidden">

            {/* =========================================
                BACKGROUND DECORATION
            ========================================= */}

            <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
            >
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />

                <div className="absolute -bottom-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />

                <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(#fff_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            {/* =========================================
                MAIN CONTAINER
            ========================================= */}

            <section className="relative z-10 w-full max-w-5xl">

                <div className="grid lg:grid-cols-2 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-blue-950/30 backdrop-blur-xl">

                    {/* =========================================
                        LEFT BRANDING PANEL
                    ========================================= */}

                    <div className="hidden lg:flex flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-blue-600/20 via-slate-900 to-cyan-500/10 border-r border-white/10">

                        <div>

                            {/* Logo */}

                            <div className="flex items-center gap-3 mb-12">

                                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">

                                    <Car className="w-6 h-6 text-blue-400" />

                                </div>

                                <div>

                                    <h2 className="text-xl font-bold tracking-tight">
                                        TraffiTech
                                    </h2>

                                    <p className="text-xs text-slate-400">
                                        Smart Traffic & Parking
                                    </p>

                                </div>

                            </div>

                            {/* Hero Text */}

                            <div className="max-w-md">

                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium mb-5">

                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                                    Intelligent mobility platform

                                </span>

                                <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">

                                    Smarter roads.

                                    <span className="block text-blue-400">
                                        Better journeys.
                                    </span>

                                </h1>

                                <p className="mt-5 text-slate-400 leading-relaxed">

                                    Manage traffic, parking and urban mobility
                                    through one connected platform.

                                </p>

                            </div>

                        </div>

                        {/* Feature Cards */}

                        <div className="grid grid-cols-3 gap-3 mt-12">

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                                <p className="text-2xl font-bold text-white">
                                    24/7
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                    Monitoring
                                </p>

                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                                <p className="text-2xl font-bold text-white">
                                    Smart
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                    Parking
                                </p>

                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                                <p className="text-2xl font-bold text-white">
                                    Live
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                    Traffic
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* =========================================
                        LOGIN PANEL
                    ========================================= */}

                    <div className="p-6 sm:p-8 lg:p-10 xl:p-12 bg-slate-950/70">

                        <div className="max-w-md mx-auto">

                            {/* Mobile Logo */}

                            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">

                                <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center">

                                    <Car className="w-6 h-6 text-blue-400" />

                                </div>

                                <div>

                                    <h2 className="text-xl font-bold">
                                        TraffiTech
                                    </h2>

                                    <p className="text-xs text-slate-400">
                                        Smart Traffic & Parking
                                    </p>

                                </div>

                            </div>

                            {/* Header */}

                            <div className="mb-8">

                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/20 mb-5">

                                    <LogIn className="w-6 h-6 text-blue-400" />

                                </div>

                                <h1 className="text-3xl font-bold tracking-tight text-white">
                                    Welcome back
                                </h1>

                                <p className="mt-2 text-sm text-slate-400">
                                    Sign in to continue to your TraffiTech
                                    dashboard.
                                </p>

                            </div>

                            {/* =========================================
                                ROLE SELECTOR
                            ========================================= */}

                            <div
                                className="grid grid-cols-2 gap-1 p-1 mb-7 rounded-xl bg-slate-900 border border-white/10"
                                role="group"
                                aria-label="Account type"
                            >

                                {/* Driver */}

                                <button
                                    type="button"
                                    onClick={() => setRole('user')}
                                    aria-pressed={role === 'user'}
                                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        role === 'user'
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >

                                    <Car className="w-4 h-4" />

                                    Driver

                                </button>

                                {/* City Admin */}

                                <button
                                    type="button"
                                    onClick={() => setRole('admin')}
                                    aria-pressed={role === 'admin'}
                                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                        role === 'admin'
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >

                                    <ShieldCheck className="w-4 h-4" />

                                    City Admin

                                </button>

                            </div>

                            {/* =========================================
                                BACKEND ERROR
                            ========================================= */}

                            {error && (

                                <div
                                    role="alert"
                                    className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                                >

                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

                                    <p>{error}</p>

                                </div>

                            )}

                            {/* =========================================
                                LOGIN FORM
                            ========================================= */}

                            <form
                                onSubmit={handleSubmit}
                                noValidate
                                className="space-y-5"
                            >

                                {/* =====================================
                                    EMAIL
                                ===================================== */}

                                <div>

                                    <label
                                        htmlFor="login-email"
                                        className="block text-sm font-medium text-slate-200 mb-2"
                                    >
                                        Email Address
                                    </label>

                                    <div className="relative">

                                        <Mail
                                            aria-hidden="true"
                                            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                                                emailError
                                                    ? 'text-red-400'
                                                    : email.trim()
                                                        ? 'text-emerald-400'
                                                        : 'text-slate-500'
                                            }`}
                                        />

                                        <input
                                            id="login-email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            value={email}
                                            onChange={handleEmailChange}
                                            aria-invalid={Boolean(emailError)}
                                            aria-describedby={
                                                emailError
                                                    ? 'email-error'
                                                    : undefined
                                            }
                                            placeholder="name@example.com"
                                            className={`w-full rounded-xl border bg-white/[0.03] py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none transition-all ${
                                                emailError
                                                    ? 'border-red-400/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                                                    : email.trim()
                                                        ? 'border-emerald-400/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                                                        : 'border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                            }`}
                                        />

                                    </div>

                                    {/* Email feedback */}

                                    {emailError ? (

                                        <p
                                            id="email-error"
                                            className="mt-2 flex items-center gap-1.5 text-xs text-red-400"
                                        >

                                            <AlertCircle className="w-3.5 h-3.5" />

                                            {emailError}

                                        </p>

                                    ) : email.trim() ? (

                                        <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">

                                            <CheckCircle2 className="w-3.5 h-3.5" />

                                            Valid email address

                                        </p>

                                    ) : null}

                                </div>

                                {/* =====================================
                                    PASSWORD
                                ===================================== */}

                                <div>

                                    <label
                                        htmlFor="login-password"
                                        className="block text-sm font-medium text-slate-200 mb-2"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">

                                        <Lock
                                            aria-hidden="true"
                                            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                                                passwordError
                                                    ? 'text-red-400'
                                                    : password
                                                        ? 'text-emerald-400'
                                                        : 'text-slate-500'
                                            }`}
                                        />

                                        <input
                                            id="login-password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={handlePasswordChange}
                                            aria-invalid={Boolean(
                                                passwordError
                                            )}
                                            aria-describedby={
                                                passwordError
                                                    ? 'password-error'
                                                    : undefined
                                            }
                                            placeholder="Enter your password"
                                            className={`w-full rounded-xl border bg-white/[0.03] py-3.5 pl-12 pr-12 text-white placeholder:text-slate-600 outline-none transition-all ${
                                                passwordError
                                                    ? 'border-red-400/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                                                    : password
                                                        ? 'border-emerald-400/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                                                        : 'border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                            }`}
                                        />

                                        {/* Show / Hide password */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (current) => !current
                                                )
                                            }
                                            aria-label={
                                                showPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors"
                                        >

                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}

                                        </button>

                                    </div>

                                    {/* Password error */}

                                    {passwordError && (

                                        <p
                                            id="password-error"
                                            className="mt-2 flex items-center gap-1.5 text-xs text-red-400"
                                        >

                                            <AlertCircle className="w-3.5 h-3.5" />

                                            {passwordError}

                                        </p>

                                    )}

                                </div>

                                {/* =========================================
                                    SIGN IN BUTTON
                                ========================================= */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-3.5 font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                                >

                                    {loading ? (

                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Signing in...
                                        </>

                                    ) : (

                                        <>
                                            Sign In
                                            <LogIn className="w-5 h-5" />
                                        </>

                                    )}

                                </button>

                            </form>

                            {/* =========================================
                                REGISTER LINK
                            ========================================= */}

                            <p className="mt-7 text-center text-sm text-slate-500">

                                Don't have an account?{' '}

                                <Link
                                    to="/register"
                                    className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Create one now
                                </Link>

                            </p>

                            {/* Footer */}

                            <p className="mt-5 text-center text-xs text-slate-600">

                                Your credentials are securely processed through
                                TraffiTech authentication.

                            </p>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
};

export default Login;