import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Smartphone, 
  Download, 
  Check, 
  Sparkles, 
  Share2, 
  ShieldCheck, 
  Wifi, 
  Maximize2, 
  Vibrate, 
  PackageCheck, 
  ExternalLink,
  ChevronRight,
  Zap,
  Info,
  Terminal,
  Code,
  FolderArchive
} from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstall: boolean;
  isStandalone: boolean;
  isAndroid: boolean;
  onTriggerInstall: () => Promise<boolean>;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  canInstall,
  isStandalone,
  isAndroid,
  onTriggerInstall,
  onTriggerHaptic
}) => {
  const [activeTab, setActiveTab] = useState<'install' | 'apk' | 'features'>('install');
  const [vibrateSuccess, setVibrateSuccess] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);

  if (!isOpen) return null;

  const manifestData = {
    name: "Catharsis Matrix",
    short_name: "Catharsis",
    description: "Сакральная Матрица Судьбы, Натальная Астрология, Чакры и Прогнозы для Android",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#050a14",
    theme_color: "#050a14",
    lang: "ru"
  };

  const handleCopyManifest = () => {
    onTriggerHaptic?.(10);
    navigator.clipboard.writeText(JSON.stringify(manifestData, null, 2));
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2500);
  };

  const handleTestVibrate = () => {
    onTriggerHaptic?.([30, 50, 30, 50, 100]);
    setVibrateSuccess(true);
    setTimeout(() => setVibrateSuccess(false), 2000);
  };

  const handleInstallClick = async () => {
    onTriggerHaptic?.(20);
    setInstalling(true);
    const success = await onTriggerInstall();
    setInstalling(false);
    if (success) {
      onClose();
    }
  };

  const handleToggleFullscreen = () => {
    onTriggerHaptic?.(15);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleCopyLink = () => {
    onTriggerHaptic?.(10);
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyBuildCommands = () => {
    onTriggerHaptic?.(10);
    const cmd = `npm run build\nnpx cap add android\nnpx cap sync\nnpx cap open android`;
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pwabuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-[#070b16] border border-amber-500/30 rounded-3xl p-5 sm:p-6 text-slate-100 shadow-[0_20px_70px_rgba(0,0,0,0.9)] z-10 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20 shrink-0">
                <Smartphone size={22} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                  Сборка и установка <span className="text-amber-400">Android</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {isStandalone ? 'Приложение работает в режиме Standalone' : 'PWA, APK, AAB и Android Studio'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sub-tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/50 border border-white/10 rounded-2xl mb-4">
            <button
              onClick={() => { onTriggerHaptic?.(8); setActiveTab('install'); }}
              className={`py-2 text-xs font-serif font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'install'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Установка
            </button>
            <button
              onClick={() => { onTriggerHaptic?.(8); setActiveTab('apk'); }}
              className={`py-2 text-xs font-serif font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'apk'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Сборка APK
            </button>
            <button
              onClick={() => { onTriggerHaptic?.(8); setActiveTab('features'); }}
              className={`py-2 text-xs font-serif font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Функции
            </button>
          </div>

          {/* Content Body */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {activeTab === 'install' && (
              <>
                {/* Standalone Status or Install Button */}
                {isStandalone ? (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-200">Приложение уже установлено</h4>
                      <p className="text-[11px] text-emerald-300/70">Вы используете нативный экран Standalone на Android.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#101728] to-amber-500/10 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-200 uppercase tracking-wider font-mono">
                        1-Click Быстрая установка
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Android PWA
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Установите иконку Catharsis Matrix на рабочий стол Android. Приложение будет открываться во весь экран без адресной строки браузера и работать офлайн.
                    </p>

                    {canInstall ? (
                      <button
                        onClick={handleInstallClick}
                        disabled={installing}
                        className="w-full py-3 px-4 btn-3d rounded-xl font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        <Download size={16} />
                        <span>{installing ? 'Установка...' : 'Установить на телефон в 1 клик'}</span>
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400">
                        Нажмите кнопку меню браузера на Android, чтобы добавить приложение на главный экран.
                      </div>
                    )}
                  </div>
                )}

                {/* Step-by-step Manual Guide */}
                <div className="space-y-2">
                  <h4 className="text-xs font-serif font-bold text-slate-300 uppercase tracking-wider px-1">
                    Инструкция по установке вручную
                  </h4>

                  <div className="space-y-2">
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">1</span>
                        <span>Google Chrome / Yandex Browser</span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-7">
                        Нажмите <strong className="text-slate-200">⋮ (три точки)</strong> в правом верхнем углу ➔ <strong className="text-amber-300">«Установить приложение»</strong> или <strong className="text-amber-300">«Добавить на главный экран»</strong>.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">2</span>
                        <span>Samsung Internet</span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-7">
                        Нажмите кнопку меню <strong className="text-slate-200">☰</strong> внизу ➔ <strong className="text-amber-300">«Добавить страницу в»</strong> ➔ <strong className="text-amber-300">«Экран приложений»</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Share Link */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedUrl ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                    <span>{copiedUrl ? 'Ссылка скопирована!' : 'Скопировать ссылку для Android'}</span>
                  </button>

                  <button
                    onClick={handleToggleFullscreen}
                    className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Полноэкранный режим"
                  >
                    <Maximize2 size={14} />
                    <span className="hidden sm:inline">Во весь экран</span>
                  </button>
                </div>
              </>
            )}

            {activeTab === 'apk' && (
              <div className="space-y-3.5">
                {/* 1. PWABuilder Direct Generator */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#0c1222] to-amber-600/10 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-xs">
                      <PackageCheck size={16} />
                      <span>1. Генератор готового APK / AAB онлайн</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      PWABuilder
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-amber-500/20 space-y-2 text-[11px] text-slate-300">
                    <div className="font-bold text-amber-200 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" />
                      <span>Как убрать «Missing Name / Timed out» на PWABuilder:</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Ссылка разработчика защищена сессией, поэтому внешний робот PWABuilder может выдать тайм-аут. Чтобы сразу упаковать APK:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px]">
                      <li>
                        Нажмите кнопку <strong className="text-amber-300">«Edit Your Manifest»</strong> прямо на сайте PWABuilder.
                      </li>
                      <li>
                        Укажите Имя: <strong className="text-white">Catharsis Matrix</strong> и Описание (или вставьте готовый JSON).
                      </li>
                      <li>
                        Нажмите <strong className="text-emerald-300">«Package For Stores» ➔ «Android» ➔ «Generate»</strong>!
                      </li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handleCopyManifest}
                      className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 hover:bg-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {copiedManifest ? <Check size={14} className="text-emerald-400" /> : <Code size={14} />}
                      <span>{copiedManifest ? 'JSON скопирован!' : 'Скопировать Manifest JSON'}</span>
                    </button>

                    <a
                      href={pwabuilderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-serif font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md cursor-pointer"
                    >
                      <span>Открыть PWABuilder</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* 2. Android Studio & Capacitor Build */}
                <div className="p-3.5 rounded-2xl bg-[#090e1c] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Terminal size={14} className="text-amber-400" />
                      <span>2. Сборка через Gradle / Android Studio</span>
                    </h5>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      Готово к сборке
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    В репозитории уже настроен каталог <code className="text-amber-300 bg-black/40 px-1 rounded">/android</code>, манифест <code className="text-amber-300 bg-black/40 px-1 rounded">AndroidManifest.xml</code> и Gradle-сборщик.
                  </p>

                  <div className="p-2.5 rounded-xl bg-black/70 border border-white/5 font-mono text-[11px] text-emerald-400 space-y-1">
                    <div className="text-slate-500 text-[10px]"># 1. Сборка веб-модулей и синхронизация:</div>
                    <div>npm run build</div>
                    <div>npx cap sync android</div>
                    <div className="text-slate-500 text-[10px]"># 2. Сборка готового APK файла:</div>
                    <div>cd android &amp;&amp; ./gradlew assembleDebug</div>
                    <div className="text-slate-500 text-[10px]"># Готовый файл появится в: android/app/build/outputs/apk/debug/</div>
                  </div>

                  <button
                    onClick={handleCopyBuildCommands}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedCmd ? <Check size={14} className="text-emerald-400" /> : <Code size={14} />}
                    <span>{copiedCmd ? 'Команды скопированы!' : 'Скопировать команды для терминала'}</span>
                  </button>
                </div>

                {/* 3. GitHub Actions Automatic APK Build */}
                <div className="p-3.5 rounded-2xl bg-[#090e1c] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <FolderArchive size={14} className="text-blue-400" />
                      <span>3. Автосборка в облаке (GitHub Actions)</span>
                    </h5>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      .github/workflows
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Добавлен рабочий процесс <code className="text-blue-300">.github/workflows/build-apk.yml</code>. При экспорте проекта в GitHub он автоматически компилирует APK в облаке и выдает готовую ссылку для скачивания во вкладке <strong>Actions ➔ Artifacts</strong>.
                  </p>
                </div>

                {/* 3. Info Badge */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                  <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-200/90 leading-relaxed">
                    Файлы конфигурации <code className="text-amber-300">capacitor.config.ts</code>, <code className="text-amber-300">android/app/src/main/AndroidManifest.xml</code> и <code className="text-amber-300">build.gradle</code> настроены под пакет <code className="text-amber-300">com.chubuk.catharsismatrix</code>.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Vibrate size={17} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Тактильная отдача (Вибрация)</span>
                      <span className="text-[10px] text-slate-400">Виброотклик кнопок и переключения вкладок</span>
                    </div>
                  </div>
                  <button
                    onClick={handleTestVibrate}
                    className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                  >
                    {vibrateSuccess ? '✓ Вибрирует!' : 'Тест'}
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wifi size={17} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Офлайн-режим (Service Worker)</span>
                    <span className="text-[10px] text-slate-400">Кеширование интерфейса для работы без интернета</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Smartphone size={17} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Обои на экран 9:16</span>
                    <span className="text-[10px] text-slate-400">Экспорт HD сакральных талисманов для экрана блокировки</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Zap size={17} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Быстрые ярлыки Android</span>
                    <span className="text-[10px] text-slate-400">Долгое нажатие на иконку открывает прогноз и чакры</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AndroidInstallModal;
