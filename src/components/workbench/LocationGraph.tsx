// src/components/workbench/LocationGraph.tsx

"use client";

import React, { useState, useMemo } from 'react';
import { MapPin, Navigation, Phone, MessageSquare, User, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapView } from './MapView';
import { ExcelData, Individual } from '@/app/[locale]/workbench/page';
import { LocationPoint as ApiLocationPoint } from '@/types/api';

type DynamicRow = Record<string, unknown>;

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
  filters: Filters;
  onIndividualSelect: (individual: Individual) => void;
}

// Enhanced field matching function - matches NetworkGraph approach
const findFieldValue = (row: DynamicRow, possibleFields: string[]): string | null => {
  if (!row || typeof row !== 'object') return null;
  
  const normalize = (str: string) => 
    str.toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ç]/g, 'c')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[^a-z0-9\s_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

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

// Enhanced coordinate parsing function
const parseCoordinates = (locationString: string): { latitude: number; longitude: number } | null => {
  if (!locationString || typeof locationString !== 'string') return null;
  
  // Try multiple coordinate formats
  const patterns = [
    // Long: X.XXX Lat: Y.YYY
    /Long:\s*(-?\d+\.?\d*)\s*.*Lat:\s*(-?\d+\.?\d*)/i,
    // Lat: Y.YYY Long: X.XXX (reversed order)
    /Lat:\s*(-?\d+\.?\d*)\s*.*Long:\s*(-?\d+\.?\d*)/i,
    // Longitude: X.XXX Latitude: Y.YYY
    /Longitude:\s*(-?\d+\.?\d*)\s*.*Latitude:\s*(-?\d+\.?\d*)/i,
    // Latitude: Y.YYY Longitude: X.XXX (reversed order)
    /Latitude:\s*(-?\d+\.?\d*)\s*.*Longitude:\s*(-?\d+\.?\d*)/i,
    // Simple comma-separated: X.XXX,Y.YYY or Y.YYY,X.XXX
    /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/,
    // With parentheses: (X.XXX, Y.YYY)
    /\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)/
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const match = locationString.match(patterns[i]);
    if (match && match.length >= 3) {
      let longitude = parseFloat(match[1]);
      let latitude = parseFloat(match[2]);
      
      // For patterns where order might be reversed, check if we need to swap
      if (i === 1 || i === 3) {
        // These patterns have lat first, then long
        [latitude, longitude] = [longitude, latitude];
      }
      
      // Validate coordinates are in reasonable ranges
      if (!isNaN(latitude) && !isNaN(longitude) && 
          latitude >= -90 && latitude <= 90 && 
          longitude >= -180 && longitude <= 180) {
        return { latitude, longitude };
      }
    }
  }
  
  return null;
};

const generateColor = (index: number): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
  return colors[index % colors.length];
};

