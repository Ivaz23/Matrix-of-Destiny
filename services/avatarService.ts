import { UserInput, MatrixNumbers, AstrologyData } from '../types';
import { calculateMatrix } from './numerologyUtils';
import { getAstrologyData } from './astrologyUtils';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export type AvatarStyleId = 'neo_mystic' | 'cosmic_astral' | 'sacred_oil' | 'vedic_shaman' | 'anime_celestial';
export type AvatarMoodId = 'gold_light' | 'astral_violet' | 'emerald_nature' | 'fiery_power' | 'crystal_frost';

export interface AvatarStyleOption {
  id: AvatarStyleId;
  title: string;
  subtitle: string;
  icon: string;
  previewColor: string;
}

export interface AvatarMoodOption {
  id: AvatarMoodId;
  label: string;
  colorHex: string;
  icon: string;
}

export const AVATAR_STYLES: AvatarStyleOption[] = [
  {
    id: 'neo_mystic',
    title: 'Мистический Нео-Арт',
    subtitle: 'Сакральная геометрия, золотой неон и футуристичный оккультизм',
    icon: '🔮',
    previewColor: 'from-amber-500 via-purple-600 to-indigo-950'
  },
  {
    id: 'cosmic_astral',
    title: 'Космический Астрал',
    subtitle: 'Звездные туманности, глубокий космос и эфирный свет',
    icon: '🌌',
    previewColor: 'from-blue-600 via-indigo-600 to-slate-950'
  },
  {
    id: 'sacred_oil',
    title: 'Сакральный Масляный Реализм',
    subtitle: 'Эстетика Ренессанса, золотые нимбы и глубокий кьяроскуро',
    icon: '🎨',
    previewColor: 'from-amber-600 via-orange-800 to-stone-950'
  },
  {
    id: 'vedic_shaman',
    title: 'Ведический Шаманизм',
    subtitle: 'Аура чакр, духи природы, кристаллы и лотосы',
    icon: '🪷',
    previewColor: 'from-emerald-500 via-teal-700 to-emerald-950'
  },
  {
    id: 'anime_celestial',
    title: 'Аниме Селестиал',
    subtitle: 'Эпический мистический аниме-портрет с магическими глифами',
    icon: '⚡',
    previewColor: 'from-fuchsia-500 via-purple-700 to-slate-950'
  }
];

export const AVATAR_MOODS: AvatarMoodOption[] = [
  { id: 'gold_light', label: 'Золотой Свет Сознания', colorHex: '#f59e0b', icon: '✨' },
  { id: 'astral_violet', label: 'Астральный Ультрамарин', colorHex: '#8b5cf6', icon: '🌌' },
  { id: 'emerald_nature', label: 'Изумрудная Сила Земли', colorHex: '#10b981', icon: '🌿' },
  { id: 'fiery_power', label: 'Огонь Трансформации', colorHex: '#ef4444', icon: '🔥' },
  { id: 'crystal_frost', label: 'Кристаллическая Чистота', colorHex: '#06b6d4', icon: '💎' }
];

