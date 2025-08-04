// src/components/workbench/FilterPanel.tsx

"use client";

import { useState } from "react";
import { Search, Calendar, Phone, MessageSquare, Users, Hash } from "lucide-react";
import { ExcelData } from "@/app/[locale]/workbench/page";

// Define a specific type for the filters
interface Filters {
  interactionType: "all" | "calls" | "sms";
  dateRange: { start: string; end: string };
  individuals: string[];
  minInteractions: number;
}

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  data: ExcelData;
}

export function FilterPanel({ filters, onFiltersChange, data }: FilterPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Use generics for a type-safe update function
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      interactionType: "all",
      dateRange: { start: "", end: "" },
      individuals: [],
      minInteractions: 0,
    });
    setSearchQuery("");
  };

  return (
    <div className="h-full bg-card border border-border rounded-lg shadow-sm">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          <button
            onClick={resetFilters}
            className="text-sm text-secondary hover:text-secondary-light transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-300px)]">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <Search className="w-4 h-4 inline mr-2" />
            Search Individual
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter phone number or IMEI..."
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Interaction Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Interaction Type
          </label>
          <div className="space-y-2">
            {[
              { value: "all", label: "All Interactions", icon: Users },
              { value: "calls", label: "Calls Only", icon: Phone },
              { value: "sms", label: "SMS Only", icon: MessageSquare },
            ].map(({ value, label, icon: Icon }) => (
              <label key={value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="interactionType"
                  value={value}
                  checked={filters.interactionType === value}
                  onChange={(e) => updateFilter("interactionType", e.target.value as Filters['interactionType'])}
                  className="sr-only"
                />
                <div
                  className={`
                  flex items-center gap-3 w-full p-3 rounded-lg border transition-all
                  ${
                    filters.interactionType === value
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-border hover:border-secondary/50 hover:bg-muted/50"
                  }
                `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date Range
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  updateFilter("dateRange", {
                    ...filters.dateRange,
                    start: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">End Date</label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  updateFilter("dateRange", {
                    ...filters.dateRange,
                    end: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Minimum Interactions */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Hash className="w-4 h-4 inline mr-2" />
            Minimum Interactions
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minInteractions}
              onChange={(e) => updateFilter("minInteractions", parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className="font-medium text-secondary">{filters.minInteractions}</span>
              <span>100+</span>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Quick Filters</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { key: "highActivity", label: "High Activity (50+ interactions)" },
              { key: "recentActivity", label: "Recent Activity (Last 7 days)" },
              { key: "suspiciousPatterns", label: "Suspicious Patterns" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" />
                <div className="flex items-center gap-3 w-full p-3 rounded-lg border border-border hover:border-secondary/50 hover:bg-muted/50 transition-all">
                  <div className="w-4 h-4 border border-border rounded flex-shrink-0" />
                  <span className="text-sm">{label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Current Dataset</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Records:</span>
              <span className="font-medium">{data.listings?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unique Numbers:</span>
              <span className="font-medium">{data.subscribers?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date Range:</span>
              <span className="font-medium text-xs">Auto-detected</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--secondary);
          cursor: pointer;
          border: 2px solid var(--background);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
        }
      `}</style>
    </div>
  );
}