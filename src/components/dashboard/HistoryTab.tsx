import { useTranslations } from 'next-intl';
import { LogIn, Waypoints, FileUp } from 'lucide-react';

export const ActivityLog = () => {
  const t = useTranslations('Dashboard.History');
  const activities = [
    { icon: LogIn, text: t('logLogin'), time: '2 hours ago' },
    { icon: Waypoints, text: t('logAnalysis'), time: '1 day ago' },
    { icon: FileUp, text: t('logImport'), time: '3 days ago' },
  ];

  return (
    <ul className="space-y-4">
      {activities.map((activity, index) => (
        <li key={index} className="flex items-center p-3 bg-card border rounded-md">
          <activity.icon className="h-5 w-5 mr-4 text-muted-foreground" />
          <span className="flex-grow text-foreground">{activity.text}</span>
          <span className="text-sm text-muted-foreground">{activity.time}</span>
        </li>
      ))}
    </ul>
  );
};

export const HistoryTab = () => {
  const t = useTranslations('Dashboard.History');
  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
      <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      <div className="mt-8">
        <ActivityLog />
      </div>
    </div>
  );
};