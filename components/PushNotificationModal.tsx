import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellRing, 
  BellOff, 
  Clock, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  X, 
  Send, 
  Sun, 
  Moon, 
  Briefcase, 
  Heart, 
  Zap, 
  ShieldCheck, 
  Smartphone,
  Info
} from 'lucide-react';
import { 
  NotificationSettings, 
  CustomReminder, 
  getNotificationPermission, 
  requestNotificationPermission, 
  getNotificationSettings, 
  saveNotificationSettings, 
  sendTestPushNotification, 
  addCustomReminder, 
  removeCustomReminder 
} from '../services/notificationService';
import { UserInput, MatrixNumbers } from '../types';

interface PushNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInput?: UserInput | null;
  matrix?: MatrixNumbers | null;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

export const PushNotificationModal: React.FC<PushNotificationModalProps> = ({
  isOpen,
  onClose,
  userInput,
  matrix,
  onTriggerHaptic
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [testSent, setTestSent] = useState(false);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [selectedGuideTab, setSelectedGuideTab] = useState<'android' | 'ios' | 'desktop'>('android');

  const checkStatusNow = () => {
    onTriggerHaptic?.(15);
    const p = getNotificationPermission();
    setPermission(p);
    if (p === 'granted') {
      const updated = { ...settings, enabled: true };
      setSettings(updated);
      saveNotificationSettings(updated);
    }
  };

  // New Reminder Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newTime, setNewTime] = useState('09:00');
  const [newCategory, setNewCategory] = useState<CustomReminder['category']>('business');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
      setSettings(getNotificationSettings());
    }
  }, [isOpen]);

  const handleRequestPermission = async () => {
    onTriggerHaptic?.([15, 30]);
    const res = await requestNotificationPermission();
    setPermission(res.permission);
    if (res.granted) {
      const updated = { ...settings, enabled: true };
      setSettings(updated);
      saveNotificationSettings(updated);
    }
  };

  const handleToggleMaster = () => {
    onTriggerHaptic?.(10);
    if (permission !== 'granted') {
      handleRequestPermission();
      return;
    }
    const updated = { ...settings, enabled: !settings.enabled };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleUpdateSetting = <K extends keyof NotificationSettings>(key: K, val: NotificationSettings[K]) => {
    onTriggerHaptic?.(8);
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleSendTest = async () => {
    onTriggerHaptic?.([20, 50]);
    if (permission !== 'granted') {
      await handleRequestPermission();
    }
    const success = await sendTestPushNotification(userInput?.name);
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onTriggerHaptic?.(12);

    addCustomReminder({
      title: newTitle.trim(),
      targetDate: newDate,
      targetTime: newTime,
      category: newCategory,
      description: newNotes.trim() || undefined
    });

    setSettings(getNotificationSettings());
    setNewTitle('');
    setNewNotes('');
    setIsAddingReminder(false);
  };

  const handleDeleteReminder = (id: string) => {
    onTriggerHaptic?.(10);
    removeCustomReminder(id);
    setSettings(getNotificationSettings());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-gradient-to-b from-[#0e1628] via-[#090f1d] to-[#060a14] border border-amber-500/40 rounded-3xl p-5 sm:p-6 relative shadow-2xl overflow-hidden my-auto"
      >
        {/* Glow Ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-black flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
              <BellRing size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-200 flex items-center gap-2">
                Push-Уведомления
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  SMART
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Напоминания о прогнозах, благоприятных датах и лунных циклах
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Permission Status Alert Banner */}
        <div className="mt-4 space-y-4 relative z-10">
          {permission === 'unsupported' ? (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200">
              <AlertTriangle size={18} className="text-amber-400 shrink-0" />
              <span>Ваш браузер не поддерживает Web Notifications API. Рекомендуем установить PWA приложение на Android/Desktop для получения всех оповещений.</span>
            </div>
          ) : permission === 'denied' ? (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-950/50 via-[#1a0c10] to-[#12080a] border border-rose-500/50 text-xs text-rose-200 space-y-3 shadow-xl">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-serif font-bold text-sm text-rose-100 block">Уведомления заблокированы в браузере</span>
                    <span className="text-[11px] text-rose-300/90 leading-relaxed block mt-0.5">
                      Браузер ограничил отправку системных сообщений. Разблокируйте их за 2 шага:
                    </span>
                  </div>
                </div>
                <button
                  onClick={checkStatusNow}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 font-bold text-[10px] flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-sm"
                  title="Проверить статус разрешения прямо сейчас"
                >
                  <span>🔄 Проверить</span>
                </button>
              </div>

              {/* OS Guide Selector */}
              <div className="pt-2 border-t border-rose-500/20 space-y-2">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-rose-500/30 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedGuideTab('android')}
                    className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all ${
                      selectedGuideTab === 'android' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🤖 Android
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGuideTab('ios')}
                    className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all ${
                      selectedGuideTab === 'ios' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🍏 iPhone / iOS
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGuideTab('desktop')}
                    className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all ${
                      selectedGuideTab === 'desktop' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    💻 ПК / Ноутбук
                  </button>
                </div>

                {/* Tab Instructions */}
                <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-[11px] text-slate-300 space-y-1.5">
                  {selectedGuideTab === 'android' && (
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>Нажмите на <strong className="text-amber-300">значок замочка / ползунков (настройки)</strong> слева в адресной строке Chrome.</li>
                      <li>Выберите пункт <strong className="text-amber-300">«Разрешения»</strong> или <strong className="text-amber-300">«Уведомления»</strong>.</li>
                      <li>Переключите тумблер в положение <strong className="text-emerald-300">«Разрешено»</strong>.</li>
                      <li>Вернитесь сюда и нажмите кнопку <strong className="text-amber-300">«🔄 Проверить»</strong> выше.</li>
                    </ol>
                  )}

                  {selectedGuideTab === 'ios' && (
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>В браузере Safari нажмите кнопку <strong className="text-amber-300">«Поделиться» (Share)</strong>.</li>
                      <li>Выберите <strong className="text-amber-300">«На экран "Домой"» (Add to Home Screen)</strong>.</li>
                      <li>Откройте приложение с экрана и включите уведомления.</li>
                    </ol>
                  )}

                  {selectedGuideTab === 'desktop' && (
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>Кликните на <strong className="text-amber-300">иконку настроек / замочка</strong> перед URL адресом сайта.</li>
                      <li>Найдите строку <strong className="text-amber-300">«Уведомления»</strong> и смените «Блокировать» на <strong className="text-emerald-300">«Разрешить»</strong>.</li>
                      <li>Нажмите кнопку <strong className="text-amber-300">«🔄 Проверить»</strong>.</li>
                    </ol>
                  )}
                </div>
              </div>
            </div>
          ) : permission === 'granted' ? (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Разрешение получено. Уведомления активны!</span>
              </div>
              <button
                onClick={handleSendTest}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold transition-all cursor-pointer"
              >
                {testSent ? 'Отправлено! ✨' : 'Тест Push 🚀'}
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-amber-400 shrink-0" />
                <div>
                  <span className="font-serif font-bold text-amber-200 block text-sm">Включить сакральные уведомления?</span>
                  <span className="text-[11px] text-slate-300">Получайте ежедневные знаки Вселенной и напоминания о денежных днях.</span>
                </div>
              </div>
              <button
                onClick={handleRequestPermission}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-serif font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/30 cursor-pointer shrink-0"
              >
                Разрешить
              </button>
            </div>
          )}

          {/* Master Toggle */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${settings.enabled ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-500'}`}>
                {settings.enabled ? <BellRing size={16} /> : <BellOff size={16} />}
              </div>
              <div>
                <span className="text-xs font-serif font-bold text-white block">Главный переключатель уведомлений</span>
                <span className="text-[10px] text-slate-400">Автоматическая доставка прогнозов и важных астро-дат</span>
              </div>
            </div>

            <button
              onClick={handleToggleMaster}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.enabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.enabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Notification Channels Grid */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 pl-1 block">
              Каналы и Категории
            </span>

            {/* Channel 1: Daily Forecast */}
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Sun size={16} className="text-amber-400" />
                  <div>
                    <span className="text-xs font-serif font-bold text-slate-100 block">
                      🌅 Ежедневный утренний прогноз
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Аркан дня, лунные сутки, биоритмы и кармический совет
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.dailyForecastEnabled}
                  onChange={(e) => handleUpdateSetting('dailyForecastEnabled', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {/* Time Picker */}
              {settings.dailyForecastEnabled && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <Clock size={12} className="text-amber-400" />
                    Время доставки:
                  </span>
                  <input
                    type="time"
                    value={settings.dailyForecastTime}
                    onChange={(e) => handleUpdateSetting('dailyForecastTime', e.target.value)}
                    className="px-2.5 py-1 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Channel 2: Favorable Planning Dates */}
            <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-emerald-400" />
                  <div>
                    <span className="text-xs font-serif font-bold text-slate-100 block">
                      💎 Благоприятные даты для дел
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Предупреждать о пиковых днях для сделок, покупок, любви и бизнеса
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.favorableDatesEnabled}
                  onChange={(e) => handleUpdateSetting('favorableDatesEnabled', e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {settings.favorableDatesEnabled && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Когда присылать напоминание:</span>
                  <select
                    value={settings.favorableDatesAdvanceDays}
                    onChange={(e) => handleUpdateSetting('favorableDatesAdvanceDays', Number(e.target.value))}
                    className="px-2 py-1 bg-black/60 border border-white/10 rounded-lg text-[11px] text-emerald-300 focus:outline-none"
                  >
                    <option value={1}>За 1 день до даты</option>
                    <option value={0}>В день события (утром)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Channel 3: Lunar & Cosmic Events */}
            <div className="p-3 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Moon size={16} className="text-purple-400" />
                <div>
                  <span className="text-xs font-serif font-bold text-slate-100 block">
                    🌙 Лунные фазы & Дни Силы
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Новолуния, Полнолуния, Экадаши и периоды без курса
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.lunarEventsEnabled}
                onChange={(e) => handleUpdateSetting('lunarEventsEnabled', e.target.checked)}
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
              />
            </div>

            {/* Channel 4: Biorhythms Critical Alerts */}
            <div className="p-3 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Zap size={16} className="text-cyan-400" />
                <div>
                  <span className="text-xs font-serif font-bold text-slate-100 block">
                    ⚡ Критические точки биоритмов
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Сигналы в дни нулевого баланса для повышенной осторожности
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.biorhythmCriticalEnabled}
                onChange={(e) => handleUpdateSetting('biorhythmCriticalEnabled', e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Custom Reminders List & Add Button */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-amber-400" />
                <span className="text-xs font-serif font-bold text-slate-200">
                  Запланированные Напоминания ({settings.customReminders.length})
                </span>
              </div>
              <button
                onClick={() => setIsAddingReminder(!isAddingReminder)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all cursor-pointer"
              >
                <Plus size={12} />
                <span>Добавить Дату</span>
              </button>
            </div>

            {/* New Reminder Form */}
            {isAddingReminder && (
              <form onSubmit={handleCreateReminder} className="p-3.5 rounded-2xl bg-black/60 border border-amber-500/30 space-y-2.5 text-xs">
                <div className="font-serif font-bold text-amber-200 text-xs">Новое кармическое напоминание:</div>
                <div>
                  <input
                    type="text"
                    placeholder="Например: Заключение договора / Свадьба / Покупка авто..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 bg-black/80 rounded-xl border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Дата:</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                      className="w-full px-2 py-1 bg-black/80 rounded-lg border border-white/10 text-xs text-amber-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Время:</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      required
                      className="w-full px-2 py-1 bg-black/80 rounded-lg border border-white/10 text-xs text-amber-300 font-mono"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Сфера:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-2 py-1 bg-black/80 rounded-lg border border-white/10 text-xs text-slate-200"
                    >
                      <option value="business">💼 Бизнес</option>
                      <option value="wealth">🪙 Финансы</option>
                      <option value="love">❤️ Любовь</option>
                      <option value="wedding">💍 Свадьба</option>
                      <option value="property">🔑 Покупки</option>
                      <option value="travel">✈️ Поездка</option>
                      <option value="health">🌿 Здоровье</option>
                      <option value="custom">✨ Другое</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingReminder(false)}
                    className="px-3 py-1 rounded-lg bg-white/5 text-slate-400 text-xs cursor-pointer hover:text-white"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            )}

            {/* List of Reminders */}
            {settings.customReminders.length === 0 ? (
              <p className="text-[11px] text-slate-500 text-center py-2 italic">
                Нет сохраненных персональных напоминаний на даты. Вы можете добавить их здесь или прямо из разделов «Элективные Даты» и «Календарь Силы».
              </p>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {settings.customReminders.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-bold text-slate-200 truncate">{r.title}</span>
                        {r.isSent && (
                          <span className="text-[9px] px-1.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                            Отправлено
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="text-amber-300 font-mono">{r.targetDate} в {r.targetTime}</span>
                        {r.description && <span>• {r.description}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteReminder(r.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Удалить напоминание"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
          <button
            onClick={handleSendTest}
            className="flex items-center gap-1.5 text-xs text-amber-300/80 hover:text-amber-300 font-medium cursor-pointer"
          >
            <Send size={13} />
            <span>Тестовый сигнал</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-serif font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20"
          >
            Готово
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PushNotificationModal;
