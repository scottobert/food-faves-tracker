import { useRef, useState } from "react";
import { Meal } from "@/types/meal";
import StarRating from "./StarRating";
import { X } from "lucide-react";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import RestaurantLocationSearch from "./RestaurantLocationSearch";

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
  const [tags, setTags] = useState<string[]>(initial.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [price, setPrice] = useState(initial.price !== undefined ? initial.price : "");

  const { location, error: locError, refresh } = useCurrentLocation();
  const [useLoc, setUseLoc] = useState(true);

  // For Mapbox-based search:
  const [searchedLoc, setSearchedLoc] = useState<{ latitude: number; longitude: number; name: string } | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");

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

  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean) return;
    if (tags.includes(clean)) return;
    setTags([...tags, clean]);
    setTagInput("");
  }
  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurant.trim()) return setError("Restaurant name is required.");
    if (!name.trim()) return setError("Meal name is required.");
    if (rating === 0) return setError("Please select a rating.");
    if (!useLoc && !searchedLoc) return setError("Please set restaurant location via GPS or search.");

    setError(null);
    let latLon: { latitude?: number; longitude?: number } = {};
    if (useLoc && location) {
      latLon = { latitude: location.latitude, longitude: location.longitude };
    } else if (!useLoc && searchedLoc) {
      latLon = { latitude: searchedLoc.latitude, longitude: searchedLoc.longitude };
    }
    let parsedPrice: number | undefined = undefined;
    if (price !== "") {
      const p = Number(price);
      if (!isNaN(p) && p >= 0) parsedPrice = p;
    }
    onSave({
      restaurant: restaurant.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      rating,
      imageUrl,
      tags: tags.length ? tags : undefined,
      price: parsedPrice,
      ...latLon,
    });
  }

  // Disable Mapbox search if no token entered
  const isSearchEnabled = !!mapboxToken;

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
        <label className="block font-medium mb-1">Categories/Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="flex items-center bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs font-medium"
            >
              #{tag}
              <button
                type="button"
                className="ml-1 text-sky-500 hover:text-sky-800"
                onClick={() => removeTag(tag)}
                aria-label={`Remove tag ${tag}`}
                tabIndex={-1}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Add tag, e.g. vegetarian, spicy"
          value={tagInput}
          onChange={e => setTagInput(e.target.value.replace(/[^a-zA-Z0-9 _-]/g, ""))}
          onKeyDown={handleTagKeyDown}
          onBlur={() => addTag(tagInput)}
        />
        <div className="text-xs text-gray-400 mt-1">
          Press Enter or comma to add. E.g. "vegan", "pasta", "breakfast"
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Price <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          className="w-full border rounded px-3 py-2"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter price (e.g., 12.99)"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
        <div className="text-xs text-gray-400 mt-1">
          Track what you paid last time. For your reference only.
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Restaurant Location</label>
        <div className="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            checked={useLoc}
            onChange={e => setUseLoc(e.target.checked)}
            className="mr-1"
            id="use-gps"
          />
          <label htmlFor="use-gps" className="text-sm text-gray-700">
            Use my current GPS location for this restaurant
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
        {!useLoc && (
          <div className="border rounded p-2 mt-2 bg-slate-50">
            {!mapboxToken && (
              <div className="mb-2">
                <label className="text-xs block mb-1 font-medium text-gray-700">
                  Mapbox Public Token:
                </label>
                <input
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={mapboxToken}
                  onChange={e => setMapboxToken(e.target.value)}
                  placeholder="pk.eyJ1Ijo..."
                />
                <div className="text-[10px] mt-1 text-gray-600">
                  Get your free public token from <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">Mapbox</a>.
                </div>
              </div>
            )}
            {!!mapboxToken && (
              <RestaurantLocationSearch
                mapboxToken={mapboxToken}
                value={searchedLoc ? { latitude: searchedLoc.latitude, longitude: searchedLoc.longitude } : undefined}
                onSelect={loc => setSearchedLoc(loc)}
              />
            )}
          </div>
        )}
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 rounded transition"
      >
        {initial && (initial.restaurant || initial.name || initial.rating) ? "Update Meal" : "Save Meal"}
      </button>
    </form>
  );
}
