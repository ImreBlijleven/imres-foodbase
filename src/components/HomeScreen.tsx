interface Props {
  onNavigate: (screen: 'week' | 'recipes' | 'shopping') => void;
}

/* Merkbadge — uitgesneden uit het aangeleverde logobestand */
const LogoBadge = () => (
  <img
    src="/badge.png"
    alt="Imre's Foodbase"
    className="w-full h-full rounded-full object-cover"
    draggable={false}
  />
);

const CalendarArt = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" className="md:w-16 md:h-16">
    <rect x="9" y="13" width="46" height="42" rx="6" stroke="currentColor" strokeWidth="2" />
    <path d="M9 25h46" stroke="currentColor" strokeWidth="2" />
    <path d="M21 7v11M43 7v11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="21" cy="34" r="2" fill="currentColor" />
    <circle cx="32" cy="34" r="2" fill="currentColor" />
    <circle cx="43" cy="34" r="2" fill="currentColor" />
    <circle cx="21" cy="45" r="2" fill="currentColor" />
    <circle cx="32" cy="45" r="2" fill="currentColor" />
  </svg>
);

const BookArt = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" className="md:w-16 md:h-16">
    <path d="M32 16c-6-4.5-14-5.5-21-3v37c7-2.5 15-1.5 21 3 6-4.5 14-5.5 21-3V13c-7-2.5-15-1.5-21 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M32 16v37" stroke="currentColor" strokeWidth="2" />
    <path d="M17 22c3-.8 7-.8 10 .5M17 30c3-.8 7-.8 10 .5M37 22c3-1.3 7-1.3 10-.5M37 30c3-1.3 7-1.3 10-.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const BasketArt = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" className="md:w-16 md:h-16">
    <path d="M11 26h42l-4.5 25a4 4 0 01-4 3h-25a4 4 0 01-4-3L11 26z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M22 26l10-15 10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 34v10M32 34v10M40 34v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const Chevron = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.55 }}>
    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const COLUMNS = [
  {
    key: 'week' as const,
    label: 'Weekplanning',
    bg: 'var(--c-forest)',
    fg: '#FDF0E8',
    icon: <CalendarArt />,
  },
  {
    key: 'recipes' as const,
    label: 'Recepten',
    bg: 'var(--c-terracotta)',
    fg: '#FDF0E8',
    icon: <BookArt />,
  },
  {
    key: 'shopping' as const,
    label: 'Boodschappen',
    bg: 'var(--c-cream)',
    fg: 'var(--c-forest)',
    icon: <BasketArt />,
  },
];

export function HomeScreen({ onNavigate }: Props) {
  return (
    <div className="flex flex-col h-svh">
      {/* Hero met logo-badge */}
      <div
        className="flex flex-col items-center flex-shrink-0 pb-6"
        style={{ background: 'var(--c-espresso)', paddingTop: 'calc(2rem + env(safe-area-inset-top))' }}
      >
        <div className="w-[140px] h-[140px] md:w-[180px] md:h-[180px]">
          <LogoBadge />
        </div>
      </div>

      {/* Drie navigatiekolommen */}
      <div className="flex flex-1 min-h-0">
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            onClick={() => onNavigate(col.key)}
            className="flex-1 flex flex-col items-center justify-center gap-5 md:gap-7 px-1.5 active:opacity-85 transition-opacity"
            style={{ background: col.bg, color: col.fg, paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {col.icon}
            <span className="font-serif-display text-[15px] md:text-xl leading-tight text-center">
              {col.label}
            </span>
            <Chevron />
          </button>
        ))}
      </div>
    </div>
  );
}
