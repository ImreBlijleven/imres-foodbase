import { useState, useCallback } from 'react';
import type { Recipe } from '../types';
import { generateId } from '../utils';

const STORAGE_KEY = 'foodbase-recipes';

function loadRecipes(): Recipe[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecipes(recipes: Recipe[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function useRecipes() {
  const [, forceUpdate] = useState(0);

  const getRecipes = useCallback((): Recipe[] => loadRecipes(), []);

  const addRecipe = useCallback((data: Omit<Recipe, 'id' | 'createdAt'>): Recipe => {
    const recipes = loadRecipes();
    const recipe: Recipe = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    saveRecipes([recipe, ...recipes]);
    return recipe;
  }, []);

  const updateRecipe = useCallback((id: string, data: Partial<Omit<Recipe, 'id' | 'createdAt'>>) => {
    const recipes = loadRecipes();
    const idx = recipes.findIndex((r) => r.id === id);
    if (idx >= 0) {
      recipes[idx] = { ...recipes[idx], ...data };
      saveRecipes(recipes);
    }
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    saveRecipes(loadRecipes().filter((r) => r.id !== id));
    forceUpdate((n) => n + 1);
  }, []);

  return { recipes: getRecipes(), addRecipe, updateRecipe, deleteRecipe, forceUpdate };
}
