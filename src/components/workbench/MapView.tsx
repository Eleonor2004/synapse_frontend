import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Re-import the LocationPoint interface to use in this component
interface LocationPoint {
  id: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  interactionType: 'call' | 'sms';
}

interface MapViewProps {
  locations: LocationPoint[];
  paths: Map<string, LocationPoint[]>;
  selectedIndividual: string | null;
  getColor: (index: number) => string;
}

// This helper component will automatically adjust the map's view.
const MapUpdater = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

// Custom icon creator
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<span style="background-color: ${color}; width: 1rem; height: 1rem; border-radius: 50%; display: block; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></span>`,
    className: 'bg-transparent border-0',
    iconSize: [16, 16],
  });
};

export const MapView: React.FC<MapViewProps> = ({ locations, paths, selectedIndividual, getColor }) => {

  // Calculate the map bounds to fit all markers
  const bounds: L.LatLngBoundsExpression = useMemo(() => {
    if (locations.length === 0) return [];
    return locations.map(loc => [loc.latitude, loc.longitude]);
  }, [locations]);

  // Create a memoized map of colors for each individual
  const colorsByIndividual = useMemo(() => {
    const colorMap = new Map<string, string>();
    const individuals = Array.from(paths.keys());
    individuals.forEach((phone, index) => {
      colorMap.set(phone, getColor(index));
    });
    return colorMap;
  }, [paths, getColor]);

  return (
    <MapContainer center={[5.63, 13.35]} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Draw paths for each individual */}
      {Array.from(paths.entries()).map(([phoneNumber, pathPoints]) => {
        const pathCoords = pathPoints.map(p => [p.latitude, p.longitude] as L.LatLngExpression);
        const color = colorsByIndividual.get(phoneNumber) || '#3388ff';
        const isSelected = selectedIndividual === phoneNumber;
        const isVisible = !selectedIndividual || isSelected;

        return (
          <Polyline
            key={phoneNumber}
            pathOptions={{
              color: color,
              weight: isSelected ? 5 : 3,
              opacity: isVisible ? (isSelected ? 0.9 : 0.5) : 0.1
            }}
            positions={pathCoords}
          />
        );
      })}

      {/* Draw markers for each location point */}
      {locations.map((loc) => {
        const color = colorsByIndividual.get(loc.phoneNumber) || '#3388ff';
        const isSelected = selectedIndividual === loc.phoneNumber;
        const isVisible = !selectedIndividual || isSelected;

        return(
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={createCustomIcon(color)}
            opacity={isVisible ? 1 : 0.3}
          >
            <Popup>
              <div>
                <strong>{loc.phoneNumber}</strong><br />
                Type: {loc.interactionType.toUpperCase()}<br />
                Time: {loc.timestamp.toLocaleString()}
              </div>
            </Popup>
          </Marker>
        );
      })}

      <MapUpdater bounds={bounds} />
    </MapContainer>
  );
};