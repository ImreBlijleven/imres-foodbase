import type { WeekPlan, DayPlan } from './types';

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

export function addWeeks(weekStart: string, n: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + n * 7);
  return d.toISOString().split('T')[0];
}

export function getWeekNumber(weekStart: string): number {
  const d = new Date(weekStart);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

export function createEmptyWeekPlan(weekStart: string): WeekPlan {
  const days: DayPlan[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      ontbijt: null,
      lunch: null,
      diner: null,
      activiteiten: [],
    };
  });
  return { id: weekStart, weekStart, days };
}

export const DAY_NAMES = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
export const FULL_DAY_NAMES = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}
