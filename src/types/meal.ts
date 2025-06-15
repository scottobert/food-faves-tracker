
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
}
