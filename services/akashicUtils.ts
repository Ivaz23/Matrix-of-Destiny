import { MatrixNumbers, UserInput, AkashicKarmaProfile } from '../types';

const reduceTo22 = (n: number): number => {
  let val = Math.abs(n);
  while (val > 22) {
    const digits = val.toString().split('').map(Number);
    val = digits.reduce((a, b) => a + b, 0);
  }
  return val === 0 ? 22 : val;
};

interface KarmicTailCatalogItem {
  key: string;
  name: string;
  pastLifeRole: string;
  pastLifeSinOrVow: string;
  unfulfilledOath: string;
  currentLifeTrap: string;
  releaseRitualAffirmation: string;
  soulGrowthTask: string;
}

const KARMIC_TAILS_CATALOG: KarmicTailCatalogItem[] = [
  {
    key: '18-6-6',
    name: 'Магическая Любовная Зависимость (Любовный Треугольник)',
    pastLifeRole: 'Обольститель или человек, применивший приворотную магию ради власти над чужим сердцем',
    pastLifeSinOrVow: 'Клятва вечной слепой преданности или манипуляция чужой волей ради любовного обладания',
    unfulfilledOath: 'Обет «Любить только одного до скончания времен даже ценой собственной свободы»',
    currentLifeTrap: 'В этой жизни притягиваются эмоциональные качели, любовные треугольники или страх быть отвергнутым',
    releaseRitualAffirmation: 'Я отпускаю все клятвы слепого обладания и приворотов из прошлых воплощений. Моя любовь свободна, чиста и наполняет меня силой.',
    soulGrowthTask: 'Научиться любить безусловно, сохраняя личные границы и не растворяясь в партнере.'
  },
  {
    key: '15-20-5',
    name: 'Бунтарь Рода и Искушение Властью',
    pastLifeRole: 'Отвергнутый родом маг, тайный реформатор или аристократ, разоривший родовое гнездо',
    pastLifeSinOrVow: 'Отказ от родовых законов, погоня за запретными удовольствиями и злоупотребление тайным знанием',
    unfulfilledOath: 'Клятва мести старейшинам рода или обет отречения от семьи',
    currentLifeTrap: 'Конфликты с родителями, страх повторить судьбу предков или искушение легкими теневыми деньгами',
    releaseRitualAffirmation: 'Я с любовью кланяюсь своему Роду. Я расторгаю все клятвы обиды и бунта. Я несу в свой Род свет, мудрость и процветание.',
    soulGrowthTask: 'Объединить семью, стать духовным лидером и передавать чистые знания следующим поколениям.'
  },
  {
    key: '21-4-10',
    name: 'Угнетенный Пленник / Закрытые Границы',
    pastLifeRole: 'Путешественник, купец или воин, попавший в плен и лишенный свободы передвижения',
    pastLifeSinOrVow: 'Ограничение свободы других людей либо клятва никогда не покидать родную землю',
    unfulfilledOath: 'Клятва «Лучше не иметь ничего, чем снова потерять свободу»',
    currentLifeTrap: 'Внутренний страх масштаба, трудности с переездами и визами, синдром стеклянного потолка в доходе',
    releaseRitualAffirmation: 'Весь мир открыт для меня. Я свободен от прошлых оков и стен. Мой масштаб безграничен, а планета — мой безопасный дом.',
    soulGrowthTask: 'Путешествовать по миру, масштабировать бизнес на международный уровень и мыслить глобально.'
  },
  {
    key: '9-3-21',
    name: 'Надзиратель и Закрытое Сердце',
    pastLifeRole: 'Человек при высокой власти (судья, тюремный надзиратель, строгий монах-инквизитор)',
    pastLifeSinOrVow: 'Холодное и безжалостное суждение других, запрет себе на проявление нежности',
    unfulfilledOath: 'Обет сурового аскетизма и безбрачия во имя идеи',
    currentLifeTrap: 'Глубинное одиночество в толпе, привычка все контролировать и страх открыться близким',
    releaseRitualAffirmation: 'Я снимаю доспехи суровости. Мое сердце мягкое и любящее. Я прощаю себя и позволяю себе доверять миру.',
    soulGrowthTask: 'Раскрыть теплосердечность, заниматься наставничеством и помогать людям без критики.'
  },
  {
    key: '15-5-8',
    name: 'Страсти и Тайные Договоры',
    pastLifeRole: 'Купец, ростовщик или алхимик, заключивший нечестную сделку ради несметных богатств',
    pastLifeSinOrVow: 'Использование людей как ресурсов, нарушение договоров чести',
    unfulfilledOath: 'Тайный контракт на богатство в обмен на душевный покой',
    currentLifeTrap: 'Финансовые качели (то миллионы, то долги), проверки на честность в бизнесе',
    releaseRitualAffirmation: 'Я расторгаю все нечестные договоры прошлого. Мои деньги приходят через пользу миру, честность и созидательную силу.',
    soulGrowthTask: 'Вести кристально чистый бизнес, инвестировать в экологичные проекты и благотворительность.'
  },
  {
    key: 'default',
    name: 'Воин Света и Кармический Целитель',
    pastLifeRole: 'Хранитель сакральных традиций, целитель или защитник угнетенных',
    pastLifeSinOrVow: 'Сомнение в своей божественной миссии в момент решающей битвы',
    unfulfilledOath: 'Клятва скрывать свой истинный дар из страха преследования',
    currentLifeTrap: 'Обесценивание своих уникальных способностей, страх заявить о себе во весь голос',
    releaseRitualAffirmation: 'Я объявляю о своем праве светить. Мой дар нужен людям. Я иду вперед с непоколебимой верой и поддержкой Вселенной.',
    soulGrowthTask: 'Проявлять свой духовный и творческий потенциал, вести людей к осознанности.'
  }
];

export const calculateAkashicKarma = (
  userInput?: UserInput | null,
  matrix?: MatrixNumbers | null
): AkashicKarmaProfile => {
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

  const mDay = matrix?.day || reduceTo22(day);
  const mMonth = matrix?.month || reduceTo22(month);
  const mYear = matrix?.year || reduceTo22(year);
  const mBottom = matrix?.bottom || reduceTo22(mDay + mMonth + mYear);

  const arc1 = mBottom;
  const arc2 = reduceTo22(mBottom + mYear);
  const arc3 = reduceTo22(arc1 + arc2);

  const tailCode = `${arc1}-${arc2}-${arc3}`;
  let match = KARMIC_TAILS_CATALOG.find(t => t.key === tailCode);

  if (!match) {
    // Select deterministic tail based on arc1
    const idx = (arc1 + arc2 + arc3) % (KARMIC_TAILS_CATALOG.length - 1);
    match = KARMIC_TAILS_CATALOG[idx] || KARMIC_TAILS_CATALOG[KARMIC_TAILS_CATALOG.length - 1];
  }

  return {
    karmicTailName: match.name,
    karmicTailArcanas: [arc1, arc2, arc3],
    pastLifeRole: match.pastLifeRole,
    pastLifeSinOrVow: match.pastLifeSinOrVow,
    unfulfilledOath: match.unfulfilledOath,
    currentLifeTrap: match.currentLifeTrap,
    releaseRitualAffirmation: match.releaseRitualAffirmation,
    soulGrowthTask: match.soulGrowthTask
  };
};
