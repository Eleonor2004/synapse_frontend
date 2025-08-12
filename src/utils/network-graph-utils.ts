// src/utils/network-graph-utils.ts

export interface DynamicRow extends Record<string, unknown> {}

export const cleanPhoneNumber = (phone: string): string | null => {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.length < 7) return null;
  return cleaned;
};

export const isSMSData = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const upperValue = value.toUpperCase();
  return upperValue.includes('SMS') || /^[A-F0-9]{6,}$/i.test(value.trim());
};

export const findFieldValue = (row: DynamicRow, fields: string[]): string | null => {
  if (!row || typeof row !== 'object') return null;
  
  const normalize = (str: string) => str.toLowerCase().replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ç]/g, 'c').replace(/[ùúûü]/g, 'u').replace(/[òóôõö]/g, 'o').replace(/[ìíîï]/g, 'i').replace(/[^a-z0-9\s_]/g, ' ').replace(/\s+/g, ' ').trim();

  const normalizedRow: { [key: string]: unknown } = {};
  Object.keys(row).forEach(key => {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      normalizedRow[normalize(key)] = row[key];
    }
  });

  for (const field of fields) {
    const normalizedField = normalize(field);
    if (normalizedRow[normalizedField]) {
      return String(normalizedRow[normalizedField]);
    }
  }
  
  return null;
};

export const parseDuration = (durationStr: string | null): { seconds: number; isSMS: boolean } => {
  if (!durationStr || typeof durationStr !== 'string') return { seconds: 0, isSMS: false };
  
  const trimmed = durationStr.trim();
  if (isSMSData(trimmed)) return { seconds: 0, isSMS: true };
  
  const timeMatch = trimmed.match(/(\d+):(\d+)(?::(\d+))?/);
  if (timeMatch) {
    const h = timeMatch[3] ? parseInt(timeMatch[1], 10) || 0 : 0;
    const m = timeMatch[3] ? parseInt(timeMatch[2], 10) : parseInt(timeMatch[1], 10) || 0;
    const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : parseInt(timeMatch[2], 10) || 0;
    return { seconds: (h * 3600) + (m * 60) + s, isSMS: false };
  }
  
  const numMatch = trimmed.match(/(\d+)/);
  if (numMatch) return { seconds: parseInt(numMatch[1], 10) || 0, isSMS: false };
  
  return { seconds: 0, isSMS: false };
};

export const getEdgeColor = (interactions: number): string => {
  if (interactions <= 2) return '#22c55e';
  if (interactions <= 5) return '#eab308';
  if (interactions <= 10) return '#f97316';
  return '#ef4444';
};

export const getNodeSize = (interactions: number): number => {
  return Math.min(60, Math.max(12, Math.log(interactions + 1) * 8 + 8));
};