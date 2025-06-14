
// Mobile-and-desktop cross platform, favorite meals app
import { useState } from "react";
import { Meal } from "@/types/meal";
import MealCard from "@/components/MealCard";
import MealForm from "@/components/MealForm";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const DEMO: Meal[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    restaurant: "Luigi's",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&q=80",
    description: "Classic tomato, mozzarella, basil.",
  },
  {
    id: "2",
    name: "Vegan Buddha Bowl",
    restaurant: "GreenLeaf",
    rating: 4,
    imageUrl: undefined,
    description: "",
  },
];

export default function Index() {
  const [meals, setMeals] = useState<Meal[]>(DEMO);
  const [showForm, setShowForm] = useState(false);

  function addMeal(fields: Omit<Meal, "id">) {
    setMeals([{ ...fields, id: uuidv4() }, ...meals]);
    setShowForm(false);
  }

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
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus size={28} />
        </button>
      </header>
      {/* Meals List */}
      <section>
        {meals.length === 0 ? (
          <div className="text-gray-500 text-xl flex flex-col items-center mt-16">
            <span>No meals saved yet.</span>
            <button
              className="mt-4 bg-blue-700 hover:bg-blue-900 text-white px-5 py-2 rounded-lg"
              onClick={() => setShowForm(true)}
            >
              Add your first meal
            </button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        )}
      </section>
      {/* Add Meal Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-30 flex items-center justify-center">
          <MealForm onSave={addMeal} onCancel={() => setShowForm(false)} />
        </div>
      )}
      {/* Floating add button for mobile */}
      <button
        className="sm:hidden fixed bottom-5 right-5 z-50 bg-blue-700 hover:bg-blue-900 text-white rounded-full p-4 shadow-xl transition hover:scale-110"
        onClick={() => setShowForm(true)}
        aria-label="Add Meal"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
