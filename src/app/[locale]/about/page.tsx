import { useTranslations } from 'next-intl';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { ContentContainer } from '@/components/ui/ContentContainer';

export default function AboutPage() {
  const t = useTranslations('AboutPageContent');

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <ContentContainer>
          <h1>{t('title')}</h1>
          <p className="lead !text-xl !text-muted-foreground">{t('subtitle')}</p>
          
          <h2>{t('section1_title')}</h2>
          <p>{t('section1_content')}</p>
          
          <h2>{t('section2_title')}</h2>
          <p>{t('section2_content')}</p>
        </ContentContainer>
      </main>
    </div>
  );
}