import { MatrixNumbers, UserInput, ChakraInfo, ChakraPsychosomaticProfile } from '../types';

const reduceTo22 = (n: number): number => {
  let val = Math.abs(n);
  while (val > 22) {
    const digits = val.toString().split('').map(Number);
    val = digits.reduce((a, b) => a + b, 0);
  }
  return val === 0 ? 22 : val;
};

export const calculateChakraProfile = (
  userInput?: UserInput | null,
  matrix?: MatrixNumbers | null
): ChakraPsychosomaticProfile => {
  let day = 15;
  let month = 7;
  let year = 1995;

  if (userInput?.birthDate) {
    const parts = userInput.birthDate.split('-').map(Number);
    if (parts.length === 3) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    }
  }

  const mCenter = matrix?.center || reduceTo22(day + month + year);
  const mDay = matrix?.day || reduceTo22(day);
  const mMonth = matrix?.month || reduceTo22(month);
  const mYear = matrix?.year || reduceTo22(year);
  const mBottom = matrix?.bottom || reduceTo22(mDay + mMonth + mYear);

  // Derive 7 chakras energy levels
  const sahasraraArcana = reduceTo22(mMonth);
  const ajnaArcana = reduceTo22(mDay + mMonth);
  const vishuddhaArcana = reduceTo22(mDay);
  const anahataArcana = reduceTo22(mCenter);
  const manipuraArcana = reduceTo22(mCenter + mYear);
  const svadhisthanaArcana = reduceTo22(mBottom + mYear);
  const muladharaArcana = reduceTo22(mBottom);

  const chakras: ChakraInfo[] = [
    {
      id: 'sahasrara',
      name: 'Сахасрара (Коронная чакра)',
      sanskritName: 'Sahasrāra • Связь с Космосом',
      color: '#c084fc',
      bgGlow: 'rgba(192, 132, 252, 0.25)',
      arcana: sahasraraArcana,
      physicalOrgans: 'Кора головного мозга, шишковидная железа, высшая нервная деятельность',
      psychosomaticBlock: 'Духовный кризис, утрата веры в Высший замысел, материальный цинизм',
      positiveState: 'Ясное осознание своего жизненного пути, глубокая интуиция, чувство космической защиты',
      negativeSymptoms: ['Хроническая усталость', 'Чувство потерянности в мире', 'Ментальные перегрузки'],
      healingExercise: 'Медитация тишины у открытого окна на рассвете, созерцание ночного звездного неба',
      biorhythmInfluence: 'Интеллектуальный & Интуитивный ритм'
    },
    {
      id: 'ajna',
      name: 'Аджна (Третий Глаз)',
      sanskritName: 'Ājñā • Мудрость и Ясновидение',
      color: '#818cf8',
      bgGlow: 'rgba(129, 140, 248, 0.25)',
      arcana: ajnaArcana,
      physicalOrgans: 'Глаза, лобные пазухи, гипофиз, мозжечок',
      psychosomaticBlock: 'Иллюзии, нежелание видеть правду о людях, ментальный хаос, гордыня ума',
      positiveState: 'Сильная образная интуиция, предвидение событий, способность видеть скрытую суть вещей',
      negativeSymptoms: ['Головные боли напряжения', 'Ухудшение зрения', 'Бессонница от навязчивых мыслей'],
      healingExercise: 'Тратака (концентрация взгляда на пламени свечи 5–7 мин), дыхание Нади Шодхана',
      biorhythmInfluence: 'Интеллектуальный ритм'
    },
    {
      id: 'vishuddha',
      name: 'Вишудха (Горловая чакра)',
      sanskritName: 'Viśuddha • Голос и Проявление',
      color: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.25)',
      arcana: vishuddhaArcana,
      physicalOrgans: 'Щитовидная железа, голосовые связки, горло, шея, плечи',
      psychosomaticBlock: 'Проглоченная обида, невысказанная правда, страх критики и публичного осуждения',
      positiveState: 'Магическая сила голоса, убедительность в переговорах, чистое творческое самовыражение',
      negativeSymptoms: ['Частые ангины и першение', 'Зажимы в шее', 'Трудность сказать «нет»'],
      healingExercise: 'Пропевание звука «ХАМ» на выдохе, запись голосовых дневников для выгрузки эмоций',
      biorhythmInfluence: 'Эмоциональный ритм'
    },
    {
      id: 'anahata',
      name: 'Анахата (Сердечный Центр)',
      sanskritName: 'Anāhata • Безусловная Любовь',
      color: '#4ade80',
      bgGlow: 'rgba(74, 222, 128, 0.25)',
      arcana: anahataArcana,
      physicalOrgans: 'Сердце, тимус (вилочковая железа), легкие, грудной отдел позвоночника',
      psychosomaticBlock: 'Сердечные раны предательства, закрытость от любви, страх быть уязвимым',
      positiveState: 'Магнетическое сердечное тепло, эмпатия, притяжение родственных душ и изобилия',
      negativeSymptoms: ['Тяжесть в груди', 'Сутулость («панцирь сердца»)', 'Аритмия на фоне стресса'],
      healingExercise: 'Дыхание сердцем 4-4-4-4, ношение розового кварца или изумруда на уровне груди',
      biorhythmInfluence: 'Эмоциональный ритм'
    },
    {
      id: 'manipura',
      name: 'Манипура (Солнечное Сплетение)',
      sanskritName: 'Maṇipūra • Воля и Деньги',
      color: '#facc15',
      bgGlow: 'rgba(250, 204, 21, 0.25)',
      arcana: manipuraArcana,
      physicalOrgans: 'Желудок, поджелудочная железа, печень, желчный пузырь, диафрагма',
      psychosomaticBlock: 'Подавленный гнев, жажда тотального контроля, синдром самозванца, страх безденежья',
      positiveState: 'Несгибаемая уверенность, лидерский статус, масштабные финансовые цели и их легкая реализация',
      negativeSymptoms: ['Гастрит/изжога при стрессах', 'Вспышки раздражения', 'Упадок жизненных сил'],
      healingExercise: 'Дыхание животом (Капалабхати), утренняя солнечная зарядка с фиксацией планки',
      biorhythmInfluence: 'Физический ритм'
    },
    {
      id: 'svadhisthana',
      name: 'Свадхистана (Сакральный Центр)',
      sanskritName: 'Svādhiṣṭhāna • Удовольствие и Сексуальность',
      color: '#fb923c',
      bgGlow: 'rgba(251, 146, 60, 0.25)',
      arcana: svadhisthanaArcana,
      physicalOrgans: 'Репродуктивная система, почки, мочевой пузырь, поясница',
      psychosomaticBlock: 'Чувство вины за наслаждение, запрет на чувственность, страх осуждения желаний',
      positiveState: 'Творческий драйв, притягательность, страсть к жизни и способность легко получать подарки Вселенной',
      negativeSymptoms: ['Тянущие боли в пояснице', 'Утрата вкуса к жизни', 'Зажимы в области таза'],
      healingExercise: 'Водные ванны с морской солью и эфирным маслом иланг-иланга, плавные танцевальные разминки',
      biorhythmInfluence: 'Физический & Эмоциональный ритм'
    },
    {
      id: 'muladhara',
      name: 'Муладхара (Корневая чакра)',
      sanskritName: 'Mūlādhāra • Опора и Заземление',
      color: '#f87171',
      bgGlow: 'rgba(248, 113, 113, 0.25)',
      arcana: muladharaArcana,
      physicalOrgans: 'Кости, суставы, стопы, копчик, толстый кишечник',
      psychosomaticBlock: 'Базовый страх выживания, нестабильность опоры, родовые травмы нищеты',
      positiveState: 'Монолитное ощущение безопасности, непоколебимая связь с родом, крепкое тело',
      negativeSymptoms: ['Холодные стопы/руки', 'Тревожность за завтрашний день', 'Проблемы с суставами'],
      healingExercise: 'Прогулки босиком по земле, упражнения на баланс (поза Дерева Врикшасана)',
      biorhythmInfluence: 'Физический ритм'
    }
  ];

  return {
    chakras,
    dominantEnergyChakra: chakras.reduce((prev, curr) => curr.arcana > prev.arcana ? curr : prev).name,
    mostVulnerableChakra: chakras.find(c => c.id === 'muladhara' || c.id === 'svadhisthana')?.name || chakras[6].name,
    generalVitalityScore: 88,
    dailyChakraAffirmation: 'Мое тело — священный храм. Потоки небесной и земной энергии свободно текут через каждый мой центр.'
  };
};
