import { useState, useEffect, useMemo } from "react";
import { Meal } from "@/types/meal";
import MealCard from "@/components/MealCard";
import MealForm from "@/components/MealForm";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";

const DEMO: Meal[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    restaurant: "Luigi's",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&q=80",
    description: "Classic tomato, mozzarella, basil.",
    latitude: 37.773972,
    longitude: -122.431297,
  },
  {
    id: "2",
    name: "Vegan Buddha Bowl",
    restaurant: "GreenLeaf",
    rating: 4,
    imageUrl: undefined,
    description: "",
    latitude: undefined,
    longitude: undefined,
  },
];

function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Haversine formula
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const NEARBY_METERS = 100; // how close user must be to "match" a restaurant

export default function Index() {
  const [meals, setMeals] = useState<Meal[]>(DEMO);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [search, setSearch] = useState(""); // NEW

  const { location, error: locError, refresh } = useCurrentLocation();

  // Find a meal with a restaurant near the current location
  const nearbyMeal = useMemo(() => {
    if (!location) return null;
    return meals.find(
      m =>
        typeof m.latitude === "number" &&
        typeof m.longitude === "number" &&
        distanceInMeters(location.latitude, location.longitude, m.latitude, m.longitude) < NEARBY_METERS
    );
  }, [meals, location]);

  function addMeal(fields: Omit<Meal, "id">) {
    setMeals([{ ...fields, id: uuidv4() }, ...meals]);
    setShowForm(false);
  }

  function updateMeal(newMeal: Omit<Meal, "id">) {
    if (!editingMeal) return;
    setMeals((meals) =>
      meals.map((meal) =>
        meal.id === editingMeal.id ? { ...meal, ...newMeal } : meal
      )
    );
    setEditingMeal(null);
    setShowForm(false);
  }

  function handleCardClick(meal: Meal) {
    setEditingMeal(meal);
    setShowForm(true);
  }

  function handleCloseForm() {
    setEditingMeal(null);
    setShowForm(false);
  }

  // Filter meals based on search term
  const filteredMeals = useMemo(() => {
    if (!search.trim()) return meals;
    const term = search.toLowerCase();
    return meals.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.restaurant.toLowerCase().includes(term)
    );
  }, [meals, search]);

  return (
    <div className="min-h-screen bg-slate-50 px-2 md:px-8 py-6">
      {/* Header */}
      <header className="flex items-center mb-8">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight select-none">
            My Favorite Meals
          </h1>
          <p className="text-lg text-gray-500 mt-1">Track your favorites from any restaurant.</p>
        </div>
        <button
          className="bg-blue-700 hover:bg-blue-900 text-white rounded-full shadow-lg p-3 ml-2 transition hover:scale-110"
          title="Add Meal"
          onClick={() => {
            setShowForm(true);
            setEditingMeal(null);
          }}
        >
          <Plus size={28} />
        </button>
      </header>
      {/* Search Bar */}
      <div className="mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search meals or restaurants..."
          className="w-full border rounded-lg px-4 py-2 text-base shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search meals"
        />
      </div>
      {nearbyMeal && (
        <div className="bg-green-100 border-l-4 border-green-600 p-4 mb-6 rounded-lg shadow flex items-center gap-4">
          <span className="text-green-700 font-semibold">
            You're at <b>{nearbyMeal.restaurant}</b>!
          </span>
          <span className="text-green-800">
            Try your favorite: <b>{nearbyMeal.name}</b>
          </span>
          {nearbyMeal.imageUrl && (
            <img src={nearbyMeal.imageUrl} alt={nearbyMeal.name} className="h-10 w-10 rounded shadow ml-2 object-cover" />
          )}
        </div>
      )}
      <section>
        {filteredMeals.length === 0 ? (
          <div className="text-gray-500 text-xl flex flex-col items-center mt-16">
            <span>No meals found.</span>
            <button
              className="mt-4 bg-blue-700 hover:bg-blue-900 text-white px-5 py-2 rounded-lg"
              onClick={() => {
                setShowForm(true);
                setEditingMeal(null);
              }}
            >
              Add your first meal
            </button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onClick={() => handleCardClick(meal)}
              />
            ))}
          </div>
        )}
      </section>
      {/* Add/Edit Meal Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-30 flex items-center justify-center">
          <MealForm
            onSave={editingMeal ? updateMeal : addMeal}
            onCancel={handleCloseForm}
            initial={editingMeal || undefined}
          />
        </div>
      )}
      {/* Floating add button for mobile */}
      <button
        className="sm:hidden fixed bottom-5 right-5 z-50 bg-blue-700 hover:bg-blue-900 text-white rounded-full p-4 shadow-xl transition hover:scale-110"
        onClick={() => {
          setShowForm(true);
          setEditingMeal(null);
        }}
        aria-label="Add Meal"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
