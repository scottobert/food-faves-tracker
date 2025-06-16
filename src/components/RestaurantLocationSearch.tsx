
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface RestaurantLocationSearchProps {
  mapboxToken?: string;
  value?: { latitude: number; longitude: number } | null;
  onSelect: (loc: { latitude: number; longitude: number; name: string }) => void;
}

const RestaurantLocationSearch: React.FC<RestaurantLocationSearchProps> = ({
  value,
  onSelect,
}) => {
  const [restaurantName, setRestaurantName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleSubmit = () => {
    if (restaurantName.trim()) {
      onSelect({
        name: restaurantName.trim(),
        latitude: latitude ? parseFloat(latitude) : 0,
        longitude: longitude ? parseFloat(longitude) : 0,
      });
      // Reset form
      setRestaurantName("");
      setLatitude("");
      setLongitude("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="restaurant-name">Restaurant Name</Label>
        <Input
          id="restaurant-name"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          placeholder="Enter restaurant name"
          className="mt-1"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="latitude">Latitude (optional)</Label>
          <Input
            id="latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g., 40.7128"
            type="number"
            step="any"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude (optional)</Label>
          <Input
            id="longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g., -74.0060"
            type="number"
            step="any"
            className="mt-1"
          />
        </div>
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!restaurantName.trim()}
        className="w-full"
        variant="outline"
      >
        Add Restaurant
      </Button>

      {value && (
        <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
          <strong>Current location:</strong> {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
        </div>
      )}
    </div>
  );
};

export default RestaurantLocationSearch;
