import { useState } from 'react';
import { useWeekPlan } from './hooks/useWeekPlan';
import { WeekGrid } from './components/WeekGrid';
import { ShoppingListScreen } from './components/ShoppingListScreen';
import { RecipeLibraryScreen } from './components/RecipeLibraryScreen';
import { getWeekStart, addWeeks, getWeekNumber } from './utils';

type Screen = 'week' | 'shopping' | 'recipes';

export default function App() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [screen, setScreen] = useState<Screen>('week');
  const { weekPlan, updateMeal, addActiviteit, updateActiviteit, removeActiviteit } = useWeekPlan(weekStart);
  const weekNum = getWeekNumber(weekStart);

  function prevWeek() { setWeekStart((w) => addWeeks(w, -1)); }
  function nextWeek() { setWeekStart((w) => addWeeks(w, 1)); }
  function goToday() { setWeekStart(getWeekStart()); }

  if (screen === 'shopping') {
    return (
      <div className="flex flex-col h-svh bg-gray-50">
        <ShoppingListScreen weekPlan={weekPlan} onBack={() => setScreen('week')} />
      </div>
    );
  }

  if (screen === 'recipes') {
    return (
      <div className="flex flex-col h-svh bg-gray-50">
        <RecipeLibraryScreen onBack={() => setScreen('week')} />
      </div>
    );
  }


  return (
    <div className="flex flex-col h-svh bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={prevWeek}
          className="w-8 h-8 flex items-center justify-center text-gray-500 text-xl rounded-full active:bg-gray-100"
        >
          ‹
        </button>
        <div className="flex-1 text-center">
          <button onClick={goToday} className="text-base font-semibold text-gray-800">
            Week {weekNum}
          </button>
        </div>
        <button
          onClick={nextWeek}
          className="w-8 h-8 flex items-center justify-center text-gray-500 text-xl rounded-full active:bg-gray-100"
        >
          ›
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-3">
        <WeekGrid
          weekPlan={weekPlan}
          onUpdateMeal={updateMeal}
          onAddActiviteit={(date, text, position) => addActiviteit(date, { text, position })}
          onUpdateActiviteit={updateActiviteit}
          onRemoveActiviteit={removeActiviteit}
        />
      </div>

      {/* Bottom bar */}
      <div className="p-4 flex gap-3 justify-end flex-shrink-0">
        <button
          onClick={() => setScreen('recipes')}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-full shadow-sm font-semibold active:bg-gray-50 active:scale-95 transition-all"
        >
          <span>📖</span>
          <span>Recepten</span>
        </button>
        <button
          onClick={() => setScreen('shopping')}
          className="flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg font-semibold active:bg-green-600 active:scale-95 transition-all"
        >
          <span>🛒</span>
          <span>Boodschappen</span>
        </button>
      </div>
    </div>
  );
}
