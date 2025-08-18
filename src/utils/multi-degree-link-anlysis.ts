// src/utils/multi-degree-link-analysis.ts

import { NetworkNode, NetworkEdge } from '../hooks/useNetworkData';

export interface MultiDegreeLink {
  sourceId: string;
  targetId: string;
  degree: 1 | 2 | 3; // primary, secondary, tertiary
  path: string[]; // Array of node IDs showing the connection path
  strength: number; // Connection strength based on intermediate connections
  directInteractions?: number; // For degree 1 links
  intermediateNodes?: string[]; // For degree 2+ links
}

export interface EnhancedNetworkData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  multiDegreeLinks: MultiDegreeLink[];
}

/**
 * Build adjacency list from network edges for efficient path finding
 */
function buildAdjacencyList(edges: NetworkEdge[]): Map<string, Set<string>> {
  const adjacencyList = new Map<string, Set<string>>();
  
  edges.forEach(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    
    if (!adjacencyList.has(sourceId)) {
      adjacencyList.set(sourceId, new Set());
    }
    if (!adjacencyList.has(targetId)) {
      adjacencyList.set(targetId, new Set());
    }
    
    adjacencyList.get(sourceId)!.add(targetId);
    adjacencyList.get(targetId)!.add(sourceId);
  });
  
  return adjacencyList;
}

/**
 * Find all paths up to degree 3 between nodes using BFS
 */
function findMultiDegreePaths(
  startNode: string,
  adjacencyList: Map<string, Set<string>>,
  maxDegree: number = 3
): MultiDegreeLink[] {
  const links: MultiDegreeLink[] = [];
  const visited = new Set<string>();
  const queue: { nodeId: string; path: string[]; degree: number }[] = [];
  
  // Initialize BFS queue
  queue.push({ nodeId: startNode, path: [startNode], degree: 0 });
  visited.add(startNode);
  
  while (queue.length > 0) {
    const { nodeId, path, degree } = queue.shift()!;
    
    // If we've reached a valid connection degree (1, 2, or 3)
    if (degree > 0 && degree <= maxDegree) {
      const strength = calculatePathStrength(path, adjacencyList);
      
      links.push({
        sourceId: startNode,
        targetId: nodeId,
        degree: degree as 1 | 2 | 3,
        path: [...path],
        strength,
        intermediateNodes: degree > 1 ? path.slice(1, -1) : undefined
      });
    }
    
    // Continue exploring if we haven't reached max degree
    if (degree < maxDegree) {
      const neighbors = adjacencyList.get(nodeId) || new Set();
      
      for (const neighbor of neighbors) {
        // Avoid cycles and revisiting nodes in the current path
        if (!path.includes(neighbor)) {
          const newPath = [...path, neighbor];
          queue.push({
            nodeId: neighbor,
            path: newPath,
            degree: degree + 1
          });
        }
      }
    }
  }
  
  return links;
}

/**
 * Calculate strength of a multi-degree connection based on path
 */
function calculatePathStrength(path: string[], adjacencyList: Map<string, Set<string>>): number {
  if (path.length < 2) return 0;
  
  // For direct connections (degree 1), return high strength
  if (path.length === 2) return 100;
  
  // For multi-degree connections, strength decreases with path length
  // and increases with number of alternative paths
  const baseStrength = 100 / (path.length - 1);
  
  // Calculate connection density between intermediate nodes
  let connectionDensity = 1;
  for (let i = 0; i < path.length - 1; i++) {
    const currentNode = path[i];
    const nextNode = path[i + 1];
    const currentConnections = adjacencyList.get(currentNode)?.size || 1;
    const nextConnections = adjacencyList.get(nextNode)?.size || 1;
    
    // Higher density = stronger connection
    connectionDensity *= Math.min(currentConnections, nextConnections) / 10;
  }
  
  return Math.round(baseStrength * Math.max(0.1, Math.min(1, connectionDensity)));
}

/**
 * Generate all multi-degree links for the network
 */
export function generateMultiDegreeLinks(
  nodes: NetworkNode[],
  edges: NetworkEdge[],
  maxDegree: number = 3
): MultiDegreeLink[] {
  const adjacencyList = buildAdjacencyList(edges);
  const allLinks: MultiDegreeLink[] = [];
  const processedPairs = new Set<string>();
  
  // Find multi-degree connections for each node
  nodes.forEach(node => {
    const links = findMultiDegreePaths(node.id, adjacencyList, maxDegree);
    
    links.forEach(link => {
      // Create a unique pair identifier (sorted to avoid duplicates)
      const pairId = [link.sourceId, link.targetId].sort().join('-');
      
      if (!processedPairs.has(pairId)) {
        processedPairs.add(pairId);
        allLinks.push(link);
      }
    });
  });
  
  // Add direct interaction counts for degree 1 links
  allLinks.forEach(link => {
    if (link.degree === 1) {
      const directEdge = edges.find(edge => {
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        return (sourceId === link.sourceId && targetId === link.targetId) ||
               (sourceId === link.targetId && targetId === link.sourceId);
      });
      
      if (directEdge) {
        link.directInteractions = directEdge.width; // Assuming width represents interaction count
      }
    }
  });
  
  return allLinks;
}

