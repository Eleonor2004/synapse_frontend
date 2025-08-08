'use client';

import React, { useState, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, Video } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

// Define the structure for our translations
type Translations = {
  [key: string]: {
    title: string;
    subtitle: string;
    badge_interactive: string;
    badge_realtime: string;
    badge_responsive: string;
  };
};

// All translations are now self-contained within the component
const translations: Translations = {
  en: {
    title: "See Your Data in Action",
    subtitle: "Watch how our visualization engine brings complex data relationships to life with stunning clarity and speed.",
    badge_interactive: "Interactive",
    badge_realtime: "Real-Time",
    badge_responsive: "Responsive"
  },
  fr: {
    title: "Voyez Vos Données en Action",
    subtitle: "Découvrez comment notre moteur de visualisation donne vie aux relations de données complexes avec une clarté et une vitesse époustouflantes.",
    badge_interactive: "Interactif",
    badge_realtime: "Temps Réel",
    badge_responsive: "Adaptatif"
  }
};


export const VideoShowcase = ({ 
  videoSrc, 
  className = "" 
}) => {
  // --- Internal I18n Logic ---
  const locale = useLocale();
  // Select the correct language object, defaulting to 'en' if the locale is not found
  const t = translations[locale] || translations.en;

  // --- State and Refs ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // --- Animation Hooks ---
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  // --- Video Control Functions ---
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        if (videoRef.current.muted) {
          videoRef.current.muted = false;
          setIsMuted(false);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const featureBadgeKeys: (keyof typeof t)[] = ['badge_interactive', 'badge_realtime', 'badge_responsive'];

  return (
    <motion.div
      ref={sectionRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {/* Themed Header Section */}
      <div className="text-center mb-12">
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          {t.title}
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Themed Video Container */}
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/[0.03] dark:bg-primary/[0.05] rounded-3xl blur-xl"></div>
        
        <div 
          className="relative bg-card/80 dark:bg-card/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-border/30 dark:border-border/20 overflow-hidden group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div className="relative aspect-video bg-secondary">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={videoSrc}
              muted={isMuted}
              loop
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              poster="/video_poster.jpg" // A poster from the public folder (optional)
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
            
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-background/80 hover:bg-background text-primary rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 border border-border/50"
                  aria-label="Play Video"
                >
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" />
                </button>
              </div>
            )}
            
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 sm:p-5 transition-all duration-300 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div 
                className="w-full h-1.5 bg-white/20 hover:h-2 transition-all duration-200 rounded-full mb-3 cursor-pointer group/progress"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-primary rounded-full relative"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div 
                    className="absolute right-0 top-1/2 -mt-2 w-4 h-4 rounded-full bg-white shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity" 
                    style={{ left: '100%', transform: 'translateX(-50%)' }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button onClick={togglePlay} className="control-button" aria-label="Play/Pause"><span className="sr-only">Play/Pause</span>{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}</button>
                  <button onClick={toggleMute} className="control-button" aria-label="Mute/Unmute"><span className="sr-only">Mute/Unmute</span>{isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
                  <span className="text-white/90 text-xs sm:text-sm font-mono tracking-tighter" aria-live="polite">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button onClick={restartVideo} className="control-button" aria-label="Restart"><span className="sr-only">Restart</span><RotateCcw className="w-5 h-5" /></button>
                  <button onClick={() => videoRef.current?.requestFullscreen()} className="control-button" aria-label="Fullscreen"><span className="sr-only">Fullscreen</span><Maximize2 className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Themed Feature Badges */}
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 mt-8">
          {featureBadgeKeys.map((badgeKey, index) => (
            <motion.div
              key={badgeKey}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-secondary/70 dark:bg-secondary/50 rounded-full shadow-sm border border-border/30"
            >
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">{t[badgeKey]}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};