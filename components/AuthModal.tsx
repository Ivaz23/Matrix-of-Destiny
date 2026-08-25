import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  CheckCircle, 
  HelpCircle,
  Smartphone,
  Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'offline_info';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInGuest } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Пожалуйста, введите email и пароль');
        }
        await signInWithEmail(email, password);
        setSuccessMessage('Успешный вход в аккаунт');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 500);
      } else if (mode === 'register') {
        if (!email.trim() || !password) {
          throw new Error('Пожалуйста, заполните все обязательные поля');
        }
        if (password.length < 6) {
          throw new Error('Пароль должен содержать не менее 6 символов');
        }
        await signUpWithEmail(email, password, displayName);
        setSuccessMessage('Аккаунт успешно создан!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 500);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Ошибка авторизации. Проверьте правильность введенных данных.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        setSuccessMessage(`Добро пожаловать, ${user.displayName || 'Искатель'}!`);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 500);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Не удалось войти через Google. Попробуйте войти по Email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInGuest();
      setSuccessMessage('Вход в гостевом режиме выполнен.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err: any) {
      // If anonymous auth is disabled, fallback to pure offline local mode
      setSuccessMessage('Активирован локальный офлайн-режим. Данные сохраняются на устройстве.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 700);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in no-print">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-[#090e1c] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#121b33] via-[#0b1022] to-[#121b33] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-serif font-bold text-lg flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base">
                {mode === 'login' && 'Вход в Профиль'}
                {mode === 'register' && 'Создание Аккаунта'}
                {mode === 'forgot' && 'Восстановление доступа'}
                {mode === 'offline_info' && 'Офлайн Режим'}
              </h3>
              <p className="text-[11px] text-amber-300/80">Синхронизация расчетов и истории</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1.5 bg-black/40 border-b border-white/5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2 rounded-xl transition-all ${mode === 'login' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            Вход по почте
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2 rounded-xl transition-all ${mode === 'register' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            Регистрация
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 leading-relaxed animate-shake">
              <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle size={18} className="shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-white text-black font-medium text-xs flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Продолжить с Google</span>
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-[10px] uppercase text-slate-500 tracking-wider">или по электронной почте</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">Ваше имя</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Например: Анна"
                    className="w-full bg-[#050812] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-medium">Email почта</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-[#050812] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-medium">Пароль</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full bg-[#050812] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 text-black font-serif font-bold text-xs flex items-center justify-center gap-2 hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-black" />
              ) : mode === 'login' ? (
                <>
                  <LogIn size={15} />
                  <span>Войти в аккаунт</span>
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  <span>Зарегистрироваться</span>
                </>
              )}
            </button>
          </form>

          {/* Guest / Offline Mode Note */}
          <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleGuestAuth}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-300 text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Globe size={14} className="text-amber-400" />
              <span>Продолжить без входа (Локально на устройстве)</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Все расчеты, матрицы и толкования работают на 100% даже без входа в аккаунт и без VPN.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
