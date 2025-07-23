'use client';
import { useTranslations } from 'next-intl';
import { UploadCloud } from 'lucide-react';

export const FileUpload = () => {
  const t = useTranslations('Workbench.ControlSidebar');
  return (
    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border px-6 py-10 hover:border-primary transition-colors">
      <div className="text-center">
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          {t('uploadInstructions')}
        </p>
      </div>
    </div>
  );
};