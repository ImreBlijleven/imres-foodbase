import { useState } from 'react';
import type { Recipe } from '../types';
import { useRecipes } from '../hooks/useRecipes';
import { AddRecipeScreen } from './AddRecipeScreen';

interface Props {
  onBack: () => void;
  onSelectRecipe?: (recipe: Recipe) => void; // wanneer geopend vanuit maaltijdslot
  selectMode?: boolean;
}

type View = 'list' | 'add' | 'detail';

export function RecipeLibraryScreen({ onBack, onSelectRecipe, selectMode }: Props) {
  const { recipes, addRecipe, deleteRecipe, forceUpdate } = useRecipes();
  const [view, setView] = useState<View>('list');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Recipe | null>(null);

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  if (view === 'add') {
    return (
      <AddRecipeScreen
        onBack={() => setView('list')}
        onSave={(data) => {
          addRecipe(data);
          forceUpdate((n) => n + 1);
          setView('list');
        }}
      />
    );
  }

  if (view === 'detail' && selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white flex-shrink-0">
          <button onClick={() => setView('list')} className="text-gray-500 text-xl">←</button>
          <h1 className="text-lg font-semibold text-gray-800 flex-1 truncate">{selected.name}</h1>
          <button
            onClick={() => { deleteRecipe(selected.id); setView('list'); }}
            className="text-red-400 text-sm font-medium active:text-red-600"
          >
            Verwijder
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selected.source && selected.source !== 'handmatig' && selected.source !== 'screenshot' && selected.source !== 'instagram' && (
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Bron</p>
              <p className="text-sm text-blue-500 break-all">{selected.source}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
              Ingrediënten ({selected.ingredients.length})
            </p>
            {selected.ingredients.length === 0 ? (
              <p className="text-sm text-gray-400">Geen ingrediënten opgeslagen.</p>
            ) : (
              <ul className="space-y-1.5">
                {selected.ingredients.map((ing) => (
                  <li key={ing.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                    <span className="flex-1">{ing.name}</span>
                    {(ing.amount || ing.unit) && (
                      <span className="text-gray-400 text-xs">
                        {ing.amount ?? ''}{ing.unit ? ` ${ing.unit}` : ''}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {selectMode && onSelectRecipe && (
          <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
            <button
              onClick={() => onSelectRecipe(selected)}
              className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl active:bg-green-600"
            >
              Gebruik dit recept
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white flex-shrink-0">
        <button onClick={onBack} className="text-gray-500 text-xl">←</button>
        <h1 className="text-lg font-semibold text-gray-800 flex-1">Recepten</h1>
        <button
          onClick={() => setView('add')}
          className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xl leading-none active:bg-green-600"
        >
          +
        </button>
      </div>

      {/* Zoekbalk */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <input
          className="w-full bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          placeholder="Zoek recept..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lijst */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              {search ? 'Geen recepten gevonden.' : 'Nog geen recepten. Tik + om te beginnen.'}
            </p>
          </div>
        )}
        {filtered.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => { setSelected(recipe); setView('detail'); }}
            className="w-full bg-white rounded-xl px-4 py-3 shadow-sm text-left active:bg-gray-50 flex items-center gap-3"
          >
            <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center text-lg flex-shrink-0">
              🍽
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{recipe.name}</p>
              <p className="text-xs text-gray-400">
                {recipe.ingredients.length} ingrediënten
                {recipe.source && recipe.source !== 'handmatig' && (
                  <span> · {recipe.source === 'screenshot' ? 'foto' : recipe.source === 'instagram' ? 'Instagram' : 'website'}</span>
                )}
              </p>
            </div>
            {selectMode && <span className="text-green-500 text-sm font-medium">Kies</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
