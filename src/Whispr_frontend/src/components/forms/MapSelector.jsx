import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Check, MapPinned, Loader2 } from 'lucide-react';
import Button from '../ui/Button';

const MapSelector = ({ onLocationSelect, initialAddress = '', initialCoordinates = null }) => {
  const mapRef = useRef(null);
  const [searchValue, setSearchValue] = useState(initialAddress);
  const [selectedLocation, setSelectedLocation] = useState({
    address: initialAddress,
    coordinates: initialCoordinates || { lat: 20.5937, lng: 78.9629 } // Default to India
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const leafletMap = useRef(null);
  const leafletMarker = useRef(null);
  const [mapError, setMapError] = useState(false);
  
  // Store initial location to avoid losing it during rendering
  const initialLocationRef = useRef({
    address: initialAddress,
    coordinates: initialCoordinates || { lat: 20.5937, lng: 78.9629 }
  });

  // Initialize Leaflet Map (free alternative to Google Maps)
  useEffect(() => {
    let isMounted = true;
    
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      try {
        const linkElement = document.createElement('link');
        linkElement.id = 'leaflet-css';
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(linkElement);
      } catch (error) {
        console.warn('Failed to load Leaflet CSS:', error);
      }
    }

    // Load Leaflet JS
    const loadLeaflet = async () => {
      // If Leaflet is already loaded
      if (window.L) {
        if (isMounted) initMap();
        return;
      }

      try {
        // Load Leaflet script
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        
        // Create a promise to wait for script load
        const scriptLoadPromise = new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
        
        document.head.appendChild(script);
        await scriptLoadPromise;
        if (isMounted) initMap();
      } catch (error) {
        console.warn('Failed to load Leaflet:', error);
        if (isMounted) {
          setIsLoading(false);
          setMapError(true);
        }
      }
    };
    
    // Short timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      loadLeaflet().catch(err => {
        console.warn('Failed to initialize map:', err);
        if (isMounted) {
          setIsLoading(false);
          setMapError(true);
        }
      });
    }, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      // Cleanup map when component unmounts
      if (leafletMap.current) {
        try {
          leafletMap.current.remove();
        } catch (e) {
          console.warn('Error cleaning up map:', e);
        }
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.L) return;

    try {
      // Check if map is already initialized
      if (leafletMap.current) {
        try {
          leafletMap.current.remove();
        } catch (e) {
          console.warn('Error removing existing map:', e);
        }
      }
      
      // Create map instance with error catcher
      try {
        // Use coordinates from state or initialRef
        const coordinates = selectedLocation.coordinates || initialLocationRef.current.coordinates;
        
        const map = window.L.map(mapRef.current, {
          // Add options to prevent common errors
          attributionControl: false,
          zoomControl: true,
          doubleClickZoom: true,
          scrollWheelZoom: true,
        }).setView(
          [coordinates.lat, coordinates.lng], 
          12
        );
        
        // Add dark theme tile layer with error handling
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          errorTileUrl: 'https://i.imgur.com/44w1cFj.png' // Simple gray placeholder for error tiles
        }).addTo(map);

        // Create simple marker icon to avoid rendering issues
        const markerIcon = window.L.divIcon({
          html: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="white" fill="#7c3aed" stroke-width="2">
                  <circle cx="12" cy="10" r="8" />
                  <line x1="12" y1="10" x2="12" y2="21" />
                </svg>`,
          className: 'custom-leaflet-marker',
          iconSize: [24, 36],
          iconAnchor: [12, 36]
        });
        
        // Create marker
        const marker = window.L.marker(
          [coordinates.lat, coordinates.lng],
          { icon: markerIcon, draggable: true }
        ).addTo(map);
        
        // Store references
        leafletMap.current = map;
        leafletMarker.current = marker;
        
        // Add marker drag event with error handling
        marker.on('dragend', () => {
          try {
            const position = marker.getLatLng();
            const newCoordinates = { 
              lat: position.lat, 
              lng: position.lng 
            };
            updateLocationFromCoordinates(newCoordinates);
          } catch (e) {
            console.warn('Error handling marker drag:', e);
          }
        });
        
        // Add map click event with error handling
        map.on('click', (e) => {
          try {
            const newCoordinates = { 
              lat: e.latlng.lat, 
              lng: e.latlng.lng 
            };
            marker.setLatLng([newCoordinates.lat, newCoordinates.lng]);
            updateLocationFromCoordinates(newCoordinates);
          } catch (e) {
            console.warn('Error handling map click:', e);
          }
        });
        
        // Add invalidateSize on window resize to prevent display issues
        const handleResize = () => {
          if (map) {
            try {
              map.invalidateSize();
            } catch (e) {
              console.warn('Error handling resize:', e);
            }
          }
        };
        
        window.addEventListener('resize', handleResize);
        
        // Clean up the event listener on map removal
        map.on('remove', () => {
          window.removeEventListener('resize', handleResize);
        });
        
        setIsLoading(false);
        setMapError(false);
        
        // If we have coordinates, fetch nearby places
        if (coordinates && coordinates.lat) {
          fetchNearbyPlaces(coordinates);
        }
        
        // Fix map rendering issues by triggering a resize after a short delay
        setTimeout(() => {
          try {
            map.invalidateSize();
          } catch (e) {
            console.warn('Error invalidating map size:', e);
          }
        }, 200);
      } catch (mapError) {
        console.warn('Error creating map instance:', mapError);
        setIsLoading(false);
        setMapError(true);
      }
    } catch (error) {
      console.warn('Error initializing map:', error);
      setIsLoading(false);
      setMapError(true);
    }
  };

  const updateLocationFromCoordinates = (coordinates) => {
    // First update coordinates immediately for better UX, regardless of geocoding success
    const immediateLocation = {
      address: selectedLocation.address || `Location at ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
      coordinates
    };
    
    setSelectedLocation(immediateLocation);
    
    // Also call onLocationSelect immediately to make sure parent components get the coordinates
    // even if the geocoding request fails
    if (onLocationSelect) {
      onLocationSelect(immediateLocation);
    }
    
    // Set a timeout to avoid too many requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    // Use Nominatim for reverse geocoding (free)
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coordinates.lat}&lon=${coordinates.lng}&format=json`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WhisprApp/1.0' // Best practice when using Nominatim
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        clearTimeout(timeoutId);
        if (data && data.display_name) {
          const address = data.display_name;
          const updatedLocation = {
            address,
            coordinates
          };
          
          setSelectedLocation(updatedLocation);
          setSearchValue(address);
          
          // Update again with the proper address
          if (onLocationSelect) {
            onLocationSelect(updatedLocation);
          }
          
          // Fetch nearby places
          fetchNearbyPlaces(coordinates);
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.warn("Geocoding request timed out");
        } else {
          console.warn("Error during reverse geocoding:", error);
        }
        
        // Location was already updated with coordinates, no need to do it again
      });
  };

  const handleSearchSubmit = (e) => {
    // Prevent form submission - this prevents page reload
    e.preventDefault();
    
    // Immediately stop if empty search
    const trimmedSearch = searchValue.trim();
    if (!trimmedSearch) return;

    // Show loading state for search button specifically
    setIsSearching(true);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    // Use Nominatim for geocoding (free)
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmedSearch)}&format=json&limit=1`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WhisprApp/1.0' // Best practice when using Nominatim
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        clearTimeout(timeoutId);
        setIsSearching(false);
        
        if (data && data.length > 0) {
          const place = data[0];
          const newCoordinates = { 
            lat: parseFloat(place.lat), 
            lng: parseFloat(place.lon) 
          };
          
          // Update location immediately regardless of map status
          const updatedLocation = {
            address: place.display_name,
            coordinates: newCoordinates
          };
          
          setSelectedLocation(updatedLocation);
          
          if (onLocationSelect) {
            onLocationSelect(updatedLocation);
          }
          
          // Then try to update the map if available
          if (leafletMap.current && leafletMarker.current) {
            try {
              leafletMap.current.setView([newCoordinates.lat, newCoordinates.lng], 16);
              leafletMarker.current.setLatLng([newCoordinates.lat, newCoordinates.lng]);
              fetchNearbyPlaces(newCoordinates);
            } catch (e) {
              console.warn("Error updating map view:", e);
            }
          }
        } else {
          // Provide better feedback - no alert
          setSearchValue(prevValue => prevValue + " (not found)");
          setTimeout(() => {
            setSearchValue(trimmedSearch);
          }, 1500);
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        setIsSearching(false);
        
        console.warn("Error during geocoding search:", error);
        // Don't use alerts - provide inline feedback
        setSearchValue(prevValue => prevValue + " (search failed)");
        setTimeout(() => {
          setSearchValue(trimmedSearch);
        }, 1500);
      });
  };

  const fetchNearbyPlaces = (coordinates) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    // Use Nominatim to find nearby POIs
    fetch(`https://nominatim.openstreetmap.org/search?lat=${coordinates.lat}&lon=${coordinates.lng}&format=json&addressdetails=1&limit=5`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WhisprApp/1.0' // Best practice when using Nominatim
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        clearTimeout(timeoutId);
        if (data && data.length > 0) {
          // Filter to unique places by name
          const uniquePlaces = [];
          const nameSet = new Set();
          
          data.forEach(place => {
            if (place.name && !nameSet.has(place.name)) {
              nameSet.add(place.name);
              uniquePlaces.push(place);
            }
          });
          
          setNearbyPlaces(uniquePlaces.slice(0, 3));
        } else {
          setNearbyPlaces([]);
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (error.name !== 'AbortError') {
          console.warn("Error fetching nearby places:", error);
        }
        setNearbyPlaces([]);
      });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      // Use non-modal feedback
      setSearchValue("Geolocation not supported by your browser");
      setTimeout(() => setSearchValue(""), 2000);
      return;
    }
    
    setIsLoading(true);
    
    // Set a timeout for the geolocation request
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      // Use non-modal feedback
      setSearchValue("Location request timed out");
      setTimeout(() => setSearchValue(""), 2000);
    }, 10000);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Update location immediately regardless of map status
        const updatedLocation = {
          address: `Current Location (${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)})`,
          coordinates
        };
        
        setSelectedLocation(updatedLocation);
        if (onLocationSelect) {
          onLocationSelect(updatedLocation);
        }
        
        // Then try to update the map
        if (leafletMap.current && leafletMarker.current) {
          try {
            leafletMap.current.setView([coordinates.lat, coordinates.lng], 16);
            leafletMarker.current.setLatLng([coordinates.lat, coordinates.lng]);
            updateLocationFromCoordinates(coordinates);
          } catch (e) {
            console.warn('Error updating map with current location:', e);
          }
        }
        
        setIsLoading(false);
      },
      (error) => {
        clearTimeout(timeoutId);
        console.warn('Error getting current location:', error);
        
        let errorMessage = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'Could not get location';
        }
        
        // Use non-modal feedback
        setSearchValue(errorMessage);
        setTimeout(() => setSearchValue(""), 2000);
        
        setIsLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Use onSubmit on the form element which correctly prevents default */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
          <input
            id="map-search-input"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          />
        </div>
        <Button 
          type="submit" 
          variant="secondary" 
          size="sm"
          disabled={isSearching || !searchValue.trim()}
        >
          {isSearching ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </form>
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="secondary" 
          size="sm"
          onClick={handleUseCurrentLocation}
          className="text-xs"
          disabled={isLoading}
        >
          <MapPin className="h-3 w-3 mr-1" />
          Use Current Location
        </Button>
        <Button 
          type="button" 
          variant="primary" 
          size="sm"
          onClick={() => onLocationSelect && onLocationSelect(selectedLocation)}
          className="text-xs ml-auto"
        >
          <Check className="h-3 w-3 mr-1" />
          Set Location
        </Button>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg overflow-hidden border border-slate-700 relative"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-gray-400 flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading map...
            </div>
          </div>
        )}
        
        {mapError && (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-10">
            <div className="text-center p-4">
              <div className="text-red-400 mb-2">Unable to load map</div>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  setIsLoading(true);
                  setMapError(false);
                  setTimeout(initMap, 500);
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {selectedLocation.coordinates && (
        <div className="px-3 py-2 bg-slate-800 rounded-lg text-sm">
          <div className="flex flex-col gap-1">
            <div className="flex items-center text-purple-400 font-medium border-b border-slate-700 pb-1 mb-1">
              <MapPinned className="h-4 w-4 mr-2" />
              Selected Location
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 mr-2">Address:</span>
              <span className="text-gray-300">{selectedLocation.address}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Coordinates:</span>
              <span className="text-gray-300">
                {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {nearbyPlaces.length > 0 && (
        <div className="px-3 py-2 bg-slate-800 rounded-lg text-sm">
          <div className="flex items-center text-purple-400 font-medium border-b border-slate-700 pb-1 mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            Nearby Places
          </div>
          <div className="space-y-2">
            {nearbyPlaces.map((place, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectNearbyPlace(place)}
                className="block w-full text-left px-2 py-1.5 rounded hover:bg-slate-700 transition-colors"
              >
                <div className="text-gray-300">{place.name || place.display_name.split(',')[0]}</div>
                <div className="text-xs text-gray-500 truncate">{place.display_name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSelector;