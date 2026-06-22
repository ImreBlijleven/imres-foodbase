import type { Ingredient } from '../types';
import { generateId } from '../utils';

interface Props {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
}

export function IngredientEditor({ ingredients, onChange }: Props) {
  function update(id: string, field: keyof Ingredient, value: string | number | null) {
    onChange(ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function add() {
    onChange([...ingredients, { id: generateId(), name: '', amount: null, unit: null }]);
  }

  function remove(id: string) {
    onChange(ingredients.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-2">
      {ingredients.map((ing) => (
        <div key={ing.id} className="flex gap-2 items-center">
          <input
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="Ingrediënt"
            value={ing.name}
            onChange={(e) => update(ing.id, 'name', e.target.value)}
          />
          <input
            className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="Qty"
            type="number"
            min={0}
            value={ing.amount ?? ''}
            onChange={(e) => update(ing.id, 'amount', e.target.value ? parseFloat(e.target.value) : null)}
          />
          <input
            className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="Eenheid"
            value={ing.unit ?? ''}
            onChange={(e) => update(ing.id, 'unit', e.target.value || null)}
          />
          <button
            onClick={() => remove(ing.id)}
            className="text-gray-300 text-xl leading-none flex-shrink-0 active:text-red-400"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="text-sm text-green-600 font-medium active:text-green-700"
      >
        + Ingrediënt
      </button>
    </div>
  );
}
