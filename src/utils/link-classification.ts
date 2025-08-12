// src/utils/link-classification.ts

export interface LinkStrength {
  callFrequency: number;
  totalDuration: number;
  averageDuration: number;
  uniqueDays: number;
  timeSpread: number; // How spread out the calls are over time
  strengthScore: number; // Composite score 0-100
  classification: 'primary' | 'secondary' | 'weak';
}

export interface EnhancedNetworkEdge {
  id: string;
  source: string;
  target: string;
  interactions: number;
  width: number;
  linkStrength: LinkStrength;
  calls: CallRecord[];
}

interface CallRecord {
  date: string;
  duration: number;
  type: 'call' | 'sms';
  timestamp?: string;
}

/**
 * Calculate link strength metrics for a connection between two individuals
 */
export function calculateLinkStrength(calls: CallRecord[]): LinkStrength {
  if (calls.length === 0) {
    return {
      callFrequency: 0,
      totalDuration: 0,
      averageDuration: 0,
      uniqueDays: 0,
      timeSpread: 0,
      strengthScore: 0,
      classification: 'weak'
    };
  }

  // Basic metrics
  const callFrequency = calls.length;
  const totalDuration = calls.reduce((sum, call) => sum + call.duration, 0);
  const averageDuration = totalDuration / callFrequency;

  // Temporal analysis
  const dates = new Set(calls.map(call => call.date.split('T')[0]));
  const uniqueDays = dates.size;

  // Time spread calculation (days between first and last call)
  const sortedDates = Array.from(dates).sort();
  const timeSpread = sortedDates.length > 1 
    ? Math.ceil((new Date(sortedDates[sortedDates.length - 1]).getTime() - new Date(sortedDates[0]).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  // Calculate composite strength score (0-100)
  const strengthScore = calculateCompositeScore({
    callFrequency,
    totalDuration,
    averageDuration,
    uniqueDays,
    timeSpread
  });

  // Classify the link based on strength score
  const classification = classifyLink(strengthScore, callFrequency, uniqueDays);

  return {
    callFrequency,
    totalDuration,
    averageDuration,
    uniqueDays,
    timeSpread,
    strengthScore,
    classification
  };
}

/**
 * Calculate a composite strength score based on multiple factors
 */
function calculateCompositeScore(metrics: {
  callFrequency: number;
  totalDuration: number;
  averageDuration: number;
  uniqueDays: number;
  timeSpread: number;
}): number {
  const { callFrequency, totalDuration, averageDuration, uniqueDays, timeSpread } = metrics;

  // Normalize different metrics to 0-1 scale
  const frequencyScore = Math.min(callFrequency / 50, 1); // 50+ calls = max score
  const durationScore = Math.min(totalDuration / 3600, 1); // 1 hour total = max score
  const avgDurationScore = Math.min(averageDuration / 300, 1); // 5 min avg = max score
  const consistencyScore = uniqueDays > 1 ? Math.min(callFrequency / uniqueDays / 5, 1) : 0; // Up to 5 calls per day
  const temporalScore = timeSpread > 7 ? Math.min(uniqueDays / (timeSpread / 7), 1) : uniqueDays / 7; // Regular contact over time

  // Weighted combination
  const compositeScore = (
    frequencyScore * 0.3 +      // 30% weight on frequency
    durationScore * 0.2 +       // 20% weight on total duration
    avgDurationScore * 0.15 +   // 15% weight on average duration
    consistencyScore * 0.2 +    // 20% weight on call consistency
    temporalScore * 0.15        // 15% weight on temporal pattern
  );

  return Math.round(compositeScore * 100);
}

/**
 * Classify link based on strength metrics
 */
function classifyLink(strengthScore: number, frequency: number, uniqueDays: number): 'primary' | 'secondary' | 'weak' {
  // Primary links: High strength score OR high frequency with good temporal spread
  if (strengthScore >= 70 || (frequency >= 20 && uniqueDays >= 5)) {
    return 'primary';
  }
  
  // Secondary links: Moderate activity
  if (strengthScore >= 30 || (frequency >= 5 && uniqueDays >= 2)) {
    return 'secondary';
  }
  
  // Everything else is weak
  return 'weak';
}

/**
 * Process network edges to add link classification
 */
export function classifyNetworkEdges(edges: any[], callData: any[]): EnhancedNetworkEdge[] {
  return edges.map(edge => {
    // Find all calls between these two nodes
    const edgeCalls = findCallsBetweenNodes(edge.source, edge.target, callData);
    const linkStrength = calculateLinkStrength(edgeCalls);

    return {
      ...edge,
      linkStrength,
      calls: edgeCalls
    };
  });
}

/**
 * Find all call records between two specific nodes
 */
function findCallsBetweenNodes(sourceId: string, targetId: string, callData: any[]): CallRecord[] {
  if (!callData || callData.length === 0) return [];

  const calls: CallRecord[] = [];

  // Define possible field names for different data formats
  const callerFields = ['caller_num', 'caller', 'calling_number', 'from_number', 'a_number'];
  const calleeFields = ['callee_num', 'callee', 'called_number', 'to_number', 'b_number'];
  const dateFields = ['date', 'call_date', 'timestamp', 'datetime'];
  const durationFields = ['duration', 'call_duration', 'dur', 'length'];

  callData.forEach(record => {
    if (!record || typeof record !== 'object') return;

    // Find caller and callee
    const caller = findFieldValue(record, callerFields);
    const callee = findFieldValue(record, calleeFields);
    
    if (!caller || !callee) return;

    // Check if this record involves our two nodes
    const isRelevantCall = 
      (caller === sourceId && callee === targetId) || 
      (caller === targetId && callee === sourceId);

    if (isRelevantCall) {
      // Extract call details
      const date = findFieldValue(record, dateFields) || new Date().toISOString();
      const durationStr = findFieldValue(record, durationFields) || '0';
      const duration = parseInt(String(durationStr)) || 0;

      calls.push({
        date,
        duration,
        type: duration > 0 ? 'call' : 'sms', // Assume SMS if duration is 0
        timestamp: date
      });
    }
  });

  return calls;
}

/**
 * Utility function to find field value (same as in FilterPanel)
 */
function findFieldValue(row: Record<string, unknown>, fields: string[]): string | null {
  if (!row || typeof row !== 'object') return null;
  
  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
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
}

/**
 * Get color for edge based on link classification
 */
export function getLinkClassificationColor(classification: 'primary' | 'secondary' | 'weak'): string {
  switch (classification) {
    case 'primary':
      return '#ef4444'; // Red for primary/strong links
    case 'secondary':
      return '#f59e0b'; // Amber for secondary links
    case 'weak':
      return '#6b7280'; // Gray for weak links
    default:
      return '#6b7280';
  }
}

/**
 * Get edge width based on link classification
 */
export function getLinkClassificationWidth(classification: 'primary' | 'secondary' | 'weak', baseWidth: number): number {
  switch (classification) {
    case 'primary':
      return Math.max(baseWidth * 1.5, 4);
    case 'secondary':
      return Math.max(baseWidth * 1.2, 3);
    case 'weak':
      return Math.max(baseWidth * 0.8, 1);
    default:
      return baseWidth;
  }
}