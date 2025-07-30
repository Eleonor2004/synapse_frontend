// LocationGraph component for visualizing individual movements and locations
'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ExcelData, Individual } from "@/app/[locale]/workbench/page";
import { 
  MapPin, 
  Route, 
  Clock, 
  Phone, 
  MessageSquare, 
  User, 
  Layers,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Navigation,
  Calendar,
  Filter,
  Eye,
  EyeOff
} from "lucide-react";

interface LocationGraphProps {
  data: ExcelData;
  filters: any;
  onIndividualSelect: (individual: Individual) => void;
}

interface LocationPoint {
  id: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  type: 'call' | 'sms';
  cellId?: string;
  duration?: number;
  correspondent: string;
  isIncoming: boolean;
}

interface IndividualPath {
  phoneNumber: string;
  color: string;
  points: LocationPoint[];
  totalInteractions: number;
  timeSpan: { start: Date; end: Date };
}

interface LocationStats {
  totalPoints: number;
  uniqueIndividuals: number;
  uniqueLocations: number;
  timeRange: { start: Date; end: Date } | null;
  averagePointsPerIndividual: number;
}

// Color palette for different individuals
const INDIVIDUAL_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#f43f5e', '#8b5cf6', '#64748b', '#059669'
];

// Cameroon major cities with approximate coordinates (for demo purposes)
const CAMEROON_CITIES = {
  'Douala': { lat: 4.0511, lng: 9.7679 },
  'Yaounde': { lat: 3.8480, lng: 11.5021 },
  'Garoua': { lat: 9.3265, lng: 13.3978 },
  'Bamenda': { lat: 5.9631, lng: 10.1591 },
  'Bafoussam': { lat: 5.4761, lng: 10.4178 },
  'Ngaoundere': { lat: 7.3167, lng: 13.5833 },
  'Bertoua': { lat: 4.5833, lng: 13.6833 },
  'Limbe': { lat: 4.0186, lng: 9.2109 },
  'Edea': { lat: 3.8000, lng: 10.1333 },
  'Kumba': { lat: 4.6300, lng: 9.4469 }
};

