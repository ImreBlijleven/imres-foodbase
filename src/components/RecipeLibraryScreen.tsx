import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Recipe, RecipeCategory } from '../types';
import { RECIPE_CATEGORIES } from '../types';
import { formatAmount } from '../utils';
import { useRecipes } from '../hooks/useRecipes';
import { AddRecipeScreen } from './AddRecipeScreen';
import { BackArrow } from './icons';

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
  <div className="flex items-center gap-3 px-4 py-3 safe-top-bar flex-shrink-0" style={{ background: 'var(--c-espresso)' }}>
    <button onClick={onBack} style={{ color: 'var(--c-cream)' }} className="flex items-center justify-center w-8 h-8 rounded-full active:opacity-70">
      <BackArrow />
    </button>
    <h1 className="font-serif-display text-lg flex-1" style={{ color: 'var(--c-cream)' }}>{title}</h1>
    {right}
  </div>
);

export function RecipeLibraryScreen({ onBack, userId, onSelectRecipe, selectMode, initialImage, initialUrl, onSharedConsumed }: Props) {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, forceUpdate } = useRecipes(userId);
  const [view, setView] = useState<View>(initialImage || initialUrl ? 'add' : 'list');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RecipeCategory | null>(null);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [editingLink, setEditingLink] = useState(false);
  const [linkDraft, setLinkDraft] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [displayServings, setDisplayServings] = useState<number | null>(null);
  const [editingServings, setEditingServings] = useState(false);
  const [servingsDraft, setServingsDraft] = useState('');

  // Reset weergave-porties wanneer een ander recept wordt geopend
  useEffect(() => {
    setDisplayServings(selected?.servings ?? null);
    setEditingName(false);
    setEditingServings(false);
  }, [selected?.id, selected?.servings]);

  const q = search.toLowerCase();
  const filtered = recipes.filter((r) =>
    (!categoryFilter || r.category === categoryFilter) &&
    (r.name.toLowerCase().includes(q) ||
      r.ingredients.some((i) => i.name.toLowerCase().includes(q)))
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
    const baseServings = selected.servings;
    const scale = baseServings && displayServings ? displayServings / baseServings : 1;
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

        <div className="flex-1 overflow-y-auto p-4 space-y-5 content-narrow">
          {/* Naam */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--c-terracotta)' }}>Naam</p>
              <button
                onClick={() => { setEditingName(true); setNameDraft(selected.name); }}
                className="text-xs font-medium active:opacity-70"
                style={{ color: 'var(--c-forest)' }}
              >
                Bewerken
              </button>
            </div>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none"
                  style={{ borderColor: 'var(--c-cream-dark)' }}
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setEditingName(false); }}
                />
                <button
                  onClick={() => {
                    const newName = nameDraft.trim();
                    if (!newName) return;
                    updateRecipe(selected.id, { name: newName });
                    setSelected({ ...selected, name: newName });
                    setEditingName(false);
                  }}
                  className="px-3 py-2 text-white rounded-xl text-sm font-medium active:opacity-80"
                  style={{ background: 'var(--c-forest)' }}
                >
                  ✓
                </button>
              </div>
            ) : (
              <p className="text-sm font-medium" style={{ color: 'var(--c-espresso)' }}>{selected.name}</p>
            )}
          </div>

          {/* Categorie */}
          <div className="bg-white rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--c-terracotta)' }}>Categorie</p>
            <div className="flex flex-wrap gap-2">
              {RECIPE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    const newCategory = selected.category === cat ? undefined : cat;
                    updateRecipe(selected.id, { category: newCategory });
                    setSelected({ ...selected, category: newCategory });
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors active:opacity-80"
                  style={selected.category === cat
                    ? { background: 'var(--c-forest)', color: 'var(--c-cream)' }
                    : { background: 'var(--c-cream)', color: 'var(--c-espresso)', border: '1px solid var(--c-cream-dark)' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Personen */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--c-terracotta)' }}>Personen</p>
              {baseServings && !editingServings && (
                <button
                  onClick={() => { setEditingServings(true); setServingsDraft(String(baseServings)); }}
                  className="text-xs font-medium active:opacity-70"
                  style={{ color: 'var(--c-forest)' }}
                >
                  Basis wijzigen
                </button>
              )}
            </div>
            {editingServings || !baseServings ? (
              <div className="flex gap-2 items-center">
                <input
                  autoFocus={editingServings}
                  className="w-20 border rounded-xl px-3 py-2 text-sm focus:outline-none"
                  style={{ borderColor: 'var(--c-cream-dark)' }}
                  placeholder="4"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  value={servingsDraft}
                  onChange={(e) => setServingsDraft(e.target.value)}
                />
                <button
                  onClick={() => {
                    const v = parseInt(servingsDraft);
                    if (!Number.isFinite(v) || v < 1) return;
                    const clamped = Math.min(v, 99);
                    updateRecipe(selected.id, { servings: clamped });
                    setSelected({ ...selected, servings: clamped });
                    setDisplayServings(clamped);
                    setEditingServings(false);
                    setServingsDraft('');
                  }}
                  className="px-3 py-2 text-white rounded-xl text-sm font-medium active:opacity-80"
                  style={{ background: 'var(--c-forest)' }}
                >
                  ✓
                </button>
                {!editingServings && (
                  <span className="text-xs" style={{ color: 'var(--c-terracotta)', opacity: 0.7 }}>Aantal personen instellen</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDisplayServings((n) => Math.max(1, (n ?? baseServings) - 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-medium active:opacity-70"
                    style={{ background: 'var(--c-cream)', color: 'var(--c-espresso)', border: '1px solid var(--c-cream-dark)' }}
                  >
                    −
                  </button>
                  <span className="text-base font-bold w-8 text-center" style={{ color: 'var(--c-espresso)' }}>
                    {displayServings ?? baseServings}
                  </span>
                  <button
                    onClick={() => setDisplayServings((n) => Math.min(99, (n ?? baseServings) + 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-medium active:opacity-70"
                    style={{ background: 'var(--c-cream)', color: 'var(--c-espresso)', border: '1px solid var(--c-cream-dark)' }}
                  >
                    +
                  </button>
                </div>
                {displayServings !== null && displayServings !== baseServings && (
                  <span className="text-xs" style={{ color: 'var(--c-terracotta)' }}>
                    Aangepast van {baseServings} personen
                  </span>
                )}
              </div>
            )}
          </div>

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
                        {ing.amount != null ? formatAmount(ing.amount * scale) : ''}{ing.unit ? ` ${ing.unit}` : ''}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bereiding */}
          {selected.instructions && selected.instructions.length > 0 && (
            <div className="bg-white rounded-xl p-4">
              <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--c-terracotta)' }}>
                Bereiding
              </p>
              <ol className="space-y-3">
                {selected.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--c-espresso)' }}>
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: 'rgba(45,74,62,0.1)', color: 'var(--c-forest)' }}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
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

      <div className="px-4 pt-3 pb-2 flex-shrink-0 space-y-2 content-narrow" style={{ background: 'var(--c-espresso)' }}>
        <input
          className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          style={{ background: 'rgba(253,240,232,0.12)', color: 'var(--c-cream)', caretColor: 'var(--c-cream)' }}
          placeholder="Zoek recept of ingrediënt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          {([null, ...RECIPE_CATEGORIES] as (RecipeCategory | null)[]).map((cat) => (
            <button
              key={cat ?? 'alle'}
              onClick={() => setCategoryFilter(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors active:opacity-80"
              style={categoryFilter === cat
                ? { background: 'var(--c-terracotta)', color: 'var(--c-cream)' }
                : { background: 'rgba(253,240,232,0.12)', color: 'rgba(253,240,232,0.7)' }}
            >
              {cat ?? 'Alle'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 content-narrow">
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
                {recipe.category && <span> · {recipe.category}</span>}
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
