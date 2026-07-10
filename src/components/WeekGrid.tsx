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

export function WeekGrid({ weekPlan, onUpdateMeal, onAddActiviteit, onUpdateActiviteit, onRemoveActiviteit }: Props) {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <>
      {/* Smal scherm: compact weekraster met horizontale scroll */}
      <div className="overflow-x-auto sm:hidden">
        <div className="min-w-[600px]">
          {/* Header row */}
          <div className="grid grid-cols-[64px_repeat(7,1fr)] gap-1 mb-1">
            <div />
            {weekPlan.days.map((day, i) => {
              const isToday = day.date === todayStr;
              return (
                <div key={day.date} className="text-center">
                  <div
                    className={`text-xs ${isToday ? 'font-bold' : 'font-medium'}`}
                    style={{ color: isToday ? 'var(--c-forest)' : 'var(--c-espresso)' }}
                  >
                    {DAY_NAMES[i]}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--c-terracotta)', opacity: 0.7 }}>{formatDate(day.date)}</div>
                </div>
              );
            })}
          </div>

          {/* Interleaved rows */}
          {ROWS.map((row) => {
            if (row.kind === 'meal') {
              return (
                <div key={row.key} className="grid grid-cols-[64px_repeat(7,1fr)] gap-1 mb-0.5">
                  <div className="flex items-center">
                    <span className="text-xs font-medium" style={{ color: 'var(--c-terracotta)', opacity: 0.8 }}>{row.label}</span>
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
              <div key={row.position} className="grid grid-cols-[64px_repeat(7,1fr)] gap-1 mb-0.5">
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

      {/* Breed scherm (landscape / iPad): dagkaarten */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-start">
        {weekPlan.days.map((day, i) => {
          const isToday = day.date === todayStr;
          return (
            <div
              key={day.date}
              className="bg-white rounded-xl p-3.5 flex flex-col gap-1.5"
              style={{
                border: isToday ? '1.5px solid var(--c-forest)' : '0.5px solid var(--c-cream-dark)',
              }}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-serif-display text-base" style={{ color: 'var(--c-espresso)' }}>
                  {FULL_DAY_NAMES[i]}
                </span>
                <span className="text-xs" style={{ color: isToday ? 'var(--c-forest)' : 'var(--c-terracotta)', opacity: isToday ? 1 : 0.75 }}>
                  {isToday ? 'Vandaag' : formatDate(day.date)}
                </span>
              </div>

              {ROWS.map((row) => {
                if (row.kind === 'meal') {
                  return (
                    <div key={row.key} className="flex items-center gap-2.5">
                      <span className="w-14 text-xs font-medium flex-shrink-0" style={{ color: 'var(--c-terracotta)', opacity: 0.8 }}>
                        {row.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <MealCell
                          large
                          meal={day[row.key]}
                          onUpdate={(meal) => onUpdateMeal(day.date, row.key, meal)}
                        />
                      </div>
                    </div>
                  );
                }

                const items = day.activiteiten.filter((a) => a.position === row.position);
                return (
                  <div key={row.position} className="pl-[66px]">
                    <ActiviteitenSlot
                      large
                      items={items}
                      position={row.position}
                      onAdd={(text) => onAddActiviteit(day.date, text, row.position)}
                      onUpdate={(id, text) => onUpdateActiviteit(day.date, id, text)}
                      onRemove={(id) => onRemoveActiviteit(day.date, id)}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
