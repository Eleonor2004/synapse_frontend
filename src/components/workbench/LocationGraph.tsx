// src/components/workbench/LocationGraph.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapPin, Navigation, Phone, MessageSquare, User, Layers } from 'lucide-react';

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

// --- HELPER FUNCTIONS ---
const normalizeKey = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str.toLowerCase().trim();
};

const generateColor = (index: number): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[index % colors.length];
};

export const LocationGraph: React.FC<LocationGraphProps> = ({
  data,
  filters,
  onIndividualSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedIndividual, setSelectedIndividual] = useState<string | null>(null);

  // --- MODIFICATION START: Fix for initialization error ---
  // The error "Cannot access '...' before initialization" is a Temporal Dead Zone (TDZ) issue
  // caused by destructuring the useMemo result. The fix is to assign the hook's entire
  // output to a single variable and access its properties from there.
  const processedData = useMemo(() => {
    let interactionList: any[] = [];
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      const sheetKeys = Object.keys(data);
      const listingKey = sheetKeys.find(key => key.toLowerCase() === 'listing' || key.toLowerCase() === 'listings');
      
      if (listingKey && Array.isArray(data[listingKey])) {
        interactionList = data[listingKey];
      } else if (Array.isArray(data[sheetKeys[0]])) {
        interactionList = data[sheetKeys[0]];
        console.warn(`LocationGraph: Could not find "Listing" sheet. Using first sheet: "${sheetKeys[0]}"`);
      }
    }

    if (interactionList.length === 0) {
      return { locationData: [], individualPaths: new Map() };
    }

    const processedLocations: LocationPoint[] = [];
    const pathsByIndividual = new Map<string, LocationPoint[]>();

    const possibleCallerFields = ['numéro appelant', 'numero appellant', 'caller', 'from'];
    const possibleLocationFields = ['localisation numéro appelant (longitude, latitude)', 'localisation', 'location'];
    const possibleDateFields = ['date début appel', 'date debut appel', 'date'];
    const possibleTypeFields = ['type', 'interaction_type'];

    interactionList.forEach((listing: any, index: number) => {
      if (typeof listing !== 'object' || listing === null) return;

      const normalizedListing: { [key: string]: any } = {};
      for (const key in listing) {
        normalizedListing[normalizeKey(key)] = listing[key];
      }

      const findValue = (fields: string[]) => {
        for (const field of fields) {
          const value = normalizedListing[field];
          if (value !== undefined && value !== null && String(value).trim() !== '') {
            return String(value).trim();
          }
        }
        return null;
      };

      const caller = findValue(possibleCallerFields);
      const locationString = findValue(possibleLocationFields);
      const dateStr = findValue(possibleDateFields);
      const typeStr = findValue(possibleTypeFields);

      if (!caller || !locationString) return;

      const locationMatch = locationString.match(/\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)/);
      if (!locationMatch) return;

      const longitude = parseFloat(locationMatch[1]);
      const latitude = parseFloat(locationMatch[2]);

      if (isNaN(latitude) || isNaN(longitude)) return;

      const locationPoint: LocationPoint = {
        id: `${caller}_${dateStr || index}`,
        phoneNumber: caller,
        latitude,
        longitude,
        timestamp: dateStr ? new Date(dateStr) : new Date(),
        interactionType: (typeStr && typeStr.toLowerCase().includes('sms')) ? 'sms' : 'call',
      };

      processedLocations.push(locationPoint);

      if (!pathsByIndividual.has(caller)) {
        pathsByIndividual.set(caller, []);
      }
      pathsByIndividual.get(caller)!.push(locationPoint);
    });

    pathsByIndividual.forEach(path => {
      path.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });

    return { locationData: processedLocations, individualPaths: pathsByIndividual };
  }, [data]);
  // --- MODIFICATION END ---

  // Now, safely access the data from the 'processedData' object.
  const locationData = processedData.locationData;

  const filteredLocations = useMemo(() => {
    return locationData.filter(location => {
      if (filters.interactionType && filters.interactionType !== 'all' && filters.interactionType !== location.interactionType) return false;
      if (filters.dateRange?.start && location.timestamp < new Date(filters.dateRange.start)) return false;
      if (filters.dateRange?.end && location.timestamp > new Date(filters.dateRange.end)) return false;
      if (filters.individuals?.length > 0 && !filters.individuals.includes(location.phoneNumber)) return false;
      return true;
    });
  }, [locationData, filters]);

  const uniqueIndividuals = Array.from(new Set(filteredLocations.map(loc => loc.phoneNumber)));

  const handleIndividualClick = (phoneNumber: string) => {
    setSelectedIndividual(selectedIndividual === phoneNumber ? null : phoneNumber);
    
    const individualLocations = filteredLocations.filter(loc => loc.phoneNumber === phoneNumber);
    if (individualLocations.length > 0) {
      const individual: Individual = {
        id: phoneNumber,
        phoneNumber: phoneNumber,
        interactions: individualLocations.length,
        details: {
          locations: individualLocations.length,
          lastSeen: Math.max(...individualLocations.map(loc => loc.timestamp.getTime())),
        }
      };
      onIndividualSelect(individual);
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
          <p className="text-muted-foreground mb-4">
            Could not find valid location data in the file. Please ensure the file contains the necessary columns.
          </p>
          <div className="text-left bg-muted/50 rounded-lg p-3 text-sm">
            <p className="font-medium mb-2">The component requires columns for:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Caller Number (e.g., <strong>Numéro Appelant</strong>)</li>
              <li>• Location (e.g., <strong>Localisation numéro appelant (Longitude, Latitude)</strong>)</li>
              <li>• Date (e.g., <strong>Date Début appel</strong>)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Location Analysis</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span><User className="w-4 h-4 inline-block mr-1" />{uniqueIndividuals.length} Individuals</span>
            <span><Navigation className="w-4 h-4 inline-block mr-1" />{filteredLocations.length} Locations</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Individual List */}
        <div className="w-80 border-r border-border bg-muted/30 overflow-y-auto">
          <div className="p-3 border-b border-border">
            <h4 className="font-medium text-foreground">Individuals ({uniqueIndividuals.length})</h4>
          </div>
          <div className="p-2">
            {uniqueIndividuals.map((phoneNumber, index) => {
              const stats = getIndividualStats(phoneNumber);
              const color = generateColor(index);
              const isSelected = selectedIndividual === phoneNumber;
              return (
                <div key={phoneNumber} onClick={() => handleIndividualClick(phoneNumber)}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${isSelected ? "bg-primary/10 border-2 border-primary" : "bg-background hover:bg-muted border border-border"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{phoneNumber}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{stats.total}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{stats.calls}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{stats.sms}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full bg-muted/20 flex items-center justify-center">
            <div className="text-center p-6">
              <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Interactive Map View</h3>
              <p className="text-muted-foreground">Map rendering logic (e.g., with Leaflet) would go here.</p>
              <div className="mt-4 bg-background rounded-lg p-4 border">
                <h4 className="font-medium mb-3">Location Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{filteredLocations.length}</div>
                    <div className="text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{uniqueIndividuals.length}</div>
                    <div className="text-muted-foreground">Individuals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};