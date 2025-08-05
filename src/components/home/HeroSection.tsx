'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { AnimatedShinyButton } from '../ui/AnimatedShinyButton';
import { ArrowRight, Sparkles, Zap, Network } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

// Floating particles component - optimized for both themes
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-primary/40 rounded-full shadow-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 4,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// Interactive grid component - theme aware
const InteractiveGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid pattern that adapts to theme */}
      <div className="bg-grid-pattern absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_60%,transparent_100%)]" />
      
      {/* Animated gradient overlay - different for light/dark */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, rgba(142, 67, 255, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, rgba(30, 5, 70, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, rgba(142, 67, 255, 0.06) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, rgba(30, 5, 70, 0.06) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

// Animated stats component - improved for light theme
const AnimatedStats = () => {
  const stats = [
    { value: "10K+", label: "Networks Analyzed", icon: Network },
    { value: "99.9%", label: "Uptime", icon: Zap },
    { value: "500ms", label: "Response Time", icon: Sparkles },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
      className="grid grid-cols-3 gap-6 md:gap-8 mt-16"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
          className="text-center group"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 mb-3 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300 shadow-sm">
            <stat.icon className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const HeroSection = () => {
  const t = useTranslations('HeroSection');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Background Elements - Theme Aware */}
      <InteractiveGrid />
      <FloatingParticles />
      
      {/* Parallax Background Shapes - Optimized for both themes */}
      <motion.div style={{ y }} className="absolute inset-0">
        {/* Light theme: subtle colored backgrounds, Dark theme: more vibrant */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/[0.03] dark:bg-primary/[0.08] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-dark/[0.02] dark:bg-primary-dark/[0.06] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/[0.015] to-primary-dark/[0.015] dark:from-primary/[0.04] dark:to-primary-dark/[0.04] rounded-full blur-3xl" />
      </motion.div>

      {/* Main Content */}
      <motion.div
        style={{ opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container relative z-10 mx-auto max-w-7xl px-4 py-32 text-center"
      >
        {/* Badge - Enhanced for light theme */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 dark:bg-primary/10 border border-primary/15 dark:border-primary/20 text-sm font-medium text-primary glass-morphism shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Introducing SYNAPSE</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </motion.div>

        {/* Main Heading - Improved contrast */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-8"
        >
          <span className="block gradient-text-animated">
            Visualize
          </span>
          <span className="block text-foreground">
            Complex
          </span>
          <span className="block gradient-text">
            Networks
          </span>
        </motion.h1>

        {/* Subtitle - Better contrast for light mode */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          {t('description')} 
          <span className="block mt-2 text-lg font-medium text-primary">
            Powered by cutting-edge AI and real-time analytics
          </span>
        </motion.p>

        {/* CTA Buttons - Enhanced styling */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatedShinyButton href="/en/workbench" className="btn-primary text-lg px-8 py-4 shadow-lg">
              <Zap className="w-5 h-5 mr-2" />
              Visualisation
              <ArrowRight className="w-5 h-5 ml-2" />
            </AnimatedShinyButton>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary text-lg px-8 py-4 group shadow-md hover:shadow-lg"
          >
            <Network className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Watch Demo
          </motion.button>
        </motion.div>

        {/* Animated Stats */}
        <AnimatedStats />

        {/* Scroll Indicator - Theme aware */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-primary/60 rounded-full flex justify-center bg-background/50 backdrop-blur-sm shadow-sm"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 bg-primary rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom Gradient Overlay - Theme aware */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
    </section>
  );
};