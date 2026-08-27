import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Soup, 
  Sparkles, 
  Flame, 
  Utensils, 
  Clock, 
  Heart, 
  Leaf, 
  BookOpen, 
  Coffee, 
  Droplet, 
  Sun, 
  Moon, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Wheat,
  Smile,
  Volume2,
  VolumeX,
  CheckCircle2,
  Apple
} from 'lucide-react';
import { UserInput, MatrixNumbers } from '../types';
import { useGlobalAudio } from '../src/hooks/useGlobalAudio';

interface SacredCookingSectionProps {
  userInput: UserInput | null;
  matrix: MatrixNumbers | null;
  onNavigateToMatrix?: () => void;
  onNavigateToChakras?: () => void;
}

interface AyurvedicCerealInfo {
  id: string;
  name: string;
  energyType: string;
  element: string;
  arcanaAffinity: number[];
  qualities: string;
  chakra: string;
  healthBenefits: string[];
  cookingTimeMinutes: number;
  waterRatio: string;
  sacredSpices: string[];
  ritualFormula: string;
  affirmation: string;
  recipeTitle: string;
  recipeIngredients: string[];
  cookingSteps: string[];
}

const AYURVEDIC_CEREALS: AyurvedicCerealInfo[] = [
  {
    id: 'buckwheat',
    name: 'Гречневая крупа (Царская каша Силы)',
    energyType: 'Ян / Согревающая, Заземляющая',
    element: 'Земля & Огонь',
    arcanaAffinity: [1, 4, 7, 8, 11, 19],
    qualities: 'Укрепляет волю, стабилизирует сосуды, очищает кровь, дает выносливость и решимость',
    chakra: 'Муладхара (1) & Манипура (3)',
    healthBenefits: [
      'Богата рутином, железом и магнием — укрепляет сердце и стенки сосудов',
      'Заземляет при тревожности, ментальном хаосе и панических состояниях',
      'Очищает печень и активирует внутренний метаболический огонь (Агни)'
    ],
    cookingTimeMinutes: 20,
    waterRatio: '1:2 (на 1 стакан крупы 2 стакана воды)',
    sacredSpices: ['Топленое масло Гхи', 'Куркума', 'Зира (кумин)', 'Черный перец', 'Семена горчицы'],
    ritualFormula: 'Варить с намерением: «Я твердо стою на ногах. Моя сила, статус и ресурс нерушимы».',
    affirmation: 'Мое тело наполнено силой Земли, я в безопасности, полон энергии и материального изобилия.',
    recipeTitle: 'Сакральная Гречневая Каша Лидера (4 & 11 Арканы)',
    recipeIngredients: [
      '1 стакан цельной зеленой или прокаленной гречки',
      '2 стакана родниковой горячей воды',
      '1 ст. л. топленого масла Гхи',
      '1/2 ч. л. куркумы и 1/3 ч. л. молотой зиры',
      'Щепотка розовой гималайской соли',
      'Свежая зелень петрушки или укропа'
    ],
    cookingSteps: [
      'Промойте крупу в 3 водах, мысленно смывая суету и усталость.',
      'В толстодонном сотейнике прогрейте ложку масла Гхи со специями 30 секунд до раскрытия аромата.',
      'Засыпьте гречку, перемешайте, чтобы каждая крупинка покрылась золотым маслом.',
      'Залейте кипятком, убавьте огонь до минимума и плотно закройте крышкой на 15 минут (не открывать!).',
      'Снимите с огня, укутайте полотенцем на 10 минут для раскрытия тонких энергий праны.'
    ]
  },
  {
    id: 'oatmeal',
    name: 'Овсяная крупа / Цельный овес (Эликсир Любви)',
    energyType: 'Инь / Мягкая, Обволакивающая, Умиротворяющая',
    element: 'Вода & Воздух',
    arcanaAffinity: [2, 3, 6, 12, 14, 17, 21],
    qualities: 'Успокаивает нервную систему, исцеляет слизистые, открывает сердечную анахату, дарит принятие',
    chakra: 'Анахата (4) & Свадхистана (2)',
    healthBenefits: [
      'Содержит бета-глюканы — защищает слизистую желудка и нормализует микробиом',
      'Снижает уровень кортизола и нервного истощения при стрессе и бессоннице',
      'Мягко питает ткани тела (Оджас) и раскрывает способность любить и прощать'
    ],
    cookingTimeMinutes: 25,
    waterRatio: '1:3 (на 1 стакан цельного овса/хлопьев 3 стакана воды или миндального молока)',
    sacredSpices: ['Корица цейлонская', 'Кардамон', 'Мускатный орех', 'Шафран', 'Натуральная ваниль'],
    ritualFormula: 'Варить с намерением: «Мое сердце открыто безусловной любви, гармонии и исцелению».',
    affirmation: 'Я наполняю каждую клеточку тела заботой, нежностью, миром и сладким покоем.',
    recipeTitle: 'Анахата-Овсянка с Кардамоном и Золотым Маслом (3 & 6 Арканы)',
    recipeIngredients: [
      '1 стакан долговарящихся овсяных хлопьев (или цельного зерна овса)',
      '1.5 стакана родниковой воды + 1.5 стакана кокосового/миндального молока',
      '1 коробочка растертого кардамона и 1/2 ч. л. цейлонской корицы',
      '1 ч. л. масла Гхи или кокосового нерафинированного',
      '1 ст. л. вымоченного изюма, сушеного инжира или ягод годжи',
      '1 ч. л. сырого меда (добавлять только в теплую кашу!)'
    ],
    cookingSteps: [
      'Замочите зерно на 2–3 часа или на ночь в теплой воде с каплей лимонного сока.',
      'Поставьте на медленный огонь в смеси воды и растительного молока.',
      'Добавьте кардамон, корицу и вымоченные сухофрукты.',
      'Томите 15-20 минут, медленно помешивая по часовой стрелке с добрыми мыслями.',
      'В готовое блюдо добавьте мед и ложечку масла перед подачей.'
    ]
  },
  {
    id: 'millet',
    name: 'Пшенная каша (Золотое Солнце Жизни)',
    energyType: 'Ян / Согревающая, Солнечная, Щелочная',
    element: 'Огонь & Эфир',
    arcanaAffinity: [1, 3, 4, 7, 10, 19, 22],
    qualities: 'Выводит токсины, ощелачивает организм, пробуждает радость, харизму и процветание',
    chakra: 'Манипура (3) & Сахасрара (7)',
    healthBenefits: [
      'Единственная злаковая крупа, дающая выраженный ощелачивающий эффект для pH',
      'Укрепляет почки, выводит тяжелые металлы и остатки антибиотиков',
      'Дарит солнечный оптимизм, устраняет апатию, депрессивный сплин и упадок сил'
    ],
    cookingTimeMinutes: 30,
    waterRatio: '1:3 или 1:3.5 (для нежной кремовой консистенции)',
    sacredSpices: ['Шафран', 'Имбирь сушеный', 'Куркума', 'Фенхель', 'Топленое масло Гхи'],
    ritualFormula: 'Варить с намерением: «Золотой свет Солнца наполняет меня богатством, сиянием и здоровьем».',
    affirmation: 'Я излучаю свет, уверенность и радость. Мой жизненный огонь горит ярко и чисто.',
    recipeTitle: 'Солнечная Золотая Каша с Тыквой и Шафраном (19 Аркан Солнца)',
    recipeIngredients: [
      '1 стакан отборного золотистого пшена',
      '200 г сладкой спелой тыквы (нарезанной мелкими кубиками)',
      '3 стакана горячей родниковой воды или орехового молока',
      '3-4 тычинки шафрана (замочить в 2 ст. л. теплой воды)',
      '1 ст. л. топленого масла Гхи',
      'Щепотка фенхеля и гималайской соли'
    ],
    cookingSteps: [
      'Обязательно ошпарьте пшено кипятком, чтобы убрать природную горчинку.',
      'В казанке растопите масло Гхи, слегка припустите кубики тыквы 3–4 минуты.',
      'Добавьте промытое пшено, шафрановую воду и залейте горячей жидкостью.',
      'Варите на тихом огне 20–25 минут под закрытой крышкой.',
      'Подавайте с щепоткой фенхеля и каплей меда — настоящая пища богов!'
    ]
  },
  {
    id: 'rice_basmati',
    name: 'Рис Басмати / Кичари (Саттвическое Очищение)',
    energyType: 'Саттва / Нейтральная, Благостная, Чистая',
    element: 'Вода & Земля',
    arcanaAffinity: [5, 9, 14, 18, 20, 21],
    qualities: 'Уравновешивает все 3 доши (Вата, Питта, Капха), очищает тонкие каналы нади, дает ясность ума',
    chakra: 'Вишудха (5) & Аджна (6)',
    healthBenefits: [
      'Легчайшее усвоение, идеальная детокс-основа для духовных постов и ретритов',
      'Снимает воспаления ЖКТ, восстанавливает энергетическую оболочку ауры',
      'Проясняет сознание для медитаций, молитв и глубокой аналитической работы'
    ],
    cookingTimeMinutes: 35,
    waterRatio: '1:4 (для классического аюрведического Кичари с машем)',
    sacredSpices: ['Кумин (зира)', 'Семена кориандра', 'Свежий корень имбиря', 'Куркума', 'Асафетида'],
    ritualFormula: 'Варить с намерением: «Мое сознание чисто, мысли спокойны, тело исцелено и свободно».',
    affirmation: 'Я нахожусь в абсолютном равновесии, мудрости и святости своего пути.',
    recipeTitle: 'Аюрведический Кичари Мудреца (9 & 14 Арканы Равновесия)',
    recipeIngredients: [
      '1/2 стакана риса басмати + 1/2 стакана желтого маша (мунг дала)',
      '4–5 стаканов воды (до полужидкой шелковистой консистенции)',
      '1 ст. л. свеженатертого имбиря',
      '1 ст. л. топленого масла Гхи',
      '1/2 ч. л. кумина, 1/2 ч. л. куркумы, щепотка асафетиды и кориандра',
      'Свежая кинза и сок четвертинки лайма при подаче'
    ],
    cookingSteps: [
      'Замочите маш и рис минимум на 1-2 часа, тщательно промойте.',
      'В кастрюле с толстым дном разогрейте Гхи, обжарьте имбирь и семена кумина до потрескивания.',
      'Добавьте порошковые специи, затем рис и маш, обжарьте 1 минуту.',
      'Залейте водой, доведите до кипения, убавьте огонь и варите 30–35 минут до разваривания маша.',
      'Сбрызните соком лайма и посыпьте кинзой. Это главное восстанавливающее блюдо восточной медицины.'
    ]
  },
  {
    id: 'quinoa',
    name: 'Киноа и Амарант (Зерна Древних Цивилизаций)',
    energyType: 'Высоковибрационная / Легкая, Пробуждающая',
    element: 'Воздух & Огонь',
    arcanaAffinity: [1, 7, 10, 13, 16, 17, 22],
    qualities: 'Полный аминокислотный профиль, раскрывает скрытый потенциал клеток, ускоряет регенерацию',
    chakra: 'Манипура (3) & Аджна (6)',
    healthBenefits: [
      'Содержит все 9 незаменимых аминокислот, рекордсмен по растительному протеину',
      'Безглютеновое зерно — не зашлаковывает ворсинки кишечника',
      'Повышает уровень личной витальности, выносливости и ментальной фокусировки'
    ],
    cookingTimeMinutes: 18,
    waterRatio: '1:2',
    sacredSpices: ['Розмарин', 'Тимьян', 'Паприка копченая', 'Чесночное масло', 'Семена льна'],
    ritualFormula: 'Варить с намерением: «Я легко трансформирую старое в новое. Моя энергия безгранична».',
    affirmation: 'Мое тело молодеет, клетки обновляются, я иду путем побед и квантовых прорывов.',
    recipeTitle: 'Энергетическая Киноа Триумфатора (7 & 17 Арканы Звездного Пути)',
    recipeIngredients: [
      '1 стакан трехцветной или белой киноа',
      '2 стакана овощного бульона или фильтрованной воды',
      '1 ст. л. оливкового масла холодного отжима или масла авокадо',
      '1/2 ч. л. сушеного розмарина и орегано',
      'Горсть кедровых орешков или семян тыквы',
      'Половинка авокадо и вяленые томаты для сервировки'
    ],
    cookingSteps: [
      'Тщательно промойте киноа в мелком сите теплой водой, чтобы смыть сапонины.',
      'В сотейнике слегка прокалите сухое зерно 2 минуты до легкого орехового аромата.',
      'Залейте кипящим бульоном, добавьте травы и щепотку морской соли.',
      'Варите под крышкой на самом слабом огне 15 минут, пока зерна не раскроются спиральками.',
      'Добавьте кедровые орешки и масло авокадо — идеальный суперфуд для активного дня!'
    ]
  },
  {
    id: 'barley',
    name: 'Перловая и Ячменная каша (Алмазный Щит Предков)',
    energyType: 'Инь-Ян / Очищающая, Охлаждающая, Структурирующая',
    element: 'Земля & Вода',
    arcanaAffinity: [4, 5, 8, 12, 16, 20],
    qualities: 'Снимает кармические токсины, укрепляет кости и суставы, очищает лимфу, дарует выдержку',
    chakra: 'Муладхара (1) & Вишудха (5)',
    healthBenefits: [
      'Рекордсмен по фосфору и клетчатке, способствует синтезу природного коллагена',
      'Выводит избыточную слизь, очищает лимфатическую систему и дыхательные пути',
      'Формирует несгибаемый внутренний стержень, дисциплину и связь с родовой защитой'
    ],
    cookingTimeMinutes: 45,
    waterRatio: '1:3 (после предварительного замачивания)',
    sacredSpices: ['Лавровый лист', 'Душистый перец', 'Майоран', 'Белые грибы сушеные', 'Укропное семя'],
    ritualFormula: 'Варить с намерением: «Я опираюсь на мудрость рода. Мой внутренний стержень нерушим».',
    affirmation: 'Мой костный скелет и воля крепки, как алмаз. Я нахожусь под защитой Рода.',
    recipeTitle: 'Монастырская Перловая Каша с Лесными Травами (8 & 20 Арканы)',
    recipeIngredients: [
      '1 стакан ячменной или перловой крупы крупного помола',
      '3 стакана воды (или грибного настоя)',
      'Горсть сушеных белых грибов (замочить заранее)',
      '1 луковица и 1 морковь (томленые на медленном огне)',
      '1 ст. л. нерафинированного подсолнечного или горчичного масла',
      '2 лавровых листика и щепотка майорана'
    ],
    cookingSteps: [
      'Замочите перловку в прохладной воде на ночь (6–8 часов).',
      'Слейте воду, залейте свежей водой и варите на медленном огне 35–40 минут.',
      'Отдельно припустите лук, морковь и замоченные грибочки на ложке масла.',
      'Соедините кашу с грибной поджаркой, добавьте лавровый лист и специи.',
      'Томите в глиняном горшочке или толстой кастрюле еще 15 минут для раскрытия насыщенного вкуса.'
    ]
  }
];

