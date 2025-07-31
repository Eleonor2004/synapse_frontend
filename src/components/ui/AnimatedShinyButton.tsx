'use client';

import { useTranslations } from 'next-intl';
import { motion, type AnimationProps } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const animationProps = {
  initial: { 
    "--x": "100%", 
    scale: 1,
    "--shimmer": "0%"
  },
  animate: { 
    "--x": "-100%",
    "--shimmer": "100%"
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
} as AnimationProps;

const shimmerAnimation = {
  initial: { x: "-100%" },
  animate: { 
    x: "100%",
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      repeatDelay: 3,
      duration: 2,
      ease: "linear"
    }
  }
};

const iconAnimation = {
  rest: { x: 0, rotate: 0 },
  hover: { 
    x: 4, 
    rotate: 15,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const sparkleAnimation = {
  rest: { scale: 0, rotate: 0 },
  hover: { 
    scale: [0, 1.2, 1],
    rotate: [0, 180, 360],
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const ShinyButton = ({ text, href }: { text: string; href: string }) => {
  return (
    <Link href={href} passHref>
      <motion.div
        className="relative group cursor-pointer"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        {/* Background gradient with animated shine */}
        <motion.button
          {...animationProps}
          className="relative overflow-hidden rounded-xl px-8 py-4 font-bold text-white backdrop-blur-xl transition-all duration-500 ease-out group-hover:shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgb(142 67 255) 0%, rgb(30 5 70) 100%)',
            boxShadow: '0 10px 25px -3px rgb(142 67 255 / 0.4), 0 4px 6px -4px rgb(142 67 255 / 0.4)',
          }}
        >
          {/* Animated shimmer effect */}
          <motion.div
            {...shimmerAnimation}
            className="absolute inset-0 w-full h-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              transform: 'skewX(-20deg)',
            }}
          />
          
          {/* Main shine effect */}
          <span
            className="relative block h-full w-full text-sm uppercase tracking-wide font-bold flex items-center justify-center gap-3"
            style={{
              maskImage: 'linear-gradient(-75deg, black calc(var(--x) + 20%), transparent calc(var(--x) + 30%), black calc(var(--x) + 100%))',
            }}
          >
            {/* Sparkle icon */}
            <motion.div variants={sparkleAnimation}>
              <Sparkles className="w-5 h-5" />
            </motion.div>
            
            {text}
            
            {/* Arrow icon */}
            <motion.div variants={iconAnimation}>
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </span>
          
          {/* Glowing border effect */}
          <span
            style={{
              mask: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
              maskComposite: 'exclude',
            }}
            className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,hsl(var(--primary)/0.1)_calc(var(--x)+20%),hsl(var(--primary)/0.8)_calc(var(--x)+25%),hsl(var(--primary)/0.1)_calc(var(--x)+100%))] p-px"
          />
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.button>
        
        {/* Outer glow on hover */}
        <div 
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500 -z-10"
          style={{
            background: 'linear-gradient(135deg, rgb(142 67 255 / 0.3) 0%, rgb(30 5 70 / 0.3) 100%)',
          }}
        />
      </motion.div>
    </Link>
  );
};

export const AnimatedShinyButton = ({ href }: { href: string }) => {
  return <ShinyButton text={"Visualisation"} href={href} />;
};