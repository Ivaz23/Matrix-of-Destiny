import React, { useState, useEffect } from 'react';
import { UserInput, MatrixNumbers, AstrologyData, CompatibilityResult, TarotCard, RelationshipType, IdealAndToxicPartnersProfile } from '../types';
import { calculateMatrix, calculateLifePathNumber } from '../services/numerologyUtils';
import { getAstrologyData } from '../services/astrologyUtils';
import { generateCompatibilityAnalysis, generateIdealAndToxicPartnersRadar, FULL_TAROT_DECK, getSpeech, decodeAudioData, VOICE_OPTIONS, generateFullAudioAnalysisText } from '../services/geminiService';
import { Heart, Users, Sparkles, Zap, Shield, MessageCircle, Eye, Volume2, VolumeX, Loader2, Download, Briefcase, UserPlus, HelpCircle, Shuffle, Compass, AlertTriangle, CheckCircle2, XCircle, Home, Flame, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadAudioForCalculation, downloadFullAudioAnalysis, exportCompatibilityPdf, exportIdealToxicRadarPdf } from '../services/exportUtils';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';

interface CompatibilitySectionProps {
  user1: {
    input: UserInput | null;
    matrix: MatrixNumbers | null;
    astrology: AstrologyData | null;
  };
  onSave: (result: CompatibilityResult) => void;
}

