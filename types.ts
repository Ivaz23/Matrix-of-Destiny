
export interface UserInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'male' | 'female';
}

export interface MatrixNumbers {
  day: number;    // A (Left) - Personal Qualities
  month: number;  // B (Top) - Spiritual Connection / Talent
  year: number;   // C (Right) - Material Karma / Health
  bottom: number; // D (Bottom) - Past Life Karma
  center: number; // E (Center) - Comfort Zone / Soul
  sky: number;    // Diagonal sum
  earth: number;  // Diagonal sum
  destiny: number;// Final sum
}

export interface AnalysisSection {
  title: string;
  content: string;
}

export interface AnalysisResult {
  introduction: string;
  sections: AnalysisSection[];
  forecast: string; // Yearly forecast
}

export interface EnergyDetails {
  general: string;
  positive: string;
  negative: string;
  advice: string;
}

export interface TarotCard {
  id: number;
  name: string;
  image?: string;
}

export interface TarotReading {
  cards: TarotCard[];
  interpretation: string;
  advice: string;
  timeFrame?: string; // New: Estimated time frame for the reading
}

export interface AstrologyData {
  zodiacSign: string;
  element: string;
  planet: string;
  house: number;
  traits: string[];
}

export interface AstrologyResult {
  introduction: string;
  natalChart: string;
  aspects: {
    title: string;
    description: string;
  }[];
  spiritualPath: string;
  professionalPath: string;
  karmicLessons: string; // New: Deeper karmic insights
  planetaryInfluences: string; // New: Detailed planetary breakdown
  advice: string;
}

export interface SavedCalculation {
  id: string;
  timestamp: number;
  input: UserInput;
  matrix: MatrixNumbers;
  astrology: AstrologyData;
  analysis?: AnalysisResult;
  astrologyResult?: AstrologyResult;
  compatibilityResult?: CompatibilityResult;
  tarotReading?: TarotReading;
  horaryResult?: HoraryResult;
}

export type RelationshipType = 'love' | 'business' | 'family' | 'friendship';

export interface HoraryResult {
  question: string;
  answer: string; // Direct answer & outcome
  probability?: number; // 0 - 100%
  timing?: string; // Timeframe of manifestation
  rulingPlanetOrArcana?: string; // Ruling cosmic energy / arcana
  favorableConditions?: string; // "Если будет..." - conditions for favorable outcome
  risksAndWarnings?: string; // Karmic traps & caveats
  explanation: string; // Mystical explanation
  advice: string; // Practical guidance
  affirmation?: string; // Sacred affirmation
  timestamp?: number;
}

export interface LivingTogetherVerdict {
  status: 'ideal' | 'karmic_challenging' | 'forbidden_toxic';
  badgeText: string;
  domesticHarmonyScore: number; // 0 - 100%
  summary: string;
  prosOfLivingTogether: string;
  fatalStumblingBlock: string;
  goldenRuleForDomesticPeace: string;
}

export interface CompatibilityResult {
  introduction: string;
  relationshipType: RelationshipType;
  matrixCompatibility: {
    commonEnergy: number;
    description: string;
  };
  astrologySynergy: {
    score: number;
    description: string;
  };
  tarotAspect?: {
    card: TarotCard;
    interpretation: string;
  };
  livingTogetherVerdict?: LivingTogetherVerdict;
  sections: {
    title: string;
    content: string;
  }[];
  advice: string;
}

