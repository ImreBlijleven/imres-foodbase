import type { MealType } from '../types';
import { MEAL_TYPE_CONFIG } from '../types';

interface Props {
  onSelect: (type: MealType) => void;
  onClose: () => void;
}

export function MealTypeSheet({ onSelect, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-2xl p-4 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <p className="text-sm text-gray-500 text-center mb-4 font-medium">Kies type maaltijd</p>
        <div className="grid grid-cols-4 gap-3">
          {(Object.entries(MEAL_TYPE_CONFIG) as [MealType, typeof MEAL_TYPE_CONFIG[MealType]][]).map(
            ([type, config]) => (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl active:scale-95 transition-transform"
              >
                <div
                  className="w-12 h-12 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-gray-700 font-medium">{config.label}</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
