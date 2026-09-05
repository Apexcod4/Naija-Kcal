import { System } from '../types';

const CM_PER_INCH = 2.54;
const LB_PER_KG = 2.20462;

export function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  // Rounding can land on 12 inches; roll it into the next foot rather than
  // displaying 5'12".
  return { ft: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function ftInToCm(ft: number, inches: number): number {
  return Math.round((ft * 12 + inches) * CM_PER_INCH);
}

export const kgToLb = (kg: number): number => Math.round(kg * LB_PER_KG);
export const lbToKg = (lb: number): number => Math.round(lb / LB_PER_KG);

export function formatHeight(cm: number, system: System): string {
  if (system === 'metric') return `${cm} cm`;
  const { ft, inches } = cmToFtIn(cm);
  return `${ft}'${inches}"`;
}

export function formatWeight(kg: number, system: System): string {
  return system === 'metric' ? `${kg} kg` : `${kgToLb(kg)} lb`;
}