export const ARCANA_ARCHETYPES_RU: Record<number, { name: string; visualEn: string; blessing: string }> = {
  1: { name: 'Маг', visualEn: 'The Magician, supreme creator wielding glowing elemental spheres of fire and water, ethereal levitating arcane symbols', blessing: 'Сила первотворения и материализации мыслей.' },
  2: { name: 'Верховная Жрица', visualEn: 'The High Priestess, veiled mystic keeper of secrets with glowing crescent moon headdress and sacred silver scrolls', blessing: 'Дар глубокой интуиции и чтения тайных знаков бытия.' },
  3: { name: 'Императрица', visualEn: 'The Empress, divine matriarch crowned with twelve stars, surrounded by lush blooming celestial nature and golden harvest light', blessing: 'Царственная женственность, изобилие и плодовитость идей.' },
  4: { name: 'Император', visualEn: 'The Emperor, authoritative sovereign in obsidian and gold ceremonial armor on a majestic stone throne, fiery aura of structure', blessing: 'Несокрушимая воля, лидерство и власть над материей.' },
  5: { name: 'Верховный Жрец (Иерофант)', visualEn: 'The Hierophant, ancient wise spiritual teacher in sacred robes holding an ornate illuminated staff of cosmic knowledge', blessing: 'Хранитель высших духовных истин и наставник душ.' },
  6: { name: 'Влюбленные', visualEn: 'The Lovers archetype, surrounded by radiant angel wings, harmonious aura of divine sacred union and choices', blessing: 'Гармония сердца, магнетизм и красота безусловной любви.' },
  7: { name: 'Колесница', visualEn: 'The Charioteer, victorious cosmic warrior with starlight armor driving through galaxies, radiant kinetic golden light', blessing: 'Триумф целеустремленности, прорыв сквозь любые преграды.' },
  8: { name: 'Справедливость', visualEn: 'Lady Justice, divine arbiter with glowing balanced golden scales and radiant sword of absolute truth and karmic order', blessing: 'Кармическое равновесие, кристальная ясность и честность.' },
  9: { name: 'Отшельник', visualEn: 'The Wise Hermit, sage mystic holding an ancient glowing star-lantern illuminating secret mountain paths of enlightenment', blessing: 'Глубинная мудрость, покой души и внутренний свет истины.' },
  10: { name: 'Колесо Фортуны', visualEn: 'The Wheel of Fortune guardian, surrounded by turning sacred celestial gears, golden coins of serendipity, and swirling time vortices', blessing: 'Поток космической удачи и благословение синхроничностей.' },
  11: { name: 'Сила', visualEn: 'The Avatar of Divine Strength, serene figure gently resting hand on a magnificent ethereal lion with glowing fiery mane', blessing: 'Мягкая непобедимая духовная мощь и укрощение страстей.' },
  12: { name: 'Повешенный', visualEn: 'The Mystical Visionary, illuminated seeker upside down in zero gravity with radiant halo of transcendent insight and enlightenment', blessing: 'Нестандартный взгляд на мир, озарения и жертвенная мудрость.' },
  13: { name: 'Смерть и Трансформация', visualEn: 'The Phoenix of Rebirth and Metamorphosis, majestic dark angelic figure with iridescent butterfly wings rising from starlight embers', blessing: 'Великое обновление, сброс старого и возрождение в силе.' },
  14: { name: 'Умеренность', visualEn: 'The Alchemist Angel, pouring liquid starlight between golden and silver chalices, glowing rainbow halo of equilibrium', blessing: 'Искусство душевного исцеления, терпение и божественный баланс.' },
  15: { name: 'Дьявол (Темная Сила Магнетизма)', visualEn: 'The Charismatic Shadow Alchemist, commanding figure with hypnotic glowing ruby eyes, intricate golden obsidian horns, and magnetic aura', blessing: 'Огромный земной потенциал, страсть и преодоление искушений.' },
  16: { name: 'Башня (Духовное Пробуждение)', visualEn: 'The Lightning Awakener, dramatic figure surrounded by cracking crystalline spires and purifying flashes of violet lightning of breakthrough', blessing: 'Мгновенное освобождение от иллюзий и строительство нерушимого духа.' },
  17: { name: 'Звезда', visualEn: 'The Celestial Star Maiden, pouring celestial waters of inspiration under a giant brilliant eight-pointed supernova star', blessing: 'Чистая надежда, сияние таланта и высшее космическое призвание.' },
  18: { name: 'Луна', visualEn: 'The Lunar Sorcerer, cloaked in misty silver starlight by a magical glowing lake with twin wolves and sacred water reflections', blessing: 'Сверхчувствительность, вещие сны и магия подсознания.' },
  19: { name: 'Солнце', visualEn: 'The Solar Lord of Light, radiating immense golden solar rays, crowned with sunflowers and pure joyful triumphant vitality', blessing: 'Безудержная радость, величие духа, тепло и жизненный триумф.' },
  20: { name: 'Страшный Суд (Родовое Пробуждение)', visualEn: 'The Angel of Awakening, blowing the golden trumpet of resurrection with ancestral spirits rising in divine light', blessing: 'Освобождение родовых уз и переход на новый эволюционный уровень.' },
  21: { name: 'Мир', visualEn: 'The Universal Dancer, floating inside an emerald sacred wreath surrounded by four elemental guardians in cosmic harmony', blessing: 'Абсолютная целостность, международный масштаб и свобода.' },
  22: { name: 'Шут (Высшая Свобода)', visualEn: 'The Zero Fool Cosmic Traveler, fearless wanderer walking on rainbow cliff edge with radiant white rose and spirit falcon', blessing: 'Божественная спонтанность, чистота сердца и безграничные возможности.' }
};

