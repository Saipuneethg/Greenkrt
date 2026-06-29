import { useState, useEffect, useRef } from 'react';

export default function LocationInput({ value, onChange, placeholder = "Search location...", className = "" }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocation = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to fetch locations');
      
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError('Error fetching locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setQuery(newVal);
    onChange(newVal); // Notify parent immediately so they hold the typed value
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (newVal.trim().length > 2) {
      setIsDropdownOpen(true);
      timeoutRef.current = setTimeout(() => {
        searchLocation(newVal);
      }, 500);
    } else {
      setResults([]);
      setIsDropdownOpen(false);
    }
  };

  const handleSelectLocation = (loc) => {
    // We try to extract a short friendly name, otherwise use the display_name
    const parts = loc.display_name.split(',');
    const shortName = parts.slice(0, 2).join(',').trim();
    
    setQuery(shortName);
    onChange(shortName);
    setIsDropdownOpen(false);
    
    // Optionally save to localStorage if user wants global access
    localStorage.setItem('userLocation', JSON.stringify({
      city: shortName,
      lat: loc.lat,
      lng: loc.lon
    }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsDropdownOpen(true);
      return;
    }

    setIsSearching(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error('Failed to reverse geocode');
          
          const data = await res.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            const shortName = parts.slice(0, 2).join(',').trim();
            
            setQuery(shortName);
            onChange(shortName);
            
            localStorage.setItem('userLocation', JSON.stringify({
              city: shortName,
              lat: latitude,
              lng: longitude
            }));
          }
        } catch (err) {
          console.error(err);
          setError('Could not get address from coordinates.');
        } finally {
          setIsSearching(false);
        }
      },
      (err) => {
        console.error(err);
        setError("Location permission denied. Please enable it in your browser settings.");
        setIsDropdownOpen(true);
        setIsSearching(false);
      }
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setIsDropdownOpen(true); }}
          placeholder={placeholder}
          className={className || "w-full h-10 px-3 pr-10 border border-[#bfcaba] rounded-lg focus:outline-none focus:border-[#0d631b]"}
        />
        <button
          type="button"
          onClick={handleDetectLocation}
          className="absolute right-2 text-[#0d631b] hover:text-[#0a4a14] p-1 flex items-center justify-center transition-colors"
          title="Detect My Location"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
      </div>
      
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#bfcaba] rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {isSearching && (
            <div className="p-3 text-sm text-[#40493d] flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              Searching...
            </div>
          )}
          
          {error && !isSearching && (
            <div className="p-3 text-sm text-[#ba1a1a]">{error}</div>
          )}
          
          {!isSearching && results.length === 0 && query.trim().length > 2 && (
            <div className="p-3 text-sm text-[#40493d]">No locations found.</div>
          )}
          
          {!isSearching && results.map((loc) => (
            <div
              key={loc.place_id}
              onClick={() => handleSelectLocation(loc)}
              className="p-3 hover:bg-[#f3fcef] cursor-pointer text-sm border-b border-gray-100 last:border-0 transition-colors flex items-start gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-[#40493d] shrink-0 mt-0.5">location_on</span>
              <span className="text-[#1a1c1c]">{loc.display_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
