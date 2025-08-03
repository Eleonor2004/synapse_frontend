"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Network, Users, Activity, Search, AlertCircle, Info } from 'lucide-react';

// --- INTERFACES ---
export interface ExcelData {
  listings?: any[];
  [key: string]: any[] | undefined;
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
  weight: number;
  color: string;
  width: number;
}

interface NetworkGraphProps {
  data: ExcelData | null;
  filters: any;
  onIndividualSelect: (individual: Individual) => void;
}

// --- HELPER FUNCTIONS ---
const getInteractionColor = (intensity: number, maxIntensity: number): string => {
  const ratio = Math.max(0, Math.min(1, intensity / maxIntensity));
  if (ratio <= 0.25) return '#22C55E';
  if (ratio <= 0.5) return '#EAB308';
  if (ratio <= 0.75) return '#F97316';
  return '#EF4444';
};

const getNodeSize = (interactions: number, maxInteractions: number): number => {
  const minSize = 15;
  const maxSize = 50;
  const ratio = Math.max(0, Math.min(1, interactions / maxInteractions));
  return minSize + (maxSize - minSize) * ratio;
};

const findFieldValue = (row: any, possibleFields: string[], excludeFields: string[] = []): string | null => {
  if (!row || typeof row !== 'object') return null;
  const normalize = (str: string) => str.toLowerCase().replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ç]/g, 'c').replace(/[ùúûü]/g, 'u').replace(/[òóôõö]/g, 'o').replace(/[ìíîï]/g, 'i').replace(/[^a-z0-9\s_]/g, ' ').replace(/\s+/g, ' ').trim();
  const normalizedRow: { [key: string]: any } = {};
  const normalizedExcludeFields = excludeFields.map(normalize);
  Object.keys(row).forEach(key => {
    const normalizedKey = normalize(key);
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      normalizedRow[normalizedKey] = row[key];
    }
  });
  const availableKeys = Object.keys(normalizedRow);
  for (const field of possibleFields) {
    const normalizedField = normalize(field);
    if (normalizedRow[normalizedField] && !normalizedExcludeFields.includes(normalizedField)) {
      return String(normalizedRow[normalizedField]).trim();
    }
  }
  for (const field of possibleFields) {
    const fieldWords = normalize(field).split(/\s+/).filter(w => w.length > 2);
    const matchingKey = availableKeys.find(key => {
      if (normalizedExcludeFields.includes(key)) return false;
      return fieldWords.every(word => key.includes(word));
    });
    if (matchingKey && normalizedRow[matchingKey]) {
      return String(normalizedRow[matchingKey]).trim();
    }
  }
  return null;
};

const cleanPhoneNumber = (phone: string): string | null => {
  if (!phone || typeof phone !== 'string') return null;
  let cleaned = String(phone).replace(/[^\d]/g, '');
  if (cleaned.length === 0) return null;
  if (cleaned.startsWith('237')) cleaned = cleaned.substring(3);
  if (cleaned.length < 8) return null;
  return cleaned;
};

const isSMSData = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  const upperValue = value.toUpperCase();
  return upperValue.includes('SMS') || /^[A-F0-9]{6,}$/i.test(value.trim());
};

