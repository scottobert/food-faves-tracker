
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Meal } from "@/types/meal";
import MealCard from "@/components/MealCard";
import MealForm from "@/components/MealForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LogOut, Plus } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMeals();
    }
  }, [user]);

  const fetchMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meals:', error);
      } else {
        // Convert the data to match our Meal interface
        const mealsData: Meal[] = data?.map(meal => ({
          id: meal.id,
          restaurant: meal.restaurant,
          name: meal.name,
          description: meal.description,
          rating: meal.rating,
          imageUrl: meal.image_url,
          latitude: meal.latitude,
          longitude: meal.longitude,
          tags: meal.tags,
          price: meal.price,
        })) || [];
        setMeals(mealsData);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealAdded = () => {
    setIsFormOpen(false);
    fetchMeals(); // Refresh the meals list
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🍽️</span>
                <h1 className="text-xl font-bold text-gray-900">My Favorite Meals</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Meals</h2>
              <p className="text-gray-600 mt-2">Track and share your culinary adventures</p>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Meal</DialogTitle>
                </DialogHeader>
                <MealForm onMealAdded={handleMealAdded} />
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">Loading your meals...</div>
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 mb-4">No meals added yet!</div>
              <p className="text-gray-500 mb-6">Start by adding your first favorite meal.</p>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Meal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Meal</DialogTitle>
                  </DialogHeader>
                  <MealForm onMealAdded={handleMealAdded} />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
