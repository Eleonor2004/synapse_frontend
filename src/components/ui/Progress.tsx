
// src/components/ui/Progress.tsx
import React from 'react';
interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'gradient';
}

export function Progress({ 
  value, 
  max = 100, 
  className = '', 
  showLabel = false,
  variant = 'default'
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variants = {
    default: "bg-[#8e43ff]",
    gradient: "bg-gradient-to-r from-[#1e0546] to-[#8e43ff]"
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${variants[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}