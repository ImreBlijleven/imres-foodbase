interface Props {
  onNavigate: (screen: 'week' | 'recipes' | 'shopping') => void;
}

const BowlIcon = ({ size = 40, color = '#FDF0E8' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 22h36l-4.5 18a4 4 0 01-4 3H18.5a4 4 0 01-4-3L10 22z" fill={color} />
    <path d="M46 27.5h3.5a4.5 4.5 0 010 9H46" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M18 17c1-3 3-4 3-7.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
    <path d="M28 15c.5-2.8 2-4.5 2-8" stroke={color} strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const NAV_ITEMS = [
  {
    key: 'week' as const,
    label: 'Rooster',
    sub: 'Weekplanning & maaltijden',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="5" width="22" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 11h22" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 3v4M19 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 16h4M16 16h4M8 20h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    accent: '#2D4A3E',
    accentLight: 'rgba(45,74,62,0.08)',
  },
  {
    key: 'recipes' as const,
    label: 'Recepten',
    sub: 'Bibliotheek & AI-import',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M5 22l-.5-16a2 2 0 012-2h15a2 2 0 012 2l-.5 16a2 2 0 01-2 2H7a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 9h8M10 13h6M10 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    accent: '#9F5E45',
    accentLight: 'rgba(159,94,69,0.08)',
  },
  {
    key: 'shopping' as const,
    label: 'Boodschappen',
    sub: 'Lijstjes & weekoverzicht',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 7h16l-2 13a2 2 0 01-2 2H10a2 2 0 01-2-2L6 7z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 7h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 13l1.5 1.5L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: '#1E0E07',
    accentLight: 'rgba(30,14,7,0.06)',
  },
];

export function HomeScreen({ onNavigate }: Props) {
  return (
    <div
      className="flex flex-col h-svh"
      style={{ background: 'var(--c-cream)' }}
    >
      {/* Hero */}
      <div
        className="flex flex-col items-center justify-center flex-shrink-0 pt-16 pb-10 px-6"
        style={{ background: 'var(--c-espresso)' }}
      >
        <div
          className="flex items-center justify-center rounded-2xl mb-5"
          style={{ width: 72, height: 72, background: 'var(--c-forest)' }}
        >
          <BowlIcon size={44} color="#FDF0E8" />
        </div>
        <h1
          className="font-serif-display text-4xl text-center mb-2 leading-tight"
          style={{ color: 'var(--c-cream)' }}
        >
          Imre's Foodbase
        </h1>
        <p
          className="text-xs tracking-widest font-medium"
          style={{ color: 'var(--c-terracotta)', letterSpacing: '0.18em' }}
        >
          PLAN, PLAN, PLAN
        </p>
      </div>

      {/* Nav cards */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-8 space-y-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className="w-full flex items-center gap-4 text-left rounded-2xl px-5 py-5 active:scale-[0.98] transition-transform"
            style={{
              background: 'white',
              border: '0.5px solid var(--c-cream-dark)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 52,
                height: 52,
                background: item.accentLight,
                color: item.accent,
              }}
            >
              {item.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium text-base" style={{ color: 'var(--c-espresso)' }}>
                {item.label}
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--c-terracotta)', opacity: 0.8 }}>
                {item.sub}
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--c-cream-dark)', flexShrink: 0 }}>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
