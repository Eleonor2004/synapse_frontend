'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import { useState, useRef } from 'react';
import { Mail, Send, CheckCircle, Sparkles, Users, TrendingUp } from 'lucide-react';

const NewsletterStats = () => {
  const stats = [
    { icon: Users, value: "50K+", label: "Subscribers" },
    { icon: TrendingUp, value: "98%", label: "Satisfaction" },
    { icon: Mail, value: "Weekly", label: "Updates" },
  ];

  return (
    <div className="grid grid-cols-3 gap-6 mb-12">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="text-center group"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/8 dark:bg-primary/10 border border-primary/15 dark:border-primary/20 mb-3 group-hover:bg-primary/15 dark:group-hover:bg-primary/20 group-hover:border-primary/25 dark:group-hover:border-primary/30 transition-all duration-300 shadow-sm">
            <stat.icon className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold gradient-text mb-1">{stat.value}</div>
          <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes - more subtle for light theme */}
      <motion.div
        className="absolute top-20 left-20 w-16 h-16 border-2 border-primary/15 dark:border-primary/20 rounded-full"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute top-40 right-32 w-12 h-12 bg-primary/5 dark:bg-primary/10 rounded-lg shadow-sm"
        animate={{
          y: [-10, 10, -10],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-32 left-40 w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full opacity-60"
        animate={{
          x: [-5, 5, -5],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export const NewsletterSection = () => {
  const t = useTranslations('NewsletterSection');
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubscribed(true);
    setEmail('');
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubscribed(false);
    }, 3000);
  };

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden bg-background">
      {/* Background Elements - theme aware */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-background to-primary-dark/[0.015] dark:from-primary/[0.08] dark:via-background dark:to-primary-dark/[0.06]" />
      <div className="absolute inset-0 bg-dot-pattern [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <FloatingElements />
      
      {/* Large decorative gradient orbs - more subtle for light theme */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.025] dark:bg-primary/[0.12] rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary-dark/[0.02] dark:bg-primary-dark/[0.10] rounded-full blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="glass-morphism-strong rounded-3xl p-8 md:p-12 text-center shadow-xl hover:shadow-2xl transition-shadow duration-500"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 dark:bg-primary/10 border border-primary/15 dark:border-primary/20 text-sm font-medium text-primary mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Stay Updated</span>
          </motion.div>

          {/* Main heading */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-5xl font-black mb-6"
          >
            <span className="gradient-text">Never miss</span>
            <br />
            <span className="text-foreground">an update</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {t('description')} Get exclusive insights, feature updates, and expert tips delivered straight to your inbox.
          </motion.p>

          {/* Stats */}
          <NewsletterStats />

          {/* Newsletter form */}
          {!isSubscribed ? (
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8"
            >
              <div className="relative flex-grow">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('placeholder')}
                  className="input-modern w-full pl-12 pr-4 py-4 bg-background/80 dark:bg-background/50 backdrop-blur-sm border-border/40 dark:border-border/30 focus:border-primary/40 dark:focus:border-primary/50 focus:bg-background shadow-sm focus:shadow-md transition-all duration-300"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary px-8 py-4 min-w-[140px] relative overflow-hidden shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="loading-spinner" />
                    <span>Joining...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>{t('cta')}</span>
                  </div>
                )}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto mb-8"
            >
              <div className="flex items-center justify-center gap-3 p-6 bg-success/8 dark:bg-success/10 border border-success/20 dark:border-success/25 rounded-2xl shadow-sm">
                <CheckCircle className="w-6 h-6 text-success" />
                <span className="text-success font-semibold text-lg">
                  Successfully subscribed! Welcome aboard! 🎉
                </span>
              </div>
            </motion.div>
          )}

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>No spam, ever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Unsubscribe anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Privacy protected</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};