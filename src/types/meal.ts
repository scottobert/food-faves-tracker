
export interface Meal {
  id: string;
  restaurant: string;
  name: string;
  description?: string;
  rating: number; // 1-5
  imageUrl?: string;
  latitude?: number; // Optional restaurant latitude
  longitude?: number; // Optional restaurant longitude
  tags?: string[]; // New: Meal tags/categories
  price?: number; // Optional: price of the meal in user currency
  mealDateTime?: string; // Optional: when the meal was eaten (ISO string)
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink' | 'other'; // Type of meal
  notes?: string; // Additional notes about the meal
}
