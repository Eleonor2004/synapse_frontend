// src/components/workbench/NetworkGraph.tsx

"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Network, Users, Zap, Search, Phone, MessageSquare, MapPin, Smartphone, X } from 'lucide-react';
import { ExcelData, Individual } from '@/app/[locale]/workbench/page';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Define Filters interface to avoid 'any'
interface Filters {
  interactionType: "all" | "calls" | "sms";
  dateRange: { start: string; end: string };
  individuals: string[];
  minInteractions: number;
}

type DynamicRow = Record<string, unknown>;

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
  filters: Filters; // Use specific type
  onIndividualSelect: (individual: Individual) => void; 
}

interface NodeDetailsProps {
  node: NetworkNode;
  edges: NetworkEdge[];
  position: { x: number; y: number };
  onClose: () => void;
}

// Helper functions with improved typing
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

const findFieldValue = (row: DynamicRow, fields: string[]): string | null => {
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

const parseDuration = (durationStr: string | null): { seconds: number; isSMS: boolean } => {
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

const getEdgeColor = (interactions: number): string => {
  if (interactions <= 2) return '#22c55e';
  if (interactions <= 5) return '#eab308';
  if (interactions <= 10) return '#f97316';
  return '#ef4444';
};

const getNodeSize = (interactions: number): number => {
  return Math.min(50, Math.max(20, interactions * 1.5 + 15));
};

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
  const exportRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);

  const networkData = useMemo(() => {
    if (!data?.listings || !Array.isArray(data.listings)) {
      return { nodes: [], edges: [] };
    }

    const interactions = new Map<string, { calls: number; sms: number; totalDuration: number; contacts: Set<string>; imei?: string; location?: string; }>();
    const edgeMap = new Map<string, { calls: number; sms: number; totalDuration: number; }>();

    const callerFields = ['caller_num', 'caller', 'calling_number', 'from_number', 'source_number', 'numéro appelant', 'numero appelant', 'appelant', 'émetteur', 'emetteur'];
    const calleeFields = ['callee_num', 'callee', 'called_number', 'to_number', 'destination_number', 'numéro appelé', 'numero appele', 'appelé', 'appele', 'destinataire', 'récepteur', 'recepteur'];
    const durationFields = ['duration', 'duration_str', 'call_duration', 'length', 'durée', 'duree', 'durée appel', 'duree appel'];
    const imeiFields = ['imei', 'device_id', 'imei_caller', 'imei_source'];
    const locationFields = ['location', 'caller_location', 'source_location', 'localisation', 'localisation numéro appelant', 'localisation numero appelant'];

    data.listings.forEach((row: DynamicRow) => {
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

      const { seconds, isSMS } = parseDuration(durationStr || null);

      if (cleanCaller) {
        if (!interactions.has(cleanCaller)) {
          interactions.set(cleanCaller, { calls: 0, sms: 0, totalDuration: 0, contacts: new Set(), imei, location });
        }
        const callerData = interactions.get(cleanCaller)!;
        if (isSMS) callerData.sms++; else { callerData.calls++; callerData.totalDuration += seconds; }
        if (cleanCallee) callerData.contacts.add(cleanCallee);
      }

      if (cleanCallee) {
        if (!interactions.has(cleanCallee)) {
          interactions.set(cleanCallee, { calls: 0, sms: 0, totalDuration: 0, contacts: new Set() });
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

    const filteredInteractions = new Map(Array.from(interactions.entries()).filter(([phone, data]) => {
      if (filters.minInteractions && (data.calls + data.sms) < filters.minInteractions) return false;
      if (filters.interactionType === 'calls' && data.calls === 0) return false;
      if (filters.interactionType === 'sms' && data.sms === 0) return false;
      if (filters.individuals?.length > 0 && !filters.individuals.includes(phone)) return false;
      return true;
    }));

    const nodes: NetworkNode[] = Array.from(filteredInteractions.entries()).map(([phone, data]) => {
      const totalInteractions = data.calls + data.sms;
      let nodeType: 'primary' | 'secondary' | 'service' = 'secondary';
      if (totalInteractions > 20) nodeType = 'primary';
      if (data.contacts.size > 10) nodeType = 'service';
      const size = getNodeSize(totalInteractions);
      const colors = { primary: '#3B82F6', secondary: '#10B981', service: '#F59E0B' };
      return { id: phone, label: phone, phoneNumber: phone, interactions: totalInteractions, type: nodeType, size, color: colors[nodeType], imei: data.imei, location: data.location };
    });

    const edges: NetworkEdge[] = Array.from(edgeMap.entries()).reduce((acc, [edgeKey, edgeData]) => {
      const [phone1, phone2] = edgeKey.split('|');
      if (filteredInteractions.has(phone1) && filteredInteractions.has(phone2)) {
        const totalInteractions = edgeData.calls + edgeData.sms;
        const width = Math.min(8, Math.max(1, totalInteractions * 0.5));
        acc.push({ id: edgeKey, from: phone1, to: phone2, interactions: totalInteractions, callCount: edgeData.calls, smsCount: edgeData.sms, width });
      }
      return acc;
    }, [] as NetworkEdge[]);

    return { nodes, edges };
  }, [data, filters]);

  const [positionedNodes, setPositionedNodes] = useState<NetworkNode[]>([]);
  
  useEffect(() => {
    if (!containerRef.current || networkData.nodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (Math.abs(dimensions.width - rect.width) > 5 || Math.abs(dimensions.height - rect.height) > 5) {
      setDimensions({ width: rect.width, height: rect.height });
    }
  }, [networkData.nodes, dimensions]); // Added 'dimensions' to dependency array

  useEffect(() => {
    if (networkData.nodes.length === 0 || dimensions.width === 0 || dimensions.height === 0) return;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.3;
    const existingPositions = new Map(positionedNodes.map(n => [n.id, { x: n.x, y: n.y }]));
    const newPositionedNodes = networkData.nodes.map((node, index) => {
      const existingPos = existingPositions.get(node.id);
      if (existingPos && existingPos.x && existingPos.y) {
        return { ...node, x: existingPos.x, y: existingPos.y };
      }
      if (networkData.nodes.length === 1) {
        return { ...node, x: centerX, y: centerY };
      }
      const angle = (index / networkData.nodes.length) * 2 * Math.PI;
      const nodeRadius = radius * (0.7 + Math.random() * 0.3);
      return { ...node, x: centerX + Math.cos(angle) * nodeRadius, y: centerY + Math.sin(angle) * nodeRadius };
    });
    setPositionedNodes(newPositionedNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkData.nodes, dimensions.width, dimensions.height]);
  
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (Math.abs(dimensions.width - rect.width) > 10 || Math.abs(dimensions.height - rect.height) > 10) {
          setDimensions({ width: rect.width, height: rect.height });
        }
      }
    };
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
      handleResize();
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [dimensions]); // Added 'dimensions' to dependency array

  const handleNodeClick = (node: NetworkNode, event: React.MouseEvent<SVGGElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newSelectedNode = selectedNode?.id === node.id ? null : node;
    setSelectedNode(newSelectedNode);
    if (newSelectedNode) {
      setDetailsPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      setShowDetails(true);
      onIndividualSelect({ id: node.id, phoneNumber: node.phoneNumber, imei: node.imei, interactions: node.interactions, details: { type: node.type, size: node.size, location: node.location }});
    } else {
      setShowDetails(false);
    }
  };

  const visibleNodes = useMemo(() => {
    if (!searchTerm.trim()) return positionedNodes;
    const lowerSearch = searchTerm.toLowerCase();
    return positionedNodes.filter(node => node.phoneNumber.toLowerCase().includes(lowerSearch));
  }, [positionedNodes, searchTerm]);

  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const connected = new Set<string>([selectedNode.id]);
    networkData.edges.forEach(edge => {
      if (edge.from === selectedNode.id) connected.add(edge.to);
      if (edge.to === selectedNode.id) connected.add(edge.from);
    });
    return connected;
  }, [selectedNode, networkData.edges]);

  const handleExport = async (format: 'png' | 'pdf') => {
    if (!exportRef.current) return;
    setIsExporting(true);
    setHoveredNodeId(null);
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const isDarkMode = document.documentElement.classList.contains('dark');
      const canvas = await html2canvas(exportRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: isDarkMode ? '#111827' : '#f8fafc',
      });
      const imgData = canvas.toDataURL('image/png');

      if (format === 'png') {
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'network-graph.png';
        link.click();
      } else if (format === 'pdf') {
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('network-graph.pdf');
      }
    } catch (error) {
      console.error('Error exporting graph:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (networkData.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-lg border">
        <div className="text-center p-6">
          <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No Network Data to Display</h3>
          <p className="text-muted-foreground mt-2">
            {!data?.listings ? 'No data source provided' : 'Could not find valid phone number interactions in the data'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={exportRef} className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex-shrink-0 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            Network Graph
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
               <button onClick={() => handleExport('png')} disabled={isExporting} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
                  {isExporting ? 'Saving...' : 'Export PNG'}
               </button>
               <button onClick={() => handleExport('pdf')} disabled={isExporting} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isExporting ? 'Saving...' : 'Export PDF'}
               </button>
            </div>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{networkData.nodes.length}</span>
            <span className="flex items-center gap-1"><Zap className="w-4 h-4" />{networkData.edges.length}</span>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search phone numbers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 relative min-h-0 w-full">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <svg width={dimensions.width} height={dimensions.height} className="w-full h-full" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
            <g>
              {networkData.edges.map(edge => {
                const fromNode = visibleNodes.find(n => n.id === edge.from);
                const toNode = visibleNodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                const isHighlighted = selectedNode && (connectedNodeIds.has(edge.from) && connectedNodeIds.has(edge.to));
                const edgeColor = getEdgeColor(edge.interactions);
                return (
                  <motion.line key={edge.id} x1={fromNode.x || 0} y1={fromNode.y || 0} x2={toNode.x || 0} y2={toNode.y || 0} stroke={isHighlighted ? "#fbbf24" : edgeColor} strokeWidth={isHighlighted ? edge.width + 1 : edge.width} initial={{ opacity: 0 }} animate={{ opacity: isHighlighted ? 0.9 : selectedNode ? 0.2 : 0.6 }} transition={{ duration: 0.2 }} />
                );
              })}
            </g>
            <g>
              {visibleNodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isConnected = selectedNode && connectedNodeIds.has(node.id);
                const isDimmed = selectedNode && !isConnected;
                return (
                  <motion.g key={node.id} onClick={(e) => handleNodeClick(node, e)} onMouseEnter={() => setHoveredNodeId(node.id)} onMouseLeave={() => setHoveredNodeId(null)} initial={{ x: dimensions.width / 2, y: dimensions.height / 2, scale: 0 }} animate={{ x: node.x || dimensions.width / 2, y: node.y || dimensions.height / 2, scale: isSelected ? 1.2 : isHovered ? 1.1 : 1, opacity: isDimmed ? 0.3 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="cursor-pointer">
                    {isSelected && (<circle r={node.size / 2 + 6} fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.8" />)}
                    <circle r={node.size / 2} fill={node.color} stroke="white" strokeWidth="2" className="drop-shadow-md" />
                    {isHovered && (<text textAnchor="middle" y={node.size / 2 + 20} fontSize="11px" fill={isDarkMode ? 'white' : 'black'} stroke="rgba(255,255,255,0.3)" strokeWidth="3" paintOrder="stroke" className="font-medium">{node.phoneNumber}</text>)}
                  </motion.g>
                );
              })}
            </g>
          </svg>
        )}
        {showDetails && selectedNode && (
          <NodeDetails node={selectedNode} edges={networkData.edges} position={detailsPosition} onClose={() => { setShowDetails(false); setSelectedNode(null); }} />
        )}
      </div>
      
      <div className="flex-shrink-0 w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-6 py-3">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Connection Strength:</span>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1"><div className="w-4 h-0.5 bg-green-500 rounded-full"></div><span className="text-xs text-gray-600 dark:text-gray-400">Low (1-2)</span></div>
                <div className="flex items-center space-x-1"><div className="w-4 h-1 bg-yellow-500 rounded-full"></div><span className="text-xs text-gray-600 dark:text-gray-400">Medium (3-5)</span></div>
                <div className="flex items-center space-x-1"><div className="w-4 h-1.5 bg-orange-500 rounded-full"></div><span className="text-xs text-gray-600 dark:text-gray-400">High (6-10)</span></div>
                <div className="flex items-center space-x-1"><div className="w-4 h-2 bg-red-500 rounded-full"></div><span className="text-xs text-gray-600 dark:text-gray-400">Very High (10+)</span></div>
              </div>
            </div>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Node Types:</span>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></div><span className="text-xs text-gray-600 dark:text-gray-400">Primary (20+ interactions)</span></div>
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-green-600 rounded-full shadow-sm"></div><span className="text-xs text-gray-600 dark:text-gray-400">Secondary (standard)</span></div>
                <div className="flex items-center space-x-1"><div className="w-3 h-3 bg-amber-600 rounded-full shadow-sm"></div><span className="text-xs text-gray-600 dark:text-gray-400">Service (10+ contacts)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

