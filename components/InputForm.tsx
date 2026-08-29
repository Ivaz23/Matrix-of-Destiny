import React, { useState } from 'react';
import { UserInput } from '../types';
import { Sparkles, Calendar, User } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserInput>({
    name: '',
    birthDate: '',
    gender: 'female',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.birthDate) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#0e1628]/95 to-[#080d19]/95 border border-amber-500/25 shadow-xl relative">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
            <Sparkles size={15} />
          </div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-amber-100">
            Расчет Матрицы
          </h2>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-mono font-medium">
          22 Аркана
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] font-bold text-amber-400/90 uppercase tracking-wider mb-1 ml-0.5">
            Имя
          </label>
          <div className="relative">
            <input
              type="text"
              required
              className="w-full rounded-xl px-3.5 py-2.5 bg-black/50 border border-white/10 focus:border-amber-400 focus:bg-black/80 text-white placeholder-slate-500 text-sm transition-all outline-none"
              placeholder="Ваше имя"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-amber-400/90 uppercase tracking-wider mb-1 ml-0.5">
            Дата Рождения
          </label>
          <input
            type="date"
            required
            className="w-full rounded-xl px-3.5 py-2.5 bg-black/50 border border-white/10 focus:border-amber-400 focus:bg-black/80 text-white text-sm transition-all outline-none [color-scheme:dark]"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-amber-400/90 uppercase tracking-wider mb-1 ml-0.5">
            Пол
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'female' })}
              className={`py-2 rounded-xl border text-xs font-serif font-bold transition-all cursor-pointer ${
                formData.gender === 'female'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md font-bold'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              Женский
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'male' })}
              className={`py-2 rounded-xl border text-xs font-serif font-bold transition-all cursor-pointer ${
                formData.gender === 'male'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md font-bold'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              Мужской
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-serif font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Связь с арканами...</span>
            </span>
          ) : (
            'Рассчитать Судьбу'
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;