export const LocationGraph: React.FC<LocationGraphProps> = ({ data, filters, onIndividualSelect }) => {
  const [selectedIndividual, setSelectedIndividual] = useState<string | null>(null);

  const processedData = useMemo(() => {
    console.log('Processing location data...', data); // Debug log
    
    // Check for pre-processed location data first
    if (data?.locations && data.locations.length > 0) {
      const preprocessed = data.locations.map((loc, index) => ({
        ...loc,
        id: `${loc.lat}-${loc.lng}-${index}`,
        latitude: loc.lat,
        longitude: loc.lng,
        phoneNumber: 'Unknown',
        timestamp: new Date(loc.timestamp),
      }));
      
      const paths = new Map<string, LocationPoint[]>();
      preprocessed.forEach(p => {
        const key = p.phoneNumber;
        if (!paths.has(key)) paths.set(key, []);
        paths.get(key)!.push(p);
      });

      return { locationData: preprocessed, individualPaths: paths };
    }

    const interactionList = data?.listings;
    if (!interactionList || !Array.isArray(interactionList)) {
      console.log('No listings data found'); // Debug log
      return { locationData: [], individualPaths: new Map() };
    }
    
    console.log('Processing', interactionList.length, 'listings...'); // Debug log
    
    const processedLocations: LocationPoint[] = [];
    const pathsByIndividual = new Map<string, LocationPoint[]>();
    
    // Use comprehensive field matching like NetworkGraph
    const possibleCallerFields = [
      'caller_num', 'caller', 'calling_number', 'from_number', 'source_number',
      'numéro appelant', 'numero appelant', 'appelant', 'émetteur', 'emetteur',
      'Numéro Appelant', 'Numero Appelant', 'Appelant'
    ];
    
    const possibleLocationFields = [
      'location', 'caller_location', 'source_location', 
      'localisation', 'localisation numéro appelant', 'localisation numero appelant',
      'Localisation numéro appelant', 'Localisation numero appelant', 'Localisation'
    ];
    
    const possibleDateFields = [
      'timestamp', 'date', 'call_date', 'date_time',
      'date début appel', 'date debut appel', 'Date Début appel', 'Date Debut appel'
    ];
    
    const possibleDurationFields = [
      'duration', 'duration_str', 'call_duration', 'length',
      'durée', 'duree', 'durée appel', 'duree appel', 'Durée appel', 'Duree appel'
    ];

    // Debug: Log sample data structure
    if (interactionList.length > 0) {
      console.log('Sample listing keys:', Object.keys(interactionList[0]));
      console.log('Sample listing:', interactionList[0]);
    }

    interactionList.forEach((listing, index) => {
      if (typeof listing !== 'object' || listing === null) return;
      
      const caller = findFieldValue(listing, possibleCallerFields);
      const locationString = findFieldValue(listing, possibleLocationFields);
      const dateStr = findFieldValue(listing, possibleDateFields);
      const durationStr = findFieldValue(listing, possibleDurationFields);

      // Debug logs for first few items
      if (index < 3) {
        console.log(`Item ${index}:`, {
          caller,
          locationString,
          dateStr,
          durationStr,
          rawListing: listing
        });
      }

      if (!caller || !locationString || !dateStr) {
        if (index < 10) console.log(`Skipping item ${index}: missing required fields`);
        return;
      }

      // Use enhanced coordinate parsing
      const coordinates = parseCoordinates(locationString);
      if (!coordinates) {
        if (index < 10) console.log(`Skipping item ${index}: could not parse coordinates from "${locationString}"`);
        return;
      }

      const { latitude, longitude } = coordinates;
      const { isSMS } = parseDuration(durationStr);
      const interactionType = isSMS ? 'sms' : 'call';
      
      // Enhanced date parsing
      let date: Date;
      try {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          // Try alternative date formats
          const parsedDate = Date.parse(dateStr);
          if (isNaN(parsedDate)) {
            console.log(`Skipping item ${index}: invalid date "${dateStr}"`);
            return;
          }
          date = new Date(parsedDate);
        }
      } catch (error) {
        console.log(`Skipping item ${index}: date parsing error for "${dateStr}"`);
        return;
      }

      const locationPoint: LocationPoint = {
        id: `${caller}_${dateStr}_${index}`,
        phoneNumber: caller,
        latitude,
        longitude,
        timestamp: date,
        interactionType,
      };

      processedLocations.push(locationPoint);
      if (!pathsByIndividual.has(caller)) {
        pathsByIndividual.set(caller, []);
      }
      pathsByIndividual.get(caller)!.push(locationPoint);
    });

    console.log(`Processed ${processedLocations.length} location points from ${interactionList.length} listings`);
    console.log('Individuals with location data:', Array.from(pathsByIndividual.keys()));

    // Sort paths by timestamp
    pathsByIndividual.forEach(path => 
      path.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    );
    
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
        id: phoneNumber, 
        phoneNumber: phoneNumber, 
        interactions: individualLocations.length,
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
          <details className="text-left text-sm text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">Debug Information</summary>
            <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
              <p>Total listings: {data?.listings?.length || 0}</p>
              <p>Available fields in first listing:</p>
              <ul className="list-disc list-inside ml-2">
                {data?.listings?.[0] && Object.keys(data.listings[0]).map(key => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5" />Location Analysis
          </h3>
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
                <div 
                  key={phoneNumber} 
                  onClick={() => handleIndividualClick(phoneNumber)} 
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-primary/20 border-l-4 border-primary" 
                      : "bg-background hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-10 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: color }} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{phoneNumber}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1" title="Total Locations">
                          <Layers className="w-3 h-3" />{stats.total}
                        </span>
                        <span className="flex items-center gap-1" title="Calls">
                          <Phone className="w-3 h-3" />{stats.calls}
                        </span>
                        <span className="flex items-center gap-1" title="SMS">
                          <MessageSquare className="w-3 h-3" />{stats.sms}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-1 relative">
          <MapView 
            locations={filteredLocations} 
            paths={individualPaths} 
            selectedIndividual={selectedIndividual} 
            getColor={generateColor} 
          />
        </div>
      </div>
    </div>
  );
};