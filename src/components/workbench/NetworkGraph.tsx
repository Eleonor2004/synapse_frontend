"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Network, Users, Activity, Search, AlertCircle, Info } from 'lucide-react';

// --- INTERFACES ---
export interface ExcelData {
  [key: string]: any[];
}

export interface Individual {
  id: string;
  phoneNumber: string;
  imei?: string;
  location?: string;
  interactions: number;
  details: any;
}

interface NetworkNode {
  id: string;
  label: string;
  phoneNumber: string;
  interactions: number;
  type: 'primary' | 'secondary';
  size: number;
  color: string;
  x?: number;
  y?: number;
  imei?: string;
  location?: string;
}

interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  interactions: number;
  callCount: number;
  smsCount: number;
  weight: number;
  color: string;
  width: number;
}

interface NetworkGraphProps {
  data: ExcelData | null;
  filters: any;
  onIndividualSelect: (individual: Individual) => void;
}

// --- ENHANCED HELPER FUNCTIONS ---
const getInteractionColor = (intensity: number, maxIntensity: number): string => {
  const ratio = Math.max(0, Math.min(1, intensity / maxIntensity));
  if (ratio <= 0.25) return '#22C55E'; // Green
  if (ratio <= 0.5) return '#EAB308';  // Yellow
  if (ratio <= 0.75) return '#F97316'; // Orange
  return '#EF4444'; // Red
};

const getNodeSize = (interactions: number, maxInteractions: number): number => {
  const minSize = 15;
  const maxSize = 50;
  const ratio = Math.max(0, Math.min(1, interactions / maxInteractions));
  return minSize + (maxSize - minSize) * ratio;
};

/**
 * Enhanced field finder with fuzzy matching
 */
const findFieldValue = (row: any, possibleFields: string[]): string | null => {
  if (!row || typeof row !== 'object') return null;
  
  // Create normalized version of row
  const normalizedRow: { [key: string]: any } = {};
  Object.keys(row).forEach(key => {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      const normalizedKey = key.toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ç]/g, 'c')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      normalizedRow[normalizedKey] = row[key];
    }
  });
  
  // Try exact matches first
  for (const field of possibleFields) {
    const normalizedField = field.toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ç]/g, 'c')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (normalizedRow[normalizedField]) {
      return String(normalizedRow[normalizedField]).trim();
    }
  }
  
  // Try partial matches
  for (const field of possibleFields) {
    const fieldWords = field.toLowerCase().split(/\s+/);
    const matchingKey = Object.keys(normalizedRow).find(key => {
      return fieldWords.some(word => key.includes(word)) ||
             fieldWords.length > 1 && fieldWords.every(word => key.includes(word));
    });
    
    if (matchingKey && normalizedRow[matchingKey]) {
      return String(normalizedRow[matchingKey]).trim();
    }
  }
  
  return null;
};

/**
 * Enhanced phone number cleaning
 */
const cleanPhoneNumber = (phone: string): string | null => {
  if (!phone || typeof phone !== 'string') return null;
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/[^\d]/g, '');
  
  if (cleaned.length === 0) return null;
  
  // Remove common country codes
  if (cleaned.startsWith('237') && cleaned.length > 3) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('1') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }
  
  // Validate minimum length
  if (cleaned.length < 6) return null;
  
  return cleaned;
};

/**
 * Enhanced SMS detection
 */
const isSMSData = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const upperValue = value.toUpperCase();
  return upperValue.includes('SMS') || 
         /^[A-F0-9]{10,}$/i.test(value.trim()) ||
         upperValue.includes('MESSAGE') ||
         value.includes('0x');
};

/**
 * Enhanced duration parsing
 */
