import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '../types';
import { generateId } from '../utils';
import { supabase } from '../lib/supabase';

export function useRecipes(userId: string) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    supabase
      .from('recipes')
      .select('data')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (data) setRecipes(data.map((r) => r.data as Recipe));
      });
  }, [userId]);

  const addRecipe = useCallback(
    (recipeData: Omit<Recipe, 'id' | 'createdAt'>): Recipe => {
      const recipe: Recipe = { ...recipeData, id: generateId(), createdAt: new Date().toISOString() };
      setRecipes((prev) => [recipe, ...prev]);
      supabase.from('recipes').insert({
        id: recipe.id,
        user_id: userId,
        data: recipe,
        updated_at: new Date().toISOString(),
      }).then();
      return recipe;
    },
    [userId]
  );

  const updateRecipe = useCallback(
    (id: string, data: Partial<Omit<Recipe, 'id' | 'createdAt'>>) => {
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data } : r))
      );
      supabase
        .from('recipes')
        .select('data')
        .eq('id', id)
        .eq('user_id', userId)
        .single()
        .then(({ data: row }) => {
          if (row) {
            const updated = { ...(row.data as Recipe), ...data };
            supabase.from('recipes').upsert({
              id,
              user_id: userId,
              data: updated,
              updated_at: new Date().toISOString(),
            }).then();
          }
        });
    },
    [userId]
  );

  const deleteRecipe = useCallback(
    (id: string) => {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      supabase.from('recipes').delete().eq('id', id).eq('user_id', userId).then();
    },
    [userId]
  );

  return { recipes, addRecipe, updateRecipe, deleteRecipe, forceUpdate };
}