const parseDuration = (durationStr: string): { seconds: number; isSMS: boolean } => {
    if (!durationStr || typeof durationStr !== 'string') return { seconds: 0, isSMS: false };
    const trimmed = durationStr.trim();
    if (isSMSData(trimmed)) return { seconds: 0, isSMS: true };
    const timeMatch = trimmed.match(/(\d+):(\d+)(?::(\d+))?/);
    if (timeMatch) {
        const hours = timeMatch[3] ? parseInt(timeMatch[1], 10) || 0 : 0;
        const minutes = timeMatch[3] ? parseInt(timeMatch[2], 10) : parseInt(timeMatch[1], 10) || 0;
        const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : parseInt(timeMatch[2], 10) || 0;
        return { seconds: hours * 3600 + minutes * 60 + seconds, isSMS: false };
    }
    const numberMatch = trimmed.match(/(\d+)/);
    if (numberMatch) return { seconds: parseInt(numberMatch[1], 10) || 0, isSMS: false };
    return { seconds: 0, isSMS: false };
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ data, filters, onIndividualSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const networkData = useMemo(() => {
    const interactionList = data?.listings;
    if (!interactionList || !Array.isArray(interactionList)) {
      setDebugInfo('Data is missing or the "listings" property is not a valid array.');
      return { nodes: [], edges: [] };
    }

    const callerFields = ['caller_num', 'Numéro Appelant'];
    const recipientFields = ['callee_num', 'Numéro appelé', 'Numéro appeléA1:F1'];
    const durationFields = ['duration_str', 'Durée appel'];
    const imeiFields = ['imei', 'IMEI numéro appelant'];
    const locationFields = ['location', 'Localisation'];
    
    const nodeMap = new Map<string, NetworkNode>();
    const edgeMap = new Map<string, NetworkEdge>();

    interactionList.forEach((row) => {
      const callerRaw = findFieldValue(row, callerFields, recipientFields);
      const recipientRaw = findFieldValue(row, recipientFields, callerFields);
      const durationRaw = findFieldValue(row, durationFields);
      
      let caller = cleanPhoneNumber(callerRaw || '');
      let recipient = cleanPhoneNumber(recipientRaw || '');
      let recipientIsService = false;
      
      const { isSMS } = parseDuration(durationRaw || '');

      if (!recipient && recipientRaw && isSMSData(durationRaw || '')) {
          recipient = recipientRaw.trim();
          recipientIsService = true;
      }

      if (!caller || !recipient || caller === recipient) return;
      
      const interactionType = isSMS ? 'sms' : 'call';
      const imeiRaw = findFieldValue(row, imeiFields);
      const locationRaw = findFieldValue(row, locationFields);

      if (!nodeMap.has(caller)) nodeMap.set(caller, { id: caller, label: caller, phoneNumber: caller, interactions: 0, type: 'primary', size: 20, color: '#3B82F6', imei: imeiRaw || undefined, location: locationRaw || undefined });
      if (!nodeMap.has(recipient)) nodeMap.set(recipient, { id: recipient, label: recipient, phoneNumber: recipient, interactions: 0, type: recipientIsService ? 'service' : 'secondary', size: 20, color: recipientIsService ? '#10B981' : '#6366F1' });
      
      nodeMap.get(caller)!.interactions++;
      nodeMap.get(recipient)!.interactions++;
      
      const edgeId = [caller, recipient].sort().join('--');
      let edge = edgeMap.get(edgeId) || { id: edgeId, from: caller, to: recipient, interactions: 0, callCount: 0, smsCount: 0, weight: 1, color: '#94A3B8', width: 1 };
      edge.interactions++;
      if (interactionType === 'call') edge.callCount++; else edge.smsCount++;
      edgeMap.set(edgeId, edge);
    });

    const nodes = Array.from(nodeMap.values());
    const edges = Array.from(edgeMap.values());
    if (nodes.length === 0) {
        setDebugInfo(`Processing complete, but no valid nodes were created from ${interactionList.length} records. Check column names and data format.`);
        return { nodes: [], edges: [] };
    }

    const maxInteractions = Math.max(...nodes.map(n => n.interactions), 1);
    const maxEdgeInteractions = Math.max(...edges.map(e => e.interactions), 1);
    nodes.forEach(node => node.size = getNodeSize(node.interactions, maxInteractions));
    edges.forEach(edge => {
      edge.weight = edge.interactions;
      edge.width = Math.max(1, Math.min(8, (edge.interactions / maxEdgeInteractions) * 6));
      edge.color = getInteractionColor(edge.interactions, maxEdgeInteractions);
    });
    return { nodes, edges };
  }, [data, filters]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: Math.max(width || 800, 400), height: Math.max(height || 600, 300) });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    const connectedEdges = networkData.edges.filter(e => e.from === node.id || e.to === node.id);
    const individual: Individual = {
      id: node.id, phoneNumber: node.phoneNumber, imei: node.imei, location: node.location, interactions: node.interactions,
      details: {
        type: node.type,
        connectedNodes: connectedEdges.length,
        callCount: connectedEdges.reduce((sum, e) => sum + e.callCount, 0),
        smsCount: connectedEdges.reduce((sum, e) => sum + e.smsCount, 0),
        interactionTypes: ['calls', 'sms'].filter(type => connectedEdges.some(e => type === 'calls' ? e.callCount > 0 : e.smsCount > 0))
      }
    };
    onIndividualSelect(individual);
  };

  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) return networkData.nodes;
    const searchLower = searchTerm.toLowerCase();
    return networkData.nodes.filter(node =>
      node.phoneNumber.toLowerCase().includes(searchLower) ||
      (node.imei && node.imei.toLowerCase().includes(searchLower))
    );
  }, [networkData.nodes, searchTerm]);

  const positionedNodes = useMemo(() => {
    const nodes = [...filteredNodes];
    if (nodes.length === 0) return [];
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    nodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) {
        node.x = centerX + (Math.random() - 0.5) * Math.min(width, height) * 0.6;
        node.y = centerY + (Math.random() - 0.5) * Math.min(width, height) * 0.6;
      }
    });
    return nodes;
  }, [filteredNodes, dimensions]);

  if (!networkData || networkData.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-center max-w-3xl p-6">
          <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-3">No Network Data to Display</h3>
          <p className="text-muted-foreground mb-4">The selected analysis did not contain any valid interaction data that could be visualized.</p>
          {debugInfo && (
            <div className="text-left bg-muted/50 rounded-lg p-4 text-sm mt-4">
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{debugInfo}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Network className="w-5 h-5" /> Network Graph</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{positionedNodes.length} Nodes</span>
            <span className="flex items-center gap-1"><Activity className="w-4 h-4" />{networkData.edges.length} Edges</span>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search nodes by phone number or IMEI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          {searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">×</button>)}
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full">
          <g className="edges">
            {networkData.edges.map(edge => {
              const fromNode = positionedNodes.find(n => n.id === edge.from);
              const toNode = positionedNodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode || !fromNode.x || !fromNode.y || !toNode.x || !toNode.y) return null;
              const isHighlighted = selectedNode && (edge.from === selectedNode || edge.to === selectedNode);
              return (
                <line 
                  key={edge.id} 
                  x1={fromNode.x} y1={fromNode.y} 
                  x2={toNode.x} y2={toNode.y} 
                  stroke={isHighlighted ? '#F59E0B' : edge.color} 
                  strokeWidth={isHighlighted ? edge.width + 1 : edge.width} 
                  opacity={isHighlighted ? 0.9 : 0.6}
                  className="transition-all duration-200"
                />
              );
            })}
          </g>
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
                  <circle cx={node.x! + 2} cy={node.y! + 2} r={node.size / 2} fill="rgba(0,0,0,0.1)" opacity={isHighlighted ? 0.3 : 0.1} />
                  <circle cx={node.x} cy={node.y} r={node.size / 2} fill={isSelected ? '#F59E0B' : node.color} stroke={isSelected ? '#D97706' : isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.3)'} strokeWidth={isSelected ? 3 : isHovered ? 2 : 1} className="transition-all duration-200" />
                  <circle cx={node.x} cy={node.y} r={Math.max(2, node.size / 4)} fill="rgba(255,255,255,0.9)" opacity={0.8} />
                  <text x={node.x} y={node.y + 3} textAnchor="middle" fontSize={Math.max(8, Math.min(12, node.size / 4))} fill="#1F2937" fontWeight="bold" className="pointer-events-none select-none">{node.interactions}</text>
                  {(isHovered || isSelected) && (
                    <text x={node.x} y={node.y! + node.size / 2 + 15} textAnchor="middle" fontSize="10" fill="currentColor" className="pointer-events-none select-none font-medium">{node.phoneNumber.length > 12 ? `${node.phoneNumber.slice(0, 12)}...` : node.phoneNumber}</text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};