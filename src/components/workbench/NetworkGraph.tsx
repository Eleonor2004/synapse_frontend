"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Network, Users, Activity, Search } from 'lucide-react';

// --- INTERFACES ---
export interface ExcelData {
  // The component is now flexible and does not depend on a hardcoded sheet name.
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
  data: ExcelData | null; // Allow null to handle loading states gracefully
  filters: any;
  onIndividualSelect: (individual: Individual) => void;
}

// --- HELPER FUNCTIONS ---
const getInteractionColor = (intensity: number, maxIntensity: number): string => {
  const ratio = intensity / maxIntensity;
  if (ratio <= 0.25) return '#22C55E'; // Green
  if (ratio <= 0.5) return '#EAB308';  // Yellow
  if (ratio <= 0.75) return '#F97316'; // Orange
  return '#EF4444'; // Red
};

const getNodeSize = (interactions: number, maxInteractions: number): number => {
  const minSize = 20;
  const maxSize = 60;
  const ratio = interactions / maxInteractions;
  return minSize + (maxSize - minSize) * ratio;
};

/**
 * Normalizes a string key to make it consistent for lookups.
 * Converts to lowercase and trims whitespace.
 * e.g., " Numéro Appelant " -> "numéro appelant"
 */
const normalizeKey = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str.toLowerCase().trim();
};

/**
 * Cleans phone numbers by removing country codes and formatting
 */
const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.toString().replace(/[^\d]/g, '');
  // Remove common country codes
  if (cleaned.startsWith('237')) {
    return cleaned.substring(3);
  }
  return cleaned;
};

/**
 * Checks if a string represents SMS data (encoded messages)
 */
const isSMSData = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  // Check for hexadecimal patterns or "SMS" keyword
  return value.includes('SMS') || /^[A-F0-9]+$/i.test(value.trim());
};

/**
 * Parses duration string in format "h:m:s" or similar
 */
