'use client';

// FIX: Removed 'AnimationProps' as it does not exist in framer-motion
import { motion } from 'framer-motion';
import Link from 'next/link';
// FIX: Removed unused icon imports
import React from 'react'; // Import React for ReactNode type

// FIX: Removed the incorrect 'as AnimationProps' type assertion
const animationProps = {
  initial: { 
    "--x": "100%", 
    scale: 1,
  },
  animate: { 
    "--x": "-100%",
  },
  whileHover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  whileTap: { scale: 0.98 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 2,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      mass: 0.8,
    },
  },
};

interface AnimatedShinyButtonProps {
  children: React.ReactNode;
  className?: string;
  href: string;
}

export const AnimatedShinyButton = ({ children, className, href }: AnimatedShinyButtonProps) => {
  return (
    <Link href={href} passHref>
      <motion.button
        {...animationProps}
        className={`relative rounded-xl font-bold text-white backdrop-blur-xl transition-all duration-500 ease-out group-hover:shadow-2xl ${className}`}
        style={{
          background: 'linear-gradient(135deg, rgb(142 67 255) 0%, rgb(30 5 70) 100%)',
          boxShadow: '0 10px 25px -3px rgb(142 67 255 / 0.4), 0 4px 6px -4px rgb(142 67 255 / 0.4)',
        }}
      >
        <span
          className="relative block h-full w-full text-sm uppercase tracking-wide font-bold"
          style={{
            maskImage: 'linear-gradient(-75deg, black calc(var(--x) + 20%), transparent calc(var(--x) + 30%), black calc(var(--x) + 100%))',
          }}
        >
          <div className="flex items-center justify-center gap-2">
            {children}
          </div>
        </span>
        <span
          style={{
            mask: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
            maskComposite: 'exclude',
          }}
          className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,hsl(var(--primary)/0.1)_calc(var(--x)+20%),hsl(var(--primary)/0.8)_calc(var(--x)+25%),hsl(var(--primary)/0.1)_calc(var(--x)+100%))] p-px"
        />
      </motion.button>
    </Link>
  );
};