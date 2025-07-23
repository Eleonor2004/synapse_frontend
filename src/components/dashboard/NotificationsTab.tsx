import { useTranslations } from 'next-intl';
import { Bell, Wrench } from 'lucide-react';
export const NotificationsTab = () => {
const t = useTranslations('Dashboard.Notifications');
const notifications = [
{ icon: Wrench, text: t('maintenance'), time: '1 day ago' },
{ icon: Bell, text: t('update'), time: '4 days ago' },
];
return (
<div>
<h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
<p className="text-muted-foreground mt-1">{t('subtitle')}</p>
<div className="mt-8 space-y-4">
{notifications.map((note, index) => (
<div key={index} className="flex items-start p-4 bg-card border rounded-lg">
<note.icon className="h-5 w-5 mr-4 mt-1 text-primary" />
<div>
<p className="text-foreground">{note.text}</p>
<p className="text-xs text-muted-foreground mt-1">{note.time}</p>
</div>
</div>
))}
</div>
</div>
);
};