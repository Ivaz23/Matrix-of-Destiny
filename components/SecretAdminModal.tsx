import React, { useState } from 'react';
import { 
  ShieldAlert, 
  KeyRound, 
  Lock, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  LogOut,
  Infinity
} from 'lucide-react';
import { unlockAdminWithPin, lockAdmin, isUserAdmin } from '../services/usageLimitService';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onSuccess?: () => void;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
  onTriggerHaptic
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isAdmin = isUserAdmin(user);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerHaptic?.(20);
    setError(null);

    const unlocked = unlockAdminWithPin(pin, user);
    if (unlocked) {
      setSuccess(true);
      onTriggerHaptic?.([30, 50, 30]);
      setTimeout(() => {
        setSuccess(false);
        setPin('');
        onSuccess?.();
        onClose();
      }, 800);
    } else {
      setError('Неверный Мастер-Пароль. Доступ отклонен.');
      onTriggerHaptic?.([50, 50, 50]);
    }
  };

  const handleLock = () => {
    onTriggerHaptic?.(15);
    lockAdmin();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in no-print">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#0c1427] via-[#090e1c] to-[#050811] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/15 blur-[60px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 text-black flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)] mb-3">
            {isAdmin ? <ShieldAlert size={28} /> : <Lock size={28} />}
          </div>
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-1.5">
            Секретный Вход • Master Control
          </span>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
            {isAdmin ? 'Режим Администратора Активен' : 'Вход Администратора'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">
            {isAdmin 
              ? 'У вас включен безлимитный доступ ко всем разделам, Таро, оракулу и настройкам системы.'
              : 'Введите секретный мастер-пароль создателя для снятия любых лимитов и открытия панели управления.'}
          </p>
        </div>

        {isAdmin ? (
          /* Active Admin State Controls */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-black shrink-0">
                <Infinity size={20} />
              </div>
              <div className="text-xs">
                <div className="text-amber-200 font-bold font-serif">Статус: Создатель / VIP Master</div>
                <div className="text-slate-400">Лимиты отключены. Расклады и расчеты без ограничений.</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onTriggerHaptic?.(10);
                  onSuccess?.();
                  onClose();
                }}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
              >
                В Админку 👑
              </button>
              <button
                type="button"
                onClick={handleLock}
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-white/10 hover:border-red-500/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Выйти из админа</span>
              </button>
            </div>
          </div>
        ) : (
          /* PIN Input Form */
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-amber-300/80 mb-1.5 ml-1">
                Мастер-Пароль или ПИН
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Введите пароль доступа..."
                  autoFocus
                  className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-black/60 border border-amber-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm transition-all shadow-inner font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPin ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Пароль принят! Открываем безлимитный доступ...</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound size={16} />
              <span>Разблокировать Master Доступ</span>
            </button>

            <div className="text-center pt-1">
              <span className="text-[11px] text-slate-500 font-sans">
                Секретный шлюз защищен сессионным шифрованием.
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SecretAdminModal;
