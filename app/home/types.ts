export type Meal = {
  _id: string;
  mealName: string;
  foodType: string;
  category: string;
  price: number;
  establishmentName: string;
  establishmentCategory: string;
  location: string;
  mealTime: string[];
  healthScore: number;
  isFried: boolean;
  isSoup: boolean;
  isVegetarian: boolean;
  tags: string[];
  allergens: string[];
  isAvailable: boolean;
};

export type Establishment = {
  _id: string;
  name: string;
  category: string;
  location: string;
  priceRange: string;
  openingHours: string;
  isOpen: boolean;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type MealOption = {
  meals: Meal[];
  totalCost: number;
  remainingBudget: number;
  score?: number;
  label?: string;
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
  hours: string;
  tags: string[];
  imageUrl: string;
  distanceM: number;
  rating: number;
  priceMin: number;
  priceMax: number;
};

export type MenuItem = {
  id: string;
  mealName: string;
  establishment: string;
  price: number;
  rating: number;
  tags: string[];
  imageUrl: string;
};

export type HistoryItem = {
  id: string;
  title: string;
  date: string;
  allowanceType: AllowanceType;
  budget: number;
  total: number;
  remaining: number;
  meals: string[];
  mood: string;
};

export type CommunityPost = {
  id: string;
  name: string;
  badge: string;
  time: string;
  establishment: string;
  content: string;
  likes: number;
  comments: number;
  tags: string[];
};

export type PreferenceMode = "cheapest" | "balanced" | "variety";
export type MealType = "full-meals" | "snacks" | "mixed";
