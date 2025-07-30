'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { AnimatedShinyButton } from '../ui/AnimatedShinyButton';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeInOut' },
  viewport: { once: true },
};

export const HeroSection = () => {
  const t = useTranslations('HeroSection');

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)] dark:[mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="container mx-auto max-w-7xl px-4 py-24 md:py-32 text-center">
        <motion.h1
          {...fadeInUp}
          className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-primary-light"
        >
          {t('tagline')}
        </motion.h1>
        <motion.p
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground"
        >
          {t('description')}
        </motion.p>
        <motion.div
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.4 }}
          className="mt-10"
        >
          <AnimatedShinyButton href="/workbench" />
        </motion.div>
      </div>
    </section>
  );
};