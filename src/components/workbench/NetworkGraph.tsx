// src/components/workbench/NetworkGraph.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Network, Users, Activity, Search, AlertCircle, Info } from 'lucide-react';
import { ExcelData, Individual } from '@/app/[locale]/workbench/page';

interface NetworkNode {
  id: string;
  label: string;
  phoneNumber: string;
  interactions: number;
  type: 'primary' | 'secondary' | 'service';
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
  width: number; 
}

interface NetworkGraphProps { 
  data: ExcelData | null; 
  filters: any; 
  onIndividualSelect: (individual: Individual) => void; 
}

// Helper Functions
const cleanPhoneNumber = (phone: string): string | null => {
  if (!phone || typeof phone !== 'string') return null;
  // Remove all non-digit characters except + at the start
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.length < 7) return null; // Too short to be a valid phone number
  return cleaned;
};

const isSMSData = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const upperValue = value.toUpperCase();
  return upperValue.includes('SMS') || /^[A-F0-9]{6,}$/i.test(value.trim());
};

const findFieldValue = (row: any, fields: string[]): string | null => {
  if (!row || typeof row !== 'object') return null;
  
  // Normalize function to handle accents and special characters
  const normalize = (str: string) => str
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ç]/g, 'c')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[^a-z0-9\s_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Create normalized row
  const normalizedRow: { [key: string]: any } = {};
  Object.keys(row).forEach(key => {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      normalizedRow[normalize(key)] = row[key];
    }
  });

  // Search for fields
  for (const field of fields) {
    const normalizedField = normalize(field);
    if (normalizedRow[normalizedField]) {
      return String(normalizedRow[normalizedField]);
    }
  }
  
  return null;
};

