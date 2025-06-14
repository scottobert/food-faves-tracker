
import { Meal } from "@/types/meal";
import StarRating from "./StarRating";

type Props = {
  meal: Meal;
  onClick?: () => void;
};

export default function MealCard({ meal, onClick }: Props) {
  return (
    <div
      className="rounded-xl shadow-lg bg-white transition hover:scale-105 cursor-pointer flex flex-col relative group"
      style={{ minWidth: 240, maxWidth: 310, width: "100%" }}
      onClick={onClick}
    >
      {meal.imageUrl && (
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="rounded-t-xl h-40 object-cover w-full"
          style={{ objectPosition: "center top" }}
        />
      )}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg truncate" title={meal.name}>
            {meal.name}
          </h2>
          <StarRating rating={meal.rating} size={20} />
        </div>
        <div className="text-sm text-blue-800 font-semibold truncate mb-1">
          {meal.restaurant}
        </div>
        {meal.description && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{meal.description}</div>
        )}
      </div>
    </div>
  );
}
