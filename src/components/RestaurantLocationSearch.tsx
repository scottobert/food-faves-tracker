
import React, { useState } from "react";

type SearchResult = {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
};

interface RestaurantLocationSearchProps {
  mapboxToken: string;
  value?: { latitude: number; longitude: number } | null;
  onSelect: (loc: { latitude: number; longitude: number; name: string }) => void;
}

const RestaurantLocationSearch: React.FC<RestaurantLocationSearchProps> = ({
  mapboxToken,
  value,
  onSelect,
}) => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!input.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          input
        )}.json?access_token=${mapboxToken}&types=poi&limit=5`
      );
      const data = await res.json();
      setResults(data.features || []);
    } catch (e) {
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          className="w-full border rounded px-3 py-2"
          placeholder="Search for restaurant (by name, address)..."
          type="text"
        />
        <button
          type="button"
          className="bg-blue-700 hover:bg-blue-900 text-white rounded px-3 py-1"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      <ul className="mt-2">
        {loading && <li className="text-sm text-gray-500">Searching...</li>}
        {!loading &&
          results.map(r => (
            <li key={r.id}>
              <button
                type="button"
                className="w-full text-left py-2 px-2 rounded hover:bg-slate-100"
                onClick={() =>
                  onSelect({
                    latitude: r.center[1],
                    longitude: r.center[0],
                    name: r.place_name,
                  })
                }
              >
                <span className="font-medium">{r.place_name}</span>
              </button>
            </li>
          ))}
      </ul>
      {value && (
        <div className="text-xs mt-2 text-gray-700">
          Location selected: <b>{value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}</b>
        </div>
      )}
    </div>
  );
};

export default RestaurantLocationSearch;
