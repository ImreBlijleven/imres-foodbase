import { supabase } from './supabase';
import type { WeekPlan, Recipe, ShoppingList } from '../types';

const MIGRATED_KEY = 'foodbase-migrated-to-supabase';

export async function migrateLocalStorageToSupabase(userId: string) {
  if (localStorage.getItem(MIGRATED_KEY)) return;

  // Check if user already has data in Supabase
  const { data: existing } = await supabase
    .from('recipes')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existing && existing.length > 0) {
    localStorage.setItem(MIGRATED_KEY, '1');
    return;
  }

  // Migrate recipes
  try {
    const recipesRaw = localStorage.getItem('foodbase-recipes');
    if (recipesRaw) {
      const recipes = JSON.parse(recipesRaw) as Recipe[];
      for (const recipe of recipes) {
        await supabase.from('recipes').upsert({
          id: recipe.id,
          user_id: userId,
          data: recipe,
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch { /* ignore */ }

  // Migrate week plans
  try {
    const weeksRaw = localStorage.getItem('meal-planner-weeks');
    if (weeksRaw) {
      const weeks = JSON.parse(weeksRaw) as Record<string, WeekPlan>;
      for (const [weekId, plan] of Object.entries(weeks)) {
        await supabase.from('week_plans').upsert({
          week_id: weekId,
          user_id: userId,
          data: plan,
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch { /* ignore */ }

  // Migrate shopping lists
  try {
    const shoppingRaw = localStorage.getItem('meal-planner-shopping');
    if (shoppingRaw) {
      const lists = JSON.parse(shoppingRaw) as Record<string, ShoppingList>;
      for (const [weekId, list] of Object.entries(lists)) {
        await supabase.from('shopping_lists').upsert({
          week_id: weekId,
          user_id: userId,
          data: list,
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch { /* ignore */ }

  localStorage.setItem(MIGRATED_KEY, '1');
}
