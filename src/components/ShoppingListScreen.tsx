import { useState } from 'react';
import type { WeekPlan, Meal, Recipe } from '../types';
import { MEAL_TYPE_CONFIG } from '../types';
import { DAY_NAMES, formatDate } from '../utils';
import { useShoppingList } from '../hooks/useShoppingList';
import { WeekOverview } from './WeekOverview';
import { RecipeLibraryScreen } from './RecipeLibraryScreen';
import { IngredientPickerSheet } from './IngredientPickerSheet';

const SLOT_LABELS = { ontbijt: 'Ontbijt', lunch: 'Lunch', diner: 'Diner' };

function computeMealCounts(
  weekPlan: WeekPlan,
  samenChoices: Record<string, number>,
  customChoices: Record<string, boolean>
): { slot: 'ontbijt' | 'lunch' | 'diner'; count: number }[] {
  const counts = { ontbijt: 0, lunch: 0, diner: 0 };
  for (const day of weekPlan.days) {
    for (const slot of ['ontbijt', 'lunch', 'diner'] as const) {
      const meal = day[slot];
      if (!meal) continue;
      const config = MEAL_TYPE_CONFIG[meal.type];
      let portions = config.defaultInclude ? 1 : 0;
      if (meal.type === 'eline') portions = 2;
      if (meal.type === 'samen') portions = samenChoices[meal.id] ?? 0;
      if (meal.type === 'custom') portions = (customChoices[meal.id] ?? false) ? 1 : 0;
      counts[slot] += portions;
    }
  }
  return (['ontbijt', 'lunch', 'diner'] as const)
    .filter((s) => counts[s] > 0)
    .map((slot) => ({ slot, count: counts[slot] }));
}

