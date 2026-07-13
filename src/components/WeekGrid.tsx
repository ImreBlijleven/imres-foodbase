import type { WeekPlan, Meal, ActivityPosition } from '../types';
import { DAY_NAMES, FULL_DAY_NAMES, formatDate } from '../utils';
import { MealCell } from './MealCell';
import { ActiviteitenSlot } from './ActiviteitenSlot';

interface Props {
  weekPlan: WeekPlan;
  onUpdateMeal: (date: string, slot: 'ontbijt' | 'lunch' | 'diner', meal: Meal | null) => void;
  onAddActiviteit: (date: string, text: string, position: ActivityPosition) => void;
  onUpdateActiviteit: (date: string, id: string, text: string) => void;
  onRemoveActiviteit: (date: string, id: string) => void;
}

const ROWS: Array<
  | { kind: 'meal'; key: 'ontbijt' | 'lunch' | 'diner'; label: string }
  | { kind: 'activity'; position: ActivityPosition }
> = [
  { kind: 'activity', position: 'voor_ontbijt' },
  { kind: 'meal', key: 'ontbijt', label: 'Ontbijt' },
  { kind: 'activity', position: 'na_ontbijt' },
  { kind: 'meal', key: 'lunch', label: 'Lunch' },
  { kind: 'activity', position: 'na_lunch' },
  { kind: 'meal', key: 'diner', label: 'Diner' },
  { kind: 'activity', position: 'na_diner' },
];

const GRID_COLS = 'grid grid-cols-[64px_repeat(7,1fr)] sm:grid-cols-[84px_repeat(7,1fr)] gap-1 sm:gap-1.5';

export function WeekGrid({ weekPlan, onUpdateMeal, onAddActiviteit, onUpdateActiviteit, onRemoveActiviteit }: Props) {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="overflow-x-auto h-full">
      {/* Vult de volledige hoogte; maaltijdrijen groeien mee met het scherm */}
      <div className="min-w-[600px] h-full flex flex-col">
        {/* Dagkoppen */}
        <div className={`${GRID_COLS} mb-1 sm:mb-2 flex-shrink-0`}>
          <div />
          {weekPlan.days.map((day, i) => {
            const isToday = day.date === todayStr;
            return (
              <div key={day.date} className="text-center">
                <div
                  className={`text-xs sm:text-sm ${isToday ? 'font-bold' : 'font-medium'}`}
                  style={{ color: isToday ? 'var(--c-forest)' : 'var(--c-espresso)' }}
                >
                  <span className="sm:hidden">{DAY_NAMES[i]}</span>
                  <span className="hidden sm:inline">{FULL_DAY_NAMES[i]}</span>
                </div>
                <div
                  className="text-xs"
                  style={{ color: isToday ? 'var(--c-forest)' : 'var(--c-terracotta)', opacity: isToday ? 1 : 0.7 }}
                >
                  {isToday ? 'Vandaag' : formatDate(day.date)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rijen: maaltijden rekken mee, activiteiten blijven compact */}
        {ROWS.map((row) => {
          if (row.kind === 'meal') {
            return (
              <div key={row.key} className={`${GRID_COLS} mb-0.5 sm:mb-1 flex-1 min-h-0`}>
                <div className="flex items-center">
                  <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--c-terracotta)', opacity: 0.8 }}>
                    {row.label}
                  </span>
                </div>
                {weekPlan.days.map((day) => (
                  <MealCell
                    key={day.date}
                    meal={day[row.key]}
                    onUpdate={(meal) => onUpdateMeal(day.date, row.key, meal)}
                  />
                ))}
              </div>
            );
          }

          // Activity row
          return (
            <div key={row.position} className={`${GRID_COLS} mb-0.5 flex-shrink-0`}>
              <div />
              {weekPlan.days.map((day) => {
                const items = day.activiteiten.filter((a) => a.position === row.position);
                return (
                  <ActiviteitenSlot
                    key={day.date}
                    items={items}
                    position={row.position}
                    onAdd={(text) => onAddActiviteit(day.date, text, row.position)}
                    onUpdate={(id, text) => onUpdateActiviteit(day.date, id, text)}
                    onRemove={(id) => onRemoveActiviteit(day.date, id)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
