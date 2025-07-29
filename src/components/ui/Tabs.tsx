// src/components/ui/Tabs.tsx
"use client";

import { useState } from 'react';

interface TabItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ items, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === item.id
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {items.find((item) => item.id === activeTab)?.content}
      </div>
    </div>
  );
}