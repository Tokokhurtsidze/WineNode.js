import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Wine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthPageProps {
  mode: 'login' | 'register';
}

export default function AuthPage({ mode }: AuthPageProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', displayName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.displayName);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.code
        ? err.code.replace('auth/', '').replace(/-/g, ' ')
        : t('error');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const togglePath = mode === 'login' ? '/auth/register' : '/auth/login';
  const toggleLabel = mode === 'login' ? t('no_account') : t('have_account');
  const toggleAction = mode === 'login' ? t('register') : t('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B0E14] px-4 py-24">
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(91,31,31,0.08), transparent 70%)',
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-md"
        >
          {/* Glass card */}
          <div
            className="rounded-2xl border border-gray-100 dark:border-[#B89968]/15 bg-white/80 dark:bg-[#12151D]/80 backdrop-blur-xl shadow-2xl px-8 py-10"
            style={{
              boxShadow:
                '0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 80px rgba(0,0,0,0.18)',
            }}
          >
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <Wine className="text-[#5b1f1f] dark:text-[#A04848]" size={20} />
              <span className="text-lg font-serif font-bold tracking-tight text-[#1a1a1a] dark:text-[#D9D2C6]">
                LAMIANI<span className="text-[#5b1f1f] dark:text-[#A04848]">.</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-center text-2xl font-serif font-light tracking-wide text-[#1a1a1a] dark:text-[#D9D2C6] mb-1">
              {mode === 'login' ? t('login_title') : t('register_title')}
            </h1>
            <div className="w-8 h-px bg-[#5b1f1f]/40 mx-auto mb-8" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#888880] mb-1.5">
                    {t('display_name')}
                  </label>
                  <input
                    name="displayName"
                    type="text"
                    value={form.displayName}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="w-full bg-gray-50 dark:bg-[#0B0E14]/60 border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] dark:text-[#D9D2C6] placeholder:text-gray-400 dark:placeholder:text-[#555] outline-none focus:border-[#5b1f1f]/60 dark:focus:border-[#B89968]/50 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#888880] mb-1.5">
                  {t('email')}
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full bg-gray-50 dark:bg-[#0B0E14]/60 border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] dark:text-[#D9D2C6] placeholder:text-gray-400 dark:placeholder:text-[#555] outline-none focus:border-[#5b1f1f]/60 dark:focus:border-[#B89968]/50 transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#888880] mb-1.5">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full bg-gray-50 dark:bg-[#0B0E14]/60 border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 pr-11 text-sm text-[#1a1a1a] dark:text-[#D9D2C6] placeholder:text-gray-400 dark:placeholder:text-[#555] outline-none focus:border-[#5b1f1f]/60 dark:focus:border-[#B89968]/50 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#555] hover:text-[#5b1f1f] dark:hover:text-[#B89968] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#888880] mb-1.5">
                    {t('confirm_password')}
                  </label>
                  <input
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className="w-full bg-gray-50 dark:bg-[#0B0E14]/60 border border-gray-200 dark:border-[#B89968]/20 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] dark:text-[#D9D2C6] placeholder:text-gray-400 dark:placeholder:text-[#555] outline-none focus:border-[#5b1f1f]/60 dark:focus:border-[#B89968]/50 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-red-500 dark:text-red-400 capitalize bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3.5 rounded-xl bg-[#5b1f1f] dark:bg-[#5b1f1f] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#6e2626] dark:hover:bg-[#6e2626] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#5b1f1f]/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('loading')}
                  </span>
                ) : (
                  mode === 'login' ? t('login') : t('register')
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100 dark:bg-[#B89968]/15" />
              <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#555]">or</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-[#B89968]/15" />
            </div>

            {/* Google */}
            <button
              type="button"
              disabled={googleLoading}
              onClick={async () => {
                setGoogleLoading(true);
                setError('');
                try {
                  await loginWithGoogle();
                  navigate(from, { replace: true });
                } catch (err: any) {
                  setError(err?.code?.replace('auth/', '').replace(/-/g, ' ') || t('error'));
                } finally {
                  setGoogleLoading(false);
                }
              }}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 dark:border-[#B89968]/20 bg-white dark:bg-[#0B0E14]/40 text-sm font-medium text-[#1a1a1a] dark:text-[#D9D2C6] hover:border-gray-300 dark:hover:border-[#B89968]/40 hover:shadow-sm transition-all duration-300 disabled:opacity-50"
            >
              {googleLoading ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>

            {/* Toggle */}
            <p className="mt-6 text-center text-xs text-gray-400 dark:text-[#666]">
              {toggleLabel}{' '}
              <Link
                to={togglePath}
                className="text-[#5b1f1f] dark:text-[#B89968] font-semibold hover:underline"
              >
                {toggleAction}
              </Link>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
