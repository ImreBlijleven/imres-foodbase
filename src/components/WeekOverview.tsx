import { useState } from 'react';
import type { WeekPlan } from '../types';
import { MEAL_TYPE_CONFIG } from '../types';
import { DAY_NAMES, formatDate } from '../utils';

interface Props {
  weekPlan: WeekPlan;
}

const SLOTS = [
  { key: 'ontbijt' as const, label: 'O' },
  { key: 'lunch' as const, label: 'L' },
  { key: 'diner' as const, label: 'D' },
];

export function WeekOverview({ weekPlan }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border-b border-gray-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-600 font-medium"
      >
        <span>Weekoverzicht</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="overflow-x-auto px-3 pb-3">
          <div className="min-w-[560px]">
            {/* Header */}
            <div className="grid grid-cols-[36px_repeat(7,1fr)] gap-1 mb-1">
              <div />
              {weekPlan.days.map((day, i) => (
                <div key={day.date} className="text-center">
                  <div className="text-xs font-bold text-gray-600">{DAY_NAMES[i]}</div>
                  <div className="text-[10px] text-gray-400">{formatDate(day.date)}</div>
                </div>
              ))}
            </div>

            {/* Meal rows */}
            {SLOTS.map((slot) => (
              <div key={slot.key} className="grid grid-cols-[36px_repeat(7,1fr)] gap-1 mb-1">
                <div className="flex items-center">
                  <span className="text-[10px] text-gray-400 font-medium">{slot.label}</span>
                </div>
                {weekPlan.days.map((day) => {
                  const meal = day[slot.key];
                  const color = meal ? MEAL_TYPE_CONFIG[meal.type].color : '#e5e7eb';
                  return (
                    <div
                      key={day.date}
                      className="h-7 rounded flex items-center justify-center px-0.5"
                      style={{ backgroundColor: color }}
                    >
                      {meal && (
                        <span className="text-[9px] font-medium text-white text-center leading-tight truncate px-0.5">
                          {meal.label || MEAL_TYPE_CONFIG[meal.type].label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Activiteiten samenvatting */}
            <div className="grid grid-cols-[36px_repeat(7,1fr)] gap-1 mt-1">
              <div className="flex items-start pt-0.5">
                <span className="text-[10px] text-gray-400 font-medium">Act.</span>
              </div>
              {weekPlan.days.map((day) => (
                <div key={day.date} className="min-h-[24px] rounded bg-gray-50 px-1 py-0.5">
                  {day.activiteiten.length > 0 ? (
                    day.activiteiten.map((a) => (
                      <p key={a.id} className="text-[9px] text-gray-500 leading-snug truncate">
                        {a.text}
                      </p>
                    ))
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
