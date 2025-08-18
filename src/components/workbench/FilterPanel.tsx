// src/components/workbench/FilterPanel.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { Clock, XCircle, Users, Hash, MessageSquare, Calendar, Link, Zap, TrendingUp, Network, GitBranch } from "lucide-react";
import { ExcelData } from "../../app/[locale]/workbench/page";
import Select, { StylesConfig, Theme } from 'react-select';
import { getDurationStats } from "../../utils/multi-degree-link-anlysis"; // Adjust path as needed

// Find a specific field value in a row, same as in NetworkGraph
const findFieldValue = (row: Record<string, unknown>, fields: string[]): string | null => {
  if (!row || typeof row !== 'object') return null;
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  const normalizedRow: { [key: string]: unknown } = {};
  Object.keys(row).forEach(key => {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      normalizedRow[normalize(key)] = row[key];
    }
  });
  for (const field of fields) {
    const normalizedField = normalize(field);
    if (normalizedRow[normalizedField]) {
      return String(normalizedRow[normalizedField]);
    }
  }
  return null;
};

export interface WorkbenchFilters {
  interactionType: "all" | "calls" | "sms";
  dateRange: { start: string; end: string };
  individuals: string[];
  minInteractions: number;
  contactWhitelist: string[];
  durationRange: { min: number; max: number };
  
  // Enhanced link classification filters
  linkTypes: ("primary" | "secondary" | "weak")[];
  minStrengthScore: number;
  showWeakLinks: boolean;
  
  // New multi-degree link filters
  connectionDegrees: (1 | 2 | 3)[]; // primary, secondary, tertiary connections
  minConnectionStrength: number;
  showIndirectConnections: boolean;
  maxPathLength: number;
}

interface FilterPanelProps {
  filters: WorkbenchFilters;
  onFiltersChange: (filters: WorkbenchFilters) => void;
  data: ExcelData;
}

