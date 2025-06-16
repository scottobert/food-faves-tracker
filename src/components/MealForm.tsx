import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import StarRating from "./StarRating";
import RestaurantLocationSearch from "./RestaurantLocationSearch";

interface MealFormProps {
  onMealAdded: () => void;
}

const MealForm = ({ onMealAdded }: MealFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    restaurant: "",
    name: "",
    description: "",
    rating: 0,
    imageUrl: "",
    latitude: null as number | null,
    longitude: null as number | null,
    tags: [] as string[],
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add a meal.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('meals')
        .insert([
          {
            restaurant: formData.restaurant,
            name: formData.name,
            description: formData.description,
            rating: formData.rating,
            image_url: formData.imageUrl,
            latitude: formData.latitude,
            longitude: formData.longitude,
            tags: formData.tags,
            price: formData.price ? parseFloat(formData.price) : null,
            user_id: user.id,
          }
        ]);

      if (error) {
        console.error('Error adding meal:', error);
        toast({
          title: "Error",
          description: "Failed to add meal. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Meal added successfully!",
        });
        // Reset form
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
        });
        onMealAdded();
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      toast({
        title: "Error",
        description: "Failed to add meal. Please try again.",
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="restaurant">Restaurant</Label>
            <RestaurantLocationSearch
              onSelect={handleLocationSelect}
              value={formData.latitude && formData.longitude ? {
                latitude: formData.latitude,
                longitude: formData.longitude
              } : null}
            />
            {formData.restaurant && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <strong>Selected:</strong> {formData.restaurant}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => setFormData(prev => ({ ...prev, restaurant: "", latitude: null, longitude: null }))}
                >
                  Clear
                </Button>
              </div>
            )}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="e.g., $15.99"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
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
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600">
            {loading ? "Adding..." : "Add Meal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MealForm;