const parseDuration = (durationStr: string): { seconds: number; isSMS: boolean } => {
  if (!durationStr || typeof durationStr !== 'string') return { seconds: 0, isSMS: false };
  
  const trimmed = durationStr.trim();
  if (isSMSData(trimmed)) return { seconds: 0, isSMS: true };
  
  // Try to parse time format (HH:MM:SS or MM:SS)
  const timeMatch = trimmed.match(/(\d+):(\d+)(?::(\d+))?/);
  if (timeMatch) {
    const h = timeMatch[3] ? parseInt(timeMatch[1], 10) || 0 : 0;
    const m = timeMatch[3] ? parseInt(timeMatch[2], 10) : parseInt(timeMatch[1], 10) || 0;
    const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : parseInt(timeMatch[2], 10) || 0;
    return { seconds: (h * 3600) + (m * 60) + s, isSMS: false };
  }
  
  // Try to parse just numbers
  const numMatch = trimmed.match(/(\d+)/);
  if (numMatch) return { seconds: parseInt(numMatch[1], 10) || 0, isSMS: false };
  
  return { seconds: 0, isSMS: false };
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ data, filters, onIndividualSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // MAIN DATA PROCESSING - This was missing!
  const networkData = useMemo(() => {
    console.log('Processing network data...', data);
    
    if (!data?.listings || !Array.isArray(data.listings)) {
      console.log('No listings found in data');
      return { nodes: [], edges: [] };
    }

    const interactions = new Map<string, { 
      calls: number; 
      sms: number; 
      totalDuration: number; 
      contacts: Set<string>;
      imei?: string;
      location?: string;
    }>();
    
    const edgeMap = new Map<string, { 
      calls: number; 
      sms: number; 
      totalDuration: number; 
    }>();

    // Comprehensive field mappings to handle different data formats
    const callerFields = [
      'caller_num', 'caller', 'calling_number', 'from_number', 'source_number',
      'numéro appelant', 'numero appelant', 'appelant', 'émetteur', 'emetteur'
    ];
    
    const calleeFields = [
      'callee_num', 'callee', 'called_number', 'to_number', 'destination_number',
      'numéro appelé', 'numero appele', 'appelé', 'appele', 'destinataire', 'récepteur', 'recepteur'
    ];
    
    const durationFields = [
      'duration', 'duration_str', 'call_duration', 'length',
      'durée', 'duree', 'durée appel', 'duree appel'
    ];

    const imeiFields = [
      'imei', 'device_id', 'imei_caller', 'imei_source'
    ];

    const locationFields = [
      'location', 'caller_location', 'source_location',
      'localisation', 'localisation numéro appelant', 'localisation numero appelant'
    ];

    // Process each interaction
    data.listings.forEach((row: any, index: number) => {
      if (!row || typeof row !== 'object') return;

      const caller = findFieldValue(row, callerFields);
      const callee = findFieldValue(row, calleeFields);
      const durationStr = findFieldValue(row, durationFields);
      const imei = findFieldValue(row, imeiFields);
      const location = findFieldValue(row, locationFields);

      if (!caller && !callee) return;

      const cleanCaller = caller ? cleanPhoneNumber(caller) : null;
      const cleanCallee = callee ? cleanPhoneNumber(callee) : null;

      if (!cleanCaller && !cleanCallee) return;

      const { seconds, isSMS } = parseDuration(durationStr || '');

      // Add caller to interactions
      if (cleanCaller) {
        if (!interactions.has(cleanCaller)) {
          interactions.set(cleanCaller, { 
            calls: 0, 
            sms: 0, 
            totalDuration: 0, 
            contacts: new Set(),
            imei,
            location
          });
        }
        const callerData = interactions.get(cleanCaller)!;
        if (isSMS) {
          callerData.sms++;
        } else {
          callerData.calls++;
          callerData.totalDuration += seconds;
        }
        if (cleanCallee) callerData.contacts.add(cleanCallee);
      }

      // Add callee to interactions
      if (cleanCallee) {
        if (!interactions.has(cleanCallee)) {
          interactions.set(cleanCallee, { 
            calls: 0, 
            sms: 0, 
            totalDuration: 0, 
            contacts: new Set()
          });
        }
        const calleeData = interactions.get(cleanCallee)!;
        if (isSMS) {
          calleeData.sms++;
        } else {
          calleeData.calls++;
          calleeData.totalDuration += seconds;
        }
        if (cleanCaller) calleeData.contacts.add(cleanCaller);
      }

      // Create edge between caller and callee
      if (cleanCaller && cleanCallee) {
        const edgeKey = [cleanCaller, cleanCallee].sort().join('|');
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, { calls: 0, sms: 0, totalDuration: 0 });
        }
        const edgeData = edgeMap.get(edgeKey)!;
        if (isSMS) {
          edgeData.sms++;
        } else {
          edgeData.calls++;
          edgeData.totalDuration += seconds;
        }
      }
    });

    console.log(`Found ${interactions.size} unique phone numbers`);

    // Apply filters
    const filteredInteractions = new Map();
    interactions.forEach((data, phone) => {
      let include = true;
      
      if (filters?.minInteractions && (data.calls + data.sms) < filters.minInteractions) {
        include = false;
      }
      
      if (filters?.interactionType) {
        if (filters.interactionType === 'calls' && data.calls === 0) include = false;
        if (filters.interactionType === 'sms' && data.sms === 0) include = false;
      }
      
      if (filters?.individuals?.length > 0 && !filters.individuals.includes(phone)) {
        include = false;
      }
      
      if (include) {
        filteredInteractions.set(phone, data);
      }
    });

    // Create nodes
    const nodes: NetworkNode[] = [];
    const phoneNumbers = Array.from(filteredInteractions.keys());
    
    phoneNumbers.forEach((phone, index) => {
      const data = filteredInteractions.get(phone)!;
      const totalInteractions = data.calls + data.sms;
      
      // Determine node type based on interaction patterns
      let nodeType: 'primary' | 'secondary' | 'service' = 'secondary';
      if (totalInteractions > 20) nodeType = 'primary';
      if (data.contacts.size > 10) nodeType = 'service';
      
      // Size based on interactions (min 20, max 60)
      const size = Math.min(60, Math.max(20, totalInteractions * 2));
      
      // Color based on type
      const colors = {
        primary: '#3B82F6',    // Blue
        secondary: '#10B981',  // Green  
        service: '#F59E0B'     // Amber
      };
      
      nodes.push({
        id: phone,
        label: phone,
        phoneNumber: phone,
        interactions: totalInteractions,
        type: nodeType,
        size,
        color: colors[nodeType],
        imei: data.imei,
        location: data.location
      });
    });

    // Create edges
    const edges: NetworkEdge[] = [];
    edgeMap.forEach((edgeData, edgeKey) => {
      const [phone1, phone2] = edgeKey.split('|');
      
      // Only include edges where both nodes exist in filtered data
      if (filteredInteractions.has(phone1) && filteredInteractions.has(phone2)) {
        const totalInteractions = edgeData.calls + edgeData.sms;
        const width = Math.min(10, Math.max(1, totalInteractions * 0.5));
        
        edges.push({
          id: edgeKey,
          from: phone1,
          to: phone2,
          interactions: totalInteractions,
          callCount: edgeData.calls,
          smsCount: edgeData.sms,
          width
        });
      }
    });

    console.log(`Created ${nodes.length} nodes and ${edges.length} edges`);
    return { nodes, edges };
  }, [data, filters]);

  // This state holds the nodes with their calculated positions
  const [positionedNodes, setPositionedNodes] = useState<NetworkNode[]>([]);
  
  useEffect(() => {
    if (!containerRef.current || networkData.nodes.length === 0) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    setDimensions({ width, height });
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    
    // Create a map of existing positions to preserve them
    const positionMap = new Map(positionedNodes.map(n => [n.id, { x: n.x, y: n.y }]));

    const newPositionedNodes = networkData.nodes.map((node, index) => {
      const existingPos = positionMap.get(node.id);
      
      if (existingPos) {
        return { ...node, x: existingPos.x, y: existingPos.y };
      }
      
      // For new nodes, use circular layout
      const angle = (index / networkData.nodes.length) * 2 * Math.PI;
      const nodeRadius = radius * (0.5 + Math.random() * 0.5); // Add some randomness
      
      return {
        ...node,
        x: centerX + Math.cos(angle) * nodeRadius,
        y: centerY + Math.sin(angle) * nodeRadius,
      };
    });

    setPositionedNodes(newPositionedNodes);
  }, [networkData.nodes, dimensions]);
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNodeClick = (node: NetworkNode) => {
    const newSelectedNode = selectedNode?.id === node.id ? null : node;
    setSelectedNode(newSelectedNode);
    
    if (newSelectedNode) {
      onIndividualSelect({
        id: node.id,
        phoneNumber: node.phoneNumber,
        imei: node.imei,
        interactions: node.interactions,
        details: { 
          type: node.type,
          size: node.size,
          location: node.location
        }
      });
    }
  };

  const visibleNodes = useMemo(() => {
    if (!searchTerm.trim()) return positionedNodes;
    const lowerSearch = searchTerm.toLowerCase();
    return positionedNodes.filter(node => 
      node.phoneNumber.toLowerCase().includes(lowerSearch)
    );
  }, [positionedNodes, searchTerm]);

  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return new Set();
    const connected = new Set([selectedNode.id]);
    networkData.edges.forEach(edge => {
      if (edge.from === selectedNode.id) connected.add(edge.to);
      if (edge.to === selectedNode.id) connected.add(edge.from);
    });
    return connected;
  }, [selectedNode, networkData.edges]);
  
  if (networkData.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-lg border">
        <div className="text-center p-6">
          <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No Network Data to Display</h3>
          <p className="text-muted-foreground mt-2">
            {!data?.listings ? 
              'No data source provided' : 
              'Could not find valid phone number interactions in the data'
            }
          </p>
          {data?.listings && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Processed {data.listings.length} rows from data source</p>
              <p>Make sure your data contains phone number fields</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border overflow-hidden">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Network className="w-5 h-5" />
            Network Analysis
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {networkData.nodes.length} nodes
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {networkData.edges.length} connections
            </span>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder={`Search ${visibleNodes.length} nodes...`} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
          />
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <svg width={dimensions.width} height={dimensions.height}>
          {/* Edges */}
          <g>
            {networkData.edges.map(edge => {
              const fromNode = visibleNodes.find(n => n.id === edge.from);
              const toNode = visibleNodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isHighlighted = selectedNode && (connectedNodeIds.has(edge.from) && connectedNodeIds.has(edge.to));
              
              return (
                <motion.line
                  key={edge.id}
                  x1={fromNode.x} y1={fromNode.y}
                  x2={toNode.x} y2={toNode.y}
                  stroke={isHighlighted ? "#fbbf24" : "#94a3b8"}
                  strokeWidth={isHighlighted ? edge.width + 1.5 : edge.width}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: isHighlighted ? 0.9 : selectedNode ? 0.1 : 0.4 }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}
          </g>
          
          {/* Nodes */}
          <g>
            {visibleNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isConnected = selectedNode && connectedNodeIds.has(node.id);
              const isDimmed = selectedNode && !isConnected;

              return (
                <motion.g
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  initial={{ x: dimensions.width / 2, y: dimensions.height / 2, scale: 0 }}
                  animate={{ 
                    x: node.x, 
                    y: node.y, 
                    scale: isSelected ? 1.2 : 1, 
                    opacity: isDimmed ? 0.2 : 1 
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="cursor-pointer"
                >
                  <circle
                    r={node.size / 2}
                    fill={node.color}
                    stroke={isSelected ? "#f59e0b" : isHovered ? node.color : "#ffffff"}
                    strokeWidth={isSelected ? 3 : 2}
                    strokeOpacity={isHovered || isSelected ? 1 : 0.5}
                  />
                  {(isHovered || isSelected) && (
                    <text 
                      textAnchor="middle" 
                      y={node.size / 2 + 14} 
                      fontSize="10px" 
                      fill="currentColor" 
                      className="font-semibold pointer-events-none select-none"
                    >
                      {node.phoneNumber}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};