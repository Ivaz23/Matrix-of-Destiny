import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Sparkles, 
  ExternalLink, 
  Tag, 
  Gem, 
  BookOpen, 
  Flame, 
  Coins, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Heart,
  Star,
  Zap
} from 'lucide-react';
import { MatrixNumbers, UserInput } from '../types';
import { 
  getMonetizationSettings, 
  recordAdClick 
} from '../services/monetizationService';

interface AffiliateMarketSectionProps {
  matrix?: MatrixNumbers;
  userInput?: UserInput;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
  onOpenOrderModal?: () => void;
}

export const AffiliateMarketSection: React.FC<AffiliateMarketSectionProps> = ({
  matrix,
  userInput,
  onTriggerHaptic,
  onOpenOrderModal
}) => {
  const settings = getMonetizationSettings();
  const [activeCategory, setActiveCategory] = useState<'all' | 'stones' | 'tarot' | 'books' | 'vip'>('all');

  const moneyArcana = matrix?.earth || matrix?.center || 15;
  const destinyArcana = matrix?.destiny || 19;
  const loveArcana = matrix?.month || 6;

  const items = [
    {
      id: 'stone-money',
      category: 'stones',
      title: `Браслет активации Денежного Канала (${moneyArcana} Аркан)`,
      description: `Натуральный пирит, цитрин и тигровый глаз. Сфокусирован на снятии финансовых блоков аркана ${moneyArcana}.`,
      priceRub: 1490,
      oldPriceRub: 2200,
      discount: '-32%',
      badge: 'ТОП ВЫБОР',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: '💎',
      url: settings.affiliateLithotherapyUrl,
    },
    {
      id: 'stone-destiny',
      category: 'stones',
      title: `Амулет Высшего Предназначения (${destinyArcana} Аркан)`,
      description: `Натуральный аметист и лазурит для усиления интуиции, раскрытия духовного пути и защиты энергетики.`,
      priceRub: 1890,
      oldPriceRub: 2600,
      discount: '-27%',
      badge: 'ДЛЯ ВАС',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: '🔮',
      url: settings.affiliateLithotherapyUrl,
    },
    {
      id: 'tarot-classic',
      category: 'tarot',
      title: 'Классическая Колода Таро Уэйта (Премиум Золотой Срез)',
      description: 'Идеальный инструмент для глубокой медитации на 22 Высших Аркана и ежедневного получения подсказок от Вселенной.',
      priceRub: 1250,
      oldPriceRub: 1900,
      discount: '-34%',
      badge: 'ХИТ',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: '🎴',
      url: settings.affiliateTarotDecksUrl,
    },
    {
      id: 'book-matrix',
      category: 'books',
      title: 'Полный Гримуар: Коды Матрицы Судьбы и Кармические Хвосты',
      description: 'Фундаментальное руководство по всем 22 энергиям, расчету родовых каналов и выходу из минусовых программ.',
      priceRub: 890,
      oldPriceRub: 1300,
      discount: '-31%',
      badge: 'КНИГА ГОДА',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      icon: '📜',
      url: settings.affiliateBooksUrl,
    },
    {
      id: 'vip-report',
      category: 'vip',
      title: 'Персональный Полный PDF-Отчет (45 страниц)',
      description: 'Индивидуальный расчет от Chubuk Matrix: прогноз на 3 года, карта здоровья по чакрам, совместимость и ключи богатства.',
      priceRub: settings.pdfReportPriceRub,
      oldPriceRub: 1990,
      discount: '-75%',
      badge: 'OFFICIAL VIP',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: '✨',
      isInternalOrder: true,
    }
  ];

  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter(i => i.category === activeCategory);

  const handleClickItem = (item: typeof items[0]) => {
    if (onTriggerHaptic) onTriggerHaptic(25);
    recordAdClick();
    if (item.isInternalOrder && onOpenOrderModal) {
      onOpenOrderModal();
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in text-slate-100 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#1a0f2e] via-[#0d142b] to-[#04060d] border border-amber-500/40 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-serif font-bold uppercase tracking-wider">
              <ShoppingBag size={13} className="text-amber-400" />
              <span>Сакральный Маркет & Атрибутика</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Персональные Артефакты и Книги
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed max-w-2xl">
              Товары и камни-талисманы, отобранные под ваши индивидуальные энергии Матрицы Судьбы ({userInput?.name || 'Гость'}, дата рождения: {userInput?.birthDate || '—'}).
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-xs text-amber-300 font-mono shrink-0">
            <ShieldCheck size={16} className="text-amber-400" />
            <span>Проверенные поставщики</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-white/10 mt-6 text-xs font-serif font-bold">
          {[
            { id: 'all', label: 'Все предложения', icon: <Sparkles size={14} /> },
            { id: 'stones', label: 'Камни и Браслеты', icon: <Gem size={14} /> },
            { id: 'tarot', label: 'Колоды Таро', icon: <Flame size={14} /> },
            { id: 'books', label: 'Гримуары и Книги', icon: <BookOpen size={14} /> },
            { id: 'vip', label: 'VIP PDF-Отчет', icon: <Award size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id as any);
                if (onTriggerHaptic) onTriggerHaptic(20);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20 scale-102'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#0c1224] to-[#060812] border border-white/10 hover:border-amber-500/50 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/15 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 font-light mt-2 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-serif font-black text-amber-300">
                    {item.priceRub} ₽
                  </span>
                  <span className="text-xs text-slate-500 line-through">
                    {item.oldPriceRub} ₽
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  Экономия {item.discount}
                </span>
              </div>

              {item.isInternalOrder ? (
                <button
                  onClick={() => handleClickItem(item)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 active:scale-95 text-black font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <span>Заказать</span>
                  <Sparkles size={13} />
                </button>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClickItem(item)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-black active:scale-95 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 border border-white/15"
                >
                  <span>Купить</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
