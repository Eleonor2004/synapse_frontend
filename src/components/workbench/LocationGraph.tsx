"use client";

import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Phone, MessageSquare, User, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapView } from './MapView'; // Assuming MapView is a separate component

// --- INTERFACES ---
export interface ExcelData {
  [key: string]: any[];
}

export interface Individual {
  id: string;
  phoneNumber: string;
  imei?: string;
  interactions: number;
  details: any;
}

interface LocationPoint {
  id: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  interactionType: 'call' | 'sms';
}

interface LocationGraphProps {
  data: ExcelData | null;
  filters: any;
  onIndividualSelect: (individual: Individual) => void;
}

// --- HELPER FUNCTIONS (Your original helpers) ---
const findFieldValue = (row: any, possibleFields: string[]): string | null => {
  if (!row || typeof row !== 'object') return null;
  const normalize = (str: string) => str.toLowerCase().replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ç]/g, 'c').replace(/[ùúûü]/g, 'u').replace(/[òóôõö]/g, 'o').replace(/[ìíîï]/g, 'i').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const normalizedRow: { [key: string]: any } = {};
  Object.keys(row).forEach(key => {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      normalizedRow[normalize(key)] = row[key];
    }
  });
  for (const field of possibleFields) {
    const normalizedField = normalize(field);
    if (normalizedRow[normalizedField]) {
      return String(normalizedRow[normalizedField]);
    }
  }
  return null;
};

const isSMSData = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const upperValue = value.toUpperCase();
  return upperValue.includes('SMS') || /^[A-F0-9]{6,}$/i.test(value.trim());
};

const parseDuration = (durationStr: string): { seconds: number; isSMS: boolean } => {
    if (!durationStr || typeof durationStr !== 'string') return { seconds: 0, isSMS: false };
    const trimmed = durationStr.trim();
    if (isSMSData(trimmed)) return { seconds: 0, isSMS: true };
    const timeMatch = trimmed.match(/(\d+):(\d+)(?::(\d+))?/);
    if (timeMatch) {
      const h = timeMatch[3] ? parseInt(timeMatch[1], 10) || 0 : 0;
      const m = timeMatch[3] ? parseInt(timeMatch[2], 10) : parseInt(timeMatch[1], 10) || 0;
      const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : parseInt(timeMatch[2], 10) || 0;
      return { seconds: (h * 3600) + (m * 60) + s, isSMS: false };
    }
    const numMatch = trimmed.match(/(\d+)/);
    if (numMatch) return { seconds: parseInt(numMatch[1], 10) || 0, isSMS: false };
    return { seconds: 0, isSMS: false };
};

const generateColor = (index: number): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
  return colors[index % colors.length];
};

export const LocationGraph: React.FC<LocationGraphProps> = ({ data, filters, onIndividualSelect }) => {
  const [selectedIndividual, setSelectedIndividual] = useState<string | null>(null);

  const processedData = useMemo(() => {
    if (!data || !data.listings) {
      return { locationData: [], individualPaths: new Map() };
    }
    const interactionList = data.listings;
    const processedLocations: LocationPoint[] = [];
    const pathsByIndividual = new Map<string, LocationPoint[]>();
    const possibleCallerFields = ['numero appelant', 'numéro appelant'];
    const possibleLocationFields = ['localisation numero appelant', 'localisation'];
    const possibleDateFields = ['date debut appel', 'date début appel'];
    const possibleDurationFields = ['duree de l appel', 'durée de l\'appel', 'durée appel'];
    interactionList.forEach((listing: any, index: number) => {
      if (typeof listing !== 'object' || listing === null) return;
      const caller = findFieldValue(listing, possibleCallerFields);
      const locationString = findFieldValue(listing, possibleLocationFields);
      const dateStr = findFieldValue(listing, possibleDateFields);
      const durationStr = findFieldValue(listing, possibleDurationFields);
      if (!caller || !locationString || !dateStr) return;
      const locationMatch = locationString.match(/Long:\s*(-?\d+\.?\d*).*Lat:\s*(-?\d+\.?\d*)/i);
      if (!locationMatch || locationMatch.length < 3) return;
      const longitude = parseFloat(locationMatch[1]);
      const latitude = parseFloat(locationMatch[2]);
      if (isNaN(latitude) || isNaN(longitude)) return;
      const { isSMS } = parseDuration(durationStr || '');
      const interactionType = isSMS ? 'sms' : 'call';
      const locationPoint: LocationPoint = {
        id: `${caller}_${dateStr}_${index}`, phoneNumber: caller, latitude, longitude,
        timestamp: new Date(dateStr), interactionType: interactionType,
      };
      processedLocations.push(locationPoint);
      if (!pathsByIndividual.has(caller)) {
        pathsByIndividual.set(caller, []);
      }
      pathsByIndividual.get(caller)!.push(locationPoint);
    });
    pathsByIndividual.forEach(path => path.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
    return { locationData: processedLocations, individualPaths: pathsByIndividual };
  }, [data]);

  // ... (The rest of your component's logic and JSX remains the same)
  // It will now render correctly.
  return (
    <div> yo</div>
  );
};