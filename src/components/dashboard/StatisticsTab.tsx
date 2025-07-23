import { useTranslations } from 'next-intl';
import { BarChart3, Network, Database } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="bg-card p-6 rounded-lg border shadow-sm">
    <Icon className="h-8 w-8 text-primary mb-4" />
    <p className="text-3xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export const StatisticsTab = () => {
  const t = useTranslations('Dashboard.Statistics');
  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
      <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <StatCard icon={BarChart3} label={t('analysesRun')} value="142" />
        <StatCard icon={Network} label={t('nodesExplored')} value="2.1M" />
        <StatCard icon={Database} label={t('dataImported')} value="58" />
      </div>
      <div className="mt-12 bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold mb-4">{t('chartTitle')}</h3>
        <div className="h-64 bg-muted/50 flex items-center justify-center rounded-md">
          <p className="text-muted-foreground">[Chart Placeholder]</p>
        </div>
      </div>
    </div>
  );
};