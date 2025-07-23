import { useTranslations } from 'next-intl';
import { ShieldAlert } from 'lucide-react';

export const UserManagementTab = () => {
  const t = useTranslations('Dashboard.UserManagement');
  // This is a placeholder. In a real app, you'd check the user's role.
  const isAdmin = true; 

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-lg border">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold">{t('adminOnly')}</h3>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
      <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      {/* UserListTable and CreateUserModal would go here */}
      <div className="mt-8 text-center text-muted-foreground">[User Management Table Placeholder]</div>
    </div>
  );
};