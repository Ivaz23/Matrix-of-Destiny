import { LithotherapyProfile, StoneTalisman, EssentialOilTalisman, MatrixNumbers, AstrologyData } from '../types';

export function calculateLithotherapyProfile(
  matrix?: MatrixNumbers | null,
  astrology?: AstrologyData | null
): LithotherapyProfile {
  const centerArcana = matrix?.center || 10;
  const destinyArcana = matrix?.destiny || 19;
  const bottomArcana = matrix?.bottom || 15;
  const moneyArcana = matrix?.earth || 8;
  const element = astrology?.element || 'Огонь';

  const stoneLibrary: Record<number, StoneTalisman> = {
    1: {
      name: "Горный Хрусталь / Алмаз",
      element: "Воздух / Эфир",
      color: "Прозрачный, алмазный блеск",
      chakra: "Сахасрара (Коронная)",
      arcanaConnection: 1,
      properties: "Усиливает силу мысли, кристаллизует намерения, открывает канал связи с Высшим Разумом.",
      activationMethod: "Заряжать под первыми лучами утреннего солнца или на кварцевой друзе.",
      cleansingMethod: "Промывать под струей холодной проточной воды не реже 1 раза в неделю.",
      whoShouldWear: "Лидерам, магам, новаторам и тем, кто начинает масштабные авторские проекты."
    },
    2: {
      name: "Лунный камень (Адуляр)",
      element: "Вода",
      color: "Молочно-голубой с переливами",
      chakra: "Аджна (Третий глаз)",
      arcanaConnection: 2,
      properties: "Обостряет интуицию, успокаивает бурные эмоции, раскрывает скрытые тайны и сакральные знания.",
      activationMethod: "Оставлять на подоконнике в ночь Полнолуния.",
      cleansingMethod: "Очищение морской солью без контакта с водой.",
      whoShouldWear: "Эзотерикам, психологам, целителям и тем, кто ищет глубокое внутреннее чутье."
    },
    3: {
      name: "Изумруд / Нефрит",
      element: "Земля",
      color: "Глубокий изумрудно-зеленый",
      chakra: "Анахата (Сердечная)",
      arcanaConnection: 3,
      properties: "Символ плодородия, женской силы, изобилия, красоты и материнского благословения.",
      activationMethod: "Положить на живые зеленые листья растений на рассвете.",
      cleansingMethod: "Окуривание ладаном или шалфеем.",
      whoShouldWear: "Женщинам, хранительницам очага, руководителям и творцам прекрасного."
    },
    4: {
      name: "Рубин / Гранат",
      element: "Огонь",
      color: "Огненно-красный, бордовый",
      chakra: "Муладхара (Корневая)",
      arcanaConnection: 4,
      properties: "Дарует несокрушимую волю, власть, стойкость перед кризисами и защищает статус.",
      activationMethod: "Медитация на пламя красной восковой свечи.",
      cleansingMethod: "Очищение сухим рисом или солью.",
      whoShouldWear: "Руководителям, предпринимателям, мужчинам и тем, кто строит твердую систему."
    },
    6: {
      name: "Розовый Кварц / Родонит",
      element: "Вода / Воздух",
      color: "Нежно-розовый",
      chakra: "Анахата (Сердце)",
      arcanaConnection: 6,
      properties: "Камень безусловной любви, гармонии в паре, прощения обид и магнетической привлекательности.",
      activationMethod: "Заряжать в лучах заходящего солнца с мыслями о любви.",
      cleansingMethod: "Промывание розовой водой или чистой родниковой водой.",
      whoShouldWear: "Тем, кто ищет вторую половинку или восстанавливает доверие в союзе."
    },
    10: {
      name: "Цитрин / Золотистый Топаз",
      element: "Огонь / Земля",
      color: "Янтарно-желтый, золотой",
      chakra: "Манипура (Солнечное сплетение)",
      arcanaConnection: 10,
      properties: "Магнит удачи, легких денег, счастливых случайностей и легкого прохождения сквозь перемены.",
      activationMethod: "Подержать на солнце, положить рядом с золотыми монетами.",
      cleansingMethod: "Промывать под струей проточной воды.",
      whoShouldWear: "Тем, кто хочет выйти из полосы застоя в поток финансового везения."
    },
    15: {
      name: "Черный Турмалин (Шерл) / Обсидиан",
      element: "Земля / Огонь",
      color: "Глубокий угольно-черный",
      chakra: "Муладхара (Заземление)",
      arcanaConnection: 15,
      properties: "Мощнейший щит от зависти, сглаза, токсичных связей и энергетических вампиров.",
      activationMethod: "Закопать в сухую соль на 24 часа для перезагрузки защитной сетки.",
      cleansingMethod: "Окуривание полынью или можжевельником.",
      whoShouldWear: "Тем, кто часто на виду, ведет крупные переговоры или подвергается нападкам."
    },
    17: {
      name: "Аквамарин / Бирюза / Лазурит",
      element: "Воздух / Вода",
      color: "Лазурно-голубой, небесный",
      chakra: "Вишудха (Горловая)",
      arcanaConnection: 17,
      properties: "Камень славы, признания, раскрытия творческого дара и чистого вдохновения.",
      activationMethod: "Оставлять под звездным ночным небом.",
      cleansingMethod: "Очищение звуком поющей чаши или колокольчика.",
      whoShouldWear: "Артистам, спикерам, блогерам, писателям и ярким талантам."
    },
    19: {
      name: "Солнечный камень (Гелиолит) / Янтарь",
      element: "Огонь",
      color: "Золотисто-медовый, мерцающий",
      chakra: "Манипура & Анахата",
      arcanaConnection: 19,
      properties: "Активирует радость жизни, харизму, тепло, щедрость и лидерское сияние.",
      activationMethod: "Прямой солнечный свет в полдень.",
      cleansingMethod: "Промывание чистой водой.",
      whoShouldWear: "Тем, кто хочет вдохновлять людей, масштабировать счастье и богатство."
    }
  };

  const oilsLibrary: EssentialOilTalisman[] = [
    {
      name: "Эфирное масло Сандала (Santalum album)",
      scentProfile: "Благородный древесно-бальзамический, теплый",
      chakra: "Сахасрара & Аджна",
      effect: "Глубокое умиротворение, очищение ауры от чужих мыслеформ, концентрация.",
      recommendedRitual: "Наносить каплю на запястья перед медитацией или сном."
    },
    {
      name: "Эфирное масло Дамасской Розы (Rosa damascena)",
      scentProfile: "Чувственный, цветочный, медовый",
      chakra: "Анахата",
      effect: "Раскрытие сердечного центра, притяжение романтической любви, снятие эмоциональных спазмов.",
      recommendedRitual: "Аромалампа во время свиданий или нанесение на область сердечной чакры."
    },
    {
      name: "Эфирное масло Пачули & Бергамота",
      scentProfile: "Землистый, пряно-цитрусовый, богатый",
      chakra: "Манипура & Муладхара",
      effect: "Магнит финансового потока, повышение уверенности в сделках и статусности.",
      recommendedRitual: "Капнуть на внутреннюю подкладку кошелька или рабочего блокнота."
    },
    {
      name: "Эфирное масло Ладана (Boswellia carterii)",
      scentProfile: "Смолистый, священный, возвышенный",
      chakra: "Аджна & Сахасрара",
      effect: "Защита от негативной энергетики, связь с Ангелом-Хранителем, исцеление тревожности.",
      recommendedRitual: "Окуривание помещения перед важными решениями."
    }
  ];

  // Pick stones based on matrix keys
  const primaryStone = stoneLibrary[centerArcana] || stoneLibrary[destinyArcana] || stoneLibrary[10];
  const wealthStone = stoneLibrary[moneyArcana] || stoneLibrary[10] || stoneLibrary[4];
  const loveStone = stoneLibrary[6] || stoneLibrary[3] || stoneLibrary[2];
  const protectionStone = stoneLibrary[bottomArcana] || stoneLibrary[15] || stoneLibrary[1];

  const metalsByElement: Record<string, string[]> = {
    'Огонь': ['Червонное Золото 585/750', 'Медь', 'Латунь'],
    'Земля': ['Желтое Золото', 'Бронза', 'Платина'],
    'Воздух': ['Белое Золото', 'Серебро 925', 'Титан'],
    'Вода': ['Черненое Серебро 925', 'Платина', 'Мельхиор']
  };

  return {
    primaryStones: [primaryStone, stoneLibrary[destinyArcana] || stoneLibrary[19]],
    wealthStones: [wealthStone, stoneLibrary[10]],
    loveStones: [loveStone, stoneLibrary[3]],
    protectionStones: [protectionStone, stoneLibrary[15]],
    essentialOils: oilsLibrary,
    metals: metalsByElement[element] || ['Золото', 'Серебро'],
    sacredGeometrySymbol: centerArcana <= 7 ? "Цветок Жизни (Flower of Life)" : centerArcana <= 14 ? "Меркаба (Звездный тетраэдр)" : "Шри Янтра (Sri Yantra)",
    personalizedGuidance: `Для гармонизации вашей центральной энергии (${centerArcana} аркан) и стихии ${element} рекомендуется носить ${primaryStone.name} в оправе из ${metalsByElement[element]?.[0] || 'золота/серебра'}. Для защиты от энергетических утечек используйте ${protectionStone.name}.`
  };
}