const CompatibilitySection: React.FC<CompatibilitySectionProps> = ({ user1, onSave }) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'check'>('radar');

  // Specific partner check state
  const [partnerName, setPartnerName] = useState('');
  const [partnerBirthDate, setPartnerBirthDate] = useState('');
  const [partnerGender, setPartnerGender] = useState<'male' | 'female'>('female');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('love');
  const [loading, setLoading] = useState(false);
  const [isDrawingTarot, setIsDrawingTarot] = useState(false);
  const [isGeneratingFullAudio, setIsGeneratingFullAudio] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [lpn1, setLpn1] = useState<number | null>(null);
  const [lpn2, setLpn2] = useState<number | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].name);

  // Radar (Ideal vs Toxic) state
  const [radarProfile, setRadarProfile] = useState<IdealAndToxicPartnersProfile | null>(null);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [isExportingRadarPdf, setIsExportingRadarPdf] = useState(false);

  const { playingId, loadingId, setLoadingId, playAudio, stopAudio, error: audioError } = useGlobalAudio();

  // Load or fetch radar when tab is opened and user is available
  const loadRadar = async () => {
    if (!user1.input || !user1.matrix || !user1.astrology) return;
    setLoadingRadar(true);
    try {
      const calculatedLpn = calculateLifePathNumber(user1.input.birthDate);
      const profile = await generateIdealAndToxicPartnersRadar({
        name: user1.input.name,
        birthDate: user1.input.birthDate,
        matrix: user1.matrix,
        astrology: user1.astrology,
        lifePath: calculatedLpn
      });
      setRadarProfile(profile);
    } catch (e) {
      console.error("Error generating radar profile:", e);
    } finally {
      setLoadingRadar(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'radar' && !radarProfile && user1.input && user1.matrix && user1.astrology) {
      loadRadar();
    }
  }, [activeTab, user1.input, user1.matrix, user1.astrology]);

  const handleDownloadAudio = async (text: string, title: string) => {
    const dlId = `dl_${title}`;
    setLoadingId(dlId);
    try {
      await downloadAudioForCalculation(text, `compatibility_${title}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleExportRadarPdf = async () => {
    if (!radarProfile || !user1.input) return;
    try {
      setIsExportingRadarPdf(true);
      await exportIdealToxicRadarPdf({
        userInput: user1.input,
        radar: radarProfile,
        filename: `Кармический_Радар_Партнеров_${user1.input.name}`
      });
    } catch (e) {
      console.error("PDF export error for radar:", e);
    } finally {
      setIsExportingRadarPdf(false);
    }
  };

  const handleExportPdf = async () => {
    if (!result || !user1.input) return;
    try {
      setIsExportingPdf(true);
      await exportCompatibilityPdf({
        user1: {
          name: user1.input.name,
          birthDate: user1.input.birthDate,
          zodiac: user1.astrology?.zodiacSign,
          lifePath: lpn1
        },
        partner: {
          name: partnerName,
          birthDate: partnerBirthDate,
          relationshipType
        },
        result,
        filename: `Совместимость_${user1.input.name}_и_${partnerName}`
      });
    } catch (e) {
      console.error("PDF export error for compatibility:", e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const playInterpretation = async () => {
    if (!result) return;
    
    const textToSpeak = `
      ${result.introduction}. 
      ${result.livingTogetherVerdict ? `Вердикт совместной жизни: ${result.livingTogetherVerdict.badgeText}. Бытовая гармония ${result.livingTogetherVerdict.domesticHarmonyScore} процентов. ${result.livingTogetherVerdict.summary}. ${result.livingTogetherVerdict.goldenRuleForDomesticPeace}.` : ''}
      Энергия вашего союза: ${result.matrixCompatibility.description}. 
      Астрологическая синергия: ${result.astrologySynergy.description}. 
      ${result.tarotAspect ? `Карта единства: ${result.tarotAspect.card.name}. ${result.tarotAspect.interpretation}.` : ''}
      ${result.sections.map(s => `${s.title}: ${s.content}`).join('. ')}
      Совет от Чубук: ${result.advice}
    `;
    
    playAudio(textToSpeak, 'compatibility', selectedVoice);
  };

  const playRadarAudio = async () => {
    if (!radarProfile || !user1.input) return;
    const text = `
      Кармический радар спутников жизни для ${user1.input.name}. 
      С кем жить в гармонии: ${radarProfile.idealPartners.psychologicalPortrait}. Атмосфера в доме: ${radarProfile.idealPartners.domesticVibe}.
      С кем категорически нельзя жить: ${radarProfile.toxicPartners.whyCategoricallyNo}. Кармическая ловушка: ${radarProfile.toxicPartners.karmicTrapWarning}.
      Напутствие Старца: ${radarProfile.wisdomSummary}
    `;
    playAudio(text, 'radar_full', selectedVoice);
  };

  const isPlaying = playingId === 'compatibility';
  const isAudioLoading = loadingId === 'compatibility';

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user1.input || !user1.matrix || !user1.astrology) return;
    if (!partnerName || !partnerBirthDate) return;

    setLoading(true);
    try {
      const partnerMatrix = calculateMatrix(partnerBirthDate);
      const partnerAstro = getAstrologyData(partnerBirthDate);
      
      const calculatedLpn1 = calculateLifePathNumber(user1.input.birthDate);
      const calculatedLpn2 = calculateLifePathNumber(partnerBirthDate);
      setLpn1(calculatedLpn1);
      setLpn2(calculatedLpn2);
      
      // Select a card for the union based on random or calculated energy
      const randomIndex = Math.floor(Math.random() * FULL_TAROT_DECK.length);
      const unionCard: TarotCard = {
        id: randomIndex,
        name: FULL_TAROT_DECK[randomIndex]
      };

      const partnerData = {
        name: partnerName,
        matrix: partnerMatrix,
        astrology: partnerAstro
      };

      const userData = {
        name: user1.input.name,
        matrix: user1.matrix,
        astrology: user1.astrology
      };

      const analysis = await generateCompatibilityAnalysis(userData, partnerData, relationshipType, unionCard);
      setResult(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawNewTarot = async () => {
    if (!result || !user1.input || !user1.matrix || !user1.astrology || !partnerName || !partnerBirthDate) return;
    
    setIsDrawingTarot(true);
    try {
      const partnerMatrix = calculateMatrix(partnerBirthDate);
      const partnerAstro = getAstrologyData(partnerBirthDate);

      // Select a different card from the full deck
      const currentCardName = result.tarotAspect?.card.name;
      let availableCards = FULL_TAROT_DECK.filter(c => c !== currentCardName);
      if (availableCards.length === 0) availableCards = FULL_TAROT_DECK;
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      const newCardName = availableCards[randomIndex];
      const newCardId = FULL_TAROT_DECK.indexOf(newCardName);
      
      const newUnionCard: TarotCard = {
        id: newCardId >= 0 ? newCardId : randomIndex,
        name: newCardName
      };

      const partnerData = {
        name: partnerName,
        matrix: partnerMatrix,
        astrology: partnerAstro
      };

      const userData = {
        name: user1.input.name,
        matrix: user1.matrix,
        astrology: user1.astrology
      };

      const updatedAnalysis = await generateCompatibilityAnalysis(userData, partnerData, relationshipType, newUnionCard);
      setResult(updatedAnalysis);
    } catch (e) {
      console.error("Error drawing new tarot card for compatibility:", e);
    } finally {
      setIsDrawingTarot(false);
    }
  };

  const handleFullAudioAnalysis = async () => {
    if (!result || !user1.input || !user1.matrix || !user1.astrology) return;
    
    const dlId = 'full_audio_comp_dl';
    setLoadingId(dlId);
    setIsGeneratingFullAudio(true);
    try {
      const partnerMatrix = calculateMatrix(partnerBirthDate);
      const partnerAstro = getAstrologyData(partnerBirthDate);
      
      await downloadFullAudioAnalysis('compatibility', {
        user1: { name: user1.input.name, matrix: user1.matrix, astrology: user1.astrology },
        user2: { name: partnerName, matrix: partnerMatrix, astrology: partnerAstro },
        relationshipType
      }, `chubuk_compatibility_${user1.input.name}_${partnerName}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingFullAudio(false);
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 mb-2">
          <Heart size={32} />
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-white">Совместимость & Кармический Радар</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Узнайте с кем вам суждено жить душа в душу и создавать гармоничный дом, а с кем совместная жизнь категорически противопоказана.
        </p>

        {/* Tab Switcher */}
        <div className="inline-flex flex-wrap justify-center p-1.5 bg-black/40 border border-white/10 rounded-2xl gap-2 mt-4 max-w-full">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === 'radar'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass size={16} />
            <span>Кармический Радар (С кем жить • С кем нельзя)</span>
          </button>
          <button
            onClick={() => setActiveTab('check')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === 'check'
                ? 'bg-gradient-to-r from-amber-600 to-amber-400 text-white shadow-lg shadow-amber-950/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={16} />
            <span>Проверить конкретного человека</span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: KARMIC RADAR ===================== */}
      {activeTab === 'radar' && (
        <div className="space-y-8">
          {!user1.input ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4">
              <Compass className="mx-auto text-amber-500" size={40} />
              <h3 className="text-xl font-serif text-white">Рассчитайте свою Матрицу</h3>
              <p className="text-sm text-slate-400">
                Чтобы узнать свой идеальный и опасный круг партнеров, сначала введите свои данные на главной вкладке расчета.
              </p>
            </div>
          ) : loadingRadar ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-6">
              <Loader2 className="animate-spin mx-auto text-emerald-400" size={48} />
              <div className="space-y-2">
                <h3 className="text-2xl font-serif text-white">Сканирование Кармического Радара...</h3>
                <p className="text-xs text-slate-400">
                  Сопоставляем 22 аркана Матрицы Судьбы, стихии Зодиака и зону комфорта души {user1.input.name}
                </p>
              </div>
            </div>
          ) : radarProfile ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Compass size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Карта совместимости для: {user1.input.name}</h3>
                    <p className="text-xs text-slate-400">
                      Центральная энергия: {user1.matrix?.center} Аркан • Знак: {user1.astrology?.zodiacSign} ({user1.astrology?.element})
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportRadarPdf}
                    disabled={isExportingRadarPdf}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                  >
                    {isExportingRadarPdf ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
                    <span>Скачать PDF Радара</span>
                  </button>

                  <button
                    onClick={playRadarAudio}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      playingId === 'radar_full'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {playingId === 'radar_full' ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    <span>{playingId === 'radar_full' ? 'Стоп' : 'Слушать'}</span>
                  </button>

                  <select
                    value={selectedVoice}
                    onChange={(e) => { stopAudio(); setSelectedVoice(e.target.value); }}
                    className="bg-black/40 border border-white/10 rounded-xl py-2 px-2.5 text-xs text-emerald-400 focus:outline-none cursor-pointer"
                  >
                    {VOICE_OPTIONS.map(v => (
                      <option key={v.name} value={v.name}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TWO MAIN ZONES: IDEAL VS CATEGORICALLY TOXIC */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* 💚 IDEAL ZONE */}
                <div className="bg-gradient-to-b from-emerald-950/40 via-emerald-900/15 to-black/60 border-2 border-emerald-500/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl shadow-emerald-950/30 relative overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-emerald-500/30 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle2 size={26} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Зеленая Зона Души</span>
                      <h3 className="text-xl md:text-2xl font-serif text-white">С Кем Жить в Гармонии</h3>
                    </div>
                  </div>

                  {/* Ideal Matrix Arcanas */}
                  <div className="space-y-3">
                    <label className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={15} />
                      <span>Идеальные Арканы Партнера в Матрице:</span>
                    </label>
                    <div className="space-y-2.5">
                      {radarProfile.idealPartners.matrixArcanas.map((arc, i) => (
                        <div key={i} className="bg-black/40 border border-emerald-500/20 rounded-2xl p-3.5 hover:border-emerald-500/40 transition-all">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-white">#{arc.arcana} {arc.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase">Сродство</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{arc.why}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ideal Zodiac Signs */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                      <Heart size={15} />
                      <span>Созвучные Знаки и Стихии:</span>
                    </label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {radarProfile.idealPartners.zodiacSigns.map((z, i) => (
                        <div key={i} className="bg-black/30 border border-emerald-500/20 rounded-xl p-3">
                          <div className="text-xs font-bold text-emerald-200">{z.sign} ({z.element})</div>
                          <div className="text-[11px] text-slate-300 mt-1 leading-snug">{z.synergy}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Psychological & Domestic Portrait */}
                  <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
                    <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                      <Home size={15} />
                      <span>Бытовой & Психологический Портрет Спутника:</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {radarProfile.idealPartners.psychologicalPortrait}
                    </p>
                    <div className="text-[11px] text-emerald-300/90 italic pt-1 border-t border-white/5">
                      <strong>Атмосфера в доме:</strong> {radarProfile.idealPartners.domesticVibe}
                    </div>
                  </div>

                  {/* 3 Pillars */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                      🗝 3 Опоры Долговечного Счастья:
                    </label>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {radarProfile.idealPartners.relationshipPillars.map((pillar, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{pillar}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ⛔ TOXIC ZONE */}
                <div className="bg-gradient-to-b from-rose-950/40 via-rose-900/15 to-black/60 border-2 border-rose-500/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl shadow-rose-950/30 relative overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-rose-500/30 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                      <XCircle size={26} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400">Красная Зона Риска</span>
                      <h3 className="text-xl md:text-2xl font-serif text-white">С Кем Категорически Нельзя</h3>
                    </div>
                  </div>

                  {/* Forbidden Arcanas */}
                  <div className="space-y-3">
                    <label className="text-xs font-extrabold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert size={15} />
                      <span>Разрушительные Арканы (Конфликт Энергий):</span>
                    </label>
                    <div className="space-y-2.5">
                      {radarProfile.toxicPartners.forbiddenArcanas.map((arc, i) => (
                        <div key={i} className="bg-black/40 border border-rose-500/20 rounded-2xl p-3.5 hover:border-rose-500/40 transition-all">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-white">#{arc.arcana} {arc.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold uppercase">Опасность</span>
                          </div>
                          <p className="text-xs text-rose-200/90 leading-relaxed">{arc.danger}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discordant Zodiacs */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-extrabold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                      <Flame size={15} />
                      <span>Конфликтные Знаки Зодиака:</span>
                    </label>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {radarProfile.toxicPartners.discordantZodiacs.map((z, i) => (
                        <div key={i} className="bg-black/30 border border-rose-500/20 rounded-xl p-3">
                          <div className="text-xs font-bold text-rose-200">{z.sign}</div>
                          <div className="text-[11px] text-rose-200/80 mt-1 leading-snug">{z.warning}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Why Categorically No */}
                  <div className="bg-black/40 border border-rose-500/20 rounded-2xl p-4 space-y-2">
                    <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle size={15} />
                      <span>Почему совместная жизнь невозможна:</span>
                    </div>
                    <p className="text-xs text-rose-100 leading-relaxed">
                      {radarProfile.toxicPartners.whyCategoricallyNo}
                    </p>
                    <div className="text-[11px] text-rose-300 italic pt-1 border-t border-white/5">
                      <strong>Кармическая ловушка:</strong> {radarProfile.toxicPartners.karmicTrapWarning}
                    </div>
                  </div>

                  {/* Red Flags */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-rose-300 uppercase tracking-wider">
                      🚩 Бытовые Красные Флаги (Сигнал к завершению):
                    </label>
                    <ul className="space-y-1.5 text-xs text-rose-200/90">
                      {radarProfile.toxicPartners.redFlags.map((rf, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Wisdom Summary from Elder Chubuk */}
              <div className="bg-gradient-to-r from-amber-600/20 via-black/50 to-emerald-600/20 border border-amber-500/30 rounded-3xl p-8 text-center space-y-4 relative overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                  <MessageCircle size={24} />
                </div>
                <h3 className="text-xl font-serif text-white">Мудрость Старца о Выборе Спутника</h3>
                <p className="text-sm md:text-base text-slate-200 max-w-3xl mx-auto italic leading-relaxed">
                  "{radarProfile.wisdomSummary}"
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <button
                onClick={loadRadar}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm uppercase tracking-wider shadow-xl hover:from-emerald-500 hover:to-teal-400 transition-all inline-flex items-center gap-3"
              >
                <Compass size={20} />
                <span>Рассчитать Кармический Радар</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: SPECIFIC PARTNER CHECK ===================== */}
      {activeTab === 'check' && (
        <div className="space-y-8">
          {!result && (
            <div className="space-y-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 max-w-2xl mx-auto shadow-2xl"
              >
                <form onSubmit={handleCalculate} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-amber-500 uppercase tracking-widest ml-1">Имя Партнера</label>
                      <input
                        type="text"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="Введите имя"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-amber-500 uppercase tracking-widest ml-1">Дата Рождения</label>
                      <input
                        type="date"
                        value={partnerBirthDate}
                        onChange={(e) => setPartnerBirthDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    {(['male', 'female'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPartnerGender(g)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                          partnerGender === g 
                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' 
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {g === 'male' ? 'Мужчина' : 'Женщина'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest text-center">Тип отношений</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'love', label: 'Любовь', icon: <Heart size={16} /> },
                        { id: 'business', label: 'Бизнес', icon: <Briefcase size={16} /> },
                        { id: 'family', label: 'Семья', icon: <Users size={16} /> },
                        { id: 'friendship', label: 'Дружба', icon: <UserPlus size={16} /> }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setRelationshipType(type.id as RelationshipType)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                            relationshipType === type.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-100'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {type.icon}
                          <span className="text-[10px] font-bold uppercase tracking-tighter">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !user1.input}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-white font-bold py-4 rounded-xl shadow-xl shadow-amber-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>Рассчитать Совместимость & Вердикт Быта</span>
                      </>
                    )}
                  </button>
                  
                  {!user1.input && (
                    <p className="text-center text-xs text-red-400">Сначала рассчитайте свою матрицу на главной вкладке</p>
                  )}
                </form>
              </motion.div>

              {/* Methodology Explanation Section */}
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Users size={24} />
                  </div>
                  <h4 className="text-xl font-serif text-white">Матрица Судьбы</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Анализ взаимодействия ваших личных энергий. Мы рассчитываем "Энергию Союза" — общее предназначение вашей пары и кармические задачи.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="text-xl font-serif text-white">Астрология</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Синастрия ваших знаков зодиака и стихий. Мы смотрим, как ваши планеты-покровители резонируют друг с другом в быту и общении.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <Eye size={24} />
                  </div>
                  <h4 className="text-xl font-serif text-white">Арканы Таро</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Высший духовный аспект. Мы вытягиваем "Карту Единства", которая описывает текущее состояние союза и дает точное напутствие.
                  </p>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                {/* Summary Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                        <span className="text-xl font-serif font-bold">{lpn1}</span>
                      </div>
                      <div>
                        <h3 className="font-serif text-white">{user1.input?.name}</h3>
                        <p className="text-xs text-amber-400 uppercase tracking-widest font-bold">Число пути</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                        <span className="text-xl font-serif font-bold">{lpn2}</span>
                      </div>
                      <div>
                        <h3 className="font-serif text-white">{partnerName}</h3>
                        <p className="text-xs text-purple-400 uppercase tracking-widest font-bold">Число пути</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🌟 PROMINENT LIVING TOGETHER VERDICT BANNER */}
                {result.livingTogetherVerdict && (
                  <div className={`backdrop-blur-xl border-2 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden ${
                    result.livingTogetherVerdict.status === 'ideal'
                      ? 'bg-gradient-to-br from-emerald-950/60 via-emerald-900/30 to-black/70 border-emerald-500/50 shadow-emerald-950/30'
                      : result.livingTogetherVerdict.status === 'karmic_challenging'
                      ? 'bg-gradient-to-br from-amber-950/60 via-amber-900/30 to-black/70 border-amber-500/50 shadow-amber-950/30'
                      : 'bg-gradient-to-br from-rose-950/60 via-rose-900/30 to-black/70 border-rose-500/50 shadow-rose-950/30'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                          result.livingTogetherVerdict.status === 'ideal'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : result.livingTogetherVerdict.status === 'karmic_challenging'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}>
                          {result.livingTogetherVerdict.status === 'ideal' ? (
                            <CheckCircle2 size={28} />
                          ) : result.livingTogetherVerdict.status === 'karmic_challenging' ? (
                            <AlertTriangle size={28} />
                          ) : (
                            <XCircle size={28} />
                          )}
                        </div>
                        <div>
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                            result.livingTogetherVerdict.status === 'ideal' ? 'text-emerald-400' : result.livingTogetherVerdict.status === 'karmic_challenging' ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            Вердикт Совместного Проживания и Брака
                          </span>
                          <h3 className="text-xl md:text-2xl font-serif text-white">{result.livingTogetherVerdict.badgeText}</h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Бытовая гармония</div>
                          <div className="text-2xl font-extrabold text-white">{result.livingTogetherVerdict.domesticHarmonyScore}%</div>
                        </div>
                        <div className="w-24 bg-black/50 h-3 rounded-full overflow-hidden border border-white/10">
                          <div
                            className={`h-full rounded-full ${
                              result.livingTogetherVerdict.status === 'ideal' ? 'bg-emerald-500' : result.livingTogetherVerdict.status === 'karmic_challenging' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${result.livingTogetherVerdict.domesticHarmonyScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-sm md:text-base text-slate-200 leading-relaxed italic">
                      "{result.livingTogetherVerdict.summary}"
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 text-xs md:text-sm">
                      <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-4 space-y-1.5">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                          <CheckCircle2 size={15} /> Плюсы совместного быта:
                        </span>
                        <p className="text-slate-300 leading-relaxed">{result.livingTogetherVerdict.prosOfLivingTogether}</p>
                      </div>

                      <div className="bg-black/40 border border-rose-500/30 rounded-2xl p-4 space-y-1.5">
                        <span className="font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                          <AlertTriangle size={15} /> Главная бытовая мина:
                        </span>
                        <p className="text-slate-300 leading-relaxed">{result.livingTogetherVerdict.fatalStumblingBlock}</p>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs md:text-sm flex items-start gap-3">
                      <span className="text-amber-400 font-bold text-base">🗝</span>
                      <div>
                        <strong className="text-amber-300 uppercase tracking-wider text-xs block mb-1">Золотое правило мира в доме:</strong>
                        <span className="text-slate-200 leading-relaxed">{result.livingTogetherVerdict.goldenRuleForDomesticPeace}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Energy Matrix, Astrology and Tarot Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap size={80} />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                        <span className="text-2xl font-serif font-bold">{result.matrixCompatibility.commonEnergy}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-serif text-white">Матрица</h3>
                        <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Энергия Союза</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{result.matrixCompatibility.description}"
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-900/40 to-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles size={80} />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                        <span className="text-2xl font-serif font-bold">{result.astrologySynergy.score}%</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-serif text-white">Астрология</h3>
                        <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Синергия Звезд</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{result.astrologySynergy.description}"
                    </p>
                  </div>

                  {result.tarotAspect && (
                    <div className="bg-gradient-to-br from-rose-950/50 via-rose-900/30 to-black/60 backdrop-blur-xl border border-rose-500/30 hover:border-rose-500/50 rounded-3xl p-6 space-y-4 relative overflow-hidden group transition-all shadow-xl shadow-rose-950/30">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                        <Eye size={80} />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/30 shadow-inner">
                            <Heart size={24} />
                          </div>
                          <div>
                            <h3 className="text-lg font-serif text-white">Таро Союза</h3>
                            <p className="text-[10px] text-rose-400 uppercase tracking-widest font-bold">{result.tarotAspect.card.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleDrawNewTarot}
                            disabled={isDrawingTarot}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-100 transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                            title="Вытянуть другую карту союза"
                          >
                            {isDrawingTarot ? <Loader2 className="animate-spin" size={13} /> : <Shuffle size={13} />}
                            <span className="hidden sm:inline">Сменить</span>
                          </button>

                          <button
                            onClick={() => handleDownloadAudio(result.tarotAspect!.interpretation, 'tarot')}
                            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                            title="Скачать аудио толкования аркана"
                          >
                            {loadingId === 'dl_tarot' ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                          </button>

                          <button
                            onClick={() => playAudio(result.tarotAspect!.interpretation, 'comp_tarot', selectedVoice)}
                            className={`p-1.5 rounded-lg transition-all ${
                              playingId === 'comp_tarot'
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 opacity-0 group-hover:opacity-100'
                            }`}
                            title={playingId === 'comp_tarot' ? "Остановить" : "Слушать толкование аркана"}
                          >
                            {loadingId === 'comp_tarot' ? <Loader2 className="animate-spin" size={14} /> : playingId === 'comp_tarot' ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed italic border-t border-rose-500/20 pt-3">
                        "{result.tarotAspect.interpretation}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Introduction & Global Controls */}
                <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 flex items-center gap-3">
                    <button
                      onClick={handleExportPdf}
                      disabled={isExportingPdf}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border border-amber-400 shadow-md disabled:opacity-50"
                    >
                      {isExportingPdf ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Download size={16} />
                      )}
                      <span>{isExportingPdf ? 'Экспорт...' : 'Скачать PDF'}</span>
                    </button>
                    <button
                      onClick={handleFullAudioAnalysis}
                      disabled={isGeneratingFullAudio}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-black"
                    >
                      {isGeneratingFullAudio ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Download size={16} />
                      )}
                      {isGeneratingFullAudio ? 'Считывание...' : 'Аудио Разбор'}
                    </button>
                    <button
                      onClick={() => {
                        if (!result) return;
                        const textToSpeak = `
                          ${result.introduction}. 
                          ${result.livingTogetherVerdict ? `Вердикт совместной жизни: ${result.livingTogetherVerdict.badgeText}. Бытовая гармония ${result.livingTogetherVerdict.domesticHarmonyScore} процентов. ${result.livingTogetherVerdict.summary}.` : ''}
                          Энергия вашего союза: ${result.matrixCompatibility.description}. 
                          Астрологическая синергия: ${result.astrologySynergy.description}. 
                          ${result.tarotAspect ? `Карта единства: ${result.tarotAspect.card.name}. ${result.tarotAspect.interpretation}.` : ''}
                          ${result.sections.map(s => `${s.title}: ${s.content}`).join('. ')}
                          Совет от Чубук: ${result.advice}
                        `;
                        handleDownloadAudio(textToSpeak, 'full');
                      }}
                      className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10 transition-all"
                      title="Скачать краткое аудио"
                    >
                      {loadingId === 'dl_full' ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                    </button>
                    <button
                      onClick={playInterpretation}
                      disabled={isAudioLoading}
                      className={`p-2 rounded-lg transition-all ${
                        isPlaying 
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                      } disabled:opacity-50`}
                      title={isPlaying ? "Остановить" : "Слушать анализ союза"}
                    >
                      {isAudioLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : isPlaying ? (
                        <VolumeX size={18} />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                    <select
                      value={selectedVoice}
                      onChange={(e) => { stopAudio(); setSelectedVoice(e.target.value); }}
                      className="bg-black/40 border border-white/10 rounded-lg py-1 px-2 text-[10px] text-amber-500 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {VOICE_OPTIONS.map(v => (
                        <option key={v.name} value={v.name}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {audioError && (
                    <div className="absolute top-14 right-4 text-[10px] text-amber-500 animate-pulse">
                      {audioError}
                    </div>
                  )}

                  <p className="text-xl md:text-2xl font-serif text-amber-100 leading-relaxed italic">
                    {result.introduction}
                  </p>
                </div>

                {/* Detailed Sections */}
                <div className="grid md:grid-cols-3 gap-8">
                  {result.sections.map((section, idx) => (
                    <div key={idx} className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-4 hover:border-white/10 transition-colors relative group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-amber-500">
                          {idx === 0 ? <Heart size={24} /> : idx === 1 ? <Shield size={24} /> : <Zap size={24} />}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadAudio(section.content, `section_${idx}`)}
                            className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                            title="Скачать аудио"
                          >
                            {loadingId === `dl_section_${idx}` ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                          </button>
                          <button
                            onClick={() => playAudio(section.content, `comp_section_${idx}`, selectedVoice)}
                            className={`p-2 rounded-lg transition-all ${
                              playingId === `comp_section_${idx}` 
                                ? 'bg-amber-500 text-black' 
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {loadingId === `comp_section_${idx}` ? <Loader2 className="animate-spin" size={14} /> : playingId === `comp_section_${idx}` ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          </button>
                        </div>
                      </div>
                      <h4 className="text-lg font-serif text-white">{section.title}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Advice */}
                <div className="bg-gradient-to-r from-amber-600/20 to-pink-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center space-y-6 relative group">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadAudio(result.advice, 'advice')}
                      className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Скачать аудио"
                    >
                      {loadingId === 'dl_advice' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                    </button>
                    <button
                      onClick={() => playAudio(result.advice, 'advice', selectedVoice)}
                      className={`p-2 rounded-lg transition-all ${
                        playingId === 'advice' 
                          ? 'bg-amber-500 text-black' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {loadingId === 'advice' ? <Loader2 className="animate-spin" size={16} /> : playingId === 'advice' ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-white/5 text-amber-500">
                      <MessageCircle size={32} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-serif text-white">Совет от Chubuk</h3>
                  <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                    {result.advice}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                    <button 
                      onClick={() => onSave(result)}
                      className="text-amber-400 hover:text-amber-300 text-sm font-bold uppercase tracking-widest transition-colors px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
                    >
                      Сохранить результат
                    </button>
                    <button 
                      onClick={() => setResult(null)}
                      className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
                    >
                      Рассчитать другого партнера
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CompatibilitySection;
