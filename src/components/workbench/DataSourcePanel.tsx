'use client';
import { useTranslations } from 'next-intl';
import { Database } from 'lucide-react';
export const DataSourcePanel = () => {
const t = useTranslations('Workbench.ControlSidebar');
return (
<div>
<h2 className="text-lg font-semibold flex items-center mb-3">
<Database className="h-5 w-5 mr-2 text-primary" />
{t('dataSourcesTitle')}
</h2>
<select className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
<option>{t('selectDataset')}</option>
<option>Case #1024 - Financial Fraud</option>
<option>Case #2048 - Smuggling Ring</option>
</select>
</div>
);
};