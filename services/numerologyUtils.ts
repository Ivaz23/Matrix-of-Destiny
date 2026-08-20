import { MatrixNumbers } from '../types';

// The Matrix of Destiny typically uses the 22 Major Arcana.
// If a number is > 22, we sum the digits (e.g., 25 -> 2+5=7).
// Exception: Some schools strictly use mod 22, but sum-digits is standard for Kapustin-style.
export const reduceArcana = (num: number): number => {
  if (num <= 22) return num;
  
  let sum = 0;
  const digits = num.toString().split('').map(Number);
  for (const digit of digits) {
    sum += digit;
  }
  
  // Recursively reduce if still > 22 (though unlikely with just 4 digits)
  return reduceArcana(sum);
};

export const calculateMatrixArcana = reduceArcana;

export const calculateMatrix = (birthDate: string): MatrixNumbers => {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // 1. Calculate Corners
  const numA = reduceArcana(day);
  const numB = reduceArcana(month);
  
  // Sum of year digits
  const yearSum = year.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
  const numC = reduceArcana(yearSum);

  // Bottom corner (A + B + C)
  const numD = reduceArcana(numA + numB + numC);

  // 2. Calculate Center (Comfort Zone)
  const numE = reduceArcana(numA + numB + numC + numD);

  // 3. Destinies (Simplified for this demo)
  const sky = reduceArcana(numB + numD);
  const earth = reduceArcana(numA + numC);
  const destiny = reduceArcana(sky + earth);

  return {
    day: numA,
    month: numB,
    year: numC,
    bottom: numD,
    center: numE,
    sky,
    earth,
    destiny
  };
};

export const calculateLifePathNumber = (birthDate: string): number => {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const sumDigits = (num: number): number => {
    let sum = num.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
    }
    return sum;
  };

  const daySum = sumDigits(day);
  const monthSum = sumDigits(month);
  const yearSum = sumDigits(year);

  return sumDigits(daySum + monthSum + yearSum);
};
