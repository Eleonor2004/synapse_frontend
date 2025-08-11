'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { AnimatedShinyButton } from '../ui/AnimatedShinyButton';
import { ArrowRight, Sparkles, Zap, Network } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

// Enhanced Graph Network Component
const AnimatedGraphNetwork = () => {
  const [nodes, setNodes] = useState<Array<{ 
    id: number; 
    x: number; 
    y: number; 
    size: number; 
    delay: number;
    connections: number[];
  }>>([]);

  const [edges, setEdges] = useState<Array<{
    id: number;
    from: number;
    to: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    // Generate nodes in a more organic distribution
    const newNodes = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70, // Keep away from edges
      y: 20 + Math.random() * 60,
      size: 4 + Math.random() * 6, // Bigger nodes (4-10px)
      delay: Math.random() * 3,
      connections: [],
    }));

    // Create connections between nearby nodes
    const newEdges: Array<{id: number; from: number; to: number; delay: number}> = [];
    let edgeId = 0;

    newNodes.forEach((node, i) => {
      const nearbyNodes = newNodes.filter((otherNode, j) => {
        if (i === j) return false;
        const distance = Math.sqrt(
          Math.pow(node.x - otherNode.x, 2) + 
          Math.pow(node.y - otherNode.y, 2)
        );
        return distance < 25 && Math.random() > 0.6; // 40% connection chance for nearby nodes
      });

      nearbyNodes.slice(0, 2).forEach((nearbyNode) => {
        if (!newEdges.find(edge => 
          (edge.from === i && edge.to === nearbyNode.id) ||
          (edge.from === nearbyNode.id && edge.to === i)
        )) {
          newEdges.push({
            id: edgeId++,
            from: i,
            to: nearbyNode.id,
            delay: Math.random() * 2,
          });
          newNodes[i].connections.push(nearbyNode.id);
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* SVG for crisp lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Render edges */}
        {edges.map((edge) => {
          const fromNode = nodes[edge.from];
          const toNode = nodes[edge.to];
          
          if (!fromNode || !toNode) return null;

          return (
            <motion.line
              key={edge.id}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="url(#edgeGradient)"
              strokeWidth="2.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 0.7], 
                opacity: [0, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                delay: edge.delay,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </svg>

      {/* Render nodes */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute rounded-full"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size}px`,
            height: `${node.size}px`,
          }}
          initial={{ 
            scale: 0, 
            opacity: 0,
            background: "hsl(var(--primary) / 0.4)",
          }}
          animate={{ 
            scale: [0, 1.3, 1],
            opacity: [0, 0.8, 0.5],
            background: [
              "hsl(var(--primary) / 0.4)",
              "hsl(var(--primary) / 0.7)", 
              "hsl(var(--primary) / 0.5)"
            ],
          }}
          transition={{
            duration: 2.5,
            delay: node.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeOut",
          }}
        >
          {/* Enhanced pulsing ring effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/40"
            animate={{
              scale: [1, 2.8, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 3.5,
              delay: node.delay + 0.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          
          {/* Additional outer ring for larger nodes */}
          {node.size > 7 && (
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/30"
              animate={{
                scale: [1, 3.5, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 4,
                delay: node.delay + 1.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </motion.div>
      ))}

      {/* Data flow particles along edges */}
      {edges.slice(0, 8).map((edge, index) => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        
        if (!fromNode || !toNode) return null;

        return (
          <motion.div
            key={`particle-${edge.id}`}
            className="absolute w-3.5 h-1.5 rounded-full bg-primary/80 shadow-lg shadow-primary/20"
            initial={{
              x: `${fromNode.x}%`,
              y: `${fromNode.y}%`,
              opacity: 0,
            }}
            animate={{
              x: [`${fromNode.x}%`, `${toNode.x}%`],
              y: [`${fromNode.y}%`, `${toNode.y}%`],
              opacity: [0, 1, 0],
              scale: [0.3, 1.2, 0.3],
            }}
            transition={{
              duration: 2.2,
              delay: index * 0.25 + 1,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

// Floating particles component - optimized for both themes
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
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
          className="absolute w-0.5 h-0.5 bg-primary/30 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 5,
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
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(var(--primary-rgb) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary-rgb) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />
      
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, rgba(142, 67, 255, 0.03) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, rgba(30, 5, 70, 0.03) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, rgba(142, 67, 255, 0.02) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, rgba(30, 5, 70, 0.02) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 12,
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

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Background Elements - Theme Aware */}
      <InteractiveGrid />
      
      {/* Animated Graph Network - Main Feature */}
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "20%"]) }}>
        <AnimatedGraphNetwork />
      </motion.div>
      
      <FloatingParticles />
      
      {/* Parallax Background Shapes - More subtle */}
      <motion.div style={{ y }} className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/[0.02] dark:bg-primary/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-dark/[0.015] dark:bg-primary-dark/[0.04] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/[0.01] to-primary-dark/[0.01] dark:from-primary/[0.03] dark:to-primary-dark/[0.03] rounded-full blur-3xl" />
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 dark:bg-primary/10 border border-primary/15 dark:border-primary/20 text-sm font-medium text-primary glass-morphism shadow-sm backdrop-blur-sm">
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
            Data
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