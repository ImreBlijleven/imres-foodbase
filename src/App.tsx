import { useState } from 'react';
import { useWeekPlan } from './hooks/useWeekPlan';
import { HomeScreen } from './components/HomeScreen';
import { WeekGrid } from './components/WeekGrid';
import { ShoppingListScreen } from './components/ShoppingListScreen';
import { RecipeLibraryScreen } from './components/RecipeLibraryScreen';
import { getWeekStart, addWeeks, getWeekNumber } from './utils';

type Screen = 'home' | 'week' | 'shopping' | 'recipes';

const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M4 5h12l-1.5 9a1.5 1.5 0 01-1.5 1.5H7A1.5 1.5 0 015.5 14L4 5z" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2.5 5h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M8 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export default function App() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [screen, setScreen] = useState<Screen>('home');
  const { weekPlan, updateMeal, addActiviteit, updateActiviteit, removeActiviteit } = useWeekPlan(weekStart);
  const weekNum = getWeekNumber(weekStart);

  function prevWeek() { setWeekStart((w) => addWeeks(w, -1)); }
  function nextWeek() { setWeekStart((w) => addWeeks(w, 1)); }
  function goToday() { setWeekStart(getWeekStart()); }

  if (screen === 'home') {
    return <HomeScreen onNavigate={(s) => setScreen(s)} />;
  }

  if (screen === 'shopping') {
    return (
      <div className="flex flex-col h-svh" style={{ background: 'var(--c-cream)' }}>
        <ShoppingListScreen weekPlan={weekPlan} onBack={() => setScreen('home')} />
      </div>
    );
  }

  if (screen === 'recipes') {
    return (
      <div className="flex flex-col h-svh" style={{ background: 'var(--c-cream)' }}>
        <RecipeLibraryScreen onBack={() => setScreen('home')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-svh" style={{ background: 'var(--c-cream)' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
        style={{ background: 'var(--c-espresso)' }}
      >
        <button
          onClick={() => setScreen('home')}
          className="flex items-center justify-center rounded-full active:opacity-70 transition-opacity"
          style={{ color: 'var(--c-cream)', width: 32, height: 32 }}
          aria-label="Terug naar home"
        >
          <BackArrow />
        </button>

        <button
          onClick={prevWeek}
          className="flex items-center justify-center rounded-full active:opacity-70 transition-opacity"
          style={{ color: 'var(--c-cream)', width: 28, height: 28 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex-1 text-center">
          <button
            onClick={goToday}
            className="font-serif-display text-lg active:opacity-70"
            style={{ color: 'var(--c-cream)' }}
          >
            Week {weekNum}
          </button>
        </div>

        <button
          onClick={nextWeek}
          className="flex items-center justify-center rounded-full active:opacity-70 transition-opacity"
          style={{ color: 'var(--c-cream)', width: 28, height: 28 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={() => setScreen('shopping')}
          className="flex items-center justify-center rounded-full active:opacity-70 transition-opacity"
          style={{ color: 'var(--c-cream)', width: 32, height: 32 }}
          aria-label="Boodschappenlijst"
        >
          <CartIcon />
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
    </div>
  );
}