export interface UserCustomAvatar {
  id: string;
  imageUrl: string;
  prompt: string;
  style: AvatarStyleId;
  mood: AvatarMoodId;
  createdAt: number;
  userName: string;
  dayArcana: number;
  centerArcana: number;
  destinyArcana: number;
  zodiacSign: string;
  blessingText: string;
}

export interface AvatarGenerationOptions {
  userInput: UserInput;
  style: AvatarStyleId;
  mood: AvatarMoodId;
  customIntent?: string;
}

export interface GeneratedAvatarResult {
  imageUrl: string;
  blessingText: string;
  prompt: string;
  dayArcana: number;
  centerArcana: number;
  destinyArcana: number;
  zodiacSign: string;
}

/**
 * Builds a world-class prompt for AI image generation by synthesizing Destiny Matrix and Astrological data
 */
export function buildMagicAvatarPrompt(options: AvatarGenerationOptions): {
  imagePrompt: string;
  matrixData: {
    dayArcana: number;
    centerArcana: number;
    destinyArcana: number;
    zodiacSign: string;
    element: string;
  };
} {
  const { userInput, style, mood, customIntent } = options;
  const matrix = calculateMatrix(userInput.birthDate);
  const astrology = getAstrologyData(userInput.birthDate);

  const dayArc = ARCANA_ARCHETYPES_RU[matrix.day] || ARCANA_ARCHETYPES_RU[1];
  const centerArc = ARCANA_ARCHETYPES_RU[matrix.center] || ARCANA_ARCHETYPES_RU[10];
  const destinyArc = ARCANA_ARCHETYPES_RU[matrix.destiny] || ARCANA_ARCHETYPES_RU[21];

  const genderTerm = userInput.gender === 'male' ? 'male deity/mystic, handsome masculine features' : 'female goddess/priestess, gorgeous feminine features';

  let styleDescriptor = '';
  switch (style) {
    case 'neo_mystic':
      styleDescriptor = 'Hyper-detailed 3D digital art, cyber-mysticism, sacred geometric gold vector line patterns floating in air, glowing runes, dark glossy obsidian backdrop, studio volumetric rim lighting, 8k resolution, octane render masterpiece';
      break;
    case 'cosmic_astral':
      styleDescriptor = 'Epic astral cosmic surrealism, swirling galaxy nebulae, deep space starry background, radiant ethereal stardust crown, bioluminescent energy lines, mystical transcendental lighting, masterpiece fine art';
      break;
    case 'sacred_oil':
      styleDescriptor = 'Renaissance sacred oil painting on canvas by Caravaggio and Klimt, rich gold leaf gilding, delicate chiaroscuro lighting, regal divine poise, ornate baroque jewelry, museum quality masterpiece';
      break;
    case 'vedic_shaman':
      styleDescriptor = 'Sacred Vedic shamanic portrait, glowing iridescent chakra halo, floating sacred crystals, blooming spiritual lotus flower aura, spirit animal ethereal presence, emerald and amethyst hues, atmospheric mystical haze';
      break;
    case 'anime_celestial':
      styleDescriptor = 'High-end celestial anime masterpiece character design by Makoto Shinkai and Ufotable, expressive glowing eyes, flowing ethereal hair with starlight particles, intricate arcane magic circles, cinematic lighting, 8k';
      break;
  }

  let moodDescriptor = '';
  switch (mood) {
    case 'gold_light':
      moodDescriptor = 'dominant warm golden solar aura, amber sparkles, warm sunlight radiance, divine gold jewelry';
      break;
    case 'astral_violet':
      moodDescriptor = 'dominant deep royal purple and ultraviolet aura, cosmic starlight, indigo mist, ethereal glowing eyes';
      break;
    case 'emerald_nature':
      moodDescriptor = 'dominant deep emerald and jade green luminescence, sacred leaves, living energy tendrils, earthy mystical power';
      break;
    case 'fiery_power':
      moodDescriptor = 'dominant fiery crimson and molten gold aura, floating embers, phoenix flame wings, dynamic passion';
      break;
    case 'crystal_frost':
      moodDescriptor = 'dominant cyan and diamond crystal glow, frost particles, shimmering sacred geometry prisms, pristine clarity';
      break;
  }

  const prompt = [
    `A magnificent close-up avatar portrait of a divine mystical character representing ${genderTerm}, inspired by the Tarot archetype of ${dayArc.visualEn}.`,
    `Infused with the soul essence of ${centerArc.name} and destiny of ${destinyArc.name}.`,
    `Astrological connection: ${astrology.zodiacSign} (${astrology.element} element).`,
    moodDescriptor,
    customIntent ? `Personal intent and spiritual vibe: ${customIntent}.` : '',
    styleDescriptor,
    'Composition: Centered portrait, symmetrical framing, iconic face, mesmerizing eyes looking at the viewer, perfect facial anatomy, immaculate detail, highly aesthetic profile picture avatar, no text, no watermarks, no distorted limbs.'
  ].filter(Boolean).join(' ');

  return {
    imagePrompt: prompt,
    matrixData: {
      dayArcana: matrix.day,
      centerArcana: matrix.center,
      destinyArcana: matrix.destiny,
      zodiacSign: astrology.zodiacSign,
      element: astrology.element
    }
  };
}

