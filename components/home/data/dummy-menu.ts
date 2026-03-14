import type { MenuItem } from "@/app/home/types";

export const dummyMenu: MenuItem[] = [
  {
    id: "1",
    mealName: "Chicken Adobo",
    establishment: "Aling Baby’s",
    price: 120,
    rating: 4.6,
    tags: ["Best Seller", "Rice Meal"],
    imageUrl:
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "2",
    mealName: "Pork Sisig",
    establishment: "Aling Baby’s",
    price: 110,
    rating: 4.7,
    tags: ["Popular", "Sizzling"],
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "3",
    mealName: "Beef Tapa",
    establishment: "Aling Baby’s",
    price: 130,
    rating: 4.5,
    tags: ["Breakfast", "Rice Meal"],
    imageUrl:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop",
  },
];