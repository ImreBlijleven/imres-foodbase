import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Recipe } from '../types';
import { useRecipes } from '../hooks/useRecipes';
import { AddRecipeScreen } from './AddRecipeScreen';

interface Props {
  onBack: () => void;
  userId: string;
  onSelectRecipe?: (recipe: Recipe) => void;
  selectMode?: boolean;
  initialImage?: { base64: string; mimeType: string };
  initialUrl?: string;
  onSharedConsumed?: () => void;
}

type View = 'list' | 'add' | 'detail';

const Header = ({ onBack, title, right }: { onBack: () => void; title: string; right?: ReactNode }) => (
  <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: 'var(--c-espresso)' }}>
    <button onClick={onBack} style={{ color: 'var(--c-cream)' }} className="text-xl active:opacity-70">←</button>
    <h1 className="font-serif-display text-lg flex-1" style={{ color: 'var(--c-cream)' }}>{title}</h1>
    {right}
  </div>
);

export function RecipeLibraryScreen({ onBack, userId, onSelectRecipe, selectMode, initialImage, initialUrl, onSharedConsumed }: Props) {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, forceUpdate } = useRecipes(userId);
  const [view, setView] = useState<View>(initialImage || initialUrl ? 'add' : 'list');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [editingLink, setEditingLink] = useState(false);
  const [linkDraft, setLinkDraft] = useState('');

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  if (view === 'add') {
    return (
      <AddRecipeScreen
        onBack={() => { setView('list'); onSharedConsumed?.(); }}
        initialImage={initialImage}
        initialUrl={initialUrl}
        onSave={(data) => {
          addRecipe(data);
          forceUpdate((n) => n + 1);
          setView('list');
          onSharedConsumed?.();
        }}
      />
    );
  }

  if (view === 'detail' && selected) {
    const hasLink = selected.source && !['handmatig', 'screenshot', 'instagram'].includes(selected.source);
    return (
      <div className="flex flex-col h-full">
        <Header
          onBack={() => { setView('list'); setEditingLink(false); }}
          title={selected.name}
          right={
            <button
              onClick={() => { deleteRecipe(selected.id); setView('list'); }}
              className="text-xs font-medium active:opacity-70"
              style={{ color: 'var(--c-terracotta)' }}
            >
              Verwijder
            </button>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Link */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--c-terracotta)' }}>Link</p>
              <button
                onClick={() => { setEditingLink(true); setLinkDraft(hasLink ? selected.source! : ''); }}
                className="text-xs font-medium active:opacity-70"
                style={{ color: 'var(--c-forest)' }}
              >
                {hasLink ? 'Bewerken' : 'Toevoegen'}
              </button>
            </div>
            {editingLink ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none"
                  style={{ borderColor: 'var(--c-cream-dark)' }}
                  placeholder="https://..."
                  type="url"
                  value={linkDraft}
                  onChange={(e) => setLinkDraft(e.target.value)}
                />
                <button
                  onClick={() => {
                    const newSource = linkDraft.trim() || 'handmatig';
                    updateRecipe(selected.id, { source: newSource });
                    setSelected({ ...selected, source: newSource });
                    setEditingLink(false);
                  }}
                  className="px-3 py-2 text-white rounded-xl text-sm font-medium active:opacity-80"
                  style={{ background: 'var(--c-forest)' }}
                >
                  ✓
                </button>
              </div>
            ) : hasLink ? (
              <a href={selected.source} target="_blank" rel="noopener noreferrer"
                className="text-sm break-all underline" style={{ color: 'var(--c-forest)' }}>
                {selected.source}
              </a>
            ) : (
              <p className="text-sm" style={{ color: 'var(--c-cream-dark)' }}>Geen link toegevoegd</p>
            )}
          </div>

          {/* Ingrediënten */}
          <div className="bg-white rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--c-terracotta)' }}>
              Ingrediënten ({selected.ingredients.length})
            </p>
            {selected.ingredients.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--c-cream-dark)' }}>Geen ingrediënten opgeslagen.</p>
            ) : (
              <ul className="space-y-2">
                {selected.ingredients.map((ing) => (
                  <li key={ing.id} className="flex items-center gap-2 text-sm" style={{ color: 'var(--c-espresso)' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--c-terracotta)' }} />
                    <span className="flex-1">{ing.name}</span>
                    {(ing.amount || ing.unit) && (
                      <span className="text-xs" style={{ color: 'var(--c-terracotta)' }}>
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
          <div className="p-4 border-t flex-shrink-0 bg-white" style={{ borderColor: 'var(--c-cream-dark)' }}>
            <button
              onClick={() => onSelectRecipe(selected)}
              className="w-full py-3 text-white font-semibold rounded-xl active:opacity-80"
              style={{ background: 'var(--c-forest)' }}
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
      <Header
        onBack={onBack}
        title="Recepten"
        right={
          <button
            onClick={() => setView('add')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none active:opacity-70"
            style={{ background: 'var(--c-forest)', color: 'var(--c-cream)' }}
          >
            +
          </button>
        }
      />

      <div className="px-4 py-3 flex-shrink-0" style={{ background: 'var(--c-espresso)' }}>
        <input
          className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          style={{ background: 'rgba(253,240,232,0.12)', color: 'var(--c-cream)', caretColor: 'var(--c-cream)' }}
          placeholder="Zoek recept..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--c-terracotta)', opacity: 0.6 }}>
              {search ? 'Geen recepten gevonden.' : 'Nog geen recepten. Tik + om te beginnen.'}
            </p>
          </div>
        )}
        {filtered.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => { setSelected(recipe); setView('detail'); }}
            className="w-full bg-white rounded-xl px-4 py-3.5 text-left active:opacity-80 flex items-center gap-3"
            style={{ border: '0.5px solid var(--c-cream-dark)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(45,74,62,0.1)', color: 'var(--c-forest)' }}
            >
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                <path d="M5 22l-.5-16a2 2 0 012-2h15a2 2 0 012 2l-.5 16a2 2 0 01-2 2H7a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M10 9h8M10 13h6M10 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--c-espresso)' }}>{recipe.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-terracotta)', opacity: 0.7 }}>
                {recipe.ingredients.length} ingrediënten
                {recipe.source && recipe.source !== 'handmatig' && (
                  <span> · {recipe.source === 'screenshot' ? 'foto' : recipe.source === 'instagram' ? 'Instagram' : 'website'}</span>
                )}
              </p>
            </div>
            {selectMode
              ? <span className="text-xs font-medium" style={{ color: 'var(--c-forest)' }}>Kies</span>
              : <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--c-cream-dark)', flexShrink: 0 }}>
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            }
          </button>
        ))}
      </div>
    </div>
  );
}