/**
 * Generates an AI interpretation & blessing for the avatar from Elder Chubuk
 */
export async function generateAvatarBlessing(options: AvatarGenerationOptions): Promise<string> {
  const { userInput, style, mood } = options;
  const matrix = calculateMatrix(userInput.birthDate);
  const astrology = getAstrologyData(userInput.birthDate);
  const dayArc = ARCANA_ARCHETYPES_RU[matrix.day] || ARCANA_ARCHETYPES_RU[1];
  const centerArc = ARCANA_ARCHETYPES_RU[matrix.center] || ARCANA_ARCHETYPES_RU[10];
  const destinyArc = ARCANA_ARCHETYPES_RU[matrix.destiny] || ARCANA_ARCHETYPES_RU[21];

  const styleObj = AVATAR_STYLES.find(s => s.id === style) || AVATAR_STYLES[0];
  const moodObj = AVATAR_MOODS.find(m => m.id === mood) || AVATAR_MOODS[0];

  const promptText = `
Вы — Мудрец Чубук, древний наставник и хранитель сакральных матриц.
Пользователь по имени ${userInput.name} (${userInput.gender === 'male' ? 'Мужчина' : 'Женщина'}, дата рождения: ${userInput.birthDate}) сгенерировал свой уникальный Магический Аватар Души на основе своей Матрицы Судьбы.

Данные его матрицы:
- Визитная карточка (День рождения): ${matrix.day} Аркан — "${dayArc.name}".
- Зона комфорта души (Сердцевина): ${matrix.center} Аркан — "${centerArc.name}".
- Высшее предназначение: ${matrix.destiny} Аркан — "${destinyArc.name}".
- Знак Зодиака: ${astrology.zodiacSign}, Стихия: ${astrology.element}.
- Выбранный стиль аватара: ${styleObj.title} (${moodObj.label}).

Напишите краткое (3-4 абзаца, 120-170 слов), глубокое, вдохновляющее и поэтичное благословение-расшифровку этого аватара от лица Старца Чубука.
Расскажите:
1. Какой лик его души проявился через ${matrix.day}-й Аркан (${dayArc.name}) в этом портрете.
2. Какую тайную силу несет в себе аура ${moodObj.label} и стихия ${astrology.element}.
3. Напутствие-аффирмация: как этот аватар станет его личным цифровым талисманом и щитом.
Тон: мистический, теплый, без банальностей, мудрый.
`;

  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-3.7-flash',
        contents: promptText
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text && data.text.trim()) {
        return data.text.trim();
      }
    }
  } catch (e) {
    console.warn('Failed to generate dynamic blessing, using template:', e);
  }

  // Graceful fallback blessing
  return `«О, ${userInput.name}, в этом образе звезды запечатлели твой истинный сакральный лик. В твоем взгляде горит первозданный огонь ${matrix.day}-го Аркана (${dayArc.name}), дарующий тебе силу созидать собственную реальность. Пусть аура ${moodObj.label} хранит твои замыслы от дурного глаза и наполняет каждый твой шаг неиссякаемой праной. Этот аватар — твой проводник и щит в бескрайних мирах!»`;
}

