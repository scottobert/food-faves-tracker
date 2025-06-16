
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCapacitorGeolocation } from "@/hooks/useCapacitorGeolocation";
import { MapPin, Search, Navigation, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface RestaurantLocationSearchProps {
  value?: { latitude: number; longitude: number } | null;
  onSelect: (loc: { latitude: number; longitude: number; name: string }) => void;
}

const RestaurantLocationSearch: React.FC<RestaurantLocationSearchProps> = ({
  value,
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const { location, error: locationError, getCurrentLocation, isLoading: locationLoading, isNativeApp } = useCapacitorGeolocation();
  const { toast } = useToast();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-search when query changes (with debounce)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length > 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchRestaurants(query);
      }, 500);
    } else {
      setRestaurants([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, location]);
  const searchRestaurants = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      let results = await searchWithNominatim(searchQuery);
      
      // If no results found with the original query, try a broader search
      if (results.length === 0 && !searchQuery.toLowerCase().includes('restaurant')) {
        console.log('No results found, trying broader search...');
        results = await searchWithNominatim(searchQuery + ' food');
      }
      
      // If still no results, try just the search term without location bias
      if (results.length === 0 && location) {
        console.log('Still no results, trying global search...');
        results = await searchWithNominatimGlobal(searchQuery);
      }
      
      setRestaurants(results);
      setShowResults(true);
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: `No restaurants found for "${searchQuery}". Try a different search term.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error searching restaurants:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for restaurants. Please try again.",
        variant: "destructive",
      });
      setRestaurants([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchWithNominatimGlobal = async (searchQuery: string): Promise<Restaurant[]> => {
    // Global search without location bias
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=15&addressdetails=1&extratags=1`;
    
    console.log('Global search with URL:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FoodFavesTracker/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Global search failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Global search results:', data);
    
    // Same filtering logic as the main search
    const filteredResults = data.filter((item: any) => {
      const amenity = item.extratags?.amenity || item.class;
      const cuisine = item.extratags?.cuisine;
      const name = item.display_name.toLowerCase();
      
      const foodKeywords = ['restaurant', 'cafe', 'bar', 'pub', 'fast_food', 'food_court', 'pizza', 'bakery', 'bistro', 'diner', 'grill', 'kitchen'];
      const isFoodPlace = foodKeywords.some(keyword => 
        amenity?.includes(keyword) || 
        item.class?.includes(keyword) ||
        name.includes(keyword) ||
        cuisine
      );
      
      const isCommercial = item.class === 'amenity' || item.class === 'shop' || item.class === 'tourism';
      
      return isFoodPlace || (searchQuery.toLowerCase().includes('restaurant') && isCommercial);
    });

    return filteredResults.map((item: any) => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      let distance = undefined;
      
      if (location) {
        distance = calculateDistance(location.latitude, location.longitude, lat, lon);
      }

      let cleanName = item.display_name.split(',')[0].trim();
      if (item.extratags?.name && item.extratags.name.length < cleanName.length) {
        cleanName = item.extratags.name;
      }

      return {
        id: item.place_id.toString(),
        name: cleanName,
        address: item.display_name,
        latitude: lat,
        longitude: lon,
        distance
      };
    }).sort((a: Restaurant, b: Restaurant) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return a.name.localeCompare(b.name);
    });
  };
  const searchWithNominatim = async (searchQuery: string): Promise<Restaurant[]> => {
    // Build search URL with location bias if available
    let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=15&addressdetails=1&extratags=1`;
    
    if (location) {
      url += `&lat=${location.latitude}&lon=${location.longitude}&bounded=1&viewbox=${location.longitude - 0.1},${location.latitude + 0.1},${location.longitude + 0.1},${location.latitude - 0.1}`;
    }

    console.log('Searching with URL:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FoodFavesTracker/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw search results:', data);
    
    // More flexible filtering - include restaurants and other food-related places
    const filteredResults = data.filter((item: any) => {
      const amenity = item.extratags?.amenity || item.class;
      const cuisine = item.extratags?.cuisine;
      const name = item.display_name.toLowerCase();
      
      // Check for food-related keywords in amenity, class, or name
      const foodKeywords = ['restaurant', 'cafe', 'bar', 'pub', 'fast_food', 'food_court', 'pizza', 'bakery', 'bistro', 'diner', 'grill', 'kitchen'];
      const isFoodPlace = foodKeywords.some(keyword => 
        amenity?.includes(keyword) || 
        item.class?.includes(keyword) ||
        name.includes(keyword) ||
        cuisine
      );
      
      // Also include places that have "restaurant" in the search query and are commercial
      const isCommercial = item.class === 'amenity' || item.class === 'shop' || item.class === 'tourism';
      
      return isFoodPlace || (searchQuery.toLowerCase().includes('restaurant') && isCommercial);
    });

    console.log('Filtered results:', filteredResults);

    const restaurants = filteredResults.map((item: any) => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      let distance = undefined;
      
      if (location) {
        distance = calculateDistance(location.latitude, location.longitude, lat, lon);
      }

      // Extract a clean name from the display_name
      let cleanName = item.display_name.split(',')[0].trim();
      
      // If the name seems too generic, try to get a better name from tags
      if (item.extratags?.name && item.extratags.name.length < cleanName.length) {
        cleanName = item.extratags.name;
      }

      return {
        id: item.place_id.toString(),
        name: cleanName,
        address: item.display_name,
        latitude: lat,
        longitude: lon,
        distance
      };
    });

    console.log('Final restaurant results:', restaurants);

    return restaurants.sort((a: Restaurant, b: Restaurant) => {
      // Sort by distance if available, otherwise by name
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return a.name.localeCompare(b.name);
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setQuery(restaurant.name);
    setShowResults(false);
    onSelect({
      name: restaurant.name,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    });
  };
  const searchNearby = async () => {
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please enable location access to search nearby restaurants.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // Search for restaurants near current location using specific amenity query
      const nearbyUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=20&addressdetails=1&extratags=1&lat=${location.latitude}&lon=${location.longitude}&bounded=1&viewbox=${location.longitude - 0.05},${location.latitude + 0.05},${location.longitude + 0.05},${location.latitude - 0.05}&q=amenity:restaurant OR amenity:cafe OR amenity:fast_food OR amenity:bar OR amenity:pub`;
      
      console.log('Nearby search URL:', nearbyUrl);
      
      const response = await fetch(nearbyUrl, {
        headers: {
          'User-Agent': 'FoodFavesTracker/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Nearby search failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Nearby search raw results:', data);
      
      // If the specific amenity search doesn't work, try a broader approach
      let results = data;
      if (results.length === 0) {
        console.log('No results with amenity search, trying broader nearby search...');
        const broadUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=20&addressdetails=1&extratags=1&lat=${location.latitude}&lon=${location.longitude}&bounded=1&viewbox=${location.longitude - 0.05},${location.latitude + 0.05},${location.longitude + 0.05},${location.latitude - 0.05}&q=restaurant`;
        
        const broadResponse = await fetch(broadUrl, {
          headers: {
            'User-Agent': 'FoodFavesTracker/1.0'
          }
        });
        
        if (broadResponse.ok) {
          results = await broadResponse.json();
          console.log('Broad nearby search results:', results);
        }
      }
      
      // Filter and process results
      const filteredResults = results.filter((item: any) => {
        const amenity = item.extratags?.amenity || item.class;
        const cuisine = item.extratags?.cuisine;
        const name = item.display_name?.toLowerCase() || '';
        
        const foodKeywords = ['restaurant', 'cafe', 'bar', 'pub', 'fast_food', 'food_court', 'pizza', 'bakery', 'bistro', 'diner', 'grill', 'kitchen'];
        const isFoodPlace = foodKeywords.some(keyword => 
          amenity?.includes(keyword) || 
          item.class?.includes(keyword) ||
          name.includes(keyword) ||
          cuisine
        );
        
        return isFoodPlace;
      });

      const restaurants = filteredResults.map((item: any) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const distance = calculateDistance(location.latitude, location.longitude, lat, lon);

        let cleanName = item.display_name?.split(',')[0]?.trim() || 'Unknown Restaurant';
        if (item.extratags?.name && item.extratags.name.length < cleanName.length) {
          cleanName = item.extratags.name;
        }

        return {
          id: item.place_id?.toString() || Math.random().toString(),
          name: cleanName,
          address: item.display_name || 'Address unavailable',
          latitude: lat,
          longitude: lon,
          distance
        };
      }).sort((a: Restaurant, b: Restaurant) => a.distance! - b.distance!);

      console.log('Final nearby restaurants:', restaurants);
      
      setRestaurants(restaurants);
      setShowResults(true);
      setQuery(""); // Clear search query to show we're showing nearby results
      
      if (restaurants.length === 0) {
        toast({
          title: "No Nearby Restaurants",
          description: "No restaurants found near your location. Try searching by name instead.",
          variant: "default",
        });
      } else {
        toast({
          title: "Found Nearby Restaurants",
          description: `Found ${restaurants.length} restaurants near you.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error searching nearby restaurants:', error);
      toast({
        title: "Search Error",
        description: "Failed to find nearby restaurants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearSelection = () => {
    setSelectedRestaurant(null);
    setQuery("");
    setRestaurants([]);
    setShowResults(false);
  };

  return (
    <div className="space-y-4 relative">
      <div>
        <Label htmlFor="restaurant-search">Restaurant Name</Label>
        <div className="relative mt-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <Input
            id="restaurant-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for restaurants..."
            className="pl-10 pr-10"
            onFocus={() => setShowResults(restaurants.length > 0)}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && restaurants.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              type="button"
              onClick={() => handleRestaurantSelect(restaurant)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{restaurant.name}</div>
                  <div className="text-sm text-gray-500 truncate">{restaurant.address}</div>
                </div>
                {restaurant.distance && (
                  <div className="flex items-center text-xs text-gray-400 ml-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {restaurant.distance < 1 
                      ? `${(restaurant.distance * 1000).toFixed(0)}m`
                      : `${restaurant.distance.toFixed(1)}km`
                    }
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={searchNearby}
          disabled={isSearching || !location}
          variant="outline"
          className="flex-1"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Find Nearby
        </Button>
          {locationError && (
          <Button
            type="button"
            onClick={getCurrentLocation}
            variant="outline"
            size="sm"
            title="Retry location access"
            disabled={locationLoading}
          >
            {locationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Current Selection Display */}
      {selectedRestaurant && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-green-800">{selectedRestaurant.name}</div>
              <div className="text-sm text-green-600 truncate">{selectedRestaurant.address}</div>
              {selectedRestaurant.distance && (
                <div className="text-xs text-green-500 mt-1">
                  Distance: {selectedRestaurant.distance < 1 
                    ? `${(selectedRestaurant.distance * 1000).toFixed(0)} meters`
                    : `${selectedRestaurant.distance.toFixed(1)} km`
                  }
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-green-600 hover:text-green-800"
            >
              Change
            </Button>
          </div>
        </div>
      )}

      {/* Location Status */}
      {locationError && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          <strong>Location access denied:</strong> Enable location for better search results and nearby restaurants.
        </div>
      )}
    </div>
  );
};

export default RestaurantLocationSearch;
