'use client';
import { useTranslations } from 'next-intl';
import { ZoomIn, ZoomOut, Move, Waypoints } from 'lucide-react';

export const AnalysisToolbar = () => {
  const t = useTranslations('Workbench.AnalysisToolbar');
  return (
    <div className="absolute top-4 left-4 z-10 bg-card border border-border/40 rounded-lg shadow-lg flex divide-x divide-border/40">
      <button title={t('zoomIn')} className="p-3 hover:bg-accent"><ZoomIn size={18} /></button>
      <button title={t('zoomOut')} className="p-3 hover:bg-accent"><ZoomOut size={18} /></button>
      <button title={t('pan')} className="p-3 hover:bg-accent bg-primary/10 text-primary"><Move size={18} /></button>
      <button title={t('shortestPath')} className="p-3 hover:bg-accent"><Waypoints size={18} /></button>
    </div>
  );
};