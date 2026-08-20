import React, { useState } from 'react';

interface OrderSectionProps {
  onDownload: () => void;
  isVisible: boolean;
}

type DownloadState = 'idle' | 'preparing' | 'ready';

const OrderSection: React.FC<OrderSectionProps> = ({ onDownload, isVisible }) => {
  const [downloadState, setDownloadState] = useState<DownloadState>('idle');

  const handleDownloadClick = () => {
    if (downloadState !== 'idle') return;

    setDownloadState('preparing');
    
    // We keep the timeout short (500ms) to ensure the browser still considers this 
    // part of the user's click interaction (Trusted Event), preventing popup blocking.
    setTimeout(() => {
      // Trigger the external download/print handler
      onDownload();
      
      // Reset state after the print dialog closes (execution resumes)
      setDownloadState('idle');
    }, 500);
  };

  return (
    <section className="w-full max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-serif text-amber-100 mb-6">
          Ваш Результат <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Готов</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          В честь запуска портала сегодня все полные разборы доступны абсолютно бесплатно.
        </p>
      </div>

      <div className="relative overflow-hidden p-[1px] rounded-3xl bg-gradient-to-b from-amber-500/50 to-slate-900/50 shadow-[0_0_50px_rgba(251,191,36,0.2)]">
        <div className="bg-[#0f172a] rounded-3xl p-8 md:p-12 relative overflow-hidden">
           
           {/* Background shine effect */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-amber-500/10 blur-[100px]"></div>

           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             
             <div className="flex-1 space-y-6 text-center md:text-left">
               <div>
                 <div className="inline-block px-4 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold uppercase tracking-wider mb-4">
                   Акция: Бесплатно
                 </div>
                 <h3 className="text-3xl font-serif text-white mb-2">Полный Разбор Матрицы</h3>
                 <div className="flex items-center justify-center md:justify-start gap-3">
                   <span className="text-4xl font-bold text-amber-400">0 ₽</span>
                   <span className="text-lg text-slate-500 line-through">9 990 ₽</span>
                 </div>
               </div>

               <ul className="space-y-3 text-slate-300 text-left mx-auto max-w-xs md:mx-0">
                 <li className="flex items-center gap-2">
                   <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   PDF-отчет (50+ страниц)
                 </li>
                 <li className="flex items-center gap-2">
                   <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   Расшифровка всех энергий
                 </li>
                 <li className="flex items-center gap-2">
                   <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   Прогноз на текущий год
                 </li>
               </ul>
             </div>

             <div className="w-full md:w-auto flex flex-col gap-4">
               <button 
                 onClick={handleDownloadClick}
                 disabled={!isVisible || downloadState !== 'idle'}
                 className={`w-full md:w-auto px-8 py-4 font-bold rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-2 min-w-[220px] ${
                   downloadState === 'ready' 
                     ? 'bg-green-500 text-white hover:scale-100' 
                     : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 shadow-amber-500/20 hover:scale-105'
                 } disabled:opacity-50 disabled:cursor-not-allowed`}
               >
                 {downloadState === 'idle' && (
                   <>
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                     </svg>
                     Скачать PDF Отчет
                   </>
                 )}
                 {downloadState === 'preparing' && (
                   <>
                     <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Подготовка...
                   </>
                 )}
                 {downloadState === 'ready' && (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Готово!
                    </>
                 )}
               </button>
               
               {!isVisible && (
                 <p className="text-xs text-center text-slate-500">
                   Сначала рассчитайте матрицу
                 </p>
               )}
             </div>

           </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSection;