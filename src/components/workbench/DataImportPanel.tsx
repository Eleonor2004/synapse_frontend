'use client';
import { useTranslations } from 'next-intl';
import { FileUp } from 'lucide-react';
import { FileUpload } from './FileUpload';

export const DataImportPanel = () => {
  const t = useTranslations('Workbench.ControlSidebar');
  return (
    <div>
      <h2 className="text-lg font-semibold flex items-center mb-3">
        <FileUp className="h-5 w-5 mr-2 text-primary" />
        {t('importDataTitle')}
      </h2>
      <FileUpload />
      <button className="w-full mt-4 bg-primary text-primary-foreground font-semibold py-2 rounded-md text-sm hover:bg-primary/90">
        {t('importButton')}
      </button>
    </div>
  );
};