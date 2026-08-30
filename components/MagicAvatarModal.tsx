import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  Wand2, 
  Download, 
  Check, 
  RefreshCw, 
  User, 
  Calendar, 
  Shield, 
  Flame, 
  Star, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Zap,
  Crown
} from 'lucide-react';
import { UserInput } from '../types';
import { 
  AVATAR_STYLES, 
  AVATAR_MOODS, 
  AvatarStyleId, 
  AvatarMoodId, 
  ARCANA_ARCHETYPES_RU,
  generateMagicAvatar, 
  setUserCustomAvatar, 
  UserCustomAvatar,
  buildMagicAvatarPrompt
} from '../services/avatarService';
import { calculateMatrix } from '../services/numerologyUtils';
import { getAstrologyData } from '../services/astrologyUtils';

interface MagicAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInput: UserInput | null;
  userId?: string;
  onAvatarSaved?: (avatar: UserCustomAvatar) => void;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

export const MagicAvatarModal: React.FC<MagicAvatarModalProps> = ({
  isOpen,
  onClose,
  userInput: initialUserInput,
  userId,
  onAvatarSaved,
  onTriggerHaptic
}) => {
  // Fallback user input form if user hasn't calculated matrix yet
  const [nameInput, setNameInput] = useState(initialUserInput?.name || '');
  const [birthDateInput, setBirthDateInput] = useState(initialUserInput?.birthDate || '1995-07-15');
  const [genderInput, setGenderInput] = useState<'male' | 'female'>(initialUserInput?.gender || 'male');

  const activeUserInput: UserInput = initialUserInput || {
    name: nameInput || 'Искатель',
    birthDate: birthDateInput || '1995-07-15',
    gender: genderInput
  };

  const [selectedStyle, setSelectedStyle] = useState<AvatarStyleId>('neo_mystic');
  const [selectedMood, setSelectedMood] = useState<AvatarMoodId>('gold_light');
  const [customIntent, setCustomIntent] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generatedAvatar, setGeneratedAvatar] = useState<UserCustomAvatar | null>(null);
  const [isSavedAsProfile, setIsSavedAsProfile] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derive matrix breakdown
  const matrix = calculateMatrix(activeUserInput.birthDate);
  const astrology = getAstrologyData(activeUserInput.birthDate);
  const dayArc = ARCANA_ARCHETYPES_RU[matrix.day] || ARCANA_ARCHETYPES_RU[1];
  const centerArc = ARCANA_ARCHETYPES_RU[matrix.center] || ARCANA_ARCHETYPES_RU[10];
  const destinyArc = ARCANA_ARCHETYPES_RU[matrix.destiny] || ARCANA_ARCHETYPES_RU[21];

  const handleStartGeneration = async () => {
    if (!activeUserInput.name.trim()) {
      setErrorMessage('Пожалуйста, укажите ваше имя');
      return;
    }
    setErrorMessage(null);
    setIsGenerating(true);
    setIsSavedAsProfile(false);
    onTriggerHaptic?.([20, 50, 20]);

    try {
      setGenerationStep('Считывание архетипов Матрицы Судьбы...');
      await new Promise(r => setTimeout(r, 600));

      setGenerationStep(`Синтез ${matrix.day} Аркана (${dayArc.name}) и стихии ${astrology.element}...`);
      await new Promise(r => setTimeout(r, 800));

      setGenerationStep('Генерация сакрального образа через нейросеть...');

      const result = await generateMagicAvatar({
        userInput: activeUserInput,
        style: selectedStyle,
        mood: selectedMood,
        customIntent: customIntent.trim() || undefined
      });

      const newCustomAvatar: UserCustomAvatar = {
        id: `avatar_${Date.now()}`,
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        style: selectedStyle,
        mood: selectedMood,
        createdAt: Date.now(),
        userName: activeUserInput.name,
        dayArcana: result.dayArcana,
        centerArcana: result.centerArcana,
        destinyArcana: result.destinyArcana,
        zodiacSign: result.zodiacSign,
        blessingText: result.blessingText
      };

      setGeneratedAvatar(newCustomAvatar);
      onTriggerHaptic?.([40, 80, 40]);
    } catch (err: any) {
      console.error('Avatar generation error:', err);
      setErrorMessage(err?.message || 'Не удалось сгенерировать аватар. Попробуйте снова.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleSaveToProfile = async () => {
    if (!generatedAvatar) return;
    onTriggerHaptic?.(25);
    await setUserCustomAvatar(generatedAvatar, userId);
    setIsSavedAsProfile(true);
    if (onAvatarSaved) {
      onAvatarSaved(generatedAvatar);
    }
  };

  const handleDownload = () => {
    if (!generatedAvatar) return;
    onTriggerHaptic?.(15);
    const link = document.createElement('a');
    link.href = generatedAvatar.imageUrl;
    link.download = `chubuk-magic-avatar-${activeUserInput.name.toLowerCase().replace(/\s+/g, '_')}-${matrix.day}arcana.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    if (!generatedAvatar) return;
    onTriggerHaptic?.(10);
    navigator.clipboard.writeText(generatedAvatar.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-gradient-to-b from-[#0e162e] via-[#0b1124] to-[#070b18] border border-amber-500/40 rounded-3xl p-5 sm:p-7 max-w-3xl w-full shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors z-20 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Sparkles size={24} className="fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                Магический AI Аватар
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
                Матрица Судьбы
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Генерация сакрального портрета души на основе ваших личных арканов и звезд
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: GENERATION RESULT VIEW                           */}
        {/* ========================================================= */}
        {generatedAvatar ? (
          <div className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-12 gap-6 items-center">
              {/* Avatar Preview Box */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-500 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
                  
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-black shadow-2xl flex items-center justify-center">
                    <img 
                      src={generatedAvatar.imageUrl} 
                      alt="Magic Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Arcana floating watermark badge */}
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-amber-500/40 text-[11px] font-serif font-bold text-amber-300 flex items-center gap-1">
                      <span>{generatedAvatar.dayArcana} Аркан</span>
                    </div>

                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-[10px] text-slate-300">
                      {generatedAvatar.zodiacSign}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs text-amber-400 font-serif font-bold">
                    {generatedAvatar.userName}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-400 font-serif">
                    {dayArc.name}
                  </span>
                </div>
              </div>

              {/* Avatar Interpretation & Blessing */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-serif font-bold text-amber-300">
                    <Crown size={15} className="text-amber-400" />
                    <span>Благословение Старца Чубука:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                    {generatedAvatar.blessingText}
                  </p>
                </div>

                {/* Energy Matrix Badges */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Визитка</div>
                    <div className="text-xs font-serif font-bold text-amber-300 mt-0.5">
                      {generatedAvatar.dayArcana} Аркан
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">{dayArc.name}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Сердцевина</div>
                    <div className="text-xs font-serif font-bold text-purple-300 mt-0.5">
                      {generatedAvatar.centerArcana} Аркан
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">{centerArc.name}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-[10px] text-slate-400 uppercase">Судьба</div>
                    <div className="text-xs font-serif font-bold text-cyan-300 mt-0.5">
                      {generatedAvatar.destinyArcana} Аркан
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">{destinyArc.name}</div>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveToProfile}
                    className={`flex-1 py-3 px-4 rounded-xl font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                      isSavedAsProfile
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20'
                    }`}
                  >
                    {isSavedAsProfile ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Установлен в профиле!</span>
                      </>
                    ) : (
                      <>
                        <User size={16} />
                        <span>Сделать аватаром профиля</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-serif font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Скачать HD</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedAvatar(null);
                      setIsSavedAsProfile(false);
                    }}
                    className="text-slate-400 hover:text-amber-300 flex items-center gap-1 underline transition-colors cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Сгенерировать другой стиль</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedPrompt ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedPrompt ? 'Промпт скопирован' : 'Скопировать промпт'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: SETUP & CONFIGURATION VIEW                        */
          /* ========================================================= */
          <div className="space-y-6">
            {/* Quick Matrix Summary Ribbon */}
            <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-serif font-bold text-lg">
                  {matrix.day}
                </div>
                <div>
                  <div className="text-xs font-serif font-bold text-white flex items-center gap-2">
                    <span>{activeUserInput.name}</span>
                    <span className="text-[10px] text-amber-400">({activeUserInput.gender === 'male' ? 'Мужской лик' : 'Женский лик'})</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Аркан личности: <span className="text-amber-300 font-bold">{dayArc.name}</span> • {astrology.zodiacSign}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  {new Date(activeUserInput.birthDate).toLocaleDateString('ru-RU')}
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  Стихия: {astrology.element}
                </span>
              </div>
            </div>

            {/* SECTION 1: Choose Magic Style */}
            <div className="space-y-2.5">
              <label className="text-xs font-serif font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 size={14} />
                <span>1. Выберите Магический Художественный Стиль:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVATAR_STYLES.map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      onTriggerHaptic?.(10);
                      setSelectedStyle(style.id);
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden cursor-pointer ${
                      selectedStyle === style.id
                        ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50'
                        : 'bg-black/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0 mt-0.5">{style.icon}</span>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-serif font-bold text-white flex items-center justify-between">
                          <span>{style.title}</span>
                          {selectedStyle === style.id && (
                            <Check size={14} className="text-amber-400 shrink-0" />
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-tight mt-1">
                          {style.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 2: Choose Energy Mood & Aura */}
            <div className="space-y-2.5">
              <label className="text-xs font-serif font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flame size={14} />
                <span>2. Выберите Цветовую Ауру и Настроение:</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {AVATAR_MOODS.map(mood => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => {
                      onTriggerHaptic?.(10);
                      setSelectedMood(mood.id);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedMood === mood.id
                        ? 'border-amber-400 bg-amber-500/20 shadow-md'
                        : 'border-white/10 bg-black/30 hover:border-white/20'
                    }`}
                  >
                    <div className="text-lg">{mood.icon}</div>
                    <div 
                      className="text-[10px] font-serif font-bold mt-1 truncate"
                      style={{ color: selectedMood === mood.id ? '#fef08a' : '#cbd5e1' }}
                    >
                      {mood.label.split(' ')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 3: Optional Custom Intent / Vibe */}
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-bold text-slate-300 flex items-center justify-between">
                <span>3. Особое намерение или деталь (Опционально):</span>
                <span className="text-[10px] text-slate-400 font-normal">для уточнения промпта</span>
              </label>
              <input
                type="text"
                value={customIntent}
                onChange={(e) => setCustomIntent(e.target.value)}
                placeholder="Например: Хранитель кристаллов, крылья феникса, корона из звезд..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-amber-500/60 text-white text-xs placeholder:text-slate-400 outline-none transition-colors"
              />
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Generate Trigger Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleStartGeneration}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>{generationStep || 'Сотворение Аватара...'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="fill-black" />
                  <span>Сгенерировать Магический Аватар (AI)</span>
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MagicAvatarModal;
