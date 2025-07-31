import { useTranslations } from 'next-intl';
import { NavBar } from '../../../components/layout/NavBar';
import { TabContainer } from '../../../components/ui/TabContainer';
import { ProfileTab } from '../../../components/dashboard/ProfileTab';
import { SettingsTab } from '../../../components/dashboard/SettingsTab';
import { HistoryTab } from '../../../components/dashboard/HistoryTab';
import { StatisticsTab } from '../../../components/dashboard/StatisticsTab';
import { UserManagementTab } from '../../../components/dashboard/UserManagementTab';
import { NotificationsTab } from '../../../components/dashboard/NotificationsTab';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');

  const tabs = [
    { id: 'profile', label: t('tabs.profile'), content: <ProfileTab /> },
    { id: 'settings', label: t('tabs.settings'), content: <SettingsTab /> },
    { id: 'history', label: t('tabs.history'), content: <HistoryTab /> },
    { id: 'statistics', label: t('tabs.statistics'), content: <StatisticsTab /> },
    { id: 'notifications', label: t('tabs.notifications'), content: <NotificationsTab /> },
    { id: 'userManagement', label: t('tabs.userManagement'), content: <UserManagementTab />, adminOnly: true },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar variant="workbench" />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
          {t('title')}
        </h1>
        <TabContainer tabs={tabs} isAdmin={true} />
      </main>
    </div>
  );
}