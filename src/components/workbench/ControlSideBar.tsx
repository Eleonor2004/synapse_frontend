import { DataSourcePanel } from './DataSourcePanel';
import { DataImportPanel } from './DataImportPanel';
import { FilterPanel } from './FilterPanel';

export const ControlSideBar = () => {
  return (
    <aside className="w-80 border-r border-border/40 bg-card p-4 flex flex-col space-y-6 overflow-y-auto">
      <DataSourcePanel />
      <DataImportPanel />
      <FilterPanel />
    </aside>
  );
};