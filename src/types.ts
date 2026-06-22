export type MealType =
  | 'alleen'
  | 'eline'
  | 'samen'
  | 'prep'
  | 'werk'
  | 'trein'
  | 'uit_eten'
  | 'custom';

export interface Ingredient {
  id: string;
  name: string;
  amount: number | null;
  unit: string | null;
}

export interface Meal {
  id: string;
  type: MealType;
  customTypeName?: string;
  label: string;
  ingredients: Ingredient[];
  recipeId?: string;
  includeInShopping: boolean;
}

export type ActivityPosition = 'voor_ontbijt' | 'na_ontbijt' | 'na_lunch' | 'na_diner';

export interface ActivityItem {
  id: string;
  text: string;
  position: ActivityPosition;
}

export const ACTIVITY_POSITION_LABELS: Record<ActivityPosition, string> = {
  voor_ontbijt: 'Voor ontbijt',
  na_ontbijt: 'Na ontbijt',
  na_lunch: 'Na lunch',
  na_diner: 'Na diner',
};

export interface DayPlan {
  date: string;
  ontbijt: Meal | null;
  lunch: Meal | null;
  diner: Meal | null;
  activiteiten: ActivityItem[];
}

export interface WeekPlan {
  id: string;
  weekStart: string;
  days: DayPlan[];
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  source: string;        // url, "handmatig", "screenshot", "instagram"
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: number | null;
  unit: string | null;
  checked: boolean;
  source: 'generated' | 'manual';
}

export interface ShoppingList {
  weekPlanId: string;
  items: ShoppingItem[];
}

export const MEAL_TYPE_CONFIG: Record<MealType, { label: string; color: string; defaultInclude: boolean | null }> = {
  alleen: { label: 'Alleen', color: '#5DCAA5', defaultInclude: true },
  eline: { label: 'Eline', color: '#D4537E', defaultInclude: true },
  samen: { label: 'Samen', color: '#EF9F27', defaultInclude: null },
  prep: { label: 'Prep', color: '#E24B4A', defaultInclude: false },
  werk: { label: 'Werk', color: '#378ADD', defaultInclude: false },
  trein: { label: 'Trein', color: '#5BB8F5', defaultInclude: false },
  uit_eten: { label: 'Uit eten', color: '#7F77DD', defaultInclude: false },
  custom: { label: 'Custom', color: '#888780', defaultInclude: null },
};
