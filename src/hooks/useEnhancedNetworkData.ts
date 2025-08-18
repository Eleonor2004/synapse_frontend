// src/hooks/useEnhancedNetworkData.ts

import { useMemo } from 'react';
import { 
  generateMultiDegreeLinks, 
  filterMultiDegreeLinks, 
  convertLinksToEdges, 
  MultiDegreeLink 
} from '../utils/multi-degree-link-anlysis';

export interface NetworkNode {
  id: string;
  phoneNumber: string;
  imei?: string;
  size: number;
  interactions: number;
  type: 'primary' | 'secondary' | 'service';
  location?: string;
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  id: string;
  source: NetworkNode | string;
  target: NetworkNode | string;
  width: number;
  weight: number;
}

export interface EnhancedNetworkEdge extends NetworkEdge {
  degree?: 1 | 2 | 3;
  path?: string[];
  intermediateNodes?: string[];
  linkStrength?: {
    classification: 'primary' | 'secondary' | 'weak';
    strengthScore: number;
  };
}

export interface ExcelData {
  listings?: Record<string, unknown>[];
}

export interface EnhancedFilters {
  interactionType: "all" | "calls" | "sms";
  dateRange: { start: string; end: string };
  individuals: string[];
  minInteractions: number;
  contactWhitelist: string[];
  durationRange: { min: number; max: number };
  linkTypes: ("primary" | "secondary" | "weak")[];
  minStrengthScore: number;
  showWeakLinks: boolean;
  connectionDegrees: (1 | 2 | 3)[];
  minConnectionStrength: number;
  showIndirectConnections: boolean;
  maxPathLength: number;
}

// Helper function to find field values in data rows
const findFieldValue = (row: Record<string, unknown>, fields: string[]): string | null => {
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
};

// Helper function to extract duration from data
const extractDuration = (row: Record<string, unknown>): number => {
  const durationFields = ['duration', 'call_duration', 'duration_seconds', 'length'];
  
  for (const field of durationFields) {
    const duration = row[field];
    if (duration !== undefined && duration !== null) {
      const numDuration = typeof duration === 'string' ? parseInt(duration, 10) : Number(duration);
      if (!isNaN(numDuration) && numDuration >= 0) {
        return numDuration;
      }
    }
  }
  return 0;
};

