import React, { useState } from 'react';
import { UserInput } from '../types';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserInput>({
    name: '',
    birthDate: '',
    gender: 'male',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.birthDate) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto card-3d p-8 md:p-10 rounded-3xl relative">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-500/20 blur-[40px] rounded-full pointer-events-none"></div>
      
      <h2 className="text-3xl font-serif text-center text-amber-100 mb-8 drop-shadow-md">
        Данные Души
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="group">
          <label className="block text-xs font-bold text-amber-500/80 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-amber-400 transition-colors">Имя</label>
          <input
            type="text"
            required
            className="w-full input-3d rounded-xl px-5 py-4 text-white focus:outline-none placeholder-slate-600 transition-all"
            placeholder="Введите имя"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="group">
          <label className="block text-xs font-bold text-amber-500/80 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-amber-400 transition-colors">Дата Рождения</label>
          <input
            type="date"
            required
            className="w-full input-3d rounded-xl px-5 py-4 text-white focus:outline-none placeholder-slate-600 transition-all [color-scheme:dark]"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-500/80 uppercase tracking-widest mb-2 ml-1">Пол</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'male' })}
              className={`py-4 rounded-xl border transition-all duration-300 font-serif ${
                formData.gender === 'male'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              Мужской
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'female' })}
              className={`py-4 rounded-xl border transition-all duration-300 font-serif ${
                formData.gender === 'female'
                  ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              Женский
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-8 btn-3d font-bold text-lg py-5 rounded-xl uppercase tracking-widest transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Связь с Chubuk...
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