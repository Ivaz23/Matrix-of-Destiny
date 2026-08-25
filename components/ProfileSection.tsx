import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Calendar, 
  History, 
  Trash2, 
  ExternalLink, 
  Shield, 
  Download, 
  MessageCircle, 
  Sparkles, 
  Eye, 
  Heart, 
  Loader2, 
  Radio, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  RefreshCw, 
  LogIn, 
  LogOut,
  Smartphone,
  Cpu
} from 'lucide-react';
import { SavedCalculation, UserInput } from '../types';
import { exportCalculationsToPdf, downloadAudioForCalculation } from '../services/exportUtils';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';
import { testAiProxyConnection, getApiBaseUrl } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

interface ProfileSectionProps {
  userInput: UserInput | null;
  savedCalculations: SavedCalculation[];
  onSelectCalculation: (calc: SavedCalculation) => void;
  onDeleteCalculation: (id: string) => void;
  onClearProfile: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  userInput,
  savedCalculations,
  onSelectCalculation,
  onDeleteCalculation,
  onClearProfile
}) => {
  const { user, signOut } = useAuth();
  const { loadingId, setLoadingId } = useGlobalAudio();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [proxyTestStatus, setProxyTestStatus] = useState<{
    testing: boolean;
    success?: boolean;
    latencyMs?: number;
    message?: string;
  }>({ testing: false });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chubuk_custom_proxy_url') || '';
      setProxyUrl(saved);
    } catch (e) {}
  }, []);

  const handleDownload = async (text: string, filename: string, id: string) => {
    setLoadingId(id);
    try {
      await downloadAudioForCalculation(text, filename);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSaveProxy = () => {
    try {
      if (proxyUrl.trim()) {
        localStorage.setItem('chubuk_custom_proxy_url', proxyUrl.trim());
      } else {
        localStorage.removeItem('chubuk_custom_proxy_url');
      }
      runProxyTest(proxyUrl.trim());
    } catch (e) {}
  };

  const runProxyTest = async (overrideUrl?: string) => {
    setProxyTestStatus({ testing: true });
    try {
      const result = await testAiProxyConnection(overrideUrl !== undefined ? overrideUrl : proxyUrl);
      setProxyTestStatus({
        testing: false,
        success: result.success,
        latencyMs: result.latencyMs,
        message: result.message
      });
    } catch (err: any) {
      setProxyTestStatus({
        testing: false,
        success: false,
        message: err?.message || 'Сетевая ошибка при проверке'
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-24">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1">
          <User size={30} />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif text-white tracking-wide">Профиль и Настройки Связи</h2>
        <p className="text-slate-400 max-w-xl mx-auto text-xs md:text-sm">
          Управление синхронизацией, безопасным доступом к AI без VPN и сохраненными расчетами.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Account & Profile Details */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Account Sync Card */}
          <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5 shadow-xl">
            <h3 className="text-lg font-serif text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield size={18} className="text-amber-400" />
                Синхронизация
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${user ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                {user ? 'Облако' : 'Локально'}
              </span>
            </h3>

            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full border border-amber-500/30" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold font-serif">
                      {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">{user.displayName || 'Искатель'}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email || 'Гостевой аккаунт'}</p>
                  </div>
                </div>

                <button
                  onClick={() => signOut()}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 border border-red-500/20 transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Выйти из аккаунта</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Войдите или зарегистрируйтесь, чтобы ваши матрицы и история были доступны на любом устройстве.
                </p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 text-black font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:from-amber-500 hover:to-amber-400 transition-all cursor-pointer"
                >
                  <LogIn size={15} />
                  <span>Войти / Создать аккаунт</span>
                </button>
              </div>
            )}
          </div>

          {/* Current Calculation Profile */}
          <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5 shadow-xl">
            <h3 className="text-lg font-serif text-white flex items-center gap-2">
              <User size={18} className="text-amber-400" />
              Текущий расчет
            </h3>
            
            {userInput ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold font-serif text-lg">
                    {userInput.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{userInput.name}</p>
                    <p className="text-[11px] text-amber-300/80 uppercase tracking-wider">{userInput.gender === 'male' ? 'Мужчина' : 'Женщина'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2.5 text-slate-300 text-xs px-1">
                  <Calendar size={15} className="text-amber-400" />
                  <span>{new Date(userInput.birthDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>

                <button 
                  onClick={onClearProfile}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all border border-white/5 cursor-pointer"
                >
                  Сбросить введенные данные
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-slate-400 text-xs italic">Данные еще не введены.</p>
                <p className="text-[11px] text-slate-500">Рассчитайте свою матрицу на главной странице.</p>
              </div>
            )}
          </div>

          {/* AI Connection & Proxy Panel (Option A - No VPN required) */}
          <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif text-white flex items-center gap-2">
                <Radio size={16} className="text-emerald-400 animate-pulse" />
                Связь с AI (Без VPN)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                Активен
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Все запросы к AI проксируются через защищенный европейский сервер. VPN на телефоне не требуется.
            </p>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300 text-[11px]">
                <span>Шлюз по умолчанию:</span>
                <span className="text-amber-300 font-mono text-[10px]">Cloud Run Europe</span>
              </div>
              
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => runProxyTest()}
                  disabled={proxyTestStatus.testing}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {proxyTestStatus.testing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  <span>Проверить скорость связи</span>
                </button>
              </div>

              {proxyTestStatus.message && (
                <div className={`p-2 rounded-xl text-[11px] flex items-center gap-2 ${proxyTestStatus.success ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-red-950/60 text-red-300 border border-red-500/30'}`}>
                  {proxyTestStatus.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  <span>{proxyTestStatus.message}</span>
                </div>
              )}
            </div>

            {/* Custom Proxy Accordion */}
            <details className="group text-xs text-slate-400">
              <summary className="cursor-pointer font-medium text-[11px] text-amber-400/80 hover:text-amber-300 select-none py-1">
                Пользовательский Proxy URL (Опционально)
              </summary>
              <div className="pt-2 space-y-2">
                <input
                  type="url"
                  value={proxyUrl}
                  onChange={(e) => setProxyUrl(e.target.value)}
                  placeholder="https://your-worker.workers.dev"
                  className="w-full bg-[#060913] border border-white/10 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveProxy}
                  className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-all"
                >
                  Сохранить свой Proxy
                </button>
              </div>
            </details>
          </div>
        </div>

        {/* Right Column: History Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 min-h-[450px] shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-3">
                <History size={22} className="text-amber-400" />
                История Расчетов
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Всего: {savedCalculations.length}
                </span>
                {savedCalculations.length > 0 && (
                  <button 
                    onClick={() => exportCalculationsToPdf(savedCalculations)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 uppercase tracking-wider transition-all border border-amber-500/30 cursor-pointer"
                  >
                    <Download size={14} />
                    PDF
                  </button>
                )}
              </div>
            </div>

            {savedCalculations.length > 0 ? (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                {savedCalculations.map((calc) => (
                  <motion.div 
                    key={calc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{calc.input.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(calc.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                      <button 
                        onClick={() => {
                          const fullText = [
                            calc.analysis?.introduction,
                            calc.analysis?.sections.map(s => `${s.title}: ${s.content}`).join('\n')
                          ].filter(Boolean).join('\n\n');
                          handleDownload(fullText.slice(0, 4500), `matrix_${calc.id}`, `dl_matrix_${calc.id}`);
                        }}
                        className="p-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all cursor-pointer"
                        title="Аудио: Матрица"
                      >
                        {loadingId === `dl_matrix_${calc.id}` ? <Loader2 className="animate-spin w-4 h-4" /> : <MessageCircle size={16} />}
                      </button>
                      {calc.astrologyResult && (
                        <button 
                          onClick={() => {
                            const fullText = [
                              calc.astrologyResult?.introduction,
                              calc.astrologyResult?.sections.map(s => `${s.title}: ${s.content}`).join('\n')
                            ].filter(Boolean).join('\n\n');
                            handleDownload(fullText.slice(0, 4500), `astro_${calc.id}`, `dl_astro_${calc.id}`);
                          }}
                          className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                          title="Аудио: Астрология"
                        >
                          {loadingId === `dl_astro_${calc.id}` ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                        </button>
                      )}
                      {calc.tarotReading && (
                        <button 
                          onClick={() => {
                            const fullText = [
                              calc.tarotReading?.question,
                              calc.tarotReading?.cards.map(c => `${c.name}: ${c.meaning}`).join('\n'),
                              calc.tarotReading?.interpretation
                            ].filter(Boolean).join('\n\n');
                            handleDownload(fullText.slice(0, 4500), `tarot_${calc.id}`, `dl_tarot_${calc.id}`);
                          }}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                          title="Аудио: Таро"
                        >
                          {loadingId === `dl_tarot_${calc.id}` ? <Loader2 className="animate-spin w-4 h-4" /> : <Eye size={16} />}
                        </button>
                      )}
                      <button 
                        onClick={() => exportCalculationsToPdf([calc])}
                        className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                        title="Скачать PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => onSelectCalculation(calc)}
                        className="p-2 rounded-xl bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                        title="Открыть расчет"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteCalculation(calc.id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-3 opacity-40">
                <History size={48} />
                <p className="text-base font-serif">История пока пуста</p>
                <p className="text-xs max-w-xs mx-auto">Каждый рассчитанный вами анализ будет автоматически сохраняться здесь.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default ProfileSection;