// Helper function to extract date from data
const extractDate = (row: Record<string, unknown>): Date | null => {
  const dateFields = ['date', 'call_date', 'timestamp', 'datetime'];
  
  for (const field of dateFields) {
    const dateValue = row[field];
    if (dateValue) {
      const date = new Date(String(dateValue));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  return null;
};

export function useEnhancedNetworkData(data: ExcelData | null, filters: EnhancedFilters) {
  return useMemo(() => {
    if (!data?.listings || data.listings.length === 0) {
      return {
        nodes: [] as NetworkNode[],
        edges: [] as EnhancedNetworkEdge[],
        multiDegreeLinks: [] as MultiDegreeLink[],
        stats: {
          totalNodes: 0,
          totalDirectEdges: 0,
          totalMultiDegreeLinks: 0,
          averageConnections: 0
        }
      };
    }

    // Field mappings for data extraction
    const callerFields = ['caller_num', 'caller', 'calling_number', 'from_number'];
    const calleeFields = ['callee_num', 'callee', 'called_number', 'to_number'];
    const typeFields = ['call_type', 'type', 'interaction_type'];

    // Filter data based on criteria
    const filteredData = data.listings.filter(row => {
      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const date = extractDate(row);
        if (date) {
          if (filters.dateRange.start && date < new Date(filters.dateRange.start)) return false;
          if (filters.dateRange.end && date > new Date(filters.dateRange.end)) return false;
        }
      }

      // Duration range filter
      const duration = extractDuration(row);
      if (duration < filters.durationRange.min || duration > filters.durationRange.max) {
        return false;
      }

      // Interaction type filter
      if (filters.interactionType !== "all") {
        const type = findFieldValue(row, typeFields)?.toLowerCase();
        if (filters.interactionType === "calls" && !type?.includes("call")) return false;
        if (filters.interactionType === "sms" && !type?.includes("sms")) return false;
      }

      return true;
    });

    // Build nodes and direct edges from filtered data
    const nodeMap = new Map<string, NetworkNode>();
    const edgeMap = new Map<string, { source: string; target: string; interactions: number; totalDuration: number }>();

    filteredData.forEach(row => {
      const caller = findFieldValue(row, callerFields);
      const callee = findFieldValue(row, calleeFields);
      const duration = extractDuration(row);

      if (!caller || !callee || caller === callee) return;

      // Create or update nodes
      [caller, callee].forEach(phoneNumber => {
        if (!nodeMap.has(phoneNumber)) {
          nodeMap.set(phoneNumber, {
            id: phoneNumber,
            phoneNumber,
            size: 20,
            interactions: 0,
            type: 'secondary', // Will be updated based on interactions
            x: 0,
            y: 0
          });
        }
        
        const node = nodeMap.get(phoneNumber)!;
        node.interactions++;
      });

      // Create or update edges
      const edgeId = [caller, callee].sort().join('-');
      if (!edgeMap.has(edgeId)) {
        edgeMap.set(edgeId, {
          source: caller,
          target: callee,
          interactions: 0,
          totalDuration: 0
        });
      }
      
      const edge = edgeMap.get(edgeId)!;
      edge.interactions++;
      edge.totalDuration += duration;
    });

    // Apply contact whitelist filter
    if (filters.contactWhitelist.length > 0) {
      const whitelistSet = new Set(filters.contactWhitelist);
      
      // Keep only nodes in whitelist and their direct connections
      const connectedNodes = new Set<string>();
      Array.from(edgeMap.values()).forEach(edge => {
        if (whitelistSet.has(edge.source) || whitelistSet.has(edge.target)) {
          connectedNodes.add(edge.source);
          connectedNodes.add(edge.target);
        }
      });

      // Filter nodes
      for (const [nodeId, node] of Array.from(nodeMap.entries())) {
        if (!connectedNodes.has(nodeId)) {
          nodeMap.delete(nodeId);
        }
      }

      // Filter edges
      for (const [edgeId, edge] of Array.from(edgeMap.entries())) {
        if (!connectedNodes.has(edge.source) || !connectedNodes.has(edge.target)) {
          edgeMap.delete(edgeId);
        }
      }
    }

    // Apply minimum interactions filter and update node types
    const finalNodes: NetworkNode[] = [];
    Array.from(nodeMap.values()).forEach(node => {
      if (node.interactions >= filters.minInteractions) {
        // Update node properties based on interactions
        node.size = Math.max(15, Math.min(50, 15 + node.interactions * 2));
        
        if (node.interactions >= 20) {
          node.type = 'primary';
        } else if (node.interactions >= 10) {
          node.type = 'secondary';
        } else if (node.interactions <= 3) {
          node.type = 'service';
        } else {
          node.type = 'secondary';
        }
        
        finalNodes.push(node);
      }
    });

    // Create final node map for edge processing
    const finalNodeMap = new Map(finalNodes.map(node => [node.id, node]));

    // Convert edges to NetworkEdge format
    const directEdges: NetworkEdge[] = [];
    Array.from(edgeMap.values()).forEach(edge => {
      const sourceNode = finalNodeMap.get(edge.source);
      const targetNode = finalNodeMap.get(edge.target);
      
      if (sourceNode && targetNode) {
        directEdges.push({
          id: `${edge.source}-${edge.target}`,
          source: sourceNode,
          target: targetNode,
          width: Math.max(1, Math.min(10, edge.interactions)),
          weight: edge.interactions / 100
        });
      }
    });

    // Generate multi-degree links
    const multiDegreeLinks = generateMultiDegreeLinks(
      finalNodes, 
      directEdges, 
      filters.maxPathLength || 3
    );

    // Filter multi-degree links based on criteria
    const filteredMultiDegreeLinks = filterMultiDegreeLinks(
      multiDegreeLinks,
      filters.connectionDegrees || [1, 2, 3],
      filters.minConnectionStrength || 0
    );

    // Convert multi-degree links to enhanced edges
    const multiDegreeEdges = convertLinksToEdges(filteredMultiDegreeLinks, finalNodes);

    // Combine direct and multi-degree edges, avoiding duplicates
    const allEdges: EnhancedNetworkEdge[] = [];
    const addedEdgeIds = new Set<string>();

    // Add direct edges with enhanced properties
    directEdges.forEach(edge => {
      const enhancedEdge: EnhancedNetworkEdge = {
        ...edge,
        degree: 1,
        path: [
          typeof edge.source === 'string' ? edge.source : edge.source.id,
          typeof edge.target === 'string' ? edge.target : edge.target.id
        ],
        linkStrength: {
          classification: edge.weight > 0.5 ? 'primary' : edge.weight > 0.2 ? 'secondary' : 'weak',
          strengthScore: Math.round(edge.weight * 100)
        }
      };
      
      allEdges.push(enhancedEdge);
      addedEdgeIds.add(edge.id);
    });

    // Add multi-degree edges (2nd and 3rd degree) if indirect connections are enabled
    if (filters.showIndirectConnections) {
      multiDegreeEdges.forEach(edge => {
        const edgeData = edge as EnhancedNetworkEdge & { degree: number };
        if (edgeData.degree > 1 && !addedEdgeIds.has(edge.id)) {
          const enhancedEdge: EnhancedNetworkEdge = {
            ...edge,
            degree: edgeData.degree as 1 | 2 | 3,
            path: edgeData.path,
            intermediateNodes: edgeData.intermediateNodes,
            linkStrength: {
              classification: edgeData.degree === 2 ? 'secondary' : 'weak',
              strengthScore: Math.max(10, 100 - (edgeData.degree - 1) * 30)
            }
          };
          
          allEdges.push(enhancedEdge);
          addedEdgeIds.add(edge.id);
        }
      });
    }

    // Apply final filters to edges
    const finalEdges = allEdges.filter(edge => {
      // Link type filters
      if (edge.linkStrength) {
        if (!filters.linkTypes.includes(edge.linkStrength.classification)) {
          return false;
        }
        
        if (edge.linkStrength.strengthScore < filters.minStrengthScore) {
          return false;
        }
        
        if (!filters.showWeakLinks && edge.linkStrength.classification === 'weak') {
          return false;
        }
      }
      
      return true;
    });

    // Calculate statistics
    const stats = {
      totalNodes: finalNodes.length,
      totalDirectEdges: directEdges.length,
      totalMultiDegreeLinks: filteredMultiDegreeLinks.length,
      averageConnections: finalNodes.length > 0 
        ? Math.round((directEdges.length * 2) / finalNodes.length * 100) / 100 
        : 0
    };

    return {
      nodes: finalNodes,
      edges: finalEdges,
      multiDegreeLinks: filteredMultiDegreeLinks,
      stats
    };

  }, [data, filters]);
}