function MealCountSummary({ counts }: { counts: { slot: 'ontbijt' | 'lunch' | 'diner'; count: number }[] }) {
  if (counts.length === 0) return null;
  return (
    <div className="mx-4 mt-3 mb-1 bg-white rounded-xl px-4 py-3 shadow-sm">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Maaltijden deze week</p>
      <div className="flex gap-3">
        {counts.map(({ slot, count }) => (
          <div key={slot} className="flex items-center gap-1.5">
            <span className="text-base font-bold text-gray-800">{count}×</span>
            <span className="text-sm text-gray-500">{SLOT_LABELS[slot]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  weekPlan: WeekPlan;
  userId: string;
  onBack: () => void;
}

function collectMealsNeedingChoice(weekPlan: WeekPlan) {
  const meals: { meal: Meal; date: string; slot: string }[] = [];
  for (const day of weekPlan.days) {
    for (const slot of ['ontbijt', 'lunch', 'diner'] as const) {
      const meal = day[slot];
      if (!meal) continue;
      if (meal.type === 'samen' || meal.type === 'custom') {
        meals.push({ meal, date: day.date, slot });
      }
    }
  }
  return meals;
}

export function ShoppingListScreen({ weekPlan, userId, onBack }: Props) {
  const { shoppingList, generateFromWeekPlan, toggleItem, addManualItem, removeItem, addRecipeItems } =
    useShoppingList(weekPlan.id, userId);

  const [generated, setGenerated] = useState(false);
  const [supermarktMode, setSupermarktMode] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [pickedRecipe, setPickedRecipe] = useState<Recipe | null>(null);
  const [mealCounts, setMealCounts] = useState<{ slot: 'ontbijt' | 'lunch' | 'diner'; count: number }[]>([]);

  // Samen/custom choices
  const needChoice = collectMealsNeedingChoice(weekPlan);
  const [samenChoices, setSamenChoices] = useState<Record<string, number>>({});
  const [customChoices, setCustomChoices] = useState<Record<string, boolean>>({});
  const [choicesDone, setChoicesDone] = useState(needChoice.length === 0);

  function handleGenerate() {
    generateFromWeekPlan(weekPlan, samenChoices, customChoices);
    setMealCounts(computeMealCounts(weekPlan, samenChoices, customChoices));
    setGenerated(true);
  }

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (newItem.trim()) {
      addManualItem(newItem.trim());
      setNewItem('');
    }
  }

  const unchecked = shoppingList.items.filter((i) => !i.checked);
  const checked = shoppingList.items.filter((i) => i.checked);

  if (!choicesDone) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: 'var(--c-espresso)' }}>
          <button onClick={onBack} style={{ color: 'var(--c-cream)' }} className="text-xl active:opacity-70">←</button>
          <h1 className="font-serif-display text-lg flex-1" style={{ color: 'var(--c-cream)' }}>Boodschappenlijst</h1>
        </div>
        <WeekOverview weekPlan={weekPlan} />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-gray-600 text-sm">Voor welke maaltijden neem jij de boodschappen mee?</p>
          {needChoice.map(({ meal, date }) => {
            const dayIndex = weekPlan.days.findIndex((d) => d.date === date);
            const dayName = dayIndex >= 0 ? DAY_NAMES[dayIndex] : '';
            const color = MEAL_TYPE_CONFIG[meal.type].color;

            if (meal.type === 'samen') {
              const qty = samenChoices[meal.id] ?? 0;
              const isCustom = qty > 3;
              return (
                <div key={meal.id} className="bg-white rounded-xl px-4 py-3 shadow-sm">
                  {/* Rij 1: kleur + titel + dag/datum */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm font-semibold text-gray-800 flex-1">
                      {meal.label || 'Samen'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {dayName} {formatDate(date)}
                    </span>
                  </div>
                  {/* Rij 2: knoppen links + tekstvakje */}
                  <div className="flex items-center gap-2">
                    {[0, 2, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => setSamenChoices((p) => ({ ...p, [meal.id]: n }))}
                        className={`h-9 px-3 rounded-lg text-sm font-semibold transition-colors ${
                          qty === n && !isCustom
                            ? 'bg-orange-400 text-white'
                            : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                        }`}
                      >
                        {n === 0 ? '✕' : n}
                      </button>
                    ))}
                    <input
                      type="number"
                      min={1}
                      placeholder="…"
                      value={isCustom ? qty : ''}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (!isNaN(v) && v > 0) setSamenChoices((p) => ({ ...p, [meal.id]: v }));
                      }}
                      className={`w-14 h-9 rounded-lg border text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                        isCustom ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-400'
                      }`}
                    />
                  </div>
                </div>
              );
            }

            // custom
            return (
              <label key={meal.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="flex-1 text-sm text-gray-800">
                  {meal.label || MEAL_TYPE_CONFIG[meal.type].label}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 mr-1">{dayName}</span>
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-green-500"
                  checked={customChoices[meal.id] ?? false}
                  onChange={(e) => setCustomChoices((p) => ({ ...p, [meal.id]: e.target.checked }))}
                />
              </label>
            );
          })}
        </div>
        <div className="p-4">
          <button
            onClick={() => setChoicesDone(true)}
            className="w-full py-3 font-semibold rounded-xl active:opacity-80 text-white"
            style={{ background: 'var(--c-forest)' }}
          >
            Doorgaan
          </button>
        </div>
      </div>
    );
  }

  if (!generated) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: 'var(--c-espresso)' }}>
          <button onClick={onBack} style={{ color: 'var(--c-cream)' }} className="text-xl active:opacity-70">←</button>
          <h1 className="font-serif-display text-lg flex-1" style={{ color: 'var(--c-cream)' }}>Boodschappenlijst</h1>
        </div>
        <WeekOverview weekPlan={weekPlan} />
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-gray-500 text-sm mb-6">
              Genereer de boodschappenlijst op basis van de weekplanning.
            </p>
            <button
              onClick={handleGenerate}
              className="px-6 py-3 text-white font-semibold rounded-xl active:opacity-80"
              style={{ background: 'var(--c-forest)' }}
            >
              Genereer boodschappenlijst
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: 'var(--c-espresso)' }}>
        <button onClick={onBack} style={{ color: 'var(--c-cream)' }} className="text-xl active:opacity-70">←</button>
        <h1 className="font-serif-display text-lg flex-1" style={{ color: 'var(--c-cream)' }}>Boodschappenlijst</h1>
        <button
          onClick={() => setSupermarktMode((m) => !m)}
          className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
          style={supermarktMode
            ? { background: 'var(--c-forest)', color: 'var(--c-cream)' }
            : { background: 'rgba(253,240,232,0.15)', color: 'var(--c-cream)' }}
        >
          {supermarktMode ? '✓ Supermarkt' : 'Supermarkt'}
        </button>
      </div>
      <WeekOverview weekPlan={weekPlan} />
      <MealCountSummary counts={mealCounts} />

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {unchecked.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 flex items-center justify-center active:scale-95 transition-transform"
            />
            <span className="flex-1 text-sm text-gray-800">
              {item.amount && item.unit ? `${item.amount} ${item.unit} ` : item.amount ? `${item.amount} ` : ''}
              {item.name}
            </span>
            {!supermarktMode && (
              <button onClick={() => removeItem(item.id)} className="text-gray-300 text-lg leading-none">×</button>
            )}
          </div>
        ))}

        {checked.length > 0 && (
          <>
            <div className="pt-4 pb-1">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Afgevinkt</span>
            </div>
            {checked.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs active:scale-95 transition-transform"
                  style={{ background: 'var(--c-forest)', color: 'var(--c-cream)' }}
                >
                  ✓
                </button>
                <span className="flex-1 text-sm text-gray-400 line-through">
                  {item.amount && item.unit ? `${item.amount} ${item.unit} ` : ''}
                  {item.name}
                </span>
              </div>
            ))}
          </>
        )}

        {shoppingList.items.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            Geen items — voeg maaltijden toe in de weekplanning.
          </p>
        )}
      </div>

      {!supermarktMode && (
        <div className="border-t border-gray-100 bg-white flex-shrink-0">
          <form onSubmit={handleAddItem} className="p-4 pb-2 flex gap-2">
            <input
              className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--c-cream-dark)', '--tw-ring-color': 'var(--c-forest)' } as React.CSSProperties}
              placeholder="Item toevoegen..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-xl font-medium active:opacity-80"
              style={{ background: 'var(--c-forest)' }}
            >
              +
            </button>
          </form>
          <div className="px-4 pb-4">
            <button
              onClick={() => setShowRecipePicker(true)}
              className="w-full py-2.5 text-sm font-medium rounded-xl active:opacity-80 flex items-center justify-center gap-2"
              style={{ border: '1px solid var(--c-forest)', color: 'var(--c-forest)' }}
            >
              <span>📖</span>
              <span>Recept toevoegen aan lijst</span>
            </button>
          </div>
        </div>
      )}

      {/* Recipe picker overlay */}
      {showRecipePicker && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col">
          <RecipeLibraryScreen
            selectMode
            userId={userId}
            onSelectRecipe={(recipe) => {
              setPickedRecipe(recipe);
              setShowRecipePicker(false);
            }}
            onBack={() => setShowRecipePicker(false)}
          />
        </div>
      )}

      {/* Ingredient picker sheet */}
      {pickedRecipe && (
        <IngredientPickerSheet
          recipe={pickedRecipe}
          onAdd={addRecipeItems}
          onClose={() => setPickedRecipe(null)}
        />
      )}
    </div>
  );
}
