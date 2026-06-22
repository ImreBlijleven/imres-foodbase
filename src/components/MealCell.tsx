import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Meal, MealType } from '../types';
import { MEAL_TYPE_CONFIG } from '../types';
import { MealTypeSheet } from './MealTypeSheet';
import { generateId } from '../utils';
import { useKeyboardBottom } from '../hooks/useKeyboardBottom';

interface Props {
  meal: Meal | null;
  onUpdate: (meal: Meal | null) => void;
}

export function MealCell({ meal, onUpdate }: Props) {
  const [showSheet, setShowSheet] = useState(false);
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(meal?.label ?? '');
  const keyboardBottom = useKeyboardBottom(editing);

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
        {meal ? (
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

      {editing && meal && createPortal(
        <div className="fixed inset-0 z-50" style={{ pointerEvents: 'none' }}>
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            style={{ pointerEvents: 'auto' }}
            onClick={handleLabelSubmit}
          />
          {/* sheet — sits just above the keyboard via Visual Viewport offset */}
          <div
            className="absolute left-0 right-0 bg-white rounded-t-2xl shadow-2xl px-4 pt-4 pb-6"
            style={{ bottom: keyboardBottom, pointerEvents: 'auto' }}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--c-terracotta)' }}>
              {MEAL_TYPE_CONFIG[meal.type].label} — naam
            </p>
            <input
              autoFocus
              className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none"
              style={{ borderColor: 'var(--c-cream-dark)', color: 'var(--c-espresso)' }}
              value={label}
              placeholder="Naam (optioneel)"
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLabelSubmit();
                if (e.key === 'Escape') setEditing(false);
              }}
            />
            <button
              onClick={handleLabelSubmit}
              className="mt-3 w-full py-3 text-white font-semibold rounded-xl active:opacity-80"
              style={{ background: 'var(--c-forest)' }}
            >
              Opslaan
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
