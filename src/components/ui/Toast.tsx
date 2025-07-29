
// src/components/ui/Toast.tsx
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type = 'info', isVisible, onClose }: ToastProps) {
  if (!isVisible) return null;

  const types = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-blue-500 text-white"
  };

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${types[type]} transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-current hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// src/components/ui/Tabs.tsx
interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ items, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || items[0]?.id);

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
