import React from 'react';
import { UserInput } from '../types';

interface PythagoreanSquareTableProps {
  birthDate: string; // YYYY-MM-DD
}

const PythagoreanSquareTable: React.FC<PythagoreanSquareTableProps> = ({ birthDate }) => {
  // Simple calculation of Pythagorean Square digits
  const getSquareDigits = () => {
    const digits = birthDate.replace(/-/g, '').split('').map(Number);
    
    // Standard calculation for demonstration
    let sum1 = digits.reduce((a, b) => a + b, 0);
    let sum2 = sum1.toString().split('').reduce((a, b) => a + Number(b), 0);
    let sum3 = sum1 - (Number(birthDate.split('-')[2][0]) * 2);
    let sum4 = sum3.toString().split('').reduce((a, b) => a + Number(b), 0);

    const allDigits = [...digits, ...sum1.toString().split('').map(Number), ...sum2.toString().split('').map(Number), ...sum3.toString().split('').map(Number), ...sum4.toString().split('').map(Number)];
    
    const square = Array(9).fill(0).map(() => '');
    allDigits.forEach(d => {
        if (d >= 1 && d <= 9) {
            square[d - 1] += d.toString();
        }
    });
    return square;
  };

  const square = getSquareDigits();

  return (
    <div className="my-6 p-6 bg-amber-500/5 rounded-2xl border border-amber-500/20">
      <h3 className="text-xl text-amber-200 mb-4 text-center">Квадрат Пифагора</h3>
      <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto">
        {square.map((val, idx) => (
          <div key={idx} className="aspect-square bg-black/40 border border-amber-500/30 flex items-center justify-center text-amber-100 font-mono text-xl">
            {val}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PythagoreanSquareTable;
