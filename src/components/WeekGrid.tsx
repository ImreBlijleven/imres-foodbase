import type { WeekPlan, Meal, ActivityPosition } from '../types';
import { DAY_NAMES, formatDate } from '../utils';
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
  | { kind: 'activity'; position: ActivityPosition; label: string }
> = [
  { kind: 'activity', position: 'voor_ontbijt', label: '' },
  { kind: 'meal', key: 'ontbijt', label: 'Ontbijt' },
  { kind: 'activity', position: 'na_ontbijt', label: '' },
  { kind: 'meal', key: 'lunch', label: 'Lunch' },
  { kind: 'activity', position: 'na_lunch', label: '' },
  { kind: 'meal', key: 'diner', label: 'Diner' },
  { kind: 'activity', position: 'na_diner', label: '' },
];

export function WeekGrid({ weekPlan, onUpdateMeal, onAddActiviteit, onUpdateActiviteit, onRemoveActiviteit }: Props) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header row */}
        <div className="grid grid-cols-[64px_repeat(7,1fr)] gap-1 mb-1">
          <div />
          {weekPlan.days.map((day, i) => (
            <div key={day.date} className="text-center">
              <div className="text-xs font-medium" style={{ color: 'var(--c-espresso)' }}>{DAY_NAMES[i]}</div>
              <div className="text-xs" style={{ color: 'var(--c-terracotta)', opacity: 0.7 }}>{formatDate(day.date)}</div>
            </div>
          ))}
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

          // Activity row — only render if any day has items or show slim add-row
          return (
            <div key={row.position} className="grid grid-cols-[64px_repeat(7,1fr)] gap-1 mb-0.5">
              <div className="flex items-center">
                <span className="text-[10px] text-gray-300 font-medium leading-none">
                  {row.label}
                </span>
              </div>
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
