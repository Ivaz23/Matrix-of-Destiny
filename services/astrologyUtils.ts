import { AstrologyData } from '../types';

export const getZodiacSign = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Овен";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Телец";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Близнецы";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Рак";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Лев";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Дева";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Весы";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Скорпион";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Стрелец";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Козерог";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Водолей";
  return "Рыбы";
};

export const getAstrologyData = (birthDate: string): AstrologyData => {
  const date = new Date(birthDate);
  const sign = getZodiacSign(date);

  const dataMap: Record<string, Omit<AstrologyData, 'zodiacSign'>> = {
    "Овен": { element: "Огонь", planet: "Марс", house: 1, traits: ["Смелость", "Энергичность", "Инициативность"] },
    "Телец": { element: "Земля", planet: "Венера", house: 2, traits: ["Надежность", "Терпение", "Практичность"] },
    "Близнецы": { element: "Воздух", planet: "Меркурий", house: 3, traits: ["Общительность", "Любознательность", "Гибкость"] },
    "Рак": { element: "Вода", planet: "Луна", house: 4, traits: ["Чувствительность", "Интуиция", "Заботливость"] },
    "Лев": { element: "Огонь", planet: "Солнце", house: 5, traits: ["Харизма", "Щедрость", "Гордость"] },
    "Дева": { element: "Земля", planet: "Меркурий", house: 6, traits: ["Аналитичность", "Трудолюбие", "Скромность"] },
    "Весы": { element: "Воздух", planet: "Венера", house: 7, traits: ["Дипломатичность", "Эстетизм", "Справедливость"] },
    "Скорпион": { element: "Вода", planet: "Плутон", house: 8, traits: ["Страстность", "Решительность", "Таинственность"] },
    "Стрелец": { element: "Огонь", planet: "Юпитер", house: 9, traits: ["Оптимизм", "Свободолюбие", "Философичность"] },
    "Козерог": { element: "Земля", planet: "Сатурн", house: 10, traits: ["Дисциплина", "Амбициозность", "Стойкость"] },
    "Водолей": { element: "Воздух", planet: "Уран", house: 11, traits: ["Оригинальность", "Независимость", "Гуманизм"] },
    "Рыбы": { element: "Вода", planet: "Нептун", house: 12, traits: ["Мечтательность", "Эмпатия", "Творчество"] },
  };

  return {
    zodiacSign: sign,
    ...dataMap[sign]
  };
};
