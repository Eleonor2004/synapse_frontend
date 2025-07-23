import { useTranslations } from 'next-intl';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { ContentContainer } from '@/components/ui/ContentContainer';
import { FAQAccordion } from '@/components/help/FAQAccordion';

export default function HelpPage() {
  const t = useTranslations('HelpPageContent');
  const tFaq = useTranslations('FAQ');

  const faqItems = [
    { question: tFaq('q1'), answer: tFaq('a1') },
    { question: tFaq('q2'), answer: tFaq('a2') },
    { question: tFaq('q3'), answer: tFaq('a3') },
    { question: tFaq('q4'), answer: tFaq('a4') },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <ContentContainer>
          <h1>{t('title')}</h1>
          <p className="lead !text-xl !text-muted-foreground">{t('subtitle')}</p>
          
          <h2 className="mt-16">{t('faq_title')}</h2>
          <div className="not-prose">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentContainer>
      </main>
    </div>
  );
}