'use client';

import { useTranslations } from 'next-intl';
import { Network, Waypoints, BarChart3, Zap, Shield, Globe, TrendingUp, Users, Brain } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const features = [
  { 
    icon: Network, 
    key: 'feature1',
    gradient: 'from-purple-500 to-pink-500',
    delay: 0
  },
  { 
    icon: Waypoints, 
    key: 'feature2',
    gradient: 'from-blue-500 to-cyan-500',
    delay: 0.2
  },
  { 
    icon: BarChart3, 
    key: 'feature3',
    gradient: 'from-green-500 to-emerald-500',
    delay: 0.4
  },
];

// Enhanced features for a more comprehensive display
const enhancedFeatures = [
  { 
    icon: Brain, 
    key: 'ai_powered',
    title: 'AI-Powered Analysis',
    description: 'Leverage machine learning algorithms to discover hidden patterns and insights in your network data.',
    gradient: 'from-purple-500 to-pink-500',
    delay: 0
  },
  { 
    icon: Zap, 
    key: 'real_time',
    title: 'Real-Time Processing',
    description: 'Process and visualize network changes as they happen with lightning-fast performance.',
    gradient: 'from-yellow-500 to-orange-500',
    delay: 0.1
  },
  { 
    icon: Shield, 
    key: 'secure',
    title: 'Enterprise Security',
    description: 'Bank-level encryption and security protocols to keep your sensitive network data protected.',
    gradient: 'from-blue-500 to-cyan-500',
    delay: 0.2
  },
  { 
    icon: Globe, 
    key: 'global_scale',
    title: 'Global Scale',
    description: 'Analyze networks of any size, from small teams to global enterprise infrastructures.',
    gradient: 'from-green-500 to-emerald-500',
    delay: 0.3
  },
  { 
    icon: TrendingUp, 
    key: 'predictive',
    title: 'Predictive Analytics',
    description: 'Forecast network behavior and identify potential issues before they impact your operations.',
    gradient: 'from-red-500 to-pink-500',
    delay: 0.4
  },
  { 
    icon: Users, 
    key: 'collaboration',
    title: 'Team Collaboration',
    description: 'Share insights and collaborate with your team in real-time with advanced permission controls.',
    gradient: 'from-indigo-500 to-purple-500',
    delay: 0.5
  },
];

// Interactive card component
const InteractiveFeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        transition: {
          duration: 0.8,
          delay: feature.delay,
          ease: [0.4, 0, 0.2, 1]
        }
      } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div className="card-modern p-8 h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-500">
        {/* Animated background gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-xl`}
          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Floating icon container */}
        <motion.div
          animate={isHovered ? { 
            y: -5,
            rotate: [0, -5, 5, 0],
            scale: 1.1
          } : { y: 0, rotate: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className={`flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
            <feature.icon className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          <motion.h3 
            className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300"
            animate={isHovered ? { x: 5 } : { x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {feature.title}
          </motion.h3>
          
          <motion.p 
            className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300"
            animate={isHovered ? { x: 5 } : { x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {feature.description}
          </motion.p>
        </div>

        {/* Hover effect particles */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 bg-gradient-to-r ${feature.gradient} rounded-full`}
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [-20, -40],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        {/* Bottom accent line */}
        <motion.div
          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-xl`}
          initial={{ width: "0%" }}
          animate={isHovered ? { width: "100%" } : { width: "0%" }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

// Original simple card for backward compatibility
const SimpleFeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  const t = useTranslations('FeatureList');
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          duration: 0.6,
          delay: feature.delay,
          ease: [0.4, 0, 0.2, 1]
        }
      } : {}}
      whileHover={{ 
        y: -8,
        scale: 1.03,
        transition: { duration: 0.3 }
      }}
      className="group"
    >
      <div className="card-modern p-8 h-full bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-300">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className={`flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg group-hover:shadow-xl`}
        >
          <feature.icon className="h-7 w-7 text-white" />
        </motion.div>
        
        <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
          {t(`${feature.key}_title`)}
        </h3>
        
        <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors leading-relaxed">
          {t(`${feature.key}_description`)}
        </p>
      </div>
    </motion.div>
  );
};

export const FeatureList = () => {
  const t = useTranslations('FeatureList');
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 bg-secondary/30 border-y border-border/50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-dot-pattern [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-primary-dark/5 rounded-full blur-3xl" />
      
      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6"
          >
            <Zap className="w-4 h-4" />
            <span>Powerful Features</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            <span className="gradient-text">Everything you need</span>
            <br />
            <span className="text-foreground">to succeed</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('title')} Discover the comprehensive suite of tools designed to transform how you analyze and understand complex networks.
          </p>
        </motion.div>

        {/* Enhanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {enhancedFeatures.map((feature, index) => (
            <InteractiveFeatureCard 
              key={feature.key} 
              feature={feature}
              index={index}
            />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-8 py-4"
            >
              <Zap className="w-5 h-5 mr-2" />
              Explore All Features
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-ghost text-lg px-6 py-4 text-primary hover:bg-primary/10"
            >
              Request Demo →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};