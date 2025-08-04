// src/components/workbench/NetworkGraph.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Users, Activity, Search, Phone, MessageSquare, MapPin, Smartphone, X, Zap } from 'lucide-react';
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

interface NodeDetailsProps {
  node: NetworkNode;
  edges: NetworkEdge[];
  position: { x: number; y: number };
  onClose: () => void;
}

// Helper Functions
const cleanPhoneNumber = (phone: string): string | null => {
  if (!phone || typeof phone !== 'string') return null;
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.length < 7) return null;
  return cleaned;
};

const isSMSData = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const upperValue = value.toUpperCase();
  return upperValue.includes('SMS') || /^[A-F0-9]{6,}$/i.test(value.trim());
};

const findFieldValue = (row: any, fields: string[]): string | null => {
  if (!row || typeof row !== 'object') return null;
  
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

  const normalizedRow: { [key: string]: any } = {};
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

const parseDuration = (durationStr: string): { seconds: number; isSMS: boolean } => {
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

// Simplified color and size utilities
const getEdgeColor = (interactions: number): string => {
  if (interactions <= 2) return '#22c55e';
  if (interactions <= 5) return '#eab308';
  if (interactions <= 10) return '#f97316';
  return '#ef4444';
};

const getNodeSize = (interactions: number): number => {
  return Math.min(50, Math.max(20, interactions * 1.5 + 15));
};

// Compact Node Details Component
const NodeDetails: React.FC<NodeDetailsProps> = ({ node, edges, position, onClose }) => {
  const connectedEdges = edges.filter(edge => edge.from === node.id || edge.to === node.id);
  const totalCalls = connectedEdges.reduce((sum, edge) => sum + edge.callCount, 0);
  const totalSMS = connectedEdges.reduce((sum, edge) => sum + edge.smsCount, 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-72"
      style={{
        left: Math.min(position.x - 144, window.innerWidth - 300),
        top: Math.max(position.y - 100, 10),
      }}
    >
      {/* Compact header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span className="font-medium text-sm">{node.phoneNumber}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Stats row */}
        <div className="flex gap-2">
          <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
            <div className="text-lg font-bold text-green-700 dark:text-green-400">{totalCalls}</div>
            <div className="text-xs text-green-600 dark:text-green-500">Calls</div>
          </div>
          <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
            <div className="text-lg font-bold text-blue-700 dark:text-blue-400">{totalSMS}</div>
            <div className="text-xs text-blue-600 dark:text-blue-500">SMS</div>
          </div>
          <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-center">
            <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{connectedEdges.length}</div>
            <div className="text-xs text-purple-600 dark:text-purple-500">Links</div>
          </div>
        </div>

        {/* Additional info if available */}
        {(node.imei || node.location) && (
          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {node.imei && (
              <div className="flex items-center gap-2 text-sm">
                <Smartphone className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400 font-mono">{node.imei}</span>
              </div>
            )}
            {node.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-3 h-3 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">{node.location}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ data, filters, onIndividualSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
  
  // Data processing (keeping your original logic)
  const networkData = useMemo(() => {
    if (!data?.listings || !Array.isArray(data.listings)) {
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

    data.listings.forEach((row: any) => {
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

      if (cleanCaller) {
        if (!interactions.has(cleanCaller)) {
          interactions.set(cleanCaller, { 
            calls: 0, sms: 0, totalDuration: 0, contacts: new Set(), imei, location
          });
        }
        const callerData = interactions.get(cleanCaller)!;
        if (isSMS) callerData.sms++; else { callerData.calls++; callerData.totalDuration += seconds; }
        if (cleanCallee) callerData.contacts.add(cleanCallee);
      }

      if (cleanCallee) {
        if (!interactions.has(cleanCallee)) {
          interactions.set(cleanCallee, { 
            calls: 0, sms: 0, totalDuration: 0, contacts: new Set()
          });
        }
        const calleeData = interactions.get(cleanCallee)!;
        if (isSMS) calleeData.sms++; else { calleeData.calls++; calleeData.totalDuration += seconds; }
        if (cleanCaller) calleeData.contacts.add(cleanCaller);
      }

      if (cleanCaller && cleanCallee) {
        const edgeKey = [cleanCaller, cleanCallee].sort().join('|');
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, { calls: 0, sms: 0, totalDuration: 0 });
        }
        const edgeData = edgeMap.get(edgeKey)!;
        if (isSMS) edgeData.sms++; else { edgeData.calls++; edgeData.totalDuration += seconds; }
      }
    });

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
    
    phoneNumbers.forEach((phone) => {
      const data = filteredInteractions.get(phone)!;
      const totalInteractions = data.calls + data.sms;
      
      let nodeType: 'primary' | 'secondary' | 'service' = 'secondary';
      if (totalInteractions > 20) nodeType = 'primary';
      if (data.contacts.size > 10) nodeType = 'service';
      
      const size = getNodeSize(totalInteractions);
      
      const colors = {
        primary: '#3B82F6',
        secondary: '#10B981',  
        service: '#F59E0B'
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
      
      if (filteredInteractions.has(phone1) && filteredInteractions.has(phone2)) {
        const totalInteractions = edgeData.calls + edgeData.sms;
        const width = Math.min(8, Math.max(1, totalInteractions * 0.5));
        
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

    return { nodes, edges };
  }, [data, filters]);

  const [positionedNodes, setPositionedNodes] = useState<NetworkNode[]>([]);
  
  useEffect(() => {
    if (!containerRef.current || networkData.nodes.length === 0) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    setDimensions({ width, height });
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    const positionMap = new Map(positionedNodes.map(n => [n.id, { x: n.x, y: n.y }]));

    const newPositionedNodes = networkData.nodes.map((node, index) => {
      const existingPos = positionMap.get(node.id);
      
      if (existingPos) {
        return { ...node, x: existingPos.x, y: existingPos.y };
      }
      
      const angle = (index / networkData.nodes.length) * 2 * Math.PI;
      const nodeRadius = radius * (0.6 + Math.random() * 0.4);
      
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
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNodeClick = (node: NetworkNode, event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const newSelectedNode = selectedNode?.id === node.id ? null : node;
    setSelectedNode(newSelectedNode);
    
    if (newSelectedNode) {
      setDetailsPosition({ 
        x: event.clientX - rect.left, 
        y: event.clientY - rect.top 
      });
      setShowDetails(true);
      
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
    } else {
      setShowDetails(false);
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
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Clean header */}
      <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            Network Graph
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {networkData.nodes.length}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              {networkData.edges.length}
            </span>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search phone numbers..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
      </div>
      
      {/* Graph area */}
      <div ref={containerRef} className="flex-1 relative">
        <svg width={dimensions.width} height={dimensions.height} className="w-full h-full">
          {/* Edges */}
          <g>
            {networkData.edges.map(edge => {
              const fromNode = visibleNodes.find(n => n.id === edge.from);
              const toNode = visibleNodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isHighlighted = selectedNode && (connectedNodeIds.has(edge.from) && connectedNodeIds.has(edge.to));
              const edgeColor = getEdgeColor(edge.interactions);
              
              return (
                <motion.line
                  key={edge.id}
                  x1={fromNode.x} y1={fromNode.y}
                  x2={toNode.x} y2={toNode.y}
                  stroke={isHighlighted ? "#fbbf24" : edgeColor}
                  strokeWidth={isHighlighted ? edge.width + 1 : edge.width}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isHighlighted ? 0.9 : selectedNode ? 0.2 : 0.6
                  }}
                  transition={{ duration: 0.2 }}
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
                  onClick={(e) => handleNodeClick(node, e as any)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  initial={{ x: dimensions.width / 2, y: dimensions.height / 2, scale: 0 }}
                  animate={{ 
                    x: node.x, 
                    y: node.y, 
                    scale: isSelected ? 1.2 : isHovered ? 1.1 : 1, 
                    opacity: isDimmed ? 0.3 : 1 
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="cursor-pointer"
                >
                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      r={node.size / 2 + 6}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      opacity="0.8"
                    />
                  )}
                  
                  {/* Main node */}
                  <circle
                    r={node.size / 2}
                    fill={node.color}
                    stroke="white"
                    strokeWidth="2"
                    className="drop-shadow-md"
                  />
                  
                  {/* Phone number on hover */}
                  {isHovered && (
                    <text 
                      textAnchor="middle" 
                      y={node.size / 2 + 20} 
                      fontSize="11px" 
                      fill="white"
                      stroke="rgba(0,0,0,0.8)"
                      strokeWidth="3"
                      paintOrder="stroke"
                      className="font-medium"
                    >
                      {node.phoneNumber}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </g>
        </svg>
        
        {/* Node details popup */}
        {showDetails && selectedNode && (
          <NodeDetails
            node={selectedNode}
            edges={networkData.edges}
            position={detailsPosition}
            onClose={() => {
              setShowDetails(false);
              setSelectedNode(null);
            }}
          />
        )}
      </div>
      
      {/* Bottom legend */}
      <div className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {/* Connection strength */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Connection:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-1 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-1 bg-yellow-500 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Med</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-1 bg-orange-500 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-1 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Max</span>
              </div>
            </div>
          </div>
          
          {/* Node types */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nodes:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Primary</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Secondary</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};