export const SacredCookingSection: React.FC<SacredCookingSectionProps> = ({
  userInput,
  matrix,
  onNavigateToMatrix,
  onNavigateToChakras
}) => {
  const [selectedCerealId, setSelectedCerealId] = useState<string>('buckwheat');
  const [activeTab, setActiveTab] = useState<'matrix_diet' | 'cereals' | 'rules' | 'timer'>('matrix_diet');
  const [cookingTimerSeconds, setCookingTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isRitualModalOpen, setIsRitualModalOpen] = useState<boolean>(false);

  const { isMuted, toggleMute, isLoaded } = useGlobalAudio();

  // Selected cereal object
  const currentCereal = useMemo(() => {
    return AYURVEDIC_CEREALS.find(c => c.id === selectedCerealId) || AYURVEDIC_CEREALS[0];
  }, [selectedCerealId]);

  // Determine user's primary arcanas
  const userArcanas = useMemo(() => {
    if (!matrix) return [1, 4, 7, 10, 19];
    return [
      matrix.day,
      matrix.month,
      matrix.year,
      matrix.center,
      matrix.bottom
    ].filter(Boolean);
  }, [matrix]);

  // Match optimal cereals for user's destiny matrix
  const recommendedCereals = useMemo(() => {
    return AYURVEDIC_CEREALS.filter(cereal => 
      cereal.arcanaAffinity.some(arc => userArcanas.includes(arc))
    );
  }, [userArcanas]);

  return (
    <div className="w-full space-y-8 animate-fade-in text-slate-100 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#120a1f] via-[#0d1326] to-[#070b16] border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Soup size={14} className="text-amber-400" />
              <span>Сакральное Кашеваривание & Питание по Арканам</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
              Искусство Сакрального Кашеваривания
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
              Каша на Руси и в древней Аюрведе — это не просто еда, а алхимия стихий: 
              <strong className="text-amber-300"> Зерно (Земля)</strong>, 
              <strong className="text-sky-300"> Родник (Вода)</strong>, 
              <strong className="text-orange-300"> Пламя (Огонь)</strong>, 
              <strong className="text-emerald-300"> Пар (Воздух)</strong> и 
              <strong className="text-purple-300"> Намерение (Эфир)</strong>. 
              Узнайте, какие крупы и специи пробуждают ресурс ваших ведущих арканов.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => setIsRitualModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-serif font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>7 Заповедей Кашевара</span>
            </button>

            {onNavigateToMatrix && (
              <button
                onClick={onNavigateToMatrix}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-200 border border-amber-500/30 font-serif text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sun size={15} />
                <span>К Матрице</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('matrix_diet')}
            className={`px-4 py-2.5 rounded-xl font-serif text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'matrix_diet'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
            }`}
          >
            <Sparkles size={15} />
            <span>Ваш Рацион по Матрице</span>
            {matrix && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-[10px] text-amber-200">
                {recommendedCereals.length} круп
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cereals')}
            className={`px-4 py-2.5 rounded-xl font-serif text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'cereals'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
            }`}
          >
            <Wheat size={15} />
            <span>Энциклопедия Злаков (6 Круп)</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2.5 rounded-xl font-serif text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
            }`}
          >
            <Flame size={15} />
            <span>Алхимия Огня и Специй</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MATRIX DIET & PERSONAL RECOMMENDATIONS */}
      {activeTab === 'matrix_diet' && (
        <div className="space-y-6">
          {/* User's Matrix Key Energies */}
          <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Sun size={18} className="text-amber-400" />
                  Энергетический баланс для: {userInput.name || 'Искателя Истины'}
                </h3>
                <p className="text-xs text-slate-400">
                  Дата рождения: {userInput.birthDate || 'Не указана'}. Ваши ведущие энергии: {userArcanas.join(', ')} арканы.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                {recommendedCereals.length > 0 ? `Найдено ${recommendedCereals.length} идеальных злака` : 'Универсальный рацион'}
              </div>
            </div>

            {/* Recommended Cereals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {(recommendedCereals.length > 0 ? recommendedCereals : AYURVEDIC_CEREALS.slice(0, 3)).map((cereal) => (
                <div 
                  key={cereal.id}
                  onClick={() => {
                    setSelectedCerealId(cereal.id);
                    setActiveTab('cereals');
                  }}
                  className="p-5 rounded-2xl bg-gradient-to-b from-[#121829] to-[#0a0f1d] border border-amber-500/25 hover:border-amber-400 transition-all cursor-pointer group space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                      {cereal.element}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {cereal.cookingTimeMinutes} мин
                    </span>
                  </div>

                  <h4 className="text-base font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                    {cereal.name}
                  </h4>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {cereal.qualities}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-serif">Чакры: <strong className="text-amber-200">{cereal.chakra}</strong></span>
                    <span className="text-amber-400 text-[11px] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Рецепт ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Matrix Arcana Eating Habits Guide */}
          <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-5">
            <h3 className="text-base font-serif font-bold text-amber-200 flex items-center gap-2">
              <Leaf size={18} className="text-emerald-400" />
              Кашеварная карта по 4 Ключевым Арканам вашей личности
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Day Arcana */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="text-amber-400 text-xs font-bold font-serif uppercase tracking-wider">
                  Визитка ({matrix ? matrix.day : '1'} Аркан)
                </div>
                <div className="text-sm font-bold text-white">Утренний Оджас</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Задаёт уровень энергии на весь день. Рекомендуются горячие цельнозерновые каши с маслом Гхи и теплыми специями.
                </p>
              </div>

              {/* Month Arcana */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="text-sky-400 text-xs font-bold font-serif uppercase tracking-wider">
                  Таланты ({matrix ? matrix.month : '7'} Аркан)
                </div>
                <div className="text-sm font-bold text-white">Ментальная Ясность</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Питание для мозга и интуиции. Киноа, легкий басмати, шафран, кардамон и грецкие орехи.
                </p>
              </div>

              {/* Comfort Arcana */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="text-emerald-400 text-xs font-bold font-serif uppercase tracking-wider">
                  Комфорт Души ({matrix ? matrix.center : '5'} Аркан)
                </div>
                <div className="text-sm font-bold text-white">Саттва и Гармония</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Устраняет тревогу. Разваристые каши (Кичари, томленый овес) в спокойной благостной атмосфере.
                </p>
              </div>

              {/* Karmic Tail */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="text-rose-400 text-xs font-bold font-serif uppercase tracking-wider">
                  Карма Рода ({matrix ? matrix.bottom : '18'} Аркан)
                </div>
                <div className="text-sm font-bold text-white">Очищение Токсинов</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Разгрузочные дни на пшене или ячмене с куркумой и имбирем для растворения тяжелых кармических паттернов.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CEREALS ENCYCLOPEDIA & DETAILED RECIPES */}
      {activeTab === 'cereals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Selection List (4 cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-xs font-serif font-bold text-slate-400 uppercase tracking-wider block px-1">
              Выберите сакральную крупу:
            </span>

            {AYURVEDIC_CEREALS.map((cereal) => {
              const isSelected = cereal.id === selectedCerealId;
              const isAffinity = cereal.arcanaAffinity.some(a => userArcanas.includes(a));

              return (
                <button
                  key={cereal.id}
                  onClick={() => setSelectedCerealId(cereal.id)}
                  className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/20 border border-amber-400 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-[#0b1020]/80 hover:bg-white/5 border border-white/5 text-slate-300'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-serif font-bold truncate">
                        {cereal.name.split('(')[0]}
                      </span>
                      {isAffinity && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-[9px] text-amber-300 font-bold uppercase shrink-0">
                          Ваш Аркан
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {cereal.energyType}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-amber-400 shrink-0">
                    {cereal.cookingTimeMinutes} мин
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Cereal Detail Card (8 cols) */}
          <div className="lg:col-span-8 bg-[#0b1020]/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header info */}
            <div className="space-y-2 pb-4 border-b border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                  {currentCereal.element}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold">
                  {currentCereal.chakra}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  Пропорция: {currentCereal.waterRatio}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {currentCereal.name}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {currentCereal.qualities}
              </p>
            </div>

            {/* Health & Spiritual Benefits */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} />
                Целебное воздействие на тело и прану
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentCereal.healthBenefits.map((benefit, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed">
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            {/* Sacred Spices */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <Flame size={15} />
                Сакральные специи-проводники:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentCereal.sacredSpices.map((spice, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-black/40 border border-amber-500/30 text-xs text-amber-300 font-medium">
                    {spice}
                  </span>
                ))}
              </div>
            </div>

            {/* Recipe Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#101729] to-[#090e1a] border border-amber-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-amber-300 flex items-center gap-2">
                  <Utensils size={18} />
                  {currentCereal.recipeTitle}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Время: ~{currentCereal.cookingTimeMinutes} мин
                </span>
              </div>

              {/* Ingredients */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Ингредиенты:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {currentCereal.recipeIngredients.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Пошаговый ритуал приготовления:
                </span>
                <ol className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  {currentCereal.cookingSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Ritual Affirmation Formula */}
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-purple-300">
                  <Sparkles size={14} />
                  Слово Силы при засыпке зерна:
                </div>
                <div className="italic font-serif">
                  «{currentCereal.affirmation}»
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SACRED PRINCIPLES & SPICES */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-[#0b1020]/90 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
                <Flame size={22} className="text-orange-400" />
                Алхимия Специй и Сила Огня (Агни)
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
                В сакральной кулинарии специи — это не приправы, а «ключи зажигания» для метаболизма и проводники тонких энергий. 
                Без специй каша может создавать слизь (Аму), а с правильными пряностями — превращается в нектар долголетия (Расаяну).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Spice 1 */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-[#13192b] to-[#090d18] border border-amber-500/20 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                  🧈
                </div>
                <h4 className="text-sm font-bold text-white font-serif">
                  Золотое Масло Гхи
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Жидкое солнце. Смазывает суставы, питает тонкую ткань мозга, усиливает память и проводит полезные вещества трав глубоко в клетки.
                </p>
              </div>

              {/* Spice 2 */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-[#13192b] to-[#090d18] border border-amber-500/20 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center font-bold text-sm">
                  🟡
                </div>
                <h4 className="text-sm font-bold text-white font-serif">
                  Куркума & Черный Перец
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Священный антиоксидант. Черный перец с пиперином увеличивает усвоение куркумина на 2000%, очищая кровь от застойной энергии.
                </p>
              </div>

              {/* Spice 3 */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-[#13192b] to-[#090d18] border border-amber-500/20 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                  🌿
                </div>
                <h4 className="text-sm font-bold text-white font-serif">
                  Кардамон & Шафран
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Энергия высших сфер и Венеры. Нейтрализуют слизь от молока и глютена, открывают сердечный центр и наполняют ауру свечением.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RITUAL MODAL: 7 COMMANDMENTS OF THE SACRED COOK */}
      {isRitualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0b1020] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                7 Заповедей Сакрального Кашевара
              </h3>
              <button
                onClick={() => setIsRitualModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400 font-mono">1.</span>
                <span><strong>Чистота рук и мыслей:</strong> Никогда не начинайте варить кашу в гневе, спешке или обиде. Пища мгновенно впитывает ваше эмоциональное поле.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400 font-mono">2.</span>
                <span><strong>Помешивание по Солнцу:</strong> Мешайте кашу деревянной ложкой строго по часовой стрелке, закручивая созидательный торсионный вихрь.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400 font-mono">3.</span>
                <span><strong>Не пробовать в процессе:</strong> Первая порция тонкой праны должна быть посвящена высшим силам и благодарности пространству.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400 font-mono">4.</span>
                <span><strong>Томление в тепле:</strong> Настоящая каша доходит после снятия с огня, укутанная в полотенце («каша любит нежность и покой»).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-amber-400 font-mono">5.</span>
                <span><strong>Живой огонь:</strong> Готовьте на самом тихом огне, сохраняя структуру природных ферментов зерна.</span>
              </div>
            </div>

            <button
              onClick={() => setIsRitualModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-serif font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
            >
              Принять и Благословить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
