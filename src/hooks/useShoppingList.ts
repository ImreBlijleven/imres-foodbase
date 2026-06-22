import { useState, useEffect, useCallback } from 'react';
import type { ShoppingList, ShoppingItem, WeekPlan } from '../types';
import { MEAL_TYPE_CONFIG } from '../types';
import { generateId } from '../utils';
import { supabase } from '../lib/supabase';

async function fetchList(weekId: string, userId: string): Promise<ShoppingList | null> {
  const { data } = await supabase
    .from('shopping_lists')
    .select('data')
    .eq('week_id', weekId)
    .eq('user_id', userId)
    .maybeSingle();
  return data ? (data.data as ShoppingList) : null;
}

async function saveList(weekId: string, userId: string, list: ShoppingList) {
  await supabase.from('shopping_lists').upsert({
    week_id: weekId,
    user_id: userId,
    data: list,
    updated_at: new Date().toISOString(),
  });
}

export function useShoppingList(weekPlanId: string, userId: string) {
  const [shoppingList, setShoppingList] = useState<ShoppingList>({ weekPlanId, items: [] });

  useEffect(() => {
    fetchList(weekPlanId, userId).then((list) => {
      setShoppingList(list ?? { weekPlanId, items: [] });
    });
  }, [weekPlanId, userId]);

  const mutate = useCallback(
    (updater: (list: ShoppingList) => ShoppingList) => {
      setShoppingList((current) => {
        const updated = updater(current);
        saveList(weekPlanId, userId, updated);
        return updated;
      });
    },
    [weekPlanId, userId]
  );

  const generateFromWeekPlan = useCallback(
    (weekPlan: WeekPlan, samenChoices: Record<string, number>, customChoices: Record<string, boolean>) => {
      const items: ShoppingItem[] = [];

      for (const day of weekPlan.days) {
        for (const slot of ['ontbijt', 'lunch', 'diner'] as const) {
          const meal = day[slot];
          if (!meal) continue;

          const config = MEAL_TYPE_CONFIG[meal.type];
          let portions = config.defaultInclude ? 1 : 0;
          if (meal.type === 'eline') portions = 2;
          if (meal.type === 'samen') portions = samenChoices[meal.id] ?? 0;
          if (meal.type === 'custom') portions = (customChoices[meal.id] ?? false) ? 1 : 0;
          if (portions === 0) continue;

          for (const ing of meal.ingredients) {
            items.push({
              id: generateId(),
              name: ing.name,
              amount: ing.amount != null ? ing.amount * portions : null,
              unit: ing.unit,
              checked: false,
              source: 'generated',
            });
          }
        }
      }

      mutate((current) => {
        const manualItems = current.items.filter((i) => i.source === 'manual');
        return { weekPlanId, items: [...items, ...manualItems] };
      });
    },
    [weekPlanId, mutate]
  );

  const toggleItem = useCallback(
    (itemId: string) => {
      mutate((list) => ({
        ...list,
        items: list.items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
      }));
    },
    [mutate]
  );

  const addManualItem = useCallback(
    (name: string) => {
      const item: ShoppingItem = { id: generateId(), name, amount: null, unit: null, checked: false, source: 'manual' };
      mutate((list) => ({ ...list, items: [...list.items, item] }));
    },
    [mutate]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      mutate((list) => ({ ...list, items: list.items.filter((i) => i.id !== itemId) }));
    },
    [mutate]
  );

  const addRecipeItems = useCallback(
    (items: Omit<ShoppingItem, 'id' | 'checked' | 'source'>[]) => {
      mutate((list) => ({
        ...list,
        items: [
          ...list.items,
          ...items.map((item) => ({ ...item, id: generateId(), checked: false, source: 'manual' as const })),
        ],
      }));
    },
    [mutate]
  );

  return { shoppingList, generateFromWeekPlan, toggleItem, addManualItem, removeItem, addRecipeItems };
}
