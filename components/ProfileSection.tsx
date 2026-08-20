
import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, History, Trash2, ExternalLink, Shield, Download, MessageCircle, Sparkles, Eye, Heart, Loader2 } from 'lucide-react';
import { SavedCalculation, UserInput } from '../types';
import { exportCalculationsToPdf, downloadAudioForCalculation } from '../services/exportUtils';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';

interface ProfileSectionProps {
  userInput: UserInput | null;
  savedCalculations: SavedCalculation[];
  onSelectCalculation: (calc: SavedCalculation) => void;
  onDeleteCalculation: (id: string) => void;
  onClearProfile: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  userInput,
  savedCalculations,
  onSelectCalculation,
  onDeleteCalculation,
  onClearProfile
}) => {
  const { loadingId, setLoadingId } = useGlobalAudio();

  const handleDownload = async (text: string, filename: string, id: string) => {
    setLoadingId(id);
    try {
      await downloadAudioForCalculation(text, filename);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-2">
          <User size={32} />
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-white">Профиль Искателя</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Ваше личное пространство в мире энергий. Здесь хранятся ваши расчеты и история познания.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-serif text-white flex items-center gap-2">
              <Shield size={20} className="text-amber-500" />
              Текущий Профиль
            </h3>
            
            {userInput ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xl">
                    {userInput.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium">{userInput.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{userInput.gender === 'male' ? 'Мужчина' : 'Женщина'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-slate-400 px-2">
                  <Calendar size={16} />
                  <span className="text-sm">{new Date(userInput.birthDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>

                <button 
                  onClick={onClearProfile}
                  className="w-full mt-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest transition-all border border-red-500/20"
                >
                  Сбросить данные
                </button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-slate-500 text-sm italic">Профиль еще не создан.</p>
                <p className="text-xs text-slate-600">Рассчитайте свою матрицу на главной странице, чтобы сохранить данные.</p>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif text-white flex items-center gap-3">
                <History size={24} className="text-amber-500" />
                История Расчетов
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Всего: {savedCalculations.length}
                </span>
                {savedCalculations.length > 0 && (
                  <button 
                    onClick={() => exportCalculationsToPdf(savedCalculations)}
                    className="flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-all"
                  >
                    <Download size={16} />
                    PDF
                  </button>
                )}
              </div>
            </div>

            {savedCalculations.length > 0 ? (
              <div className="space-y-4">
                {savedCalculations.map((calc) => (
                  <motion.div 
                    key={calc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 rounded-2xl p-4 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{calc.input.name}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(calc.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                      <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          const fullText = [
                            calc.analysis?.introduction,
                            calc.analysis?.sections.map(s => `${s.title}: ${s.content}`).join('\n')
                          ].filter(Boolean).join('\n\n');
                          handleDownload(fullText.slice(0, 4500), `matrix_${calc.id}`, `dl_matrix_${calc.id}`);
                        }}
                        className="p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all"
                        title="Аудио: Матрица"
                      >
                        {loadingId === `dl_matrix_${calc.id}` ? <Loader2 className="animate-spin w-4 h-4" /> : <MessageCircle size={18} />}
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
                          className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                          title="Аудио: Астрология"
                        >
                          {loadingId === `dl_astro_${calc.id}` ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles size={18} />}
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
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                          title="Аудио: Таро"
                        >
                          {loadingId === `dl_tarot_${calc.id}` ? <Loader2 className="animate-spin w-4 h-4" /> : <Eye size={18} />}
                        </button>
                      )}
                      {calc.compatibilityResult && (
                        <button 
                          onClick={() => {
                            const fullText = [
                              calc.compatibilityResult?.introduction,
                              calc.compatibilityResult?.sections.map(s => `${s.title}: ${s.content}`).join('\n')
                            ].filter(Boolean).join('\n\n');
                            handleDownload(fullText.slice(0, 4500), `compat_${calc.id}`, `dl_compat_${calc.id}`);
                          }}
                          className="p-2 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500 hover:text-white transition-all"
                          title="Аудио: Совместимость"
                        >
                          {loadingId === `dl_compat_${calc.id}` ? <Loader2 className="animate-spin w-4 h-4" /> : <Heart size={18} />}
                        </button>
                      )}
                      <button 
                        onClick={() => exportCalculationsToPdf([calc])}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                        title="Скачать PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => onSelectCalculation(calc)}
                        className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all"
                        title="Открыть расчет"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button 
                        onClick={() => onDeleteCalculation(calc.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        title="Удалить"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                <History size={64} />
                <p className="text-lg font-serif">История пуста</p>
                <p className="text-xs max-w-xs mx-auto">Ваши прошлые расчеты будут появляться здесь автоматически.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