/**
 * Filter multi-degree links based on selected degrees
 */
export function filterMultiDegreeLinks(
  links: MultiDegreeLink[],
  selectedDegrees: (1 | 2 | 3)[],
  minStrength: number = 0
): MultiDegreeLink[] {
  return links.filter(link => 
    selectedDegrees.includes(link.degree) && 
    link.strength >= minStrength
  );
}

/**
 * Convert multi-degree links back to network edges for visualization
 */
export function convertLinksToEdges(
  links: MultiDegreeLink[],
  nodes: NetworkNode[]
): NetworkEdge[] {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  
  return links.map(link => {
    const sourceNode = nodeMap.get(link.sourceId);
    const targetNode = nodeMap.get(link.targetId);
    
    if (!sourceNode || !targetNode) {
      throw new Error(`Node not found for link: ${link.sourceId} -> ${link.targetId}`);
    }
    
    return {
      id: `${link.sourceId}-${link.targetId}-deg${link.degree}`,
      source: sourceNode,
      target: targetNode,
      width: link.directInteractions || Math.max(1, Math.round(link.strength / 20)),
      weight: link.strength / 100,
      degree: link.degree,
      path: link.path,
      intermediateNodes: link.intermediateNodes
    } as NetworkEdge & {
      degree: number;
      path: string[];
      intermediateNodes?: string[];
    };
  });
}

/**
 * Get color for multi-degree link visualization
 */
export function getMultiDegreeLinkColor(degree: 1 | 2 | 3): string {
  switch (degree) {
    case 1: return '#ef4444'; // Red for primary (direct)
    case 2: return '#f59e0b'; // Amber for secondary
    case 3: return '#6b7280'; // Gray for tertiary
    default: return '#9ca3af';
  }
}

/**
 * Get width for multi-degree link visualization
 */
export function getMultiDegreeLinkWidth(degree: 1 | 2 | 3, baseWidth: number): number {
  switch (degree) {
    case 1: return Math.max(2, baseWidth); // Thickest for direct
    case 2: return Math.max(1, baseWidth * 0.7); // Medium for secondary
    case 3: return Math.max(1, baseWidth * 0.4); // Thinnest for tertiary
    default: return 1;
  }
}

/**
 * Calculate mean duration from call data
 */
export function calculateMeanDuration(data: any[]): number {
  if (!data || data.length === 0) return 0;
  
  const durationFields = ['duration', 'call_duration', 'duration_seconds', 'length'];
  const durations: number[] = [];
  
  data.forEach(record => {
    for (const field of durationFields) {
      const duration = record[field];
      if (duration !== undefined && duration !== null) {
        const numDuration = typeof duration === 'string' ? parseInt(duration, 10) : Number(duration);
        if (!isNaN(numDuration) && numDuration >= 0) {
          durations.push(numDuration);
          break; // Found a valid duration, move to next record
        }
      }
    }
  });
  
  if (durations.length === 0) return 0;
  
  const sum = durations.reduce((acc, dur) => acc + dur, 0);
  return Math.round(sum / durations.length);
}

/**
 * Get duration statistics for filter initialization
 */
export function getDurationStats(data: any[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
} {
  if (!data || data.length === 0) {
    return { min: 0, max: 3600, mean: 0, median: 0 };
  }
  
  const durationFields = ['duration', 'call_duration', 'duration_seconds', 'length'];
  const durations: number[] = [];
  
  data.forEach(record => {
    for (const field of durationFields) {
      const duration = record[field];
      if (duration !== undefined && duration !== null) {
        const numDuration = typeof duration === 'string' ? parseInt(duration, 10) : Number(duration);
        if (!isNaN(numDuration) && numDuration >= 0) {
          durations.push(numDuration);
          break;
        }
      }
    }
  });
  
  if (durations.length === 0) {
    return { min: 0, max: 3600, mean: 0, median: 0 };
  }
  
  const sorted = durations.sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = Math.round(durations.reduce((acc, dur) => acc + dur, 0) / durations.length);
  const median = sorted.length % 2 === 0 
    ? Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
    : sorted[Math.floor(sorted.length / 2)];
  
  return { min, max, mean, median };
}