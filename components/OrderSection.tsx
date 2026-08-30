import React, { useState } from 'react';
import { Download, Check, Loader2, Sparkles, FileText, Shield, Star, Flame } from 'lucide-react';
import { UserInput, MatrixNumbers, AstrologyData, AnalysisResult } from '../types';
import { exportStylizedMatrixPdf } from '../services/exportUtils';

interface OrderSectionProps {
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
  astrology?: AstrologyData | null;
  analysis?: AnalysisResult | null;
  isVisible: boolean;
  onSuccess?: () => void;
}

type DownloadState = 'idle' | 'generating' | 'ready' | 'error';

const OrderSection: React.FC<OrderSectionProps> = ({
  userInput,
  matrix,
  astrology,
  analysis,
  isVisible,
  onSuccess
}) => {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownloadClick = async () => {
    if (downloadState === 'generating') return;
    if (!matrix || !userInput) {
      setErrorMessage('Сначала введите дату рождения для расчета');
      return;
    }

    setDownloadState('generating');
    setErrorMessage(null);

    try {
      await exportStylizedMatrixPdf({
        userInput,
        matrix,
        astrology,
        analysis: analysis || {
          introduction: `Персональный расчет энергий Матрицы Судьбы для ${userInput.name}`,
          forecast: 'Годовой цикл трансформации и раскрытия духовного потенциала.',
          sections: [
            { title: 'Энергия Личности', content: `Аркан ${matrix.day} отражает базовый код вашего проявления в социуме.` },
            { title: 'Таланты и Духовность', content: `Аркан ${matrix.month} указывает на высшие таланты, дарованные от рождения.` },
            { title: 'Материальная Карма', content: `Аркан ${matrix.year} определяет финансовый поток и материальную реализацию.` },
            { title: 'Центр Души (Комфорт)', content: `Аркан ${matrix.center} — ключ к гармонии и внутренней силе.` }
          ]
        },
        filename: `Сакральный_Отчет_${userInput.name?.replace(/\s+/g, '_') || 'Матрица'}`
      });

      setDownloadState('ready');
      if (onSuccess) onSuccess();

      setTimeout(() => {
        setDownloadState('idle');
      }, 4000);
    } catch (err: any) {
      console.error('PDF Generation failed in OrderSection:', err);
      setErrorMessage('Не удалось сформировать PDF. Попробуйте еще раз.');
      setDownloadState('error');
      setTimeout(() => {
        setDownloadState('idle');
      }, 3500);
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-2 sm:px-4 no-print">
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider mb-3">
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span>Сакральный Документ Судьбы</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-amber-100 mb-3">
          Ваш Результат <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Готов к Сохранению</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-base">
          Сгенерируйте и скачайте подарочный PDF-манускрипт с 22 арканами, астрологической космограммой, наталом и ключами судьбы на базе jsPDF.
        </p>
      </div>

      <div className="relative overflow-hidden p-[1px] rounded-3xl bg-gradient-to-b from-amber-500/60 via-amber-600/30 to-slate-900/60 shadow-[0_0_50px_rgba(251,191,36,0.2)]">
        <div className="bg-[#0c1224] rounded-3xl p-6 sm:p-10 relative overflow-hidden">
           
           {/* Background glow effect */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[220px] bg-amber-500/10 blur-[110px] pointer-events-none"></div>

           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             
             <div className="flex-1 space-y-4 sm:space-y-6 text-center md:text-left">
               <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
                   <Shield size={13} />
                   <span>Без ограничений • 100% Доступно</span>
                 </div>
                 <h3 className="text-2xl sm:text-3xl font-serif text-white mb-2">
                   Полный Сакральный Отчет (PDF)
                 </h3>
                 <div className="flex items-center justify-center md:justify-start gap-3">
                   <span className="text-3xl sm:text-4xl font-bold text-amber-400">0 ₽</span>
                   <span className="text-sm sm:text-base text-slate-500 line-through">4 990 ₽</span>
                   <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">Подарок портала</span>
                 </div>
               </div>

               <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 text-left mx-auto max-w-xs md:mx-0">
                 <li className="flex items-center gap-2.5">
                   <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                   <span>Стилизованный манускрипт высокого разрешения</span>
                 </li>
                 <li className="flex items-center gap-2.5">
                   <Star className="w-4 h-4 text-amber-400 shrink-0" />
                   <span>Расшифровка всех 22 арканов и карты здоровья</span>
                 </li>
                 <li className="flex items-center gap-2.5">
                   <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                   <span>Натальный астрологический анализ и камни-талисманы</span>
                 </li>
               </ul>

               {errorMessage && (
                 <p className="text-xs text-red-400 font-medium">{errorMessage}</p>
               )}
             </div>

             <div className="w-full md:w-auto flex flex-col items-center gap-3 shrink-0">
               <button 
                 type="button"
                 onClick={handleDownloadClick}
                 disabled={!isVisible || downloadState === 'generating'}
                 className={`w-full md:w-auto px-8 py-4 font-serif font-bold rounded-2xl shadow-xl transition-all transform flex items-center justify-center gap-3 min-w-[240px] cursor-pointer text-sm uppercase tracking-wider ${
                   downloadState === 'ready' 
                     ? 'bg-emerald-500 text-black shadow-emerald-500/30' 
                     : downloadState === 'error'
                     ? 'bg-red-600 text-white'
                     : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-amber-500/30 hover:scale-[1.03] active:scale-[0.98]'
                 } disabled:opacity-50 disabled:cursor-not-allowed`}
               >
                 {downloadState === 'idle' && (
                   <>
                     <Download size={18} className="text-slate-950" />
                     <span>Скачать отчет (PDF)</span>
                   </>
                 )}
                 {downloadState === 'generating' && (
                   <>
                     <Loader2 size={18} className="animate-spin text-slate-950" />
                     <span>Формирование PDF...</span>
                   </>
                 )}
                 {downloadState === 'ready' && (
                   <>
                     <Check size={18} className="text-black font-bold" />
                     <span>Отчет скачан!</span>
                   </>
                 )}
                 {downloadState === 'error' && (
                   <>
                     <Download size={18} />
                     <span>Повторить</span>
                   </>
                 )}
               </button>
               
               <p className="text-[11px] text-slate-400 text-center">
                 Формат PDF • Готов для печати и отправки
               </p>
             </div>

           </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSection;
