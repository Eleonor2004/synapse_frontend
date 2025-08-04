// src/components/workbench/LocationGraph.tsx

"use client";

import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Phone, MessageSquare, User, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapView } from './MapView';
import { ExcelData, Individual } from '@/app/[locale]/workbench/page';

type DynamicRow = Record<string, unknown>;

// Define the shape of the filters object
interface Filters {
  interactionType: "all" | "calls" | "sms";
  dateRange: { start: string; end: string };
  individuals: string[];
  minInteractions: number;
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
  filters: Filters; // Use the specific Filters type
  onIndividualSelect: (individual: Individual) => void;
}

const findFieldValue = (row: DynamicRow, possibleFields: string[]): string | null => {
  if (!row || typeof row !== 'object') return null;
  const normalize = (str: string) => str.toLowerCase().replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ç]/g, 'c').replace(/[ùúûü]/g, 'u').replace(/[òóôõö]/g, 'o').replace(/[ìíîï]/g, 'i').replace(/[^a-z0-9\s_]/g, ' ').replace(/\s+/g, ' ').trim();

  const normalizedRow: { [key: string]: unknown } = {};
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

const parseDuration = (durationStr: string | null): { seconds: number; isSMS: boolean } => {
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
    const interactionList = data?.listings;
    if (!interactionList || !Array.isArray(interactionList)) {
      return { locationData: [], individualPaths: new Map() };
    }
    
    const processedLocations: LocationPoint[] = [];
    const pathsByIndividual = new Map<string, LocationPoint[]>();
    
    const possibleCallerFields = ['caller_num', 'Numéro Appelant', 'numero appelant', 'source'];
    const possibleLocationFields = ['location', 'Localisation numéro appelant', 'localisation_numero_appelant'];
    const possibleDateFields = ['timestamp', 'Date Début appel', 'date_debut_appel', 'date'];
    const possibleDurationFields = ['duration_str', 'Durée appel', 'duree_appel'];

    interactionList.forEach((listing, index) => {
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

      const { isSMS } = parseDuration(durationStr);
      const interactionType = isSMS ? 'sms' : 'call';
      
      // FIX: Changed 'let' to 'const' as 'date' is never reassigned.
      const date = new Date(dateStr);
      if(isNaN(date.getTime())) return; // Skip if date is invalid

      const locationPoint: LocationPoint = {
        id: `${caller}_${dateStr}_${index}`, phoneNumber: caller, latitude, longitude,
        timestamp: date, interactionType: interactionType,
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

  const { locationData, individualPaths } = processedData;

  const filteredData = useMemo(() => {
    const filteredLocs = locationData.filter(location => {
      if (filters.interactionType && filters.interactionType !== 'all' && location.interactionType !== filters.interactionType) return false;
      if (filters.dateRange?.start && location.timestamp < new Date(filters.dateRange.start)) return false;
      if (filters.dateRange?.end && location.timestamp > new Date(filters.dateRange.end)) return false;
      if (filters.individuals?.length > 0 && !filters.individuals.includes(location.phoneNumber)) return false;
      return true;
    });

    const filteredPaths = new Map<string, LocationPoint[]>();
    filteredLocs.forEach(loc => {
      if(!filteredPaths.has(loc.phoneNumber)) {
        filteredPaths.set(loc.phoneNumber, []);
      }
      filteredPaths.get(loc.phoneNumber)!.push(loc);
    });
    return { filteredLocations: filteredLocs, filteredPaths };
  }, [locationData, filters]);

  const { filteredLocations, filteredPaths } = filteredData;
  const uniqueIndividuals = Array.from(filteredPaths.keys());

  const handleIndividualClick = (phoneNumber: string) => {
    setSelectedIndividual(selectedIndividual === phoneNumber ? null : phoneNumber);
    const individualLocations = filteredLocations.filter(loc => loc.phoneNumber === phoneNumber);
    if (individualLocations.length > 0) {
      onIndividualSelect({
        id: phoneNumber, phoneNumber: phoneNumber, interactions: individualLocations.length,
        details: { 
            locations: individualLocations.length, 
            lastSeen: Math.max(...individualLocations.map(loc => loc.timestamp.getTime())) 
        }
      });
    }
  };

  const getIndividualStats = (phoneNumber: string) => {
    const locations = filteredLocations.filter(loc => loc.phoneNumber === phoneNumber);
    const calls = locations.filter(loc => loc.interactionType === 'call').length;
    const sms = locations.filter(loc => loc.interactionType === 'sms').length;
    return { total: locations.length, calls, sms };
  };

  if (locationData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-center max-w-lg p-4">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Location Data Found</h3>
          <p className="text-muted-foreground mb-4">Could not find valid location data in the file.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><MapPin className="w-5 h-5" />Location Analysis</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span><User className="w-4 h-4 inline-block mr-1" />{uniqueIndividuals.length} Individuals</span>
            <span><Navigation className="w-4 h-4 inline-block mr-1" />{filteredLocations.length} Locations</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex" style={{ minHeight: 0 }}>
        <div className="w-80 border-r border-border bg-muted/30 overflow-y-auto">
          <div className="p-3 border-b border-border sticky top-0 bg-muted/30 z-10">
            <h4 className="font-medium text-foreground">Individuals ({uniqueIndividuals.length})</h4>
          </div>
          <div className="p-2 space-y-2">
            {uniqueIndividuals.map((phoneNumber, index) => {
              const stats = getIndividualStats(phoneNumber);
              const color = generateColor(index);
              const isSelected = selectedIndividual === phoneNumber;
              return (
                <div key={phoneNumber} onClick={() => handleIndividualClick(phoneNumber)} className={`p-3 rounded-lg cursor-pointer transition-all ${isSelected ? "bg-primary/20 border-l-4 border-primary" : "bg-background hover:bg-muted/60"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{phoneNumber}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1" title="Total Locations"><Layers className="w-3 h-3" />{stats.total}</span>
                        <span className="flex items-center gap-1" title="Calls"><Phone className="w-3 h-3" />{stats.calls}</span>
                        <span className="flex items-center gap-1" title="SMS"><MessageSquare className="w-3 h-3" />{stats.sms}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-1 relative">
          <MapView locations={filteredLocations} paths={individualPaths} selectedIndividual={selectedIndividual} getColor={generateColor} />
        </div>
      </div>
    </div>
  );
};