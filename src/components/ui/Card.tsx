// src/components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  padding = 'md'
}: CardProps) {
  const baseClasses = "rounded-xl transition-all duration-300";
  
  const variants = {
    default: "card-modern",
    glass: "card-glass",
    gradient: "bg-gradient-to-br from-[#1e0546]/10 to-[#8e43ff]/10 border border-[#8e43ff]/20"
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  const hoverEffect = hover ? "hover:scale-105" : "";

  return (
    <div className={`${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverEffect} ${className}`}>
      {children}
    </div>
  );
}
