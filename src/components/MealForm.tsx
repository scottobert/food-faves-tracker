import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Meal } from "@/types/meal";
import StarRating from "./StarRating";
import RestaurantLocationSearch from "./RestaurantLocationSearch";
import { useCapacitorCamera } from "@/hooks/useCapacitorCamera";
import { Camera, Trash2 } from "lucide-react";

interface MealFormProps {
  onMealAdded: () => void;
  editingMeal?: Meal | null;
  onEditComplete?: () => void;
}

const MealForm = ({ onMealAdded, editingMeal, onEditComplete }: MealFormProps) => {
  const { user } = useAuth();
  const { takePhoto, isLoading: cameraLoading, error: cameraError, isNativeApp } = useCapacitorCamera();const [formData, setFormData] = useState({
    restaurant: "",
    name: "",
    description: "",
    rating: 0,
    imageUrl: "",
    latitude: null as number | null,
    longitude: null as number | null,
    tags: [] as string[],
    price: "",
    mealDateTime: new Date().toISOString().slice(0, 16), // Default to current date/time in YYYY-MM-DDTHH:mm format
    mealType: "" as string,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!editingMeal;  // Initialize form with editing meal data
  useEffect(() => {
    if (editingMeal) {
      setFormData({
        restaurant: editingMeal.restaurant || "",
        name: editingMeal.name || "",
        description: editingMeal.description || "",
        rating: editingMeal.rating || 0,
        imageUrl: editingMeal.imageUrl || "",
        latitude: editingMeal.latitude || null,
        longitude: editingMeal.longitude || null,
        tags: editingMeal.tags || [],
        price: editingMeal.price ? editingMeal.price.toString() : "",
        mealDateTime: editingMeal.mealDateTime 
          ? new Date(editingMeal.mealDateTime).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        mealType: editingMeal.mealType || "",
        notes: editingMeal.notes || "",
      });
    } else {
      // Reset form for new meal
      setFormData({
        restaurant: "",
        name: "",
        description: "",
        rating: 0,
        imageUrl: "",
        latitude: null,
        longitude: null,
        tags: [],
        price: "",
        mealDateTime: new Date().toISOString().slice(0, 16),
        mealType: "",
        notes: "",
      });
    }
  }, [editingMeal]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a meal.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {      const mealData = {
        restaurant: formData.restaurant,
        name: formData.name,
        description: formData.description,
        rating: formData.rating,
        image_url: formData.imageUrl,
        latitude: formData.latitude,
        longitude: formData.longitude,
        tags: formData.tags,
        price: formData.price ? parseFloat(formData.price) : null,
        meal_date_time: formData.mealDateTime ? new Date(formData.mealDateTime).toISOString() : null,
        meal_type: formData.mealType || null,
        notes: formData.notes || null,
        user_id: user.id,
      };

      let error;
      
      if (isEditing && editingMeal) {
        // Update existing meal
        const { error: updateError } = await supabase
          .from('meals')
          .update(mealData)
          .eq('id', editingMeal.id)
          .eq('user_id', user.id); // Ensure user owns the meal
        error = updateError;
      } else {
        // Insert new meal
        const { error: insertError } = await supabase
          .from('meals')
          .insert([mealData]);
        error = insertError;
      }

      if (error) {
        console.error(`Error ${isEditing ? 'updating' : 'adding'} meal:`, error);
        toast({
          title: "Error",
          description: `Failed to ${isEditing ? 'update' : 'add'} meal. Please try again.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: `Meal ${isEditing ? 'updated' : 'added'} successfully!`,
        });
        
        if (isEditing && onEditComplete) {
          onEditComplete();        } else {
          // Reset form for new meal
          setFormData({
            restaurant: "",
            name: "",
            description: "",
            rating: 0,
            imageUrl: "",
            latitude: null,
            longitude: null,
            tags: [],
            price: "",
            mealDateTime: new Date().toISOString().slice(0, 16),
            mealType: "",
            notes: "",
          });
          onMealAdded();
        }
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} meal:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} meal. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: { name: string; latitude: number; longitude: number }) => {
    setFormData(prev => ({
      ...prev,
      restaurant: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };
  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTakePhoto = async () => {
    try {
      const photoDataUrl = await takePhoto();
      if (photoDataUrl) {
        setFormData(prev => ({
          ...prev,
          imageUrl: photoDataUrl,
        }));
        toast({
          title: "Photo captured!",
          description: "Photo has been added to your meal.",
        });
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Failed to take photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: "",
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">          <div className="space-y-2">
            <Label htmlFor="restaurant">Restaurant</Label>
            <RestaurantLocationSearch
              onSelect={handleLocationSelect}
              value={formData.latitude && formData.longitude ? {
                latitude: formData.latitude,
                longitude: formData.longitude
              } : null}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Meal Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Margherita Pizza"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the meal..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating
              rating={formData.rating}
              setRating={(rating) => setFormData(prev => ({ ...prev, rating }))}
            />
          </div>          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="e.g., $15.99"
            />
          </div>          <div className="space-y-2">
            <Label htmlFor="mealDateTime">Date & Time</Label>
            <Input
              id="mealDateTime"
              type="datetime-local"
              value={formData.mealDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, mealDateTime: e.target.value }))}
              className="w-full"
            />
            <div className="text-xs text-gray-500">
              When did you have this meal?
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={formData.mealType} onValueChange={(value) => setFormData(prev => ({ ...prev, mealType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                <SelectItem value="lunch">☀️ Lunch</SelectItem>
                <SelectItem value="dinner">🌙 Dinner</SelectItem>
                <SelectItem value="snack">🍿 Snack</SelectItem>
                <SelectItem value="dessert">🍰 Dessert</SelectItem>
                <SelectItem value="drink">🥤 Drink</SelectItem>
                <SelectItem value="other">🍽️ Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this meal (dietary restrictions, special occasion, cooking method, etc.)"
              rows={3}
            />
          </div>          <div className="space-y-2">
            <Label>Photo</Label>
            {formData.imageUrl ? (
              <div className="space-y-2">
                <div className="relative">
                  <img
                    src={formData.imageUrl}
                    alt="Meal preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemovePhoto}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTakePhoto}
                  disabled={cameraLoading}
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {cameraLoading ? "Taking Photo..." : "Take New Photo"}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTakePhoto}
                  disabled={cameraLoading}
                  className="w-full h-32 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {cameraLoading ? "Taking Photo..." : (isNativeApp ? "Take Photo" : "Select Photo")}
                    </span>
                  </div>
                </Button>
                {!isNativeApp && (
                  <div className="text-xs text-gray-500 text-center">
                    Or enter image URL manually:
                  </div>
                )}
                {!isNativeApp && (
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                )}
              </div>
            )}
            {cameraError && (
              <div className="text-sm text-red-500">
                {cameraError}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1 text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleTagAdd(input.value);
                  input.value = '';
                }}
              >
                Add Tag
              </Button>
            </div>
          </div>          <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600">
            {loading ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Meal" : "Add Meal")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MealForm;
