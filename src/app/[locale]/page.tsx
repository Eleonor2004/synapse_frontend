// src/app/[locale]/page.tsx
"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Globe, 
  TrendingUp, 
  Users, 
  Brain,
  Network,
  Eye,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";

// Generate static params for the supported locales
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' }
  ];
}

// Define translations directly in the component
const translations = {
  en: {
    hero: {
      title: "Visualize Complex Networks with",
      titleHighlight: "SYNAPSE",
      subtitle: "The ultimate platform for analyzing and visualizing complex communication networks with cutting-edge AI technology.",
      ctaPrimary: "Start Analyzing",
      ctaSecondary: "Watch Demo"
    },
    features: {
      title: "Why Choose SYNAPSE?",
      subtitle: "Powerful features designed for modern network analysis",
      items: [
        {
          icon: "Brain",
          title: "AI-Powered Analysis",
          description: "Advanced machine learning algorithms provide deep insights into your network data."
        },
        {
          icon: "Network",
          title: "Real-time Visualization",
          description: "Interactive, dynamic visualizations that update in real-time as your data changes."
        },
        {
          icon: "Shield",
          title: "Enterprise Security",
          description: "Bank-level security ensures your sensitive network data remains protected."
        },
        {
          icon: "Globe",
          title: "Global Scale",
          description: "Analyze networks of any size, from small teams to global organizations."
        },
        {
          icon: "TrendingUp",
          title: "Predictive Analytics",
          description: "Forecast network trends and identify potential issues before they occur."
        },
        {
          icon: "Eye",
          title: "Intuitive Interface",
          description: "Clean, modern interface designed for both beginners and experts."
        }
      ]
    },
    stats: {
      title: "Trusted by Industry Leaders",
      items: [
        { number: "50K+", label: "Networks Analyzed" },
        { number: "99.9%", label: "Uptime Guarantee" },
        { number: "500+", label: "Enterprise Clients" },
        { number: "24/7", label: "Expert Support" }
      ]
    },
    cta: {
      title: "Ready to Transform Your Network Analysis?",
      subtitle: "Join thousands of organizations already using SYNAPSE to unlock the power of their communication networks.",
      button: "Get Started Today"
    }
  },
  fr: {
    hero: {
      title: "Visualisez les Réseaux Complexes avec",
      titleHighlight: "SYNAPSE",
      subtitle: "La plateforme ultime pour analyser et visualiser les réseaux de communication complexes avec une technologie IA de pointe.",
      ctaPrimary: "Commencer l'Analyse",
      ctaSecondary: "Voir la Démo"
    },
    features: {
      title: "Pourquoi Choisir SYNAPSE ?",
      subtitle: "Des fonctionnalités puissantes conçues pour l'analyse moderne des réseaux",
      items: [
        {
          icon: "Brain",
          title: "Analyse Alimentée par l'IA",
          description: "Des algorithmes d'apprentissage automatique avancés fournissent des insights approfondis sur vos données réseau."
        },
        {
          icon: "Network",
          title: "Visualisation en Temps Réel",
          description: "Visualisations interactives et dynamiques qui se mettent à jour en temps réel lorsque vos données changent."
        },
        {
          icon: "Shield",
          title: "Sécurité Entreprise",
          description: "Une sécurité de niveau bancaire garantit que vos données réseau sensibles restent protégées."
        },
        {
          icon: "Globe",
          title: "Échelle Mondiale",
          description: "Analysez des réseaux de toute taille, des petites équipes aux organisations mondiales."
        },
        {
          icon: "TrendingUp",
          title: "Analyses Prédictives",
          description: "Prévoyez les tendances du réseau et identifiez les problèmes potentiels avant qu'ils ne surviennent."
        },
        {
          icon: "Eye",
          title: "Interface Intuitive",
          description: "Interface propre et moderne conçue pour les débutants et les experts."
        }
      ]
    },
    stats: {
      title: "Approuvé par les Leaders de l'Industrie",
      items: [
        { number: "50K+", label: "Réseaux Analysés" },
        { number: "99.9%", label: "Garantie de Disponibilité" },
        { number: "500+", label: "Clients Entreprise" },
        { number: "24/7", label: "Support Expert" }
      ]
    },
    cta: {
      title: "Prêt à Transformer Votre Analyse de Réseau ?",
      subtitle: "Rejoignez des milliers d'organisations qui utilisent déjà SYNAPSE pour libérer la puissance de leurs réseaux de communication.",
      button: "Commencer Aujourd'hui"
    }
  }
} as const;

