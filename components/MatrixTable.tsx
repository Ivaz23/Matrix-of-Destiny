import React from 'react';
import { MatrixNumbers } from '../types';

interface MatrixTableProps {
  matrix: MatrixNumbers;
}

const MatrixTable: React.FC<MatrixTableProps> = ({ matrix }) => {
  const data = [
    { label: 'День рождения (A)', value: matrix.day },
    { label: 'Месяц (B)', value: matrix.month },
    { label: 'Год (C)', value: matrix.year },
    { label: 'Карма (D)', value: matrix.bottom },
    { label: 'Центр / Душа (E)', value: matrix.center },
    { label: 'Предназначение (Destiny)', value: matrix.destiny },
  ];

  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-left text-sm text-amber-100 border-collapse">
        <thead>
          <tr>
            <th className="p-3 border-b border-amber-500/30 text-amber-500">Энергия</th>
            <th className="p-3 border-b border-amber-500/30 text-amber-500">Значение</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="hover:bg-amber-500/5">
              <td className="p-3 border-b border-white/5">{item.label}</td>
              <td className="p-3 border-b border-white/5 font-mono font-bold text-lg">{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatrixTable;