export interface IdealAndToxicPartnersProfile {
  idealPartners: {
    matrixArcanas: { arcana: number; title: string; why: string }[];
    zodiacSigns: { sign: string; element: string; synergy: string }[];
    psychologicalPortrait: string;
    domesticVibe: string;
    relationshipPillars: string[];
  };
  toxicPartners: {
    forbiddenArcanas: { arcana: number; title: string; danger: string }[];
    discordantZodiacs: { sign: string; warning: string }[];
    redFlags: string[];
    whyCategoricallyNo: string;
    karmicTrapWarning: string;
  };
  wisdomSummary: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface DailyHealthAndVitality {
  diseaseRiskPercentage: number; // 0-100%
  vulnerabilityLevel: 'low' | 'moderate' | 'elevated' | 'high';
  vulnerableOrgansOrSystems: string[];
  psychosomaticTrigger: string;
  vitalityForecast: string;
  healingRemedy: string;
}

export interface DailyFinancialFlow {
  profitPotential: number; // 0-100%
  lossRisk: number; // 0-100%
  flowVector: 'profit_favored' | 'balanced' | 'caution_loss_risk' | 'high_risk';
  profitOpportunities: string;
  lossDangers: string;
  wealthActionAdvice: string;
}

export interface BiorhythmValue {
  name: string; // 'Физический', 'Эмоциональный', 'Интеллектуальный', 'Интуитивный'
  period: number; // 23, 28, 33, 38
  value: number; // -100 to +100
  percentage: number; // 0 to 100
  phase: 'peak' | 'critical' | 'low';
  trend: 'rising' | 'falling';
  color: string;
  description: string;
  advice: string;
}

export interface BiorhythmDayPoint {
  date: string; // YYYY-MM-DD
  dayLabel: string;
  isTarget: boolean;
  physical: number;
  emotional: number;
  intellectual: number;
  intuitive: number;
  average: number;
}

export interface BiorhythmReport {
  daysLived: number;
  physical: BiorhythmValue;
  emotional: BiorhythmValue;
  intellectual: BiorhythmValue;
  intuitive: BiorhythmValue;
  averageScore: number;
  overallState: 'optimal' | 'productive' | 'unstable_critical' | 'recharge';
  timeline: BiorhythmDayPoint[];
  summaryText: string;
}

export interface DailyMysticalForecast {
  date: string;
  targetDate: string; // YYYY-MM-DD
  zodiacSign: string;
  lifePathNumber?: number;
  dayMatrixArcana?: number;
  planetaryTransits: string;
  generalVibe: string;
  personalImpact: string;
  loveAndRelations: string;
  careerAndMoney: string;
  warningOrCaution: string;
  healthAndVitality?: DailyHealthAndVitality;
  financialFlow?: DailyFinancialFlow;
  biorhythms?: BiorhythmReport;
  affirmation: string;
  sources: GroundingSource[];
  webQueries?: string[];
}

// Lunar Calendar Types
export interface LunarDayInfo {
  lunarDay: number; // 1-30
  moonPhase: 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  phaseName: string;
  illuminationPercentage: number;
  zodiacSign: string;
  symbol: string;
  energyLevel: 'high' | 'rising' | 'peak' | 'declining' | 'minimal';
  isVoidOfCourse: boolean;
  voidOfCourseDetails?: string;
  generalVibe: string;
  haircutAndBeautyAdvice: string;
  financeAndBusinessAdvice: string;
  relationshipsAdvice: string;
  healthAndDetoxAdvice: string;
  gardenAndPlantsAdvice: string;
  dreamAndMysticAdvice: string;
  favorableActivities: string[];
  unfavorableActivities: string[];
  sacredSymbol: string;
  affirmation: string;
}

// Best Dates Finder (Elective)
export interface FavorableDateRecommendation {
  date: string; // YYYY-MM-DD
  formattedDate: string;
  score: number; // 0-100
  rating: 'exceptional' | 'favorable' | 'neutral' | 'unfavorable';
  dayArcana: number;
  lunarDay: number;
  moonSign: string;
  summary: string;
  pros: string[];
  cautions: string[];
  goldenHourTip: string;
}

export interface BestDatesQueryResult {
  goalCategory: 'wedding' | 'business' | 'property' | 'travel' | 'health_beauty' | 'spiritual';
  goalTitle: string;
  timeframe: string;
  topDates: FavorableDateRecommendation[];
  generalStrategy: string;
}

// Talismans & Lithotherapy
export interface StoneTalisman {
  name: string;
  element: string;
  color: string;
  chakra: string;
  arcanaConnection: number;
  properties: string;
  activationMethod: string;
  cleansingMethod: string;
  whoShouldWear: string;
}

export interface EssentialOilTalisman {
  name: string;
  scentProfile: string;
  chakra: string;
  effect: string;
  recommendedRitual: string;
}

export interface LithotherapyProfile {
  primaryStones: StoneTalisman[];
  wealthStones: StoneTalisman[];
  loveStones: StoneTalisman[];
  protectionStones: StoneTalisman[];
  essentialOils: EssentialOilTalisman[];
  metals: string[];
  sacredGeometrySymbol: string;
  personalizedGuidance: string;
}

// Ancestral Lineage (4 Lines of Ancestry)
export interface AncestralLineInfo {
  title: string; // "Мужская линия отца", "Женская линия отца", "Мужская линия матери", "Женская линия матери"
  side: 'father_male' | 'father_female' | 'mother_male' | 'mother_female';
  keyArcana: number;
  generationalGift: string;
  karmicLesson: string;
  healingAffirmation: string;
  actionStep: string;
}

export interface AncestralTreeAnalysis {
  lines: AncestralLineInfo[];
  overallKarmaScore: number;
  dominantAncestralArchetype: string;
  lineageBlessing: string;
  unresolvedGenerationalLoop: string;
  ancestralHealingRitual: string;
}

// Dream Oracle
export interface DreamAnalysisResult {
  dreamText: string;
  archetypeArcanas: { arcana: number; name: string; relevance: string }[];
  lunarContext: string;
  hiddenSubconsciousMessage: string;
  symbolicDecodings: { symbol: string; meaning: string }[];
  spiritualWarningOrBlessing: string;
  wakingWorldActionAdvice: string;
}

// Cities of Power (Astrocartography)
export interface CityPowerProfile {
  cityName: string;
  country: string;
  compatibilityScore: number; // 0-100%
  vibeType: 'wealth_accelerator' | 'love_magnet' | 'spiritual_sanctuary' | 'high_intensity' | 'calm_rest';
  wealthImpact: string;
  loveImpact: string;
  careerImpact: string;
  energyWarning: string;
  bestPurposeForVisit: string;
}

// 9:16 Sacred Stories / Wallpaper Poster Generator
export type WallpaperTheme = 'gold_alchemy' | 'cosmic_violet' | 'emerald_wealth' | 'sacred_obsidian' | 'rose_love';
export type WallpaperType = 'phone_wallpaper' | 'instagram_stories' | 'minimalist_sigil';

export interface SacredWallpaperConfig {
  theme: WallpaperTheme;
  type: WallpaperType;
  showSigil: boolean;
  showAffirmation: boolean;
  showStone: boolean;
  showMatrixCode: boolean;
  customQuote?: string;
}

// Chakra & Psychosomatic Health Map
export interface ChakraInfo {
  id: 'sahasrara' | 'ajna' | 'vishuddha' | 'anahata' | 'manipura' | 'svadhisthana' | 'muladhara';
  name: string;
  sanskritName: string;
  color: string;
  bgGlow: string;
  arcana: number;
  physicalOrgans: string;
  psychosomaticBlock: string;
  positiveState: string;
  negativeSymptoms: string[];
  healingExercise: string;
  biorhythmInfluence: string;
}

export interface ChakraPsychosomaticProfile {
  chakras: ChakraInfo[];
  dominantEnergyChakra: string;
  mostVulnerableChakra: string;
  generalVitalityScore: number;
  dailyChakraAffirmation: string;
}

// Akashic Records & Past Life Karma
export interface AkashicKarmaProfile {
  karmicTailName: string;
  karmicTailArcanas: [number, number, number];
  pastLifeRole: string;
  pastLifeSinOrVow: string;
  unfulfilledOath: string;
  currentLifeTrap: string;
  releaseRitualAffirmation: string;
  soulGrowthTask: string;
}

// Power Calendar 365
export interface PowerCalendarDay {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  weekday: string;
  energyType: 'wealth' | 'love' | 'spirit' | 'caution' | 'neutral';
  dayArcana: number;
  badge: string;
  energyTitle: string;
  shortAdvice: string;
  isFavorable: boolean;
}



