import { useState, useCallback } from 'react';
import type { WeekPlan, Meal, ActivityItem } from '../types';
import { createEmptyWeekPlan } from '../utils';
import { generateId } from '../utils';

const STORAGE_KEY = 'meal-planner-weeks';

function loadAllWeeks(): Record<string, WeekPlan> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    // Migreer oude string-activiteiten naar nieuwe array-vorm
    for (const plan of Object.values(raw) as WeekPlan[]) {
      for (const day of plan.days) {
        if (typeof (day.activiteiten as unknown) === 'string') {
          const old = day.activiteiten as unknown as string;
          day.activiteiten = old
            ? [{ id: generateId(), text: old, position: 'na_diner' }]
            : [];
        }
      }
    }
    return raw;
  } catch {
    return {};
  }
}

function saveAllWeeks(weeks: Record<string, WeekPlan>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
}

export function useWeekPlan(weekStart: string) {
  const [, forceUpdate] = useState(0);

  const getWeekPlan = useCallback((): WeekPlan => {
    const all = loadAllWeeks();
    if (all[weekStart]) return all[weekStart];
    return createEmptyWeekPlan(weekStart);
  }, [weekStart]);

  const updateMeal = useCallback(
    (date: string, slot: 'ontbijt' | 'lunch' | 'diner', meal: Meal | null) => {
      const all = loadAllWeeks();
      const plan = all[weekStart] ?? createEmptyWeekPlan(weekStart);
      const day = plan.days.find((d) => d.date === date);
      if (day) day[slot] = meal;
      all[weekStart] = plan;
      saveAllWeeks(all);
      forceUpdate((n) => n + 1);
    },
    [weekStart]
  );

  const addActiviteit = useCallback(
    (date: string, item: Omit<ActivityItem, 'id'>) => {
      const all = loadAllWeeks();
      const plan = all[weekStart] ?? createEmptyWeekPlan(weekStart);
      const day = plan.days.find((d) => d.date === date);
      if (day) day.activiteiten = [...day.activiteiten, { ...item, id: generateId() }];
      all[weekStart] = plan;
      saveAllWeeks(all);
      forceUpdate((n) => n + 1);
    },
    [weekStart]
  );

  const updateActiviteit = useCallback(
    (date: string, id: string, text: string) => {
      const all = loadAllWeeks();
      const plan = all[weekStart] ?? createEmptyWeekPlan(weekStart);
      const day = plan.days.find((d) => d.date === date);
      if (day) {
        const item = day.activiteiten.find((a) => a.id === id);
        if (item) item.text = text;
      }
      all[weekStart] = plan;
      saveAllWeeks(all);
      forceUpdate((n) => n + 1);
    },
    [weekStart]
  );

  const removeActiviteit = useCallback(
    (date: string, id: string) => {
      const all = loadAllWeeks();
      const plan = all[weekStart] ?? createEmptyWeekPlan(weekStart);
      const day = plan.days.find((d) => d.date === date);
      if (day) day.activiteiten = day.activiteiten.filter((a) => a.id !== id);
      all[weekStart] = plan;
      saveAllWeeks(all);
      forceUpdate((n) => n + 1);
    },
    [weekStart]
  );

  return { weekPlan: getWeekPlan(), updateMeal, addActiviteit, updateActiviteit, removeActiviteit };
}
