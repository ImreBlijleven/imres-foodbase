import { useState, useEffect, useCallback } from 'react';
import type { WeekPlan, Meal, ActivityItem } from '../types';
import { createEmptyWeekPlan, generateId } from '../utils';
import { supabase } from '../lib/supabase';

async function fetchWeekPlan(weekId: string, userId: string): Promise<WeekPlan | null> {
  const { data } = await supabase
    .from('week_plans')
    .select('data')
    .eq('week_id', weekId)
    .eq('user_id', userId)
    .maybeSingle();
  return data ? (data.data as WeekPlan) : null;
}

async function saveWeekPlan(weekId: string, userId: string, plan: WeekPlan) {
  await supabase.from('week_plans').upsert({
    week_id: weekId,
    user_id: userId,
    data: plan,
    updated_at: new Date().toISOString(),
  });
}

export function useWeekPlan(weekStart: string, userId: string) {
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(() => createEmptyWeekPlan(weekStart));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setWeekPlan(createEmptyWeekPlan(weekStart));
    fetchWeekPlan(weekStart, userId).then((plan) => {
      setWeekPlan(plan ?? createEmptyWeekPlan(weekStart));
      setLoading(false);
    });
  }, [weekStart, userId]);

  const mutate = useCallback(
    (updater: (plan: WeekPlan) => WeekPlan) => {
      setWeekPlan((current) => {
        const updated = updater(current);
        saveWeekPlan(weekStart, userId, updated);
        return updated;
      });
    },
    [weekStart, userId]
  );

  const updateMeal = useCallback(
    (date: string, slot: 'ontbijt' | 'lunch' | 'diner', meal: Meal | null) => {
      mutate((plan) => ({
        ...plan,
        days: plan.days.map((d) => (d.date === date ? { ...d, [slot]: meal } : d)),
      }));
    },
    [mutate]
  );

  const addActiviteit = useCallback(
    (date: string, item: Omit<ActivityItem, 'id'>) => {
      mutate((plan) => ({
        ...plan,
        days: plan.days.map((d) =>
          d.date === date
            ? { ...d, activiteiten: [...d.activiteiten, { ...item, id: generateId() }] }
            : d
        ),
      }));
    },
    [mutate]
  );

  const updateActiviteit = useCallback(
    (date: string, id: string, text: string) => {
      mutate((plan) => ({
        ...plan,
        days: plan.days.map((d) =>
          d.date === date
            ? {
                ...d,
                activiteiten: d.activiteiten.map((a) =>
                  a.id === id ? { ...a, text } : a
                ),
              }
            : d
        ),
      }));
    },
    [mutate]
  );

  const removeActiviteit = useCallback(
    (date: string, id: string) => {
      mutate((plan) => ({
        ...plan,
        days: plan.days.map((d) =>
          d.date === date
            ? { ...d, activiteiten: d.activiteiten.filter((a) => a.id !== id) }
            : d
        ),
      }));
    },
    [mutate]
  );

  return { weekPlan, loading, updateMeal, addActiviteit, updateActiviteit, removeActiviteit };
}
