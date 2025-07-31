"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocationPoint } from '@/types/api';
import { MapPin } from 'lucide-react';

// Fix for default Leaflet icon path issue with bundlers like Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationGraphProps {
  locations: LocationPoint[];
}

export const LocationGraph: React.FC<LocationGraphProps> = ({ locations }) => {
  // Center the map on the first location or a default location
  const mapCenter: L.LatLngExpression = locations.length > 0
    ? [locations[0].lat, locations[0].lng]
    : [3.8480, 11.5021]; // Default to Yaoundé, Cameroon

  if (locations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center p-4">
        <div>
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium text-foreground">No Location Data</h3>
          <p className="text-sm text-muted-foreground">
            This analysis set does not contain any geographic information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((point, index) => (
          <Marker key={index} position={[point.lat, point.lng]}>
            <Popup>
              Type: {point.type} <br />
              Time: {new Date(point.timestamp).toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};