'use client';

import { useTranslations } from 'next-intl';
import { motion, type AnimationProps } from 'framer-motion';
import Link from 'next/link';

const animationProps = {
  initial: { "--x": "100%", scale: 1 },
  animate: { "--x": "-100%" },
  whileTap: { scale: 0.97 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 10,
      damping: 5,
      mass: 0.1,
    },
  },
} as AnimationProps;

const ShinyButton = ({ text, href }: { text: string; href: string }) => {
  return (
    <Link href={href} passHref>
      <motion.button
        {...animationProps}
        className="relative rounded-lg px-6 py-3 font-medium text-neutral-50 backdrop-blur-xl transition-[box-shadow] duration-300 ease-in-out hover:shadow-primary-dark/50"
        style={{
          background: 'linear-gradient(to right, transparent, hsl(var(--primary)), transparent)',
          backgroundSize: '200% 100%',
          backgroundPosition: 'var(--x, 100%) 0',
        }}
      >
        <span
          className="relative block h-full w-full text-sm uppercase tracking-wide"
          style={{
            maskImage: 'linear-gradient(-75deg, black calc(var(--x) + 20%), transparent calc(var(--x) + 30%), black calc(var(--x) + 100%))',
          }}
        >
          {text}
        </span>
        <span
          style={{
            mask: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
            maskComposite: 'exclude',
          }}
          className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,hsl(var(--primary)/0.1)_calc(var(--x)+20%),hsl(var(--primary)/0.5)_calc(var(--x)+25%),hsl(var(--primary)/0.1)_calc(var(--x)+100%))] p-px"
        ></span>
      </motion.button>
    </Link>
  );
};

export const AnimatedShinyButton = ({ href }: { href: string }) => {
  const t = useTranslations('AnimatedShinyButton');
  return <ShinyButton text={t('cta')} href={href} />;
};