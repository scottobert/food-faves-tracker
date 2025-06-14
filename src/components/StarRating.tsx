
import { Star, StarHalf, StarOff } from "lucide-react";

type Props = {
  rating: number; // 1-5
  setRating?: (rating: number) => void; // if present, interactive
  size?: number;
  className?: string;
};

export default function StarRating({ rating, setRating, size = 22, className = "" }: Props) {
  return (
    <div className={"flex gap-1 " + className}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = rating >= i + 1;
        const starProps = {
          size,
          className: "transition-colors cursor-pointer",
          color: filled ? "#fbbf24" : "#d1d5db",
          onClick: setRating ? () => setRating(i + 1) : undefined,
        };
        return filled
          ? <Star key={i} {...starProps} data-testid={`star-filled-${i + 1}`}/>
          : <StarOff key={i} {...starProps} data-testid={`star-empty-${i + 1}`}/>;
      })}
    </div>
  );
}