const iconMap = {
  Brain,
  Network,
  Shield,
  Globe,
  TrendingUp,
  Eye,
  Zap,
  Users,
  Sparkles
};

export default function HomePage() {
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Get translations for current locale with fallback to English
  const t = translations[locale as keyof typeof translations] || translations.en;

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-[#1e0546]/20 to-[#8e43ff]/20 rounded-full blur-3xl opacity-70 animate-pulse"
          style={{
            left: mousePosition.x * 0.02 + 'px',
            top: mousePosition.y * 0.02 + 'px',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-72 h-72 bg-gradient-to-r from-[#8e43ff]/20 to-[#1e0546]/20 rounded-full blur-3xl opacity-50"
          style={{
            right: mousePosition.x * 0.01 + 'px',
            bottom: mousePosition.y * 0.01 + 'px',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="container mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-[#8e43ff] rounded-full opacity-20 animate-pulse"
                  style={{
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    animationDelay: Math.random() * 3 + 's',
                    animationDuration: (Math.random() * 3 + 2) + 's'
                  }}
                />
              ))}
            </div>

            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#1e0546]/10 to-[#8e43ff]/10 rounded-full border border-[#8e43ff]/20 mb-8">
              <Sparkles className="w-4 h-4 text-[#8e43ff] mr-2" />
              <span className="text-sm font-medium text-[#8e43ff]">AI-Powered Network Analysis</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
              <span className="text-gray-900 dark:text-white">{t.hero.title}</span>
              <br />
              <span className="gradient-text relative">
                {t.hero.titleHighlight}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#1e0546] to-[#8e43ff] rounded-lg blur opacity-30 animate-pulse" />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Link
                href={`/${locale}/workbench`}
                className="btn-primary flex items-center space-x-2 px-8 py-4 text-lg font-semibold rounded-xl shadow-brand hover:shadow-brand-lg transform hover:scale-105 transition-all duration-300"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <button className="flex items-center space-x-2 px-8 py-4 text-lg font-semibold rounded-xl border-2 border-[#8e43ff] text-[#8e43ff] hover:bg-[#8e43ff] hover:text-white transition-all duration-300 hover:scale-105">
                <span>{t.hero.ctaSecondary}</span>
                <div className="w-8 h-8 rounded-full bg-[#8e43ff]/20 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-[#8e43ff] border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1" />
                </div>
              </button>
            </div>

            {/* Floating Network Visualization */}
            <div className="relative mx-auto w-full max-w-2xl">
              <div className="glass-morphism rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e0546]/5 to-[#8e43ff]/5" />
                <div className="relative">
                  <div className="grid grid-cols-3 gap-8 items-center">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1e0546] to-[#8e43ff] flex items-center justify-center shadow-brand opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-110"
                        style={{
                          animationDelay: i * 0.2 + 's'
                        }}
                      >
                        <div className="w-6 h-6 rounded-full bg-white/30" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e0546" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8e43ff" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    {[...Array(6)].map((_, i) => (
                      <line
                        key={i}
                        x1={Math.random() * 100}
                        y1={Math.random() * 100}
                        x2={Math.random() * 100}
                        y2={Math.random() * 100}
                        stroke="url(#lineGradient)"
                        strokeWidth="1"
                        className="animate-pulse"
                        style={{ animationDelay: i * 0.5 + 's' }}
                      />
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            {t.stats.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {t.stats.items.map((stat, index) => (
              <div
                key={index}
                className="text-center card-modern p-8 hover:scale-105 transition-all duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              {t.features.title}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.features.items.map((feature, index) => {
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
              return (
                <div
                  key={index}
                  className="card-modern p-8 group hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: index * 0.1 + 's' }}
                >
                  <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-brand transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e0546] to-[#8e43ff] opacity-90" />
        <div className="relative container mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t.cta.title}
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            {t.cta.subtitle}
          </p>
          <Link
            href={`/${locale}/workbench`}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-[#1e0546] font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl"
          >
            <span className="text-lg">{t.cta.button}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}