const parseDuration = (durationStr: string): { seconds: number; isSMS: boolean } => {
  if (!durationStr || typeof durationStr !== 'string') {
    return { seconds: 0, isSMS: false };
  }
  
  const trimmed = durationStr.trim();
  
  // Check for SMS indicators
  if (isSMSData(trimmed)) {
    return { seconds: 0, isSMS: true };
  }
  
  // Parse time formats: HH:MM:SS, MM:SS, or just seconds
  const timeMatch = trimmed.match(/(\d+):(\d+)(?::(\d+))?/);
  if (timeMatch) {
    const hours = timeMatch[3] ? parseInt(timeMatch[1]) || 0 : 0;
    const minutes = timeMatch[3] ? parseInt(timeMatch[2]) || 0 : parseInt(timeMatch[1]) || 0;
    const seconds = timeMatch[3] ? parseInt(timeMatch[3]) || 0 : parseInt(timeMatch[2]) || 0;
    
    return { seconds: hours * 3600 + minutes * 60 + seconds, isSMS: false };
  }
  
  // Try to parse as plain number
  const numberMatch = trimmed.match(/(\d+)/);
  if (numberMatch) {
    return { seconds: parseInt(numberMatch[1]) || 0, isSMS: false };
  }
  
  return { seconds: 0, isSMS: false };
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  data,
  filters,
  onIndividualSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const networkData = useMemo(() => {
    console.log('=== NetworkGraph Processing Started ===');
    console.log('Input data:', data);
    
    // Reset debug info
    let debug = '';
    
    if (!data || typeof data !== 'object') {
      debug = 'No data provided or data is not an object';
      setDebugInfo(debug);
      return { nodes: [], edges: [] };
    }
    
    // Find the best sheet to use
    const sheets = Object.keys(data);
    debug += `Available sheets: ${sheets.join(', ')}\n`;
    
    let selectedSheet: string | null = null;
    let interactionList: any[] = [];
    
    // Priority order for sheet selection
    const sheetPriorities = [
      // Exact matches first
      'listing', 'listings',
      // Then partial matches
      'communication', 'calls', 'data', 'interactions', 'records'
    ];
    
    // Try to find sheet by priority
    for (const priority of sheetPriorities) {
      const foundKey = sheets.find(key => 
        key.toLowerCase().includes(priority.toLowerCase())
      );
      if (foundKey && Array.isArray(data[foundKey]) && data[foundKey].length > 0) {
        selectedSheet = foundKey;
        interactionList = data[foundKey];
        break;
      }
    }
    
    // If no priority match, use first non-empty array
    if (!selectedSheet) {
      for (const sheet of sheets) {
        if (Array.isArray(data[sheet]) && data[sheet].length > 0) {
          selectedSheet = sheet;
          interactionList = data[sheet];
          break;
        }
      }
    }
    
    if (!selectedSheet || interactionList.length === 0) {
      debug += 'No valid sheet found with data\n';
      setDebugInfo(debug);
      return { nodes: [], edges: [] };
    }
    
    debug += `Using sheet: "${selectedSheet}" with ${interactionList.length} rows\n`;
    
    // Analyze data structure
    const sampleRow = interactionList.find(row => row && typeof row === 'object');
    if (!sampleRow) {
      debug += 'No valid sample row found\n';
      setDebugInfo(debug);
      return { nodes: [], edges: [] };
    }
    
    const availableColumns = Object.keys(sampleRow);
    debug += `Available columns: ${availableColumns.join(', ')}\n`;
    
    // Enhanced field mapping with more variations
    const callerFields = [
      'numero appelant', 'numéro appelant', 'numero appellant', 'numéro appellant',
      'caller', 'from', 'source', 'appelant', 'calling number', 'caller number',
      'phone a', 'numero a', 'number a', 'a', 'from number'
    ];
    
    const recipientFields = [
      'numero appele', 'numéro appelé', 'numero appelé', 'numéro appele',
      'called', 'to', 'destination', 'appele', 'appelé', 'recipient',
      'phone b', 'numero b', 'number b', 'b', 'to number', 'called number'
    ];
    
    const durationFields = [
      'duree appel', 'durée appel', 'duree', 'durée', 'duration',
      'call duration', 'temps', 'time', 'length', 'sms'
    ];
    
    const dateFields = [
      'date debut appel', 'date début appel', 'date', 'start date',
      'call date', 'timestamp', 'time', 'date appel', 'datetime'
    ];
    
    const imeiFields = [
      'imei numero appelant', 'imei numéro appelant', 'imei appellant',
      'imei', 'device id', 'device', 'terminal'
    ];
    
    const locationFields = [
      'localisation numero appelant', 'localisation numéro appelant',
      'localisation', 'location', 'position', 'coordinates',
      'longitude latitude', 'lat long', 'cell', 'tower'
    ];
    
    // Process data
    const nodeMap = new Map<string, NetworkNode>();
    const edgeMap = new Map<string, NetworkEdge>();
    
    let processedCount = 0;
    let skippedCount = 0;
    const skipReasons: string[] = [];
    
    interactionList.forEach((row, index) => {
      if (!row || typeof row !== 'object') {
        skippedCount++;
        if (skipReasons.length < 5) {
          skipReasons.push(`Row ${index + 1}: Invalid row data`);
        }
        return;
      }
      
      // Extract field values
      const callerRaw = findFieldValue(row, callerFields);
      const recipientRaw = findFieldValue(row, recipientFields);
      const durationRaw = findFieldValue(row, durationFields);
      const dateRaw = findFieldValue(row, dateFields);
      const imeiRaw = findFieldValue(row, imeiFields);
      const locationRaw = findFieldValue(row, locationFields);
      
      // Clean phone numbers
      const caller = cleanPhoneNumber(callerRaw || '');
      const recipient = cleanPhoneNumber(recipientRaw || '');
      
      // Parse duration and determine type
      const { seconds: duration, isSMS } = parseDuration(durationRaw || '');
      
      // Skip if essential data is missing
      if (!caller || !recipient) {
        skippedCount++;
        if (skipReasons.length < 5) {
          skipReasons.push(`Row ${index + 1}: Missing caller (${callerRaw}) or recipient (${recipientRaw})`);
        }
        return;
      }
      
      // Skip if caller and recipient are the same
      if (caller === recipient) {
        skippedCount++;
        if (skipReasons.length < 5) {
          skipReasons.push(`Row ${index + 1}: Caller and recipient are the same (${caller})`);
        }
        return;
      }
      
      // Determine interaction type
      const interactionType = isSMS || duration === 0 ? 'sms' : 'call';
      
      // Apply filters
      if (filters?.interactionType && filters.interactionType !== 'all' && filters.interactionType !== interactionType) {
        skippedCount++;
        return;
      }
      
      if (filters?.dateRange?.start && dateRaw && new Date(dateRaw) < new Date(filters.dateRange.start)) {
        skippedCount++;
        return;
      }
      
      if (filters?.dateRange?.end && dateRaw && new Date(dateRaw) > new Date(filters.dateRange.end)) {
        skippedCount++;
        return;
      }
      
      if (filters?.individuals?.length > 0) {
        const matchesFilter = filters.individuals.some((filterNum: string) => 
          caller.includes(filterNum) || recipient.includes(filterNum)
        );
        if (!matchesFilter) {
          skippedCount++;
          return;
        }
      }
      
      // Create or update nodes
      if (!nodeMap.has(caller)) {
        nodeMap.set(caller, {
          id: caller,
          label: caller,
          phoneNumber: caller,
          interactions: 0,
          type: 'primary',
          size: 20,
          color: '#3B82F6',
          imei: imeiRaw || undefined,
          location: locationRaw || undefined,
        });
      } else {
        const node = nodeMap.get(caller)!;
        if (!node.imei && imeiRaw) node.imei = imeiRaw;
        if (!node.location && locationRaw) node.location = locationRaw;
      }
      
      if (!nodeMap.has(recipient)) {
        nodeMap.set(recipient, {
          id: recipient,
          label: recipient,
          phoneNumber: recipient,
          interactions: 0,
          type: 'secondary',
          size: 20,
          color: '#6366F1',
        });
      }
      
      // Update interaction counts
      nodeMap.get(caller)!.interactions++;
      nodeMap.get(recipient)!.interactions++;
      
      // Create or update edge
      const edgeId = [caller, recipient].sort().join('--');
      let edge = edgeMap.get(edgeId);
      if (!edge) {
        edge = {
          id: edgeId,
          from: caller,
          to: recipient,
          interactions: 0,
          callCount: 0,
          smsCount: 0,
          weight: 1,
          color: '#94A3B8',
          width: 1
        };
        edgeMap.set(edgeId, edge);
      }
      
      edge.interactions++;
      if (interactionType === 'call') {
        edge.callCount++;
      } else {
        edge.smsCount++;
      }
      
      processedCount++;
    });
    
    debug += `Processing complete: ${processedCount} processed, ${skippedCount} skipped\n`;
    debug += `Created: ${nodeMap.size} nodes, ${edgeMap.size} edges\n`;
    
    if (skipReasons.length > 0) {
      debug += `Sample skip reasons:\n${skipReasons.join('\n')}\n`;
    }
    
    setDebugInfo(debug);
    
    const nodes = Array.from(nodeMap.values());
    const edges = Array.from(edgeMap.values());
    
    if (nodes.length === 0) {
      debug += 'No valid nodes created. Check data format and column names.\n';
      setDebugInfo(debug);
      return { nodes: [], edges: [] };
    }
    
    // Apply styling based on interaction counts
    const maxInteractions = Math.max(...nodes.map(n => n.interactions), 1);
    const maxEdgeInteractions = Math.max(...edges.map(e => e.interactions), 1);
    
    nodes.forEach(node => {
      node.size = getNodeSize(node.interactions, maxInteractions);
      const meetsMinInteractions = node.interactions >= (filters?.minInteractions || 0);
      node.color = meetsMinInteractions ? 
        (node.type === 'primary' ? '#3B82F6' : '#6366F1') : '#94A3B8';
    });
    
    edges.forEach(edge => {
      edge.weight = edge.interactions;
      edge.width = Math.max(1, Math.min(8, (edge.interactions / maxEdgeInteractions) * 6));
      edge.color = getInteractionColor(edge.interactions, maxEdgeInteractions);
    });
    
    console.log('=== NetworkGraph Processing Complete ===');
    console.log(`Final result: ${nodes.length} nodes, ${edges.length} edges`);
    
    return { nodes, edges };
  }, [data, filters]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: Math.max(width || 800, 400), 
          height: Math.max(height || 600, 300) 
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle node interactions
  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    
    const connectedEdges = networkData.edges.filter(e => 
      e.from === node.id || e.to === node.id
    );
    
    const individual: Individual = {
      id: node.id,
      phoneNumber: node.phoneNumber,
      imei: node.imei,
      location: node.location,
      interactions: node.interactions,
      details: {
        type: node.type,
        connectedNodes: connectedEdges.length,
        callCount: connectedEdges.reduce((sum, e) => sum + e.callCount, 0),
        smsCount: connectedEdges.reduce((sum, e) => sum + e.smsCount, 0),
        interactionTypes: ['calls', 'sms'].filter(type => 
          connectedEdges.some(e => type === 'calls' ? e.callCount > 0 : e.smsCount > 0)
        )
      }
    };
    
    onIndividualSelect(individual);
  };

  // Filter nodes based on search
  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) return networkData.nodes;
    const searchLower = searchTerm.toLowerCase();
    return networkData.nodes.filter(node =>
      node.phoneNumber.toLowerCase().includes(searchLower) ||
      node.label.toLowerCase().includes(searchLower) ||
      (node.imei && node.imei.toLowerCase().includes(searchLower))
    );
  }, [networkData.nodes, searchTerm]);

  // Position nodes using force simulation
  const positionedNodes = useMemo(() => {
    const nodes = [...filteredNodes];
    if (nodes.length === 0) return [];
    
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    const margin = 60;
    
    // Initialize positions if not set
    nodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) {
        node.x = centerX + (Math.random() - 0.5) * Math.min(width, height) * 0.6;
        node.y = centerY + (Math.random() - 0.5) * Math.min(width, height) * 0.6;
      }
    });
    
    // Simple force simulation
    const iterations = nodes.length > 50 ? 50 : 100;
    for (let iter = 0; iter < iterations; iter++) {
      nodes.forEach(nodeA => {
        let fx = 0, fy = 0;
        
        // Repulsion between all nodes
        nodes.forEach(nodeB => {
          if (nodeA.id === nodeB.id) return;
          const dx = (nodeA.x || 0) - (nodeB.x || 0);
          const dy = (nodeA.y || 0) - (nodeB.y || 0);
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const repulsion = 3000 / (distance * distance);
          fx += (dx / distance) * repulsion;
          fy += (dy / distance) * repulsion;
        });
        
        // Attraction for connected nodes
        networkData.edges.forEach(edge => {
          const connected = edge.from === nodeA.id || edge.to === nodeA.id;
          if (!connected) return;
          
          const otherId = edge.from === nodeA.id ? edge.to : edge.from;
          const otherNode = nodes.find(n => n.id === otherId);
          if (!otherNode) return;
          
          const dx = (otherNode.x || 0) - (nodeA.x || 0);
          const dy = (otherNode.y || 0) - (nodeA.y || 0);
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const attraction = Math.min(distance * 0.01, 5);
          fx += (dx / distance) * attraction;
          fy += (dy / distance) * attraction;
        });
        
        // Center attraction (weak)
        fx += (centerX - (nodeA.x || 0)) * 0.001;
        fy += (centerY - (nodeA.y || 0)) * 0.001;
        
        // Apply forces with bounds
        const damping = 0.1;
        nodeA.x = Math.max(margin, Math.min(width - margin, 
          (nodeA.x || 0) + fx * damping));
        nodeA.y = Math.max(margin, Math.min(height - margin, 
          (nodeA.y || 0) + fy * damping));
      });
    }
    
    return nodes;
  }, [filteredNodes, dimensions, networkData.edges]);

  // Show error state if no data
  if (networkData.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-center max-w-3xl p-6">
          <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-3">No Network Data Found</h3>
          <p className="text-muted-foreground mb-4">
            Could not find valid interaction data in the provided file. The component tried to process the data but couldn't identify valid caller-recipient pairs.
          </p>
          
          {debugInfo && (
            <div className="text-left bg-muted/50 rounded-lg p-4 text-sm mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4" />
                <span className="font-medium">Debug Information:</span>
              </div>
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{debugInfo}</pre>
            </div>
          )}
          
          <div className="text-left bg-muted/50 rounded-lg p-4 text-sm space-y-3">
            <div>
              <p className="font-medium mb-2">Expected data structure:</p>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• <strong>Caller Number</strong> (e.g., "Numéro Appelant", "650589893")</li>
                <li>• <strong>Recipient Number</strong> (e.g., "Numéro appelé", "659789768")</li>
                <li>• <strong>Call Date</strong> (e.g., "Date Début appel")</li>
                <li>• <strong>Duration/Type</strong> (e.g., "Durée appel", "SMS")</li>
                <li>• <strong>IMEI</strong> (Optional)</li>
                <li>• <strong>Location</strong> (Optional)</li>
              </ul>
            </div>
            <div className="text-xs text-muted-foreground mt-3 p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
              <strong>Expected sheet structure:</strong> The component expects a sheet named "Listing" with the following columns:<br/>
              Numéro Appelant, Localisation numéro appelant (Longitude, Latitude), IMEI numéro appelant (optional), Date Début appel, Durée appel, Numéro appelé<br/>
              Range: A1:F1
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Network className="w-5 h-5" />
            Network Graph
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {positionedNodes.length} Nodes
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {networkData.edges.length} Edges
            </span>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nodes by phone number or IMEI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full">
          {/* Define gradients for edges */}
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          {/* Edges */}
          <g className="edges">
            {networkData.edges.map(edge => {
              const fromNode = positionedNodes.find(n => n.id === edge.from);
              const toNode = positionedNodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode || !fromNode.x || !fromNode.y || !toNode.x || !toNode.y) return null;
              
              const isHighlighted = selectedNode && (edge.from === selectedNode || edge.to === selectedNode);
              
              return (
                <line 
                  key={edge.id} 
                  x1={fromNode.x} 
                  y1={fromNode.y} 
                  x2={toNode.x} 
                  y2={toNode.y} 
                  stroke={isHighlighted ? '#F59E0B' : edge.color} 
                  strokeWidth={isHighlighted ? edge.width + 1 : edge.width} 
                  opacity={isHighlighted ? 0.9 : 0.6}
                  className="transition-all duration-200"
                />
              );
            })}
          </g>
          
          {/* Nodes */}
          <g className="nodes">
            {positionedNodes.map(node => {
              const isSelected = selectedNode === node.id;
              const isHovered = hoveredNode === node.id;
              const isHighlighted = isSelected || isHovered;
              
              return (
                <g 
                  key={node.id} 
                  className="cursor-pointer transition-all duration-200" 
                  onClick={() => handleNodeClick(node)} 
                  onMouseEnter={() => setHoveredNode(node.id)} 
                  onMouseLeave={() => setHoveredNode(null)}
                  transform={isHighlighted ? 'scale(1.1)' : 'scale(1)'}
                  style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                >
                  {/* Node shadow for depth */}
                  <circle 
                    cx={node.x! + 2} 
                    cy={node.y! + 2} 
                    r={node.size / 2} 
                    fill="rgba(0,0,0,0.1)" 
                    opacity={isHighlighted ? 0.3 : 0.1}
                  />
                  
                  {/* Main node circle */}
                  <circle 
                    cx={node.x} 
                    cy={node.y} 
                    r={node.size / 2} 
                    fill={isSelected ? '#F59E0B' : node.color} 
                    stroke={isSelected ? '#D97706' : isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.3)'} 
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                    className="transition-all duration-200"
                  />
                  
                  {/* Node inner circle for better visibility */}
                  <circle 
                    cx={node.x} 
                    cy={node.y} 
                    r={Math.max(2, node.size / 4)} 
                    fill="rgba(255,255,255,0.9)" 
                    opacity={0.8}
                  />
                  
                  {/* Interaction count text */}
                  <text 
                    x={node.x} 
                    y={node.y + 3} 
                    textAnchor="middle" 
                    fontSize={Math.max(8, Math.min(12, node.size / 4))} 
                    fill="#1F2937" 
                    fontWeight="bold" 
                    className="pointer-events-none select-none"
                  >
                    {node.interactions}
                  </text>
                  
                  {/* Phone number label below node */}
                  {(isHovered || isSelected) && (
                    <text 
                      x={node.x} 
                      y={node.y! + node.size / 2 + 15} 
                      textAnchor="middle" 
                      fontSize="10" 
                      fill="currentColor" 
                      className="pointer-events-none select-none font-medium"
                    >
                      {node.phoneNumber.length > 12 ? `${node.phoneNumber.slice(0, 12)}...` : node.phoneNumber}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Enhanced Hover Tooltip */}
        {hoveredNode && (() => {
          const node = positionedNodes.find(n => n.id === hoveredNode);
          if (!node || !node.x || !node.y) return null;
          
          const connectedEdges = networkData.edges.filter(e => e.from === node.id || e.to === node.id);
          const callCount = connectedEdges.reduce((sum, e) => sum + e.callCount, 0);
          const smsCount = connectedEdges.reduce((sum, e) => sum + e.smsCount, 0);
          
          return (
            <div 
              className="absolute bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-xl pointer-events-none border border-border z-10 max-w-xs" 
              style={{ 
                left: `${Math.min(node.x + 30, dimensions.width - 280)}px`, 
                top: `${Math.max(node.y - 60, 10)}px` 
              }}
            >
              <div className="space-y-2">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: node.color }}
                  />
                  {node.phoneNumber}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted/50 rounded p-2">
                    <div className="text-muted-foreground">Total</div>
                    <div className="font-semibold text-foreground">{node.interactions}</div>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <div className="text-muted-foreground">Connections</div>
                    <div className="font-semibold text-foreground">{connectedEdges.length}</div>
                  </div>
                  {callCount > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950 rounded p-2">
                      <div className="text-blue-600 dark:text-blue-400">Calls</div>
                      <div className="font-semibold text-blue-700 dark:text-blue-300">{callCount}</div>
                    </div>
                  )}
                  {smsCount > 0 && (
                    <div className="bg-green-50 dark:bg-green-950 rounded p-2">
                      <div className="text-green-600 dark:text-green-400">SMS</div>
                      <div className="font-semibold text-green-700 dark:text-green-300">{smsCount}</div>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <div className="text-muted-foreground mb-1">Type: {node.type}</div>
                  {node.imei && (
                    <div className="text-muted-foreground mb-1">
                      IMEI: {node.imei.length > 15 ? `${node.imei.slice(0, 15)}...` : node.imei}
                    </div>
                  )}
                  {node.location && (
                    <div className="text-muted-foreground">
                      Location: {node.location.length > 30 ? `${node.location.slice(0, 30)}...` : node.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border">
          <div className="text-xs font-medium text-foreground mb-2">Interaction Levels</div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-muted-foreground">Very High</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setSelectedNode(null)}
            className="px-3 py-1 bg-background/90 backdrop-blur-sm border border-border rounded-md text-xs font-medium hover:bg-muted transition-colors"
            disabled={!selectedNode}
          >
            Clear Selection
          </button>
          
          {selectedNode && (
            <div className="bg-background/90 backdrop-blur-sm p-2 rounded-lg border border-border text-xs">
              <div className="font-medium text-foreground">Selected:</div>
              <div className="text-muted-foreground">{selectedNode}</div>
            </div>
          )}
        </div>

        {/* Empty state overlay for filtered results */}
        {searchTerm && filteredNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="text-center p-6">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">No Results Found</h3>
              <p className="text-sm text-muted-foreground mb-3">
                No nodes match "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
