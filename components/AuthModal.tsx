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
  Globe,
  Send,
  Zap,
  Server,
  HelpCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'fast' | 'telegram' | 'email_login' | 'email_register' | 'hosting_guide';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithTelegram, signInGuest } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('fast');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const handleTelegramAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const clean = telegramUsername.replace('@', '').trim();
    if (!clean) {
      setError('Введите ваш Telegram никнейм (@username)');
      setLoading(false);
      return;
    }

    try {
      const user = await signInWithTelegram({
        username: clean,
        first_name: clean
      });
      setSuccessMessage(`Добро пожаловать в сакральный круг, @${clean}!`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'Не удалось авторизоваться через Telegram.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'email_login') {
        if (!email.trim() || !password) {
          throw new Error('Пожалуйста, введите email и пароль');
        }
        await signInWithEmail(email, password);
        setSuccessMessage('Успешный вход в аккаунт');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 500);
      } else if (mode === 'email_register') {
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
      setError(err?.message || 'Ошибка авторизации. Проверьте введенные данные.');
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
      setError(err?.message || 'Не удалось войти через Google. Попробуйте быстрый вход через Telegram или Email.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInGuest();
      setSuccessMessage('Вход в автономном режиме выполнен. Все работает без VPN!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err: any) {
      setSuccessMessage('Активирован локальный режим на устройстве.');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in no-print">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-[#090e1c] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#121b33] via-[#0b1022] to-[#121b33] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-serif font-bold text-lg flex items-center justify-center shadow-lg shadow-amber-500/10">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-base">
                {mode === 'fast' && 'Вход и Авторизация'}
                {mode === 'telegram' && 'Вход через Telegram'}
                {mode === 'email_login' && 'Вход по Email'}
                {mode === 'email_register' && 'Регистрация по Email'}
                {mode === 'hosting_guide' && '🇷🇺 Запуск в РФ без VPN'}
              </h3>
              <p className="text-[11px] text-amber-300/80">Работает стабильно 24/7 без ограничений</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Mode Nav */}
        <div className="grid grid-cols-4 p-1.5 bg-black/40 border-b border-white/5 text-[11px] font-semibold gap-1">
          <button
            type="button"
            onClick={() => { setMode('fast'); setError(null); }}
            className={`py-2 px-1 rounded-xl transition-all text-center ${mode === 'fast' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            ⚡ Быстрый
          </button>
          <button
            type="button"
            onClick={() => { setMode('telegram'); setError(null); }}
            className={`py-2 px-1 rounded-xl transition-all text-center flex items-center justify-center gap-1 ${mode === 'telegram' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            <Send size={12} className="text-sky-400" />
            <span>Telegram</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('email_login'); setError(null); }}
            className={`py-2 px-1 rounded-xl transition-all text-center ${mode === 'email_login' || mode === 'email_register' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Почта
          </button>
          <button
            type="button"
            onClick={() => { setMode('hosting_guide'); setError(null); }}
            className={`py-2 px-1 rounded-xl transition-all text-center flex items-center justify-center gap-1 ${mode === 'hosting_guide' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            <Server size={12} className="text-emerald-400" />
            <span>Хостинг</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex flex-col gap-2 leading-relaxed animate-shake">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="shrink-0 text-amber-400 mt-0.5" />
                <span className="text-slate-200">{error}</span>
              </div>
              {error.includes('Google') && (
                <div className="mt-1 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-amber-300">Рекомендуем войти через Telegram:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('telegram');
                      setError(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Вход по Telegram
                  </button>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle size={18} className="shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE: FAST (1-Click & Recommended Options) */}
          {mode === 'fast' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent border border-amber-500/30 text-center space-y-1">
                <div className="inline-flex items-center justify-center p-2 rounded-xl bg-amber-500/20 text-amber-300 mb-1">
                  <Zap size={20} />
                </div>
                <h4 className="font-serif font-bold text-white text-sm">Самый быстрый вход без VPN</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Не требует паролей и зарубежных сервисов. История сохраняется на вашем устройстве.
                </p>
              </div>

              {/* 1-Click Guest Button */}
              <button
                type="button"
                onClick={handleGuestAuth}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-serif font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Zap size={16} className="text-black fill-current" />
                <span>⚡ Войти в 1 клик (Без пароля и регистрации)</span>
              </button>

              {/* Telegram Login Button */}
              <button
                type="button"
                onClick={() => setMode('telegram')}
                className="w-full py-3 px-4 rounded-2xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/50 text-white font-medium text-xs flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Send size={16} className="text-[#229ED9] fill-[#229ED9]" />
                <span>Войти через Telegram (@username)</span>
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[10px] uppercase text-slate-500 tracking-wider">или другие способы</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-2xl bg-white text-black font-medium text-xs flex items-center justify-center gap-2.5 hover:bg-slate-100 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Продолжить с Google</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('email_login')}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Mail size={14} className="text-amber-400" />
                <span>Войти с Email и паролем</span>
              </button>
            </div>
          )}

          {/* MODE: TELEGRAM */}
          {mode === 'telegram' && (
            <form onSubmit={handleTelegramAuth} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-sky-200 text-xs flex items-start gap-2.5 leading-relaxed">
                <Send size={18} className="shrink-0 text-sky-400 mt-0.5" />
                <span>
                  Мгновенная привязка по вашему Telegram никнейму. Данные и расчеты сохранятся в вашем профиле без VPN и SMS.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 font-medium">Ваш Telegram @username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    placeholder="durov_guru"
                    className="w-full bg-[#050812] border border-sky-500/40 focus:border-sky-400 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#229ED9] hover:bg-[#1f8fc4] text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <>
                    <Send size={15} />
                    <span>Войти через Telegram</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode('fast')}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Вернуться к выбору
              </button>
            </form>
          )}

          {/* MODE: EMAIL LOGIN / REGISTER */}
          {(mode === 'email_login' || mode === 'email_register') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 p-1 bg-black/40 rounded-xl border border-white/5 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('email_login')}
                  className={`py-1.5 rounded-lg transition-all ${mode === 'email_login' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
                >
                  Вход
                </button>
                <button
                  type="button"
                  onClick={() => setMode('email_register')}
                  className={`py-1.5 rounded-lg transition-all ${mode === 'email_register' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'}`}
                >
                  Регистрация
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {mode === 'email_register' && (
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
                  ) : mode === 'email_login' ? (
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
            </div>
          )}

          {/* MODE: HOSTING IN RF (Timeweb, Yandex, VK Cloud) */}
          {mode === 'hosting_guide' && (
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 leading-relaxed space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-white text-xs">
                  <Server size={16} className="text-emerald-400" />
                  <span>Как захостить сайт в РФ на 100% без VPN:</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Приложение собирается в 1 статическую папку <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">dist/</code> и открывается со скоростью 0.2 сек у всех провайдеров РФ (МТС, Билайн, Мегафон, Ростелеком).
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-300 text-[11px]">1. Экспорт готовой сборки (0 ₽):</div>
                <div className="flex items-center justify-between bg-black/50 p-2 rounded-lg text-[11px] font-mono text-slate-300 border border-white/5">
                  <span>npm run build</span>
                  <button 
                    onClick={() => copyToClipboard('npm run build')}
                    className="text-amber-400 hover:text-amber-300 p-1"
                  >
                    {copiedCmd ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  В меню Settings вверху нажмите «Export to ZIP» или «Export to GitHub».
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-300 text-[11px]">2. Варианты серверов в РФ:</div>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  <li><strong>Timeweb Cloud:</strong> 190–300 ₽/мес (готовый Node.js/Nginx в Москве/СПб).</li>
                  <li><strong>Яндекс Cloud / VK Cloud:</strong> объектное хранилище S3 или легкий Compute Cloud.</li>
                  <li><strong>Netlify / Vercel:</strong> бесплатно (0 ₽) для всего мира.</li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-300 text-[11px]">3. Домен (.ru):</div>
                <p className="text-[11px] text-slate-300">
                  Домен .ru стоит ~190 ₽ в год. SSL-сертификат (зеленый замочек HTTPS) подключается бесплатно за 1 клик.
                </p>
              </div>
            </div>
          )}

          {/* Footer Offline Notice */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <Globe size={12} className="text-amber-400 shrink-0" />
            <span>Все расчеты и модули работают автономно на любом устройстве</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;

