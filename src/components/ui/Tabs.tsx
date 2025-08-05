// src/components/ui/Tabs.tsx

// FIX: Import useState from React at the top of the file.
import React, { useState } from 'react';

interface TabItem {
  id: string;
  // The error in help/page.tsx was because it expected 'title', but the component uses 'label'.
  // I am reverting this to 'label' as it seems to be the intended prop for this component.
  // If you see the 'title' vs 'label' error again, you will need to make them consistent.
  label: string; 
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ items, defaultTab, className = '' }: TabsProps) {
  // FIX: Use the imported 'useState' directly instead of 'React.useState'
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  return (
    <div className={className}>
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-white dark:bg-gray-700 text-[#8e43ff] shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {items.find(item => item.id === activeTab)?.content}
      </div>
    </div>
  );
}