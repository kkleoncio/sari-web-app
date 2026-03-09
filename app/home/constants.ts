export interface Meal {
  mealName: string;
  price: number;
  establishment: string;
}

export type MealOption = {
  meals: Meal[];
  totalCost: number;
  remainingBudget: number;
};

export type AllowanceType = "daily" | "weekly";

export type NavKey =
  | "dashboard"
  | "establishments"
  | "menu"
  | "history"
  | "community";

export type EstablishmentCard = {
  id: string;
  name: string;
  address: string;
  distanceM: number;
  rating: number;
  priceMin: number;
  priceMax: number;
  hours: string;
  tags: string[];
  imageUrl: string;
};