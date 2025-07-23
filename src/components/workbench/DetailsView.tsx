import { useTranslations } from 'next-intl';
import { type SelectedItem } from '@/types';

export const DetailsView = ({ item }: { item: SelectedItem }) => {
  const t = useTranslations('Workbench.DetailsSidebar');
  return (
    <div>
      <h3 className="font-semibold text-lg mb-4 capitalize">{item.type} Details</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">ID:</span>
          <span className="font-mono text-right">{item.id}</span>
        </div>
        <h4 className="font-semibold pt-4 border-t border-border/40">{t('properties')}</h4>
        {Object.entries(item.data).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-muted-foreground capitalize">{key}:</span>
            <span className="text-right">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};