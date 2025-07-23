// types/index.ts
export interface SelectedItem {
  id: string;
  type: 'node' | 'edge';
  data: Record<string, any>;
}