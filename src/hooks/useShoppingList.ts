import { useState, useCallback } from 'react';
import type { ShoppingList, ShoppingItem, WeekPlan } from '../types';
import { MEAL_TYPE_CONFIG } from '../types';
import { generateId } from '../utils';

const STORAGE_KEY = 'meal-planner-shopping';

function loadAllLists(): Record<string, ShoppingList> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLists(lists: Record<string, ShoppingList>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function useShoppingList(weekPlanId: string) {
  const [, forceUpdate] = useState(0);

  const getList = useCallback((): ShoppingList => {
    const all = loadAllLists();
    return all[weekPlanId] ?? { weekPlanId, items: [] };
  }, [weekPlanId]);

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

      const all = loadAllLists();
      const existing = all[weekPlanId];
      const manualItems = existing?.items.filter((i) => i.source === 'manual') ?? [];
      all[weekPlanId] = { weekPlanId, items: [...items, ...manualItems] };
      saveLists(all);
      forceUpdate((n) => n + 1);
    },
    [weekPlanId]
  );

  const toggleItem = useCallback(
    (itemId: string) => {
      const all = loadAllLists();
      const list = all[weekPlanId];
      if (!list) return;
      const item = list.items.find((i) => i.id === itemId);
      if (item) item.checked = !item.checked;
      saveLists(all);
      forceUpdate((n) => n + 1);
    },
    [weekPlanId]
  );

  const addManualItem = useCallback(
    (name: string) => {
      const all = loadAllLists();
      const list = all[weekPlanId] ?? { weekPlanId, items: [] };
      list.items.push({
        id: generateId(),
        name,
        amount: null,
        unit: null,
        checked: false,
        source: 'manual',
      });
      all[weekPlanId] = list;
      saveLists(all);
      forceUpdate((n) => n + 1);
    },
    [weekPlanId]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      const all = loadAllLists();
      const list = all[weekPlanId];
      if (!list) return;
      list.items = list.items.filter((i) => i.id !== itemId);
      saveLists(all);
      forceUpdate((n) => n + 1);
    },
    [weekPlanId]
  );

  return { shoppingList: getList(), generateFromWeekPlan, toggleItem, addManualItem, removeItem };
}