export function FilterPanel({ filters, onFiltersChange, data }: FilterPanelProps) {
  const [durationStats, setDurationStats] = useState({ min: 0, max: 3600, mean: 180, median: 120 });
  const [isDurationInitialized, setIsDurationInitialized] = useState(false);

  // Calculate duration statistics when data changes
  useEffect(() => {
    if (data.listings && data.listings.length > 0 && !isDurationInitialized) {
      const stats = getDurationStats(data.listings);
      setDurationStats(stats);
      
      // Initialize duration filter to mean value
      if (!isDurationInitialized) {
        updateFilter('durationRange', {
          min: 0,
          max: stats.mean || stats.median || 180
        });
        setIsDurationInitialized(true);
      }
    }
  }, [data.listings, isDurationInitialized]);

  const updateFilter = <K extends keyof WorkbenchFilters>(key: K, value: WorkbenchFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      interactionType: "all",
      dateRange: { start: "", end: "" },
      individuals: [],
      minInteractions: 0,
      contactWhitelist: [],
      durationRange: { min: 0, max: durationStats.mean || 180 },
      linkTypes: ["primary", "secondary", "weak"],
      minStrengthScore: 0,
      showWeakLinks: true,
      connectionDegrees: [1, 2, 3],
      minConnectionStrength: 0,
      showIndirectConnections: true,
      maxPathLength: 3,
    });
    setIsDurationInitialized(false);
  };

  const contactOptions = useMemo(() => {
    if (!data.listings) return [];
    const contacts = new Set<string>();
    const callerFields = ['caller_num', 'caller', 'calling_number', 'from_number'];
    const calleeFields = ['callee_num', 'callee', 'called_number', 'to_number'];
    data.listings.forEach(row => {
      const caller = findFieldValue(row, callerFields);
      const callee = findFieldValue(row, calleeFields);
      if (caller) contacts.add(caller);
      if (callee) contacts.add(callee);
    });
    return Array.from(contacts).sort().map(c => ({ value: c, label: c }));
  }, [data]);

  const selectStyles: StylesConfig = {
    control: (base) => ({ ...base, backgroundColor: 'var(--background)', borderColor: 'var(--border)' }),
    menu: (base) => ({ ...base, backgroundColor: 'var(--background)'}),
    menuList: (base) => ({...base, '::-webkit-scrollbar': {width: '4px'}, '::-webkit-scrollbar-track': {background: 'transparent'}, '::-webkit-scrollbar-thumb': {background: '#888'}}),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--muted)' : 'transparent',
      ':active': { ...base[':active'], backgroundColor: 'var(--primary-focus)'},
      color: state.isSelected ? 'white' : 'var(--foreground)'
    }),
    multiValue: (base) => ({...base, backgroundColor: 'var(--muted)' }),
    multiValueLabel: (base) => ({ ...base, color: 'var(--foreground)' }),
    input: (base) => ({...base, color: 'var(--foreground)'}),
  };

  const handleLinkTypeToggle = (linkType: "primary" | "secondary" | "weak") => {
    const newLinkTypes = filters.linkTypes.includes(linkType)
      ? filters.linkTypes.filter(type => type !== linkType)
      : [...filters.linkTypes, linkType];
    updateFilter("linkTypes", newLinkTypes);
  };

  const handleConnectionDegreeToggle = (degree: 1 | 2 | 3) => {
    const newDegrees = filters.connectionDegrees?.includes(degree)
      ? filters.connectionDegrees.filter(d => d !== degree)
      : [...(filters.connectionDegrees || []), degree];
    updateFilter("connectionDegrees", newDegrees);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="h-full bg-card border border-border rounded-lg shadow-sm flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Advanced Filters</h3>
          <button onClick={resetFilters} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            <XCircle className="w-4 h-4" /> Reset All
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Interaction Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Interaction Type
          </label>
          <div className="flex bg-muted p-1 rounded-md">
            {["all", "calls", "sms"].map(type => (
              <button 
                key={type} 
                onClick={() => updateFilter("interactionType", type as WorkbenchFilters['interactionType'])}
                className={`flex-1 capitalize text-sm py-1.5 rounded-md transition-colors ${
                  filters.interactionType === type 
                    ? 'bg-background shadow-sm text-primary font-semibold' 
                    : 'hover:bg-background/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* NEW: Multi-Degree Connection Analysis */}
        <div className="border-t border-border pt-4">
          <label className="block text-sm font-medium text-foreground mb-3">
            <Network className="w-4 h-4 inline mr-2" />
            Connection Analysis
          </label>
          
          <div className="space-y-4">
            {/* Connection Degrees */}
            <div className="space-y-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Connection Degrees</span>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleConnectionDegreeToggle(1)}
                  className={`flex flex-col items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.connectionDegrees?.includes(1)
                      ? 'bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <div className="text-center">
                    <div className="font-semibold">Primary</div>
                    <div className="text-xs opacity-75">Direct</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleConnectionDegreeToggle(2)}
                  className={`flex flex-col items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.connectionDegrees?.includes(2)
                      ? 'bg-amber-100 text-amber-800 border-2 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                >
                  <GitBranch className="w-4 h-4 text-amber-500" />
                  <div className="text-center">
                    <div className="font-semibold">Secondary</div>
                    <div className="text-xs opacity-75">A→B→C</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleConnectionDegreeToggle(3)}
                  className={`flex flex-col items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.connectionDegrees?.includes(3)
                      ? 'bg-gray-200 text-gray-800 border-2 border-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500'
                      : 'bg-gray-50 text-gray-500 border-2 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-3 h-px bg-gray-400 mx-1"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-3 h-px bg-gray-400 mx-1"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Tertiary</div>
                    <div className="text-xs opacity-75">A→B→C→D</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Connection Strength */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Multi-Degree Connection Strength
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={filters.minConnectionStrength || 0} 
                onChange={(e) => updateFilter("minConnectionStrength", parseInt(e.target.value))} 
                className="w-full" 
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Weak (0)</span>
                <span className="font-medium text-primary">{filters.minConnectionStrength || 0}%</span>
                <span>Strong (100)</span>
              </div>
            </div>

            {/* Additional Controls */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showIndirectConnections"
                  checked={filters.showIndirectConnections ?? true}
                  onChange={(e) => updateFilter("showIndirectConnections", e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="showIndirectConnections" className="text-sm text-foreground cursor-pointer">
                  Show indirect connections (2nd & 3rd degree)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum Path Length
                </label>
                <select
                  value={filters.maxPathLength || 3}
                  onChange={(e) => updateFilter("maxPathLength", parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                >
                  <option value={2}>2 steps (A→B→C)</option>
                  <option value={3}>3 steps (A→B→C→D)</option>
                  <option value={4}>4 steps (A→B→C→D→E)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Original Link Classification Section */}
        <div className="border-t border-border pt-4">
          <label className="block text-sm font-medium text-foreground mb-3">
            <Link className="w-4 h-4 inline mr-2" />
            Direct Link Classification
          </label>
          
          <div className="space-y-3">
            <div className="flex flex-col space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Link Quality Types</span>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleLinkTypeToggle("primary")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.linkTypes.includes("primary")
                      ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  High Quality
                </button>
                
                <button
                  onClick={() => handleLinkTypeToggle("secondary")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.linkTypes.includes("secondary")
                      ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  Medium Quality
                </button>
                
                <button
                  onClick={() => handleLinkTypeToggle("weak")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.linkTypes.includes("weak")
                      ? 'bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  Low Quality
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Minimum Link Strength Score
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={filters.minStrengthScore} 
                onChange={(e) => updateFilter("minStrengthScore", parseInt(e.target.value))} 
                className="w-full" 
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span className="font-medium text-primary">{filters.minStrengthScore}</span>
                <span>100</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showWeakLinks"
                checked={filters.showWeakLinks}
                onChange={(e) => updateFilter("showWeakLinks", e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="showWeakLinks" className="text-sm text-foreground cursor-pointer">
                Show weak direct connections
              </label>
            </div>
          </div>
        </div>

        {/* Focus on Contacts */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Focus on Contacts
          </label>
          <Select
            isMulti
            options={contactOptions}
            placeholder="Select contacts..."
            value={contactOptions.filter(opt => filters.contactWhitelist.includes(opt.value))}
            onChange={(selected) => updateFilter('contactWhitelist', selected.map(s => s.value))}
            styles={selectStyles}
            className="text-sm"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {filters.contactWhitelist.length > 0 && (
              <span>Showing connections for {filters.contactWhitelist.length} selected contact{filters.contactWhitelist.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {/* Minimum Interactions */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Hash className="w-4 h-4 inline mr-2" />
            Minimum Interactions
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={filters.minInteractions} 
            onChange={(e) => updateFilter("minInteractions", parseInt(e.target.value))} 
            className="w-full" 
          />
          <div className="text-center text-sm font-medium text-primary">
            {filters.minInteractions}+ Interactions
          </div>
        </div>
        
        {/* Enhanced Call Duration Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Clock className="w-4 h-4 inline mr-2" />
            Call Duration Filter
          </label>
          
          <div className="space-y-3">
            {/* Duration Statistics Display */}
            <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dataset Statistics:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>Min: <span className="font-medium">{formatDuration(durationStats.min)}</span></div>
                <div>Max: <span className="font-medium">{formatDuration(durationStats.max)}</span></div>
                <div>Mean: <span className="font-medium text-primary">{formatDuration(durationStats.mean)}</span></div>
                <div>Median: <span className="font-medium">{formatDuration(durationStats.median)}</span></div>
              </div>
            </div>

            {/* Duration Range Controls */}
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Minimum Duration</label>
                <input 
                  type="range" 
                  min={durationStats.min} 
                  max={durationStats.max} 
                  value={filters.durationRange.min} 
                  onChange={(e) => updateFilter('durationRange', { 
                    ...filters.durationRange, 
                    min: parseInt(e.target.value) 
                  })} 
                  className="w-full" 
                />
                <div className="text-center text-sm font-medium text-primary">
                  {formatDuration(filters.durationRange.min)}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Maximum Duration</label>
                <input 
                  type="range" 
                  min={durationStats.min} 
                  max={durationStats.max} 
                  value={filters.durationRange.max} 
                  onChange={(e) => updateFilter('durationRange', { 
                    ...filters.durationRange, 
                    max: parseInt(e.target.value) 
                  })} 
                  className="w-full" 
                />
                <div className="text-center text-sm font-medium text-primary">
                  {formatDuration(filters.durationRange.max)}
                </div>
              </div>
            </div>

            {/* Quick Duration Presets */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => updateFilter('durationRange', { min: 0, max: 30 })}
                className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded"
              >
                Short (&lt;30s)
              </button>
              <button
                onClick={() => updateFilter('durationRange', { min: 0, max: durationStats.mean })}
                className="px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded"
              >
                Up to Mean
              </button>
              <button
                onClick={() => updateFilter('durationRange', { min: durationStats.mean, max: durationStats.max })}
                className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded"
              >
                Above Mean
              </button>
              <button
                onClick={() => updateFilter('durationRange', { min: 300, max: durationStats.max })}
                className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded"
              >
                Long (&gt;5min)
              </button>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date Range
          </label>
          <div className="space-y-3">
            <input 
              type="date" 
              value={filters.dateRange.start} 
              onChange={(e) => updateFilter("dateRange", { ...filters.dateRange, start: e.target.value })} 
              className="w-full px-3 py-2 bg-background border border-border rounded-md"
              placeholder="Start date"
            />
            <input 
              type="date" 
              value={filters.dateRange.end} 
              onChange={(e) => updateFilter("dateRange", { ...filters.dateRange, end: e.target.value })} 
              className="w-full px-3 py-2 bg-background border border-border rounded-md"
              placeholder="End date"
            />
          </div>
        </div>
      </div>
    </div>
  );
}