export function LocationGraph({ data, filters, onIndividualSelect }: LocationGraphProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndividual, setSelectedIndividual] = useState<string | null>(null);
  const [showPaths, setShowPaths] = useState(true);
  const [showTimeAnimation, setShowTimeAnimation] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'overview' | 'individual' | 'heatmap'>('overview');
  const [locationStats, setLocationStats] = useState<LocationStats>({
    totalPoints: 0,
    uniqueIndividuals: 0,
    uniqueLocations: 0,
    timeRange: null,
    averagePointsPerIndividual: 0
  });

  // Process location data from cell frequency and listings
  const processedLocationData = useMemo(() => {
    if (!data?.listings || !data?.cellFrequency) {
      return { paths: [], allPoints: [] };
    }

    setIsLoading(true);

    const locationPoints: LocationPoint[] = [];
    const individualMap = new Map<string, LocationPoint[]>();

    // Generate synthetic location data based on cell tower information
    // In real implementation, this would use actual cell tower coordinates
    const generateLocationFromCell = (cellId: string, baseCity: string = 'Douala'): { lat: number; lng: number } => {
      const cityCoords = CAMEROON_CITIES[baseCity as keyof typeof CAMEROON_CITIES] || CAMEROON_CITIES.Douala;
      
      // Add some random variation around the city center (simulating cell tower locations)
      const variation = 0.05; // ~5km radius
      const lat = cityCoords.lat + (Math.random() - 0.5) * variation;
      const lng = cityCoords.lng + (Math.random() - 0.5) * variation;
      
      return { lat, lng };
    };

    // Process listings to create location points
    data.listings.forEach((listing: any, index: number) => {
      const phoneA = String(listing["Numéro A"] || listing.caller || listing.source);
      const phoneB = String(listing["Numéro B"] || listing.called || listing.target);
      const timestamp = new Date(listing.Date || listing.timestamp || Date.now());
      const type = String(listing.Type || 'appel').toLowerCase().includes('sms') ? 'sms' : 'call';
      const duration = parseFloat(listing.Durée || listing.duration || 0);
      
      // Generate location based on cell information or use random city
      const cities = Object.keys(CAMEROON_CITIES);
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const cellId = listing.Cellule || `CELL_${Math.floor(Math.random() * 1000)}`;
      
      if (phoneA && phoneA !== 'undefined') {
        const location = generateLocationFromCell(cellId, randomCity);
        const point: LocationPoint = {
          id: `${phoneA}_${index}_A`,
          phoneNumber: phoneA,
          latitude: location.lat,
          longitude: location.lng,
          timestamp,
          type,
          cellId,
          duration,
          correspondent: phoneB,
          isIncoming: false
        };
        locationPoints.push(point);
        
        if (!individualMap.has(phoneA)) {
          individualMap.set(phoneA, []);
        }
        individualMap.get(phoneA)!.push(point);
      }

      if (phoneB && phoneB !== 'undefined') {
        const location = generateLocationFromCell(cellId, randomCity);
        const point: LocationPoint = {
          id: `${phoneB}_${index}_B`,
          phoneNumber: phoneB,
          latitude: location.lat,
          longitude: location.lng,
          timestamp,
          type,
          cellId,
          duration,
          correspondent: phoneA,
          isIncoming: true
        };
        locationPoints.push(point);
        
        if (!individualMap.has(phoneB)) {
          individualMap.set(phoneB, []);
        }
        individualMap.get(phoneB)!.push(point);
      }
    });

    // Create individual paths
    const paths: IndividualPath[] = Array.from(individualMap.entries())
      .filter(([phone, points]) => points.length >= filters.minInteractions)
      .map(([phone, points], index) => {
        // Sort points by timestamp
        const sortedPoints = points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        return {
          phoneNumber: phone,
          color: INDIVIDUAL_COLORS[index % INDIVIDUAL_COLORS.length],
          points: sortedPoints,
          totalInteractions: points.length,
          timeSpan: {
            start: sortedPoints[0].timestamp,
            end: sortedPoints[sortedPoints.length - 1].timestamp
          }
        };
      })
      .slice(0, 15); // Limit to 15 individuals for performance

    // Calculate statistics
    const allTimestamps = locationPoints.map(p => p.timestamp).sort((a, b) => a.getTime() - b.getTime());
    const uniqueLocations = new Set(locationPoints.map(p => `${p.latitude.toFixed(4)},${p.longitude.toFixed(4)}`));
    
    const stats: LocationStats = {
      totalPoints: locationPoints.length,
      uniqueIndividuals: individualMap.size,
      uniqueLocations: uniqueLocations.size,
      timeRange: allTimestamps.length > 0 ? {
        start: allTimestamps[0],
        end: allTimestamps[allTimestamps.length - 1]
      } : null,
      averagePointsPerIndividual: locationPoints.length / Math.max(1, individualMap.size)
    };

    setLocationStats(stats);
    setIsLoading(false);

    return { paths, allPoints: locationPoints };
  }, [data, filters]);

  // Initialize OpenStreetMap using Leaflet
  useEffect(() => {
    // Since we can't import Leaflet directly, we'll create a mock implementation
    // In a real app, you would load Leaflet from CDN and use it here
    
    if (!mapRef.current) return;

    // Clear previous map
    if (mapInstance.current) {
      mapInstance.current = null;
    }

    // Create a mock map interface for demonstration
    const mockMap = {
      markers: [] as any[],
      paths: [] as any[],
      
      addMarker: (lat: number, lng: number, options: any) => {
        const marker = { lat, lng, ...options };
        mockMap.markers.push(marker);
        return marker;
      },
      
      addPath: (points: Array<[number, number]>, options: any) => {
        const path = { points, ...options };
        mockMap.paths.push(path);
        return path;
      },
      
      clear: () => {
        mockMap.markers = [];
        mockMap.paths = [];
      },
      
      fitBounds: () => {
        console.log('Fitting map bounds');
      }
    };

    mapInstance.current = mockMap;

    // Render the map visualization
    renderMapVisualization();

  }, [processedLocationData, viewMode, selectedIndividual, showPaths]);

  const renderMapVisualization = () => {
    if (!mapInstance.current || !processedLocationData) return;

    const { paths, allPoints } = processedLocationData;
    
    // Clear existing visualization
    mapInstance.current.clear();

    if (viewMode === 'overview') {
      // Show all individuals and their paths
      paths.forEach(path => {
        if (showPaths && path.points.length > 1) {
          // Add path line
          const pathCoords = path.points.map(p => [p.latitude, p.longitude] as [number, number]);
          mapInstance.current.addPath(pathCoords, {
            color: path.color,
            weight: 3,
            opacity: selectedIndividual && selectedIndividual !== path.phoneNumber ? 0.3 : 0.8
          });
        }

        // Add markers for each point
        path.points.forEach((point, index) => {
          mapInstance.current.addMarker(point.latitude, point.longitude, {
            color: path.color,
            size: point.type === 'call' ? 8 : 6,
            icon: point.type === 'call' ? '📞' : '💬',
            title: `${point.phoneNumber} - ${point.type} at ${point.timestamp.toLocaleString()}`,
            isFirst: index === 0,
            isLast: index === path.points.length - 1
          });
        });
      });
    } else if (viewMode === 'individual' && selectedIndividual) {
      // Show only selected individual
      const individualPath = paths.find(p => p.phoneNumber === selectedIndividual);
      if (individualPath) {
        const pathCoords = individualPath.points.map(p => [p.latitude, p.longitude] as [number, number]);
        mapInstance.current.addPath(pathCoords, {
          color: individualPath.color,
          weight: 4,
          opacity: 1
        });

        individualPath.points.forEach((point, index) => {
          mapInstance.current.addMarker(point.latitude, point.longitude, {
            color: individualPath.color,
            size: 10,
            icon: point.type === 'call' ? '📞' : '💬',
            title: `${point.correspondent} - ${point.type} - ${point.timestamp.toLocaleString()}`,
            isFirst: index === 0,
            isLast: index === individualPath.points.length - 1
          });
        });
      }
    } else if (viewMode === 'heatmap') {
      // Create heatmap visualization
      const locationDensity = new Map<string, number>();
      allPoints.forEach(point => {
        const key = `${point.latitude.toFixed(3)},${point.longitude.toFixed(3)}`;
        locationDensity.set(key, (locationDensity.get(key) || 0) + 1);
      });

      Array.from(locationDensity.entries()).forEach(([coords, count]) => {
        const [lat, lng] = coords.split(',').map(Number);
        const intensity = count / Math.max(...locationDensity.values());
        mapInstance.current.addMarker(lat, lng, {
          color: intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f97316' : '#eab308',
          size: 8 + (intensity * 12),
          opacity: 0.7,
          title: `${count} interactions at this location`
        });
      });
    }
  };

  // Handle individual selection
  const handleIndividualSelect = (phoneNumber: string) => {
    if (selectedIndividual === phoneNumber) {
      setSelectedIndividual(null);
      setViewMode('overview');
    } else {
      setSelectedIndividual(phoneNumber);
      setViewMode('individual');
      
      // Trigger callback
      const individualPath = processedLocationData.paths.find(p => p.phoneNumber === phoneNumber);
      if (individualPath) {
        onIndividualSelect({
          id: phoneNumber,
          phoneNumber,
          interactions: individualPath.totalInteractions,
          details: {
            totalPoints: individualPath.points.length,
            timeSpan: individualPath.timeSpan,
            color: individualPath.color
          }
        });
      }
    }
  };

  // Time animation
  useEffect(() => {
    if (!showTimeAnimation || !processedLocationData.allPoints.length) return;

    const allPoints = processedLocationData.allPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const interval = setInterval(() => {
      setCurrentTimeIndex(prev => {
        const next = prev + 1;
        return next >= allPoints.length ? 0 : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimeAnimation, processedLocationData]);

  if (!processedLocationData.paths.length) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Location Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload data with location information to see movement patterns
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Location Analysis</h3>
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              {locationStats.totalPoints} location points
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              {locationStats.uniqueIndividuals} individuals
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              {locationStats.uniqueLocations} unique locations
            </span>
            {locationStats.timeRange && (
              <span className="text-gray-500">
                {locationStats.timeRange.start.toLocaleDateString()} - {locationStats.timeRange.end.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        {/* View Mode Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
            {[
              { mode: 'overview', icon: Layers, label: 'Overview' },
              { mode: 'individual', icon: User, label: 'Individual' },
              { mode: 'heatmap', icon: MapPin, label: 'Heatmap' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`p-1.5 rounded-sm transition-colors ${
                  viewMode === mode 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Toggle Controls */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
            <button
              onClick={() => setShowPaths(!showPaths)}
              className={`p-1.5 rounded-sm transition-colors ${
                showPaths 
                  ? 'bg-green-500 text-white' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}
              title={showPaths ? "Hide Paths" : "Show Paths"}
            >
              <Route className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowTimeAnimation(!showTimeAnimation)}
              className={`p-1.5 rounded-sm transition-colors ${
                showTimeAnimation 
                  ? 'bg-purple-500 text-white' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}
              title={showTimeAnimation ? "Stop Animation" : "Play Animation"}
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-gray-100 dark:bg-gray-800">
        {/* Mock Map Display */}
        <div ref={mapRef} className="w-full h-full relative overflow-hidden">
          {/* Background Map Simulation */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900">
            {/* Grid overlay to simulate map */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Cameroon Cities Markers */}
            {Object.entries(CAMEROON_CITIES).map(([city, coords]) => (
              <div
                key={city}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-xs"
                style={{
                  left: `${20 + (coords.lng - 8) * 15}%`,
                  top: `${70 - (coords.lat - 2) * 10}%`
                }}
              >
                <div className="bg-gray-800 text-white px-2 py-1 rounded-md shadow-lg">
                  📍 {city}
                </div>
              </div>
            ))}

            {/* Individual Paths and Points */}
            {processedLocationData.paths.map((path, pathIndex) => {
              if (viewMode === 'individual' && selectedIndividual !== path.phoneNumber) return null;
              if (viewMode === 'heatmap') return null;

              return (
                <div key={path.phoneNumber}>
                  {/* Path Line */}
                  {showPaths && path.points.length > 1 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <path
                        d={`M ${path.points.map((point, i) => {
                          const x = 20 + (point.longitude - 8) * 15;
                          const y = 70 - (point.latitude - 2) * 10;
                          return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                        }).join(' ')}`}
                        stroke={path.color}
                        strokeWidth="2"
                        fill="none"
                        opacity={selectedIndividual && selectedIndividual !== path.phoneNumber ? "0.3" : "0.8"}
                        strokeDasharray={viewMode === 'individual' ? "0" : "5,5"}
                      />
                    </svg>
                  )}

                  {/* Location Points */}
                  {path.points.map((point, pointIndex) => {
                    const x = 20 + (point.longitude - 8) * 15;
                    const y = 70 - (point.latitude - 2) * 10;
                    
                    // Time animation filter
                    if (showTimeAnimation) {
                      const allPoints = processedLocationData.allPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
                      const pointGlobalIndex = allPoints.findIndex(p => p.id === point.id);
                      if (pointGlobalIndex > currentTimeIndex) return null;
                    }

                    return (
                      <motion.div
                        key={point.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: showTimeAnimation ? pointIndex * 0.1 : 0 }}
                        onClick={() => handleIndividualSelect(path.phoneNumber)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <div
                          className={`
                            w-3 h-3 rounded-full border-2 border-white shadow-lg
                            ${selectedIndividual === path.phoneNumber ? 'ring-2 ring-offset-1 ring-blue-500' : ''}
                          `}
                          style={{ backgroundColor: path.color }}
                          title={`${point.phoneNumber}: ${point.type} at ${point.timestamp.toLocaleString()}`}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {point.type === 'call' ? '📞' : '💬'}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}

            {/* Heatmap Mode */}
            {viewMode === 'heatmap' && (
              <>
                {(() => {
                  const locationDensity = new Map<string, { count: number; points: LocationPoint[] }>();
                  processedLocationData.allPoints.forEach(point => {
                    const key = `${point.latitude.toFixed(2)},${point.longitude.toFixed(2)}`;
                    if (!locationDensity.has(key)) {
                      locationDensity.set(key, { count: 0, points: [] });
                    }
                    const entry = locationDensity.get(key)!;
                    entry.count++;
                    entry.points.push(point);
                  });

                  const maxCount = Math.max(...Array.from(locationDensity.values()).map(v => v.count));

                  return Array.from(locationDensity.entries()).map(([coords, data]) => {
                    const [lat, lng] = coords.split(',').map(Number);
                    const x = 20 + (lng - 8) * 15;
                    const y = 70 - (lat - 2) * 10;
                    const intensity = data.count / maxCount;
                    const size = 10 + (intensity * 20);

                    return (
                      <motion.div
                        key={coords}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div
                          className="rounded-full opacity-70"
                          style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            backgroundColor: intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f97316' : '#eab308'
                          }}
                          title={`${data.count} interactions - ${data.points.map(p => p.phoneNumber).filter((v, i, a) => a.indexOf(v) === i).length} individuals`}
                        />
                      </motion.div>
                    );
                  });
                })()}
              </>
            )}

            {/* Time Animation Indicator */}
            {showTimeAnimation && (
              <motion.div
                className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {processedLocationData.allPoints.length > 0 && currentTimeIndex < processedLocationData.allPoints.length
                      ? processedLocationData.allPoints.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[currentTimeIndex]?.timestamp.toLocaleString()
                      : 'Animation Complete'
                    }
                  </span>
                </div>
                <div className="w-48 h-1 bg-gray-600 rounded-full mt-2">
                  <div 
                    className="h-1 bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(currentTimeIndex / Math.max(processedLocationData.allPoints.length - 1, 1)) * 100}%` }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <MapPin className="absolute inset-0 w-6 h-6 m-auto text-green-600" />
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Processing Location Data
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Analyzing movement patterns and generating paths...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Individual List Sidebar */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0 overflow-y-auto">
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Individuals ({processedLocationData.paths.length})
          </h4>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {processedLocationData.paths.map(path => (
              <motion.div
                key={path.phoneNumber}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${selectedIndividual === path.phoneNumber
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }
                `}
                onClick={() => handleIndividualSelect(path.phoneNumber)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: path.color }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {path.phoneNumber}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {path.points.length} points
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {path.totalInteractions} interactions
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {path.timeSpan.start.toLocaleDateString()} - {path.timeSpan.end.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Location Statistics */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Statistics</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Points/Individual:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {locationStats.averagePointsPerIndividual.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Coverage Area:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {locationStats.uniqueLocations} locations
                </span>
              </div>
              {locationStats.timeRange && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time Span:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {Math.ceil((locationStats.timeRange.end.getTime() - locationStats.timeRange.start.getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Call Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">SMS Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-gray-400" style={{ borderStyle: 'dashed' }} />
            <span className="text-gray-600 dark:text-gray-400">Movement Path</span>
          </div>
        </div>
      </div>
    </div>
  );
}