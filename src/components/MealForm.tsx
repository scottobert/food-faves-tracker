
import { useRef, useState } from "react";
import { Meal } from "@/types/meal";
import StarRating from "./StarRating";
import { X } from "lucide-react";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";

type Props = {
  onSave: (meal: Omit<Meal, "id">) => void;
  onCancel: () => void;
  initial?: Partial<Meal>;
};

export default function MealForm({ onSave, onCancel, initial = {} }: Props) {
  const [restaurant, setRestaurant] = useState(initial.restaurant ?? "");
  const [name, setName] = useState(initial.name ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [rating, setRating] = useState(initial.rating || 0);
  const [imageUrl, setImageUrl] = useState<string | undefined>(initial.imageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const { location, error: locError, refresh } = useCurrentLocation();
  const [useLoc, setUseLoc] = useState(true);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurant.trim()) return setError("Restaurant name is required.");
    if (!name.trim()) return setError("Meal name is required.");
    if (rating === 0) return setError("Please select a rating.");
    setError(null);
    let latLon: { latitude?: number; longitude?: number } = {};
    if (useLoc && location) {
      latLon = { latitude: location.latitude, longitude: location.longitude };
    }
    onSave({
      restaurant: restaurant.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      rating,
      imageUrl,
      ...latLon,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg relative animate-fade-in"
      style={{ minWidth: 320 }}
    >
      <button
        type="button"
        className="absolute right-4 top-3 text-gray-400 hover:text-gray-700"
        onClick={onCancel}
        aria-label="Cancel"
      >
        <X size={20} />
      </button>
      <h2 className="text-xl font-semibold mb-4">Add a Meal</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Restaurant <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full border rounded px-3 py-2"
          value={restaurant}
          onChange={e => setRestaurant(e.target.value)}
          required
          placeholder="e.g. Sushi Bar"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Meal Name <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="e.g. Spicy Tuna Roll"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Description</label>
        <textarea
          className="w-full border rounded px-3 py-2 h-20"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Optional description or notes"
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Photo</label>
        {imageUrl && (
          <div className="mb-2">
            <img src={imageUrl} alt="Meal preview" className="rounded-lg h-24 object-cover mx-auto" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInput}
          className="hidden"
          onChange={handleImage}
        />
        <button
          type="button"
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
          onClick={() => fileInput.current?.click()}
        >
          {imageUrl ? "Replace Photo" : "Upload Photo"}
        </button>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Rating <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} setRating={setRating} size={30} className="mb-1" />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Save Restaurant Location</label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useLoc}
            onChange={e => setUseLoc(e.target.checked)}
            className="mr-1"
            id="save-location"
          />
          <label htmlFor="save-location" className="text-sm text-gray-700">
            Save my location for this restaurant (for future reminders)
          </label>
          <button
            type="button"
            onClick={refresh}
            className="ml-2 text-xs underline text-blue-600"
            tabIndex={-1}
          >
            Refresh
          </button>
        </div>
        {useLoc && (
          <div className="text-xs text-gray-500 mt-1">
            {location
              ? <>Current Location: <b>{location.latitude.toFixed(4)}</b>, <b>{location.longitude.toFixed(4)}</b></>
              : locError
                ? <span className="text-red-400">{locError}</span>
                : "Retrieving current location..."}
          </div>
        )}
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 rounded transition"
      >
        Save Meal
      </button>
    </form>
  );
}
