import { useTranslations } from 'next-intl';
import { X, Info } from 'lucide-react';
import { type SelectedItem } from '@/types';
import { DetailsView } from './DetailsView';

interface DetailsSideBarProps {
  selectedItem: SelectedItem | null;
  onClose: () => void;
}

export const DetailsSideBar = ({ selectedItem, onClose }: DetailsSideBarProps) => {
  const t = useTranslations('Workbench.DetailsSidebar');
  const isVisible = selectedItem !== null;

  return (
    <aside 
      className={`
        w-96 border-l border-border/40 bg-card p-4 flex flex-col transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Info className="h-5 w-5 mr-2 text-primary" />
          {t('title')}
        </h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-accent">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {selectedItem ? (
          <DetailsView item={selectedItem} />
        ) : (
          <div className="text-center text-muted-foreground text-sm mt-10">
            {t('noSelection')}
          </div>
        )}
      </div>
    </aside>
  );
};