const parseDuration = (durationStr: string): number => {
  if (!durationStr || typeof durationStr !== 'string') return 0;
  
  // Handle "SMS" entries
  if (durationStr.includes('SMS') || isSMSData(durationStr)) return 0;
  
  // Parse time format h:m:s
  const parts = durationStr.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parts.length > 2 ? parseInt(parts[2]) || 0 : 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  // Try to parse as plain number
  return parseInt(durationStr) || 0;
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

  const networkData = useMemo(() => {
    console.log('Processing data:', data);
    
    // --- ENHANCED SHEET DETECTION ---
    let interactionList: any[] = [];
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      const sheetKeys = Object.keys(data);
      console.log('Available sheets:', sheetKeys);
      
      // Priority order for sheet detection
      const sheetPriorities = [
        'listing', 'listings', 'data', 'interactions', 'calls', 'records'
      ];
      
      let selectedSheet = null;
      
      // Try to find a sheet by priority
      for (const priority of sheetPriorities) {
        const foundKey = sheetKeys.find(key => 
          key.toLowerCase().includes(priority)
        );
        if (foundKey && Array.isArray(data[foundKey]) && data[foundKey].length > 0) {
          selectedSheet = foundKey;
          break;
        }
      }
      
      // If no priority sheet found, use the first non-empty array sheet
      if (!selectedSheet) {
        selectedSheet = sheetKeys.find(key => 
          Array.isArray(data[key]) && data[key].length > 0
        );
      }
      
      if (selectedSheet) {
        interactionList = data[selectedSheet];
        console.log(`Using sheet: "${selectedSheet}" with ${interactionList.length} rows`);
      } else {
        console.warn('No valid sheet found with data');
      }
    }

    if (interactionList.length === 0) {
      console.log('No interaction data found');
      return { nodes: [], edges: [] };
    }

    // Log first few rows to understand structure
    console.log('Sample data rows:', interactionList.slice(0, 3));

    const nodeMap = new Map<string, NetworkNode>();
    const edgeMap = new Map<string, NetworkEdge>();

    // --- ENHANCED FIELD MAPPING ---
    const possibleCallerFields = [
      'numéro appelant', 'numero appellant', 'numero appelant', 'caller', 'from', 
      'caller number', 'calling number', 'appelant', 'source'
    ];
    const possibleRecipientFields = [
      'numéro appelé', 'numero appele', 'numero appelé', 'called', 'to', 
      'recipient', 'recipient number', 'appelé', 'destination', 'target'
    ];
    const possibleDurationFields = [
      'durée appel', 'duree appel', 'duree', 'duration', 'call duration',
      'durée de l\'appel', 'duree de l\'appel', 'temps'
    ];
    const possibleDateFields = [
      'date début appel', 'date debut appel', 'date', 'start date', 
      'call date', 'date appel', 'timestamp', 'time'
    ];
    const possibleImeiFields = [
      'imei numéro appelant', 'imei numero appelant', 'imei', 'device id',
      'imei appelant', 'imei numero appellant'
    ];
    const possibleLocationFields = [
      'localisation numéro appelant (longitude, latitude)', 
      'localisation numero appelant', 'localisation', 'location', 'position',
      'cell', 'tower', 'base station'
    ];

    let processedCount = 0;
    let skippedCount = 0;

    interactionList.forEach((listing: any, index: number) => {
      if (typeof listing !== 'object' || listing === null) {
        skippedCount++;
        return;
      }

      const normalizedListing: { [key: string]: any } = {};
      for (const key in listing) {
        if (listing[key] !== undefined && listing[key] !== null) {
          normalizedListing[normalizeKey(key)] = listing[key];
        }
      }

      const findValue = (fields: string[]) => {
        for (const field of fields) {
          const value = normalizedListing[field];
          if (value !== undefined && value !== null && String(value).trim() !== '') {
            return String(value).trim();
          }
        }
        return null;
      };

      const callerRaw = findValue(possibleCallerFields);
      const recipientRaw = findValue(possibleRecipientFields);
      
      // Clean phone numbers
      const caller = callerRaw ? cleanPhoneNumber(callerRaw) : null;
      const recipient = recipientRaw ? cleanPhoneNumber(recipientRaw) : null;
      
      // Skip row if essential data is missing or identical
      if (!caller || !recipient || caller === recipient) {
        // Check if this might be an SMS with encoded recipient
        const durationRaw = findValue(possibleDurationFields);
        if (caller && durationRaw && isSMSData(durationRaw)) {
          // For SMS, use the encoded data as recipient identifier
          const smsRecipient = durationRaw.replace('SMS', '').trim() || 'SMS_DATA';
          if (smsRecipient !== caller) {
            // Process as SMS
            const imei = findValue(possibleImeiFields);
            const location = findValue(possibleLocationFields);
            const date = findValue(possibleDateFields);

            // Apply filters
            if (filters.interactionType && filters.interactionType !== 'all' && filters.interactionType !== 'sms') {
              skippedCount++;
              return;
            }
            if (filters.dateRange?.start && date && new Date(date) < new Date(filters.dateRange.start)) {
              skippedCount++;
              return;
            }
            if (filters.dateRange?.end && date && new Date(date) > new Date(filters.dateRange.end)) {
              skippedCount++;
              return;
            }
            if (filters.individuals?.length > 0 && !filters.individuals.includes(caller)) {
              skippedCount++;
              return;
            }

            // Create nodes for SMS
            if (!nodeMap.has(caller)) {
              nodeMap.set(caller, {
                id: caller, label: caller, phoneNumber: caller, interactions: 0,
                type: 'primary', size: 20, color: '#3B82F6',
                imei: imei || undefined, location: location || undefined,
              });
            }
            if (!nodeMap.has(smsRecipient)) {
              nodeMap.set(smsRecipient, {
                id: smsRecipient, label: `SMS:${smsRecipient}`, phoneNumber: smsRecipient, 
                interactions: 0, type: 'secondary', size: 20, color: '#6366F1',
              });
            }

            nodeMap.get(caller)!.interactions++;
            nodeMap.get(smsRecipient)!.interactions++;

            const edgeId = [caller, smsRecipient].sort().join('--');
            let edge = edgeMap.get(edgeId);
            if (!edge) {
              edge = {
                id: edgeId, from: caller, to: smsRecipient, interactions: 0,
                callCount: 0, smsCount: 0, weight: 1, color: '#94A3B8', width: 1
              };
              edgeMap.set(edgeId, edge);
            }
            edge.interactions++;
            edge.smsCount++;
            processedCount++;
            return;
          }
        }
        
        skippedCount++;
        return;
      }

      const imei = findValue(possibleImeiFields);
      const location = findValue(possibleLocationFields);
      const date = findValue(possibleDateFields);
      const durationStr = findValue(possibleDurationFields);
      const duration = parseDuration(durationStr || '');
      
      let interactionType: 'call' | 'sms' = 'call';
      
      // Determine interaction type
      if (durationStr && isSMSData(durationStr)) {
        interactionType = 'sms';
      } else if (duration === 0 && durationStr && durationStr.includes('SMS')) {
        interactionType = 'sms';
      }

      // Apply filters passed in via props
      if (filters.interactionType && filters.interactionType !== 'all' && filters.interactionType !== interactionType) {
        skippedCount++;
        return;
      }
      if (filters.dateRange?.start && date && new Date(date) < new Date(filters.dateRange.start)) {
        skippedCount++;
        return;
      }
      if (filters.dateRange?.end && date && new Date(date) > new Date(filters.dateRange.end)) {
        skippedCount++;
        return;
      }
      if (filters.individuals?.length > 0 && !filters.individuals.includes(caller) && !filters.individuals.includes(recipient)) {
        skippedCount++;
        return;
      }

      // Create or update the caller node
      if (!nodeMap.has(caller)) {
        nodeMap.set(caller, {
          id: caller, label: caller, phoneNumber: caller, interactions: 0,
          type: 'primary', size: 20, color: '#3B82F6',
          imei: imei || undefined, location: location || undefined,
        });
      } else {
        const node = nodeMap.get(caller)!;
        if (!node.imei && imei) node.imei = imei;
        if (!node.location && location) node.location = location;
      }

      // Create or update the recipient node
      if (!nodeMap.has(recipient)) {
        nodeMap.set(recipient, {
          id: recipient, label: recipient, phoneNumber: recipient, interactions: 0,
          type: 'secondary', size: 20, color: '#6366F1',
        });
      }

      nodeMap.get(caller)!.interactions++;
      nodeMap.get(recipient)!.interactions++;

      const edgeId = [caller, recipient].sort().join('--');
      let edge = edgeMap.get(edgeId);
      if (!edge) {
        edge = {
          id: edgeId, from: caller, to: recipient, interactions: 0,
          callCount: 0, smsCount: 0, weight: 1, color: '#94A3B8', width: 1
        };
        edgeMap.set(edgeId, edge);
      }
      edge.interactions++;
      interactionType === 'call' ? edge.callCount++ : edge.smsCount++;
      processedCount++;
    });

    console.log(`Processed: ${processedCount} rows, Skipped: ${skippedCount} rows`);
    console.log(`Created: ${nodeMap.size} nodes, ${edgeMap.size} edges`);

    const nodes = Array.from(nodeMap.values());
    const edges = Array.from(edgeMap.values());

    if (nodes.length === 0) {
      console.log('No valid nodes created');
      return { nodes: [], edges: [] };
    }

    const maxInteractions = Math.max(...nodes.map(n => n.interactions), 1);
    const maxEdgeInteractions = Math.max(...edges.map(e => e.interactions), 1);

    nodes.forEach(node => {
      node.size = getNodeSize(node.interactions, maxInteractions);
      node.color = node.interactions >= (filters.minInteractions || 0) ? 
        (node.type === 'primary' ? '#3B82F6' : '#6366F1') : '#94A3B8';
    });

    edges.forEach(edge => {
      edge.weight = edge.interactions;
      edge.width = Math.max(1, Math.min(8, (edge.interactions / maxEdgeInteractions) * 6));
      edge.color = getInteractionColor(edge.interactions, maxEdgeInteractions);
    });

    return { nodes, edges };
  }, [data, filters]);

  // --- RENDERING LOGIC ---

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width || 800, height: height || 600 });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    const individual: Individual = {
      id: node.id,
      phoneNumber: node.phoneNumber,
      imei: node.imei,
      location: node.location,
      interactions: node.interactions,
      details: {
        type: node.type,
        connectedNodes: networkData.edges.filter(e => e.from === node.id || e.to === node.id).length
      }
    };
    onIndividualSelect(individual);
  };

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return networkData.nodes;
    const lowercasedFilter = searchTerm.toLowerCase();
    return networkData.nodes.filter(node =>
      node.phoneNumber.toLowerCase().includes(lowercasedFilter) ||
      node.label.toLowerCase().includes(lowercasedFilter)
    );
  }, [networkData.nodes, searchTerm]);

  const positionedNodes = useMemo(() => {
    const nodes = [...filteredNodes];
    const { width, height } = dimensions;
    if (nodes.length === 0) return [];
    
    nodes.forEach(node => {
        if (node.x === undefined) node.x = width / 2 + (Math.random() - 0.5) * 200;
        if (node.y === undefined) node.y = height / 2 + (Math.random() - 0.5) * 200;
    });

    // Enhanced force simulation
    for (let i = 0; i < 100; i++) {
        nodes.forEach(nodeA => {
            let fx = 0, fy = 0;
            
            // Repulsion between nodes
            nodes.forEach(nodeB => {
                if (nodeA.id === nodeB.id) return;
                const dx = (nodeA.x || 0) - (nodeB.x || 0);
                const dy = (nodeA.y || 0) - (nodeB.y || 0);
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const repulsion = 2000 / (dist * dist);
                fx += (dx / dist) * repulsion;
                fy += (dy / dist) * repulsion;
            });
            
            // Attraction for connected nodes
            networkData.edges.forEach(edge => {
                const isLinked = edge.from === nodeA.id || edge.to === nodeA.id;
                if (!isLinked) return;
                const otherNode = nodes.find(n => n.id === (edge.from === nodeA.id ? edge.to : edge.from));
                if (!otherNode) return;
                const dx = (otherNode.x || 0) - (nodeA.x || 0);
                const dy = (otherNode.y || 0) - (nodeA.y || 0);
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const attraction = dist * 0.02;
                fx += (dx / dist) * attraction;
                fy += (dy / dist) * attraction;
            });
            
            // Center attraction
            fx += (width / 2 - (nodeA.x || 0)) * 0.002;
            fy += (height / 2 - (nodeA.y || 0)) * 0.002;
            
            // Apply forces with bounds checking
            nodeA.x = Math.max(50, Math.min(width - 50, (nodeA.x || 0) + fx * 0.1));
            nodeA.y = Math.max(50, Math.min(height - 50, (nodeA.y || 0) + fy * 0.1));
        });
    }
    return nodes;
  }, [filteredNodes, dimensions, networkData.edges]);

  // --- ENHANCED ERROR STATE ---
  if (networkData.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-center max-w-2xl p-6">
          <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-3">No Network Data Found</h3>
          <p className="text-muted-foreground mb-4">
            Could not find valid interaction data in the provided file. The component tried to process the data but couldn't identify valid caller-recipient pairs.
          </p>
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
            <div>
              <p className="font-medium mb-2">Troubleshooting:</p>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Ensure your Excel file has the correct sheet structure</li>
                <li>• Check that phone numbers are properly formatted</li>
                <li>• Verify column headers match expected names</li>
                <li>• Make sure data rows contain valid caller-recipient pairs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Network Graph</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span><Users className="w-4 h-4 inline-block mr-1" />{positionedNodes.length} Nodes</span>
                <span><Activity className="w-4 h-4 inline-block mr-1" />{networkData.edges.length} Edges</span>
            </div>
        </div>
        <div className="relative mt-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search nodes by phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
          <g>
            {networkData.edges.map(edge => {
              const fromNode = positionedNodes.find(n => n.id === edge.from);
              const toNode = positionedNodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode || !fromNode.x || !fromNode.y || !toNode.x || !toNode.y) return null;
              return (
                <line 
                  key={edge.id} 
                  x1={fromNode.x} 
                  y1={fromNode.y} 
                  x2={toNode.x} 
                  y2={toNode.y} 
                  stroke={edge.color} 
                  strokeWidth={edge.width} 
                  opacity={0.6} 
                />
              );
            })}
          </g>
          <g>
            {positionedNodes.map(node => (
              <g 
                key={node.id} 
                className="cursor-pointer" 
                onClick={() => handleNodeClick(node)} 
                onMouseEnter={() => setHoveredNode(node.id)} 
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r={node.size / 2} 
                  fill={selectedNode === node.id ? '#F59E0B' : node.color} 
                  stroke={selectedNode === node.id ? '#D97706' : '#FFFFFF'} 
                  strokeWidth={2} 
                />
                <text 
                  x={node.x} 
                  y={node.y + 4} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="white" 
                  fontWeight="bold" 
                  className="pointer-events-none select-none"
                >
                  {node.interactions}
                </text>
              </g>
            ))}
          </g>
        </svg>
        {hoveredNode && (() => {
            const node = positionedNodes.find(n => n.id === hoveredNode);
            if (!node || !node.x || !node.y) return null;
            return (
                <div 
                  className="absolute bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg pointer-events-none border border-border z-10" 
                  style={{ 
                    left: `${Math.min(node.x + 20, dimensions.width - 200)}px`, 
                    top: `${Math.max(node.y - 50, 10)}px` 
                  }}
                >
                    <div className="font-bold text-foreground">{node.phoneNumber}</div>
                    <div className="text-sm text-muted-foreground">Interactions: {node.interactions}</div>
                    <div className="text-xs text-muted-foreground">Type: {node.type}</div>
                    {node.imei && <div className="text-xs text-muted-foreground mt-1">IMEI: {node.imei}</div>}
                    {node.location && <div className="text-xs text-muted-foreground">Location: {node.location.substring(0, 30)}...</div>}
                </div>
            );
        })()}
      </div>
    </div>
  );
};