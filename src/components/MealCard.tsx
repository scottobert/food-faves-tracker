
import { Meal } from "@/types/meal";
import StarRating from "./StarRating";
import SocialShareButton from "./SocialShareButton";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

type Props = {
  meal: Meal;
  onClick?: () => void;
  onEdit?: (meal: Meal) => void;
  onDelete?: (meal: Meal) => void;
};

const ORIGIN =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://my-meals-app.lovable.app";

function buildShareUrl(meal: Meal) {
  // Estimate a meal-share URL (you could improve it to use a canonical slug/ID if you want)
  if (typeof window !== "undefined") {
    return window.location.origin + "?meal=" + meal.id;
  }
  return "https://my-meals-app.lovable.app/?meal=" + meal.id;
}

export default function MealCard({ meal, onClick, onEdit, onDelete }: Props) {
  // Build sharing text
  const shareText = `🍽️ "${meal.name}" at ${meal.restaurant} — ${meal.rating}⭐` + (meal.description ? " | " + meal.description : "");

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(meal);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(meal);
  };
  return (
    <div
      className="rounded-xl shadow-lg bg-white transition hover:scale-105 cursor-pointer flex flex-col relative"
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
        {meal.tags && meal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1 mt-1">
            {meal.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}        {typeof meal.price === "number" && (
          <div className="text-xs text-green-800 font-medium mb-1">
            Price: ${meal.price.toFixed(2)}
          </div>
        )}        {meal.mealDateTime && (
          <div className="text-xs text-purple-800 font-medium mb-1">
            Eaten: {new Date(meal.mealDateTime).toLocaleDateString()} at {new Date(meal.mealDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        {meal.mealType && (
          <div className="text-xs text-orange-800 font-medium mb-1">
            Type: {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
          </div>
        )}
        {meal.notes && (
          <div className="text-xs text-gray-600 mt-1 mb-2 italic line-clamp-2">
            "{meal.notes}"
          </div>
        )}
        {meal.description && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-2 mb-3">{meal.description}</div>
        )}
        
        {/* Action buttons row at bottom - always visible */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
          <div className="flex gap-2">
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                onClick={handleEdit}
                title="Edit meal"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                onClick={handleDelete}
                title="Delete meal"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
          
          {/* Share button moved to bottom right */}
          <div className="flex-shrink-0">
            <SocialShareButton
              url={buildShareUrl(meal)}
              text={shareText}
              imageUrl={meal.imageUrl}
              className="relative"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
