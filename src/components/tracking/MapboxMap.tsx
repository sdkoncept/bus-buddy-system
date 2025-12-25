import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Bus } from 'lucide-react';

interface BusLocation {
  id: string;
  registration_number: string;
  model: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  route?: {
    name: string;
    origin: string;
    destination: string;
  };
}

interface MapboxMapProps {
  buses: BusLocation[];
  selectedBusId: string;
  onBusSelect: (busId: string) => void;
  mapboxToken: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  buses, 
  selectedBusId, 
  onBusSelect,
  mapboxToken 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [36.8219, -1.2921], // Nairobi, Kenya
      zoom: 11,
      pitch: 0,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    map.current.addControl(
      new mapboxgl.FullscreenControl(),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      // Clean up markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update bus markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove old markers that are no longer in the buses array
    const currentBusIds = new Set(buses.map(b => b.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!currentBusIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    buses.forEach(bus => {
      if (markersRef.current[bus.id]) {
        // Update existing marker position with animation
        markersRef.current[bus.id].setLngLat([bus.lng, bus.lat]);
        
        // Update rotation
        const el = markersRef.current[bus.id].getElement();
        if (el) {
          el.style.transform = `rotate(${bus.heading}deg)`;
        }
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'bus-marker';
        el.innerHTML = `
          <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"/>
              <path d="M16 6v6"/>
              <path d="M2 12h20"/>
              <path d="M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/>
            </svg>
          </div>
        `;
        el.style.transform = `rotate(${bus.heading}deg)`;

        el.addEventListener('click', () => {
          onBusSelect(bus.id);
        });

        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: false,
          closeOnClick: false 
        }).setHTML(`
          <div class="p-2">
            <div class="font-semibold">${bus.registration_number}</div>
            <div class="text-sm text-gray-600">${bus.model}</div>
            <div class="text-sm mt-1">
              <span class="font-medium">${bus.speed} km/h</span>
            </div>
            ${bus.route ? `
              <div class="text-xs mt-1 text-gray-500">
                ${bus.route.origin} → ${bus.route.destination}
              </div>
            ` : ''}
          </div>
        `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([bus.lng, bus.lat])
          .setPopup(popup)
          .addTo(map.current!);

        // Show popup on hover
        el.addEventListener('mouseenter', () => {
          marker.togglePopup();
        });
        el.addEventListener('mouseleave', () => {
          marker.togglePopup();
        });

        markersRef.current[bus.id] = marker;
      }
    });
  }, [buses, mapLoaded, onBusSelect]);

  // Fly to selected bus
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedBusId) return;

    const selectedBus = buses.find(b => b.id === selectedBusId);
    if (selectedBus) {
      map.current.flyTo({
        center: [selectedBus.lng, selectedBus.lat],
        zoom: 14,
        duration: 1500,
      });

      // Show popup for selected bus
      const marker = markersRef.current[selectedBusId];
      if (marker && !marker.getPopup().isOpen()) {
        marker.togglePopup();
      }
    }
  }, [selectedBusId, buses, mapLoaded]);

  if (!mapboxToken) {
    return (
      <div className="h-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center p-8">
          <Bus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Mapbox Token Required</h3>
          <p className="text-sm text-muted-foreground">
            Please configure your Mapbox public token to enable live tracking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
