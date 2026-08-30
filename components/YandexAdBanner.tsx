import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, Tag, Info, Zap } from 'lucide-react';
import { 
  getMonetizationSettings, 
  initYandexAdsScript, 
  recordAdImpression, 
  recordAdClick,
  MonetizationSettings 
} from '../services/monetizationService';

interface YandexAdBannerProps {
  placement: 'header' | 'infeed' | 'sidebar' | 'footer';
  className?: string;
  onOpenAdmin?: () => void;
  onOpenPaywall?: () => void;
}

export const YandexAdBanner: React.FC<YandexAdBannerProps> = ({
  placement,
  className = '',
  onOpenAdmin,
  onOpenPaywall
}) => {
  const [settings, setSettings] = useState<MonetizationSettings>(getMonetizationSettings);
  const [isRendered, setIsRendered] = useState(false);
  const containerId = useRef(`yandex_rtb_${placement}_${Math.random().toString(36).substring(2, 9)}`).current;

  useEffect(() => {
    const handleUpdate = () => setSettings(getMonetizationSettings());
    window.addEventListener('chubuk_monetization_updated', handleUpdate);
    return () => window.removeEventListener('chubuk_monetization_updated', handleUpdate);
  }, []);

  const blockId = placement === 'header' 
    ? settings.yandexHeaderBlockId 
    : settings.yandexInfeedBlockId;

  const isRealYandexActive = settings.adsEnabled && settings.yandexAdsEnabled && !!blockId;

  useEffect(() => {
    if (!settings.adsEnabled) return;

    recordAdImpression();

    if (isRealYandexActive) {
      initYandexAdsScript().then((success) => {
        if (!success) return;
        try {
          const yaContextCb = (window as any).yaContextCb || [];
          yaContextCb.push(() => {
            if ((window as any).Ya && (window as any).Ya.Context) {
              (window as any).Ya.Context.AdvManager.render({
                blockId: blockId,
                renderTo: containerId,
                async: true
              });
              setIsRendered(true);
            }
          });
        } catch (e) {
          console.warn('Yandex Ad render error', e);
        }
      });
    }
  }, [blockId, isRealYandexActive, settings.adsEnabled]);

  if (!settings.adsEnabled) {
    return null;
  }

  // Real Yandex RTB Container
  if (isRealYandexActive) {
    return (
      <div className={`w-full overflow-hidden my-4 rounded-2xl bg-black/40 border border-white/10 p-2 text-center ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-2 pb-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Яндекс Реклама
          </span>
          <span className="text-[9px]">ID: {blockId}</span>
        </div>
        <div id={containerId} className="min-h-[90px] flex items-center justify-center text-xs text-slate-500">
          {!isRendered && <span className="animate-pulse">Загрузка рекламного блока...</span>}
        </div>
      </div>
    );
  }

  // High-converting Native Partner Showcase (Fallback when Yandex block ID is not yet entered)
  return (
    <div className={`w-full my-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#130b24] via-[#0d1326] to-[#0a1829] border border-amber-500/30 p-4 sm:p-5 shadow-xl ${className}`}>
      <div className="absolute top-2 right-3 flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-300">
          Партнерская рекомендация
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center shadow-lg font-serif font-black text-xl shrink-0">
            💎
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
                Натуральные минералы и браслеты по вашему Аркану
              </h4>
            </div>
            <p className="text-xs text-slate-300 font-light mt-0.5 line-clamp-1">
              Усиление денежного потока и защита биополя. Подбор камня по расчету Матрицы Судьбы.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <a
            href={settings.affiliateLithotherapyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordAdClick()}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-black text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <span>Выбрать камень</span>
            <ExternalLink size={13} />
          </a>

          {onOpenPaywall && (
            <button
              onClick={onOpenPaywall}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-serif transition-all border border-white/10"
              title="Отключить рекламу с тарифом VIP"
            >
              VIP (без рекламы)
            </button>
          )}
        </div>
      </div>

      {/* Admin Quick Setup Hint */}
      {!blockId && (
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-amber-300/80">
            <Info size={11} />
            <span>Владельцу: подключите свой ID РСЯ (Яндекс) в Админ-Панели для показа баннеров</span>
          </span>
          {onOpenAdmin && (
            <button 
              onClick={onOpenAdmin} 
              className="underline text-amber-400 hover:text-amber-300 cursor-pointer font-bold"
            >
              Настроить РСЯ →
            </button>
          )}
        </div>
      )}
    </div>
  );
};
