
export interface Meal {
  id: string;
  restaurant: string;
  name: string;
  description?: string;
  rating: number; // 1-5
  imageUrl?: string;
}
