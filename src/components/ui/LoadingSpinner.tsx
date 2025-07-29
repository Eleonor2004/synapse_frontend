
// src/components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="relative">
        <div className="w-full h-full rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-transparent border-t-[#8e43ff] animate-spin"></div>
      </div>
    </div>
  );
}
