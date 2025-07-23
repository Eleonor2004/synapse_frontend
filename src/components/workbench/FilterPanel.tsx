'use client';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';

export const FilterPanel = () => {
  const t = useTranslations('Workbench.ControlSidebar');
  return (
    <div>
      <h2 className="text-lg font-semibold flex items-center mb-3">
        <SlidersHorizontal className="h-5 w-5 mr-2 text-primary" />
        {t('filtersTitle')}
      </h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">{t('timeRange')}</label>
          {/* Placeholder for TimeRangeSlider */}
          <input type="range" className="w-full mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium">{t('nodeTypes')}</label>
          {/* Placeholder for NodeTypeCheckboxes */}
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center"><input type="checkbox" className="mr-2" /> Person</div>
            <div className="flex items-center"><input type="checkbox" className="mr-2" /> Organization</div>
            <div className="flex items-center"><input type="checkbox" className="mr-2" /> Location</div>
          </div>
        </div>
      </div>
    </div>
  );
};