/**
 * Generates the magical avatar image via the Gemini image API
 */
export async function generateMagicAvatar(options: AvatarGenerationOptions): Promise<GeneratedAvatarResult> {
  const { imagePrompt, matrixData } = buildMagicAvatarPrompt(options);

  // Parallelize prompt blessing and image generation
  const blessingPromise = generateAvatarBlessing(options);

  let imageUrl = '';

  try {
    const imageRes = await fetch('/api/gemini/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: imagePrompt,
        aspectRatio: '1:1',
        imageSize: '1K'
      })
    });

    if (imageRes.ok) {
      const data = await imageRes.json();
      if (data.imageUrl) {
        imageUrl = data.imageUrl;
      }
    } else {
      const errJson = await imageRes.json().catch(() => ({}));
      console.warn('Image API returned non-OK status:', imageRes.status, errJson);
    }
  } catch (err) {
    console.error('Failed to generate image via /api/gemini/generate-image:', err);
  }

  // If the server-side image call failed or didn't return an image, create a stunning procedural sacred mandala avatar as fallback
  if (!imageUrl) {
    imageUrl = createProceduralSacredAvatarDataUrl(options, matrixData);
  }

  const blessingText = await blessingPromise;

  return {
    imageUrl,
    blessingText,
    prompt: imagePrompt,
    dayArcana: matrixData.dayArcana,
    centerArcana: matrixData.centerArcana,
    destinyArcana: matrixData.destinyArcana,
    zodiacSign: matrixData.zodiacSign
  };
}

/**
 * Creates a high-res SVG procedural sacred talisman avatar in case the remote image API is unreachable
 */
