import { useState } from 'react';
import type { Recipe, ShoppingItem } from '../types';

interface Props {
  recipe: Recipe;
  onAdd: (items: Omit<ShoppingItem, 'id' | 'checked' | 'source'>[]) => void;
  onClose: () => void;
}

export function IngredientPickerSheet({ recipe, onAdd, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(recipe.ingredients.map((i) => i.id))
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === recipe.ingredients.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(recipe.ingredients.map((i) => i.id)));
    }
  }

  function handleAdd() {
    const items = recipe.ingredients
      .filter((i) => selected.has(i.id))
      .map((i) => ({ name: i.name, amount: i.amount, unit: i.unit }));
    onAdd(items);
    onClose();
  }

  const allSelected = selected.size === recipe.ingredients.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[85svh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{recipe.name}</p>
            <p className="text-xs text-gray-400">{recipe.ingredients.length} ingrediënten</p>
          </div>
          <button
            onClick={toggleAll}
            className="text-xs text-green-600 font-medium active:text-green-800"
          >
            {allSelected ? 'Deselecteer alles' : 'Selecteer alles'}
          </button>
        </div>

        {/* Ingredient list */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {recipe.ingredients.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              Dit recept heeft geen ingrediënten opgeslagen.
            </p>
          ) : (
            recipe.ingredients.map((ing) => (
              <label
                key={ing.id}
                className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 cursor-pointer active:bg-gray-50"
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected.has(ing.id)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selected.has(ing.id) && (
                    <span className="text-white text-xs font-bold">✓</span>
                  )}
                </div>
                <span className="flex-1 text-sm text-gray-800">{ing.name}</span>
                {(ing.amount || ing.unit) && (
                  <span className="text-xs text-gray-400">
                    {ing.amount ?? ''}{ing.unit ? ` ${ing.unit}` : ''}
                  </span>
                )}
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selected.has(ing.id)}
                  onChange={() => toggle(ing.id)}
                />
              </label>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleAdd}
            disabled={selected.size === 0}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl active:bg-green-600 disabled:opacity-40"
          >
            {selected.size === 0
              ? 'Selecteer ingrediënten'
              : `${selected.size} ingrediënt${selected.size !== 1 ? 'en' : ''} toevoegen`}
          </button>
        </div>
      </div>
    </div>
  );
}
