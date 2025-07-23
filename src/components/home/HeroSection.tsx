import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

const hero_light = "/images/hero-light.png";
const hero_dark = "/images/hero-dark.png";

export const HeroSection = () => {
  const t = useTranslations('HeroSection');

  return (
    <section className="container mx-auto flex flex-col md:flex-row items-center gap-12 px-4 md:px-6 py-20 md:py-32">
      <div className="md:w-1/2 space-y-6 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-foreground">
          {t('tagline')}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {t('description')}
        </p>
        <Link 
          href="/workbench" 
          className="inline-block bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-md hover:bg-primary/90 transition-transform transform hover:scale-105"
        >
          {t('cta')}
        </Link>
      </div>
      <div className="md:w-1/2">
        <div className="relative aspect-video">
          <Image
            src={hero_light}
            alt="SYNAPSE light theme hero image"
            layout="fill"
            objectFit="contain"
            className="dark:hidden"
          />
          <Image
            src={hero_dark}
            alt="SYNAPSE dark theme hero image"
            layout="fill"
            objectFit="contain"
            className="hidden dark:block"
          />
        </div>
      </div>
    </section>
  );
};