export function createProceduralSacredAvatarDataUrl(
  options: AvatarGenerationOptions,
  matrixData: { dayArcana: number; centerArcana: number; destinyArcana: number; zodiacSign: string; element: string }
): string {
  const dayArc = ARCANA_ARCHETYPES_RU[matrixData.dayArcana] || ARCANA_ARCHETYPES_RU[1];
  const mood = AVATAR_MOODS.find(m => m.id === options.mood) || AVATAR_MOODS[0];

  const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070a14" />
      <stop offset="50%" stop-color="#111a36" />
      <stop offset="100%" stop-color="#050811" />
    </linearGradient>
    <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${mood.colorHex}" stop-opacity="0.8" />
      <stop offset="40%" stop-color="${mood.colorHex}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="800" fill="url(#bgGrad)" />
  <circle cx="400" cy="400" r="380" fill="url(#auraGlow)" />

  <!-- Outer Sacred Geometry Ring -->
  <circle cx="400" cy="400" r="340" fill="none" stroke="url(#goldGrad)" stroke-width="2" opacity="0.6" stroke-dasharray="8 6" />
  <circle cx="400" cy="400" r="310" fill="none" stroke="${mood.colorHex}" stroke-width="1.5" opacity="0.8" />
  <circle cx="400" cy="400" r="260" fill="none" stroke="url(#goldGrad)" stroke-width="2" opacity="0.5" />

  <!-- 12-point Sacred Star -->
  <g transform="translate(400, 400)" stroke="url(#goldGrad)" stroke-width="1.5" fill="none" opacity="0.4">
    <polygon points="0,-240 240,0 0,240 -240,0" />
    <polygon points="0,-240 240,0 0,240 -240,0" transform="rotate(30)" />
    <polygon points="0,-240 240,0 0,240 -240,0" transform="rotate(60)" />
  </g>

  <!-- Central Mystic Eye & Arcana Badge -->
  <g transform="translate(400, 360)" filter="url(#glow)">
    <circle cx="0" cy="0" r="140" fill="#090e1f" stroke="url(#goldGrad)" stroke-width="4" />
    <circle cx="0" cy="0" r="110" fill="url(#auraGlow)" />
    
    <!-- Third Eye / Arcana Symbol -->
    <path d="M-80 0 Q 0 -60 80 0 Q 0 60 -80 0 Z" fill="none" stroke="url(#goldGrad)" stroke-width="4" />
    <circle cx="0" cy="0" r="28" fill="${mood.colorHex}" />
    <circle cx="0" cy="0" r="12" fill="#ffffff" />
    <circle cx="4" cy="-4" r="4" fill="#ffffff" />
  </g>

  <!-- Crown and Rays -->
  <g transform="translate(400, 200)" stroke="url(#goldGrad)" stroke-width="3" fill="none">
    <line x1="0" y1="0" x2="0" y2="-45" stroke-linecap="round" />
    <line x1="-30" y1="5" x2="-50" y2="-30" stroke-linecap="round" />
    <line x1="30" y1="5" x2="50" y2="-30" stroke-linecap="round" />
    <line x1="-60" y1="20" x2="-95" y2="-5" stroke-linecap="round" />
    <line x1="60" y1="20" x2="95" y2="-5" stroke-linecap="round" />
  </g>

  <!-- Lower Banner with Name and Arcana -->
  <g transform="translate(400, 580)">
    <rect x="-240" y="-30" width="480" height="60" rx="30" fill="#0b1022" stroke="url(#goldGrad)" stroke-width="2" />
    <text x="0" y="-5" fill="#fef08a" font-family="Georgia, serif" font-size="22" font-weight="bold" text-anchor="middle" letter-spacing="2">
      ${options.userInput.name.toUpperCase()}
    </text>
    <text x="0" y="18" fill="#94a3b8" font-family="sans-serif" font-size="13" text-anchor="middle" letter-spacing="1">
      ${matrixData.dayArcana} АРКАН • ${dayArc.name.toUpperCase()}
    </text>
  </g>

  <!-- Subtitle with Destiny & Zodiac -->
  <text x="400" y="675" fill="${mood.colorHex}" font-family="Georgia, serif" font-size="16" text-anchor="middle" letter-spacing="1.5">
    ✧ ${matrixData.zodiacSign} • СТИХИЯ ${matrixData.element.toUpperCase()} ✧
  </text>
  <text x="400" y="705" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">
    САКРАЛЬНЫЙ АВАТАР МАТРИЦЫ СУДЬБЫ
  </text>
</svg>
`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

/**
 * Storage helpers for local & cloud syncing of custom magic avatars
 */
const STORAGE_KEY = 'chubuk_user_custom_avatar';

export function getUserCustomAvatar(): UserCustomAvatar | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export async function setUserCustomAvatar(avatar: UserCustomAvatar, userId?: string): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(avatar));
    window.dispatchEvent(new CustomEvent('chubuk_avatar_updated', { detail: avatar }));

    if (userId) {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        customAvatar: avatar,
        customAvatarUrl: avatar.imageUrl,
        customAvatarUpdatedAt: Date.now()
      }, { merge: true });
    }
  } catch (e) {
    console.warn('Failed to persist custom avatar to Firestore/LocalStorage:', e);
  }
}

export async function removeUserCustomAvatar(userId?: string): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('chubuk_avatar_updated', { detail: null }));

    if (userId) {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        customAvatar: null,
        customAvatarUrl: null,
        customAvatarUpdatedAt: Date.now()
      }, { merge: true });
    }
  } catch (e) {
    console.warn('Failed to clear custom avatar in Firestore:', e);
  }
}
