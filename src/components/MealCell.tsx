import { useState } from 'react';
import type { Meal, MealType } from '../types';
import { MEAL_TYPE_CONFIG } from '../types';
import { MealTypeSheet } from './MealTypeSheet';
import { generateId } from '../utils';

interface Props {
  meal: Meal | null;
  onUpdate: (meal: Meal | null) => void;
}

export function MealCell({ meal, onUpdate }: Props) {
  const [showSheet, setShowSheet] = useState(false);
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(meal?.label ?? '');

  const bgColor = meal ? MEAL_TYPE_CONFIG[meal.type].color : 'var(--c-cream-dark)';

  function handleTap() {
    if (!meal) {
      setShowSheet(true);
    } else {
      setEditing(true);
      setLabel(meal.label);
    }
  }

  function handleLongPress() {
    setShowSheet(true);
  }

  function handleTypeSelect(type: MealType) {
    setShowSheet(false);
    const config = MEAL_TYPE_CONFIG[type];
    const newMeal: Meal = meal
      ? { ...meal, type, includeInShopping: config.defaultInclude ?? false }
      : {
          id: generateId(),
          type,
          label: '',
          ingredients: [],
          includeInShopping: config.defaultInclude ?? false,
        };
    onUpdate(newMeal);
    // Titel invullen is optioneel — niet automatisch openen
  }

  function handleLabelSubmit() {
    setEditing(false);
    if (!meal) return;
    // Lege titel is OK — maaltijd blijft bestaan, toont type-naam
    onUpdate({ ...meal, label: label.trim() });
  }

  let pressTimer: ReturnType<typeof setTimeout>;
  function onPointerDown() {
    pressTimer = setTimeout(() => {
      handleLongPress();
    }, 500);
  }
  function onPointerUp() {
    clearTimeout(pressTimer);
  }

  return (
    <>
      <div
        className="relative min-h-[52px] rounded-lg flex items-center justify-center cursor-pointer select-none active:opacity-80 transition-opacity px-1"
        style={{ backgroundColor: bgColor }}
        onClick={handleTap}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {editing ? (
          <input
            autoFocus
            className="w-full text-center text-xs font-medium bg-transparent outline-none text-white placeholder-white/60"
            value={label}
            placeholder="Naam (optioneel)"
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLabelSubmit();
              if (e.key === 'Escape') setEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : meal ? (
          <span className="text-xs font-medium text-white text-center leading-tight px-0.5">
            {meal.label || MEAL_TYPE_CONFIG[meal.type].label}
          </span>
        ) : (
          <span className="text-lg leading-none" style={{ color: 'var(--c-terracotta)', opacity: 0.4 }}>+</span>
        )}
      </div>

      {showSheet && (
        <MealTypeSheet onSelect={handleTypeSelect} onClose={() => setShowSheet(false)} />
      )}
    </>
  );
}
