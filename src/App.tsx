import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useWeekPlan } from './hooks/useWeekPlan';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { WeekGrid } from './components/WeekGrid';
import { ShoppingListScreen } from './components/ShoppingListScreen';
import { RecipeLibraryScreen } from './components/RecipeLibraryScreen';
import { getWeekStart, addWeeks, getWeekNumber } from './utils';
import { migrateLocalStorageToSupabase } from './lib/migrate';

type Screen = 'home' | 'week' | 'shopping' | 'recipes';

interface SharedPayload {
  type: 'image';
  base64: string;
  mimeType: string;
}

async function consumeSharedContent(): Promise<{ image?: SharedPayload; url?: string } | null> {
  const params = new URLSearchParams(window.location.search);
  window.history.replaceState({}, '', '/');

  if (params.get('shared') === 'image') {
    try {
      const cache = await caches.open('foodbase-share-v1');
      const response = await cache.match('/shared-image');
      if (response) {
        await cache.delete('/shared-image');
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
        return { image: { type: 'image', base64, mimeType: blob.type } };
      }
    } catch { /* ignore */ }
  }

  const shareUrl = params.get('share_url');
  if (shareUrl) return { url: decodeURIComponent(shareUrl) };

  return null;
}

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

function ShoppingHomeWrapper({ userId, onBack }: { userId: string; onBack: () => void }) {
  const weekStart = getWeekStart();
  const { weekPlan } = useWeekPlan(weekStart, userId);
  return (
    <div className="flex flex-col h-svh" style={{ background: 'var(--c-cream)' }}>
      <ShoppingListScreen weekPlan={weekPlan} userId={userId} onBack={onBack} />
    </div>
  );
}

function WeekScreen({ userId, onHome }: { userId: string; onHome: () => void }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [screen, setScreen] = useState<'week' | 'shopping'>('week');
  const { weekPlan, loading, updateMeal, addActiviteit, updateActiviteit, removeActiviteit } =
    useWeekPlan(weekStart, userId);
  const weekNum = getWeekNumber(weekStart);

  function prevWeek() { setWeekStart((w) => addWeeks(w, -1)); }
  function nextWeek() { setWeekStart((w) => addWeeks(w, 1)); }
  function goToday() { setWeekStart(getWeekStart()); }

  if (screen === 'shopping') {
    return (
      <div className="flex flex-col h-svh" style={{ background: 'var(--c-cream)' }}>
        <ShoppingListScreen weekPlan={weekPlan} userId={userId} onBack={() => setScreen('week')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-svh" style={{ background: 'var(--c-cream)' }}>
      <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ background: 'var(--c-espresso)' }}>
        <button
          onClick={onHome}
          className="flex items-center justify-center rounded-full active:opacity-70"
          style={{ color: 'var(--c-cream)', width: 32, height: 32 }}
        >
          <BackArrow />
        </button>
        <button
          onClick={prevWeek}
          className="flex items-center justify-center rounded-full active:opacity-70"
          style={{ color: 'var(--c-cream)', width: 28, height: 28 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <button onClick={goToday} className="font-serif-display text-lg active:opacity-70" style={{ color: 'var(--c-cream)' }}>
            Week {weekNum}
          </button>
        </div>
        <button
          onClick={nextWeek}
          className="flex items-center justify-center rounded-full active:opacity-70"
          style={{ color: 'var(--c-cream)', width: 28, height: 28 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={() => setScreen('shopping')}
          className="flex items-center justify-center rounded-full active:opacity-70"
          style={{ color: 'var(--c-cream)', width: 32, height: 32 }}
        >
          <CartIcon />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: 'var(--c-terracotta)', opacity: 0.5 }}>Laden…</p>
          </div>
        ) : (
          <WeekGrid
            weekPlan={weekPlan}
            onUpdateMeal={updateMeal}
            onAddActiviteit={(date, text, position) => addActiviteit(date, { text, position })}
            onUpdateActiviteit={updateActiviteit}
            onRemoveActiviteit={removeActiviteit}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('home');
  const [sharedImage, setSharedImage] = useState<SharedPayload | undefined>();
  const [sharedUrl, setSharedUrl] = useState<string | undefined>();

  // Auto-migrate localStorage data on first login
  useEffect(() => {
    if (user) migrateLocalStorageToSupabase(user.id);
  }, [user?.id]);

  // Handle Web Share Target incoming content
  useEffect(() => {
    consumeSharedContent().then((payload) => {
      if (!payload) return;
      if (payload.image) { setSharedImage(payload.image); setScreen('recipes'); }
      if (payload.url) { setSharedUrl(payload.url); setScreen('recipes'); }
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-svh" style={{ background: 'var(--c-espresso)' }}>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--c-forest)' }}
          >
            <svg width="36" height="36" viewBox="0 0 56 56" fill="none">
              <path d="M10 22h36l-4.5 18a4 4 0 01-4 3H18.5a4 4 0 01-4-3L10 22z" fill="#FDF0E8" />
              <path d="M46 27.5h3.5a4.5 4.5 0 010 9H46" stroke="#FDF0E8" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-serif-display" style={{ color: 'var(--c-cream)', opacity: 0.6 }}>Laden…</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  if (screen === 'week') {
    return <WeekScreen userId={user.id} onHome={() => setScreen('home')} />;
  }

  if (screen === 'shopping') {
    return <ShoppingHomeWrapper userId={user.id} onBack={() => setScreen('home')} />;
  }

  if (screen === 'recipes') {
    return (
      <div className="flex flex-col h-svh" style={{ background: 'var(--c-cream)' }}>
        <RecipeLibraryScreen
          userId={user.id}
          onBack={() => setScreen('home')}
          initialImage={sharedImage}
          initialUrl={sharedUrl}
          onSharedConsumed={() => { setSharedImage(undefined); setSharedUrl(undefined); }}
        />
      </div>
    );
  }

  return <HomeScreen onNavigate={(s) => setScreen(s)} />;
}
