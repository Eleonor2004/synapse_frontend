"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Users, Zap, Search, Phone, MapPin, Smartphone, X, Download, ZoomIn, ZoomOut, RotateCcw, Maximize } from 'lucide-react';
import * as d3 from 'd3';

// Mock data types for demonstration - replace with your actual types
interface ExcelData {
  listings?: any[];
}

interface Individual {
  id: string;
  phoneNumber: string;
  imei?: string;
  interactions: number;
  details: {
    type: string;
    size: number;
    location?: string;
  };
}

interface Filters {
  interactionType: "all" | "calls" | "sms";
  dateRange: { start: string; end: string };
  individuals: string[];
  minInteractions: number;
}

type DynamicRow = Record<string, unknown>;

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  phoneNumber: string;
  interactions: number;
  type: 'primary' | 'secondary' | 'service';
  size: number;
  color: string;
  imei?: string;
  location?: string;
  degree?: number;
}

interface NetworkEdge extends d3.SimulationLinkDatum<NetworkNode> {
  id: string;
  source: string | NetworkNode;
  target: string | NetworkNode;
  interactions: number;
  callCount: number;
  smsCount: number;
  width: number;
}

interface NetworkGraphProps {
  data: ExcelData | null;
  filters: Filters;
  onIndividualSelect: (individual: Individual) => void;
}

interface NodeDetailsProps {
  node: NetworkNode | null; // Allow node to be null
  edges: NetworkEdge[];
  position: { x: number; y: number };
  onClose: () => void;
  isVisible: boolean;
}

// Helper functions (keeping your existing logic)
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
  return Math.min(60, Math.max(12, Math.log(interactions + 1) * 8 + 8));
};

// Enhanced and Corrected Node Details Component
const NodeDetails: React.FC<NodeDetailsProps> = ({ node, edges, position, onClose, isVisible }) => {
  // CORRECTION: Add a guard clause at the very beginning.
  // This prevents any code from running if the node is null, fixing the crash.
  if (!node) {
    return null; 
  }

  // This logic is now safe because the guard clause above ensures 'node' is not null.
  const connectedEdges = edges.filter(edge => 
    (typeof edge.source === 'object' ? edge.source.id : edge.source) === node.id || 
    (typeof edge.target === 'object' ? edge.target.id : edge.target) === node.id
  );
  const totalCalls = connectedEdges.reduce((sum, edge) => sum + edge.callCount, 0);
  const totalSMS = connectedEdges.reduce((sum, edge) => sum + edge.smsCount, 0);
  
  // CORRECTION: The misplaced 'if (!isVisible)' check is removed from here.
  // The animation logic is now handled correctly inside the JSX.
  return (
    <AnimatePresence>
      {/* CORRECTION: Conditionally render the motion.div based on the isVisible prop. */}
      {/* This allows framer-motion to correctly handle enter and exit animations. */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="absolute z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-80 pointer-events-auto"
          style={{
            left: Math.min(position.x + 20, window.innerWidth - 340),
            top: Math.max(position.y - 100, 20),
          }}
        >
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white rounded-t-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm">{node.phoneNumber}</span>
                <div className="text-xs opacity-90 capitalize">{node.type} Node</div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 p-3 rounded-lg text-center border border-green-200/50 dark:border-green-700/50">
                <div className="text-xl font-bold text-green-700 dark:text-green-400">{totalCalls}</div>
                <div className="text-xs text-green-600 dark:text-green-500 font-medium">Calls</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 p-3 rounded-lg text-center border border-blue-200/50 dark:border-blue-700/50">
                <div className="text-xl font-bold text-blue-700 dark:text-blue-400">{totalSMS}</div>
                <div className="text-xs text-blue-600 dark:text-blue-500 font-medium">SMS</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 p-3 rounded-lg text-center border border-purple-200/50 dark:border-purple-700/50">
                <div className="text-xl font-bold text-purple-700 dark:text-purple-400">{connectedEdges.length}</div>
                <div className="text-xs text-purple-600 dark:text-purple-500 font-medium">Links</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Network Stats</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Degree:</span>
                  <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">{node.degree || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total:</span>
                  <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">{node.interactions}</span>
                </div>
              </div>
            </div>
            
            {(node.imei || node.location) && (
              <div className="space-y-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                {node.imei && (
                  <div className="flex items-center gap-2 text-sm p-2 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg">
                    <Smartphone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 font-mono text-xs break-all">{node.imei}</span>
                  </div>
                )}
                {node.location && (
                  <div className="flex items-center gap-2 text-sm p-2 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 text-xs">{node.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export const NetworkGraph: React.FC<NetworkGraphProps> = ({ data, filters, onIndividualSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkEdge> | null>(null);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  // Process network data (keeping your existing logic)
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
      return { 
        id: phone, 
        label: phone, 
        phoneNumber: phone, 
        interactions: totalInteractions, 
        type: nodeType, 
        size, 
        color: colors[nodeType], 
        imei: data.imei, 
        location: data.location,
        degree: data.contacts.size
      };
    });

    const edges: NetworkEdge[] = Array.from(edgeMap.entries()).reduce((acc, [edgeKey, edgeData]) => {
      const [phone1, phone2] = edgeKey.split('|');
      if (filteredInteractions.has(phone1) && filteredInteractions.has(phone2)) {
        const totalInteractions = edgeData.calls + edgeData.sms;
        const width = Math.min(8, Math.max(1, totalInteractions * 0.5));
        acc.push({ 
          id: edgeKey, 
          source: phone1, 
          target: phone2, 
          interactions: totalInteractions, 
          callCount: edgeData.calls, 
          smsCount: edgeData.sms, 
          width 
        });
      }
      return acc;
    }, [] as NetworkEdge[]);

    return { nodes, edges };
  }, [data, filters]);

  // Filter nodes based on search
  const visibleNodes = useMemo(() => {
    if (!searchTerm.trim()) return networkData.nodes;
    const lowerSearch = searchTerm.toLowerCase();
    return networkData.nodes.filter(node => 
      node.phoneNumber.toLowerCase().includes(lowerSearch)
    );
  }, [networkData.nodes, searchTerm]);

  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return networkData.edges.filter(edge => 
      visibleNodeIds.has(typeof edge.source === 'object' ? edge.source.id : edge.source) &&
      visibleNodeIds.has(typeof edge.target === 'object' ? edge.target.id : edge.target)
    );
  }, [networkData.edges, visibleNodes]);

  // D3 Force Simulation Setup
  useEffect(() => {
    if (!svgRef.current || visibleNodes.length === 0) return;

    setIsSimulationRunning(true);

    // Stop existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;

    // Create simulation with optimized forces for large datasets
    const simulation = d3.forceSimulation<NetworkNode>(visibleNodes)
      .force("link", d3.forceLink<NetworkNode, NetworkEdge>(visibleEdges)
        .id(d => d.id)
        .distance(d => Math.min(100, 30 + d.width * 5))
        .strength(0.3)
      )
      .force("charge", d3.forceManyBody<NetworkNode>()
        .strength(d => {
          // Adaptive charge based on node importance and dataset size
          const baseCharge = visibleNodes.length > 100 ? -30 : -50;
          const sizeMultiplier = d.size / 20;
          return baseCharge * sizeMultiplier;
        })
        .distanceMax(200)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<NetworkNode>()
        .radius(d => d.size / 2 + 5)
        .strength(0.8)
      )
      // Additional forces for better layout
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .alphaDecay(0.02) // Slower cooling for better convergence
      .velocityDecay(0.4); // Reduced friction for smoother movement

    simulationRef.current = simulation;

    // Optimization: Use alpha threshold to stop early for large datasets
    simulation.on("tick", () => {
      // Update node and edge positions
      svg.selectAll<SVGCircleElement, NetworkNode>(".node")
        .attr("cx", d => d.x || 0)
        .attr("cy", d => d.y || 0);

      svg.selectAll<SVGLineElement, NetworkEdge>(".edge")
        .attr("x1", d => (typeof d.source === 'object' ? d.source.x : 0) || 0)
        .attr("y1", d => (typeof d.source === 'object' ? d.source.y : 0) || 0)
        .attr("x2", d => (typeof d.target === 'object' ? d.target.x : 0) || 0)
        .attr("y2", d => (typeof d.target === 'object' ? d.target.y : 0) || 0);

      svg.selectAll<SVGTextElement, NetworkNode>(".node-label")
        .attr("x", d => d.x || 0)
        .attr("y", d => (d.y || 0) + d.size / 2 + 15);
    });

    simulation.on("end", () => {
      setIsSimulationRunning(false);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [visibleNodes, visibleEdges, dimensions]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
      handleResize();
    }

    return () => observer.disconnect();
  }, []);

  // Zoom functionality
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>(".zoom-group");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        const { transform } = event;
        setTransform(transform);
        g.attr("transform", transform.toString());
      });

    svg.call(zoom);

    // Set initial transform
    svg.call(zoom.transform, transform);

    return () => {
      svg.on(".zoom", null);
    };
  }, [transform]);

  const handleNodeClick = useCallback((node: NetworkNode, event: React.MouseEvent) => {
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
  }, [selectedNode, onIndividualSelect]);

  const connectedNodeIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const connected = new Set<string>([selectedNode.id]);
    visibleEdges.forEach(edge => {
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
      if (sourceId === selectedNode.id) connected.add(targetId);
      if (targetId === selectedNode.id) connected.add(sourceId);
    });
    return connected;
  }, [selectedNode, visibleEdges]);

  // Enhanced export functionality
  // Add these import statements at the top of your component file
// Note: You'll need to install these packages:
// npm install jspdf

// Updated export functionality with proper SVG handling
// Fixed export functionality that captures the complete graph
const handleExport = useCallback(async (format: 'png' | 'pdf') => {
  if (!svgRef.current || visibleNodes.length === 0) return;
  
  setIsExporting(true);
  setHoveredNodeId(null);
  setShowDetails(false);
  
  try {
    // Wait for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 300));

    // Calculate the actual bounds of all nodes and edges
    const bounds = calculateGraphBounds(visibleNodes, visibleEdges);
    
    // Add padding around the graph
    const padding = 50;
    const graphWidth = bounds.maxX - bounds.minX + (padding * 2);
    const graphHeight = bounds.maxY - bounds.minY + (padding * 2);
    
    // Create SVG content with proper bounds and centering
    const svgContent = generateExportSVG(bounds, padding, graphWidth, graphHeight);
    
    if (format === 'png') {
      await exportAsPNG(svgContent, graphWidth, graphHeight);
    } else if (format === 'pdf') {
      await exportAsPDF(svgContent, graphWidth, graphHeight);
    }
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  } finally {
    setIsExporting(false);
  }
}, [visibleNodes, visibleEdges]);

// Calculate the actual bounds of the graph
const calculateGraphBounds = (nodes: NetworkNode[], edges: NetworkEdge[]) => {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: dimensions.width, maxY: dimensions.height };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  // Get bounds from all nodes (including their size)
  nodes.forEach(node => {
    if (node.x !== undefined && node.y !== undefined) {
      const nodeRadius = node.size / 2 + 10; // Add some buffer for node size and labels
      minX = Math.min(minX, node.x - nodeRadius);
      minY = Math.min(minY, node.y - nodeRadius - 25); // Extra space for labels
      maxX = Math.max(maxX, node.x + nodeRadius);
      maxY = Math.max(maxY, node.y + nodeRadius + 25); // Extra space for labels
    }
  });

  // Fallback if no nodes have positions yet
  if (minX === Infinity) {
    return { minX: 0, minY: 0, maxX: dimensions.width, maxY: dimensions.height };
  }

  return { minX, minY, maxX, maxY };
};

// Generate the complete SVG for export
const generateExportSVG = (bounds: any, padding: number, graphWidth: number, graphHeight: number) => {
  // Calculate offset to center the graph
  const offsetX = padding - bounds.minX;
  const offsetY = padding - bounds.minY;
  
  // Generate edges
  const edgesHTML = visibleEdges.map(edge => {
    const sourceNode = typeof edge.source === 'object' ? edge.source : visibleNodes.find(n => n.id === edge.source);
    const targetNode = typeof edge.target === 'object' ? edge.target : visibleNodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) {
      return '';
    }
    
    const edgeColor = getEdgeColor(edge.interactions);
    
    return `
      <line
        x1="${sourceNode.x + offsetX}"
        y1="${sourceNode.y + offsetY}"
        x2="${targetNode.x + offsetX}"
        y2="${targetNode.y + offsetY}"
        stroke="${edgeColor}"
        stroke-width="${edge.width}"
        opacity="0.7"
        stroke-linecap="round"
      />
    `;
  }).join('');

  // Generate nodes
  const nodesHTML = visibleNodes.map(node => {
    if (!node.x || !node.y) return '';
    
    const nodeX = node.x + offsetX;
    const nodeY = node.y + offsetY;
    
    // Determine gradient based on node type
    const gradientId = node.type === 'primary' ? 'primaryGradient' : 
                     node.type === 'service' ? 'serviceGradient' : 'secondaryGradient';
    
    let nodeContent = `
      <!-- Node shadow -->
      <circle
        cx="${nodeX + 2}"
        cy="${nodeY + 2}"
        r="${node.size / 2}"
        fill="rgba(0,0,0,0.1)"
      />
      
      <!-- Main node -->
      <circle
        cx="${nodeX}"
        cy="${nodeY}"
        r="${node.size / 2}"
        fill="url(#${gradientId})"
        
      />
      
      <!-- Node label -->
      <text
        x="${nodeX}"
        y="${nodeY + node.size / 2 + 18}"
        text-anchor="middle"
        font-size="11px"
        font-family="Arial, sans-serif"
        fill="#333333"
        font-weight="600"
      >${node.phoneNumber}</text>
    `;
    
    // Add interaction count badge for important nodes
    if (node.interactions > 10) {
      nodeContent += `
        <g transform="translate(${nodeX + node.size / 2 - 8}, ${nodeY - node.size / 2 + 8})">
          <circle r="10" fill="#ef4444" stroke="white" stroke-width="2"/>
          <text
            text-anchor="middle"
            y="4"
            font-size="8px"
            font-family="Arial, sans-serif"
            fill="white"
            font-weight="bold"
          >${node.interactions > 99 ? '99+' : node.interactions}</text>
        </g>
      `;
    }
    
    return nodeContent;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${graphWidth}" height="${graphHeight}" viewBox="0 0 ${graphWidth} ${graphHeight}">
      <defs>
        <style type="text/css">
          <![CDATA[
            text { font-family: Arial, sans-serif; }
          ]]>
        </style>
        <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3B82F6" />
          <stop offset="100%" stop-color="#1D4ED8" />
        </linearGradient>
        <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10B981" />
          <stop offset="100%" stop-color="#047857" />
        </linearGradient>
        <linearGradient id="serviceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#D97706" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="#ffffff"/>
      
      <!-- Edges -->
      <g class="edges">
        ${edgesHTML}
      </g>
      
      <!-- Nodes -->
      <g class="nodes">
        ${nodesHTML}
      </g>
    </svg>
  `;
};

// PNG Export Function
const exportAsPNG = async (svgString: string, width: number, height: number) => {
  return new Promise<void>((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Set canvas size with high DPI for better quality
    const scale = 2; // 2x resolution for crisp images
    canvas.width = width * scale;
    canvas.height = height * scale;
    
    // Scale the context to match
    ctx.scale(scale, scale);
    
    // Create blob from SVG string
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    
    img.onload = () => {
      try {
        // Fill background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Draw the SVG image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `Synapse-graph-${new Date().toISOString().slice(0, 10)}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(svgUrl);
            resolve();
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png', 1.0);
      } catch (error) {
        URL.revokeObjectURL(svgUrl);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      reject(new Error('Failed to load SVG image'));
    };
    
    img.src = svgUrl;
  });
};

// PDF Export Function
const exportAsPDF = async (svgString: string, width: number, height: number) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // First convert SVG to PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // High resolution for PDF
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);
      
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      
      img.onload = async () => {
        try {
          // Fill background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          
          // Draw the SVG
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert canvas to data URL
          const imgData = canvas.toDataURL('image/png', 1.0);
          
          // Dynamically import jsPDF
          const { jsPDF } = await import('jspdf');
          
          // Calculate PDF dimensions
          const aspectRatio = width / height;
          
          // A4 dimensions in mm
          const a4Width = 210;
          const a4Height = 297;
          
          let pdfWidth, pdfHeight, orientation: 'portrait' | 'landscape';
          
          // Determine best fit orientation
          if (aspectRatio > 1.4) {
            // Wide graph - use landscape
            orientation = 'landscape';
            pdfWidth = a4Height - 20; // A4 height minus margins
            pdfHeight = pdfWidth / aspectRatio;
            
            // If too tall for landscape, scale down
            if (pdfHeight > a4Width - 20) {
              pdfHeight = a4Width - 20;
              pdfWidth = pdfHeight * aspectRatio;
            }
          } else {
            // Portrait or square graph
            orientation = 'portrait';
            pdfWidth = a4Width - 20; // A4 width minus margins
            pdfHeight = pdfWidth / aspectRatio;
            
            // If too tall for portrait, scale down
            if (pdfHeight > a4Height - 40) { // Extra margin for header
              pdfHeight = a4Height - 40;
              pdfWidth = pdfHeight * aspectRatio;
            }
          }
          
          // Create PDF
          const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format: 'a4'
          });
          
          // Add header with title and metadata
          pdf.setFontSize(16);
          pdf.setTextColor(40, 40, 40);
          pdf.text('Network Analysis Graph with Synapse by ANTIC', 10, 15);
          
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, 25);
          pdf.text(`Nodes: ${visibleNodes.length} | Edges: ${visibleEdges.length}`, 10, 32);
          
          // Center the image on the page
          const pageWidth = orientation === 'landscape' ? a4Height : a4Width;
          const pageHeight = orientation === 'landscape' ? a4Width : a4Height;
          
          const xOffset = (pageWidth - pdfWidth) / 2;
          const yOffset = 40; // Start below header
          
          pdf.addImage(imgData, 'PNG', xOffset, yOffset, pdfWidth, pdfHeight, '', 'FAST');
          
          pdf.save(`network-graph-${new Date().toISOString().slice(0, 10)}.pdf`);
          
          // Cleanup
          URL.revokeObjectURL(svgUrl);
          resolve();
        } catch (error) {
          URL.revokeObjectURL(svgUrl);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG for PDF export'));
      };
      
      img.src = svgUrl;
    } catch (error) {
      reject(error);
    }
  });
};

  // Control functions
  const resetZoom = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(750).call(
      d3.zoom<SVGSVGElement, unknown>().transform,
      d3.zoomIdentity
    );
  }, []);

  const zoomIn = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy,
      1.5
    );
  }, []);

  const zoomOut = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy,
      1 / 1.5
    );
  }, []);

  const restartSimulation = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
      setIsSimulationRunning(true);
    }
  }, []);

  if (networkData.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
            <Network className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Network Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            {!data?.listings ? 'No data source provided. Please upload data to visualize network connections.' : 'No valid phone number interactions found in the current dataset.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={exportRef} className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Enhanced Header with Controls */}
      <div className="flex-shrink-0 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Network Graph with {networkData.nodes.length} nodes</h3>
              
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Network Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="font-medium">{visibleNodes.length}</span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span className="font-medium">{visibleEdges.length}</span>
              </div>
              {isSimulationRunning && (
                <>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs">Simulation</span>
                  </div>
                </>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={zoomIn}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={zoomOut}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetZoom}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Reset Zoom"
              >
                <Maximize className="w-4 h-4" />
              </button>
              <button
                onClick={restartSimulation}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Restart Layout"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            

            {/* Export Controls */}
            <div className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-600 pl-4">
              <button
                onClick={() => handleExport('png')}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'PNG'}
              </button>
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search phone numbers or filter network..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      
      {/* Network Visualization */}
      <div ref={containerRef} className="flex-1 relative min-h-0 w-full overflow-hidden">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <defs>
              {/* Gradient definitions for enhanced visuals */}
              <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="serviceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              
              {/* Filters for enhanced effects */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="shadow">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
              </filter>
            </defs>
            
            <g className="zoom-group">
              {/* Edges */}
              <g className="edges">
                {visibleEdges.map(edge => {
                  const sourceNode = typeof edge.source === 'object' ? edge.source : visibleNodes.find(n => n.id === edge.source);
                  const targetNode = typeof edge.target === 'object' ? edge.target : visibleNodes.find(n => n.id === edge.target);
                  
                  if (!sourceNode || !targetNode) return null;
                  
                  const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
                  const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
                  const isHighlighted = selectedNode && (connectedNodeIds.has(sourceId) && connectedNodeIds.has(targetId));
                  const isDimmed = selectedNode && !isHighlighted;
                  const edgeColor = getEdgeColor(edge.interactions);
                  
                  return (
                    <line
                      key={edge.id}
                      className="edge"
                      x1={sourceNode.x || 0}
                      y1={sourceNode.y || 0}
                      x2={targetNode.x || 0}
                      y2={targetNode.y || 0}
                      stroke={isHighlighted ? "#fbbf24" : edgeColor}
                      strokeWidth={isHighlighted ? edge.width + 2 : edge.width}
                      opacity={isDimmed ? 0.15 : isHighlighted ? 0.9 : 0.6}
                      strokeLinecap="round"
                      style={{ 
                        transition: 'all 0.3s ease',
                        filter: isHighlighted ? 'url(#glow)' : 'none'
                      }}
                    />
                  );
                })}
              </g>
              
              {/* Nodes */}
              <g className="nodes">
                {visibleNodes.map(node => {
                  const isSelected = selectedNode?.id === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isConnected = selectedNode && connectedNodeIds.has(node.id);
                  const isDimmed = selectedNode && !isConnected;
                  
                  const gradientId = node.type === 'primary' ? 'primaryGradient' : 
                                   node.type === 'service' ? 'serviceGradient' : 'secondaryGradient';
                  
                  return (
                    <g key={node.id} className="node-group">
                      {/* Selection ring */}
                      {isSelected && (
                        <circle
                          cx={node.x || 0}
                          cy={node.y || 0}
                          r={node.size / 2 + 8}
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="3"
                          opacity="0.8"
                          className="animate-pulse"
                        />
                      )}
                      
                      {/* Node shadow */}
                      <circle
                        cx={node.x || 0}
                        cy={node.y || 0}
                        r={node.size / 2}
                        fill="rgba(0,0,0,0.1)"
                        transform="translate(2,2)"
                      />
                      
                      {/* Main node */}
                      <circle
                        className="node"
                        cx={node.x || 0}
                        cy={node.y || 0}
                        r={node.size / 2}
                        fill={`url(#${gradientId})`}
                        stroke="white"
                        strokeWidth="3"
                        opacity={isDimmed ? 0.3 : 1}
                        style={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          transform: isSelected ? 'scale(1.01)' : isHovered ? 'scale(1)' : 'scale(1)',
                          filter: isSelected || isHovered ? 'url(#shadow)' : 'none'
                        }}
                        onClick={(e) => handleNodeClick(node, e as any)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                      />
                      
                      {/* Node label on hover */}
                      {(isHovered || isSelected) && (
                        <text
                          className="node-label"
                          x={node.x || 0}
                          y={(node.y || 0) + node.size / 2 + 20}
                          textAnchor="middle"
                          fontSize="12px"
                          fill="white"
                          stroke="rgba(0,0,0,0.8)"
                          strokeWidth="3"
                          paintOrder="stroke"
                          fontWeight="600"
                          style={{ pointerEvents: 'none' }}
                        >
                          {node.phoneNumber}
                        </text>
                      )}
                      
                      {/* Interaction count badge for important nodes */}
                      {node.interactions > 10 && !isDimmed && (
                        <g transform={`translate(${(node.x || 0) + node.size / 2 - 8}, ${(node.y || 0) - node.size / 2 + 8})`}>
                          <circle
                            r="10"
                            fill="#ef4444"
                            
                          />
                          <text
                            textAnchor="middle"
                            y="4"
                            fontSize="8px"
                            fill="white"
                            fontWeight="bold"
                            style={{ pointerEvents: 'none' }}
                          >
                            {node.interactions > 99 ? '99+' : node.interactions}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
        )}

        {/* Node Details Panel */}
        <NodeDetails
          node={selectedNode}
          edges={visibleEdges}
          position={detailsPosition}
          onClose={() => {
            setShowDetails(false);
            setSelectedNode(null);
          }}
          isVisible={showDetails && selectedNode !== null}
        />

        {/* Loading overlay */}
        {isExporting && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Exporting network graph...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced Legend */}
      <div className="flex-shrink-0 w-full border-t border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Connection Strength:</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-0.5 bg-green-500 rounded-full shadow-sm"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Low (1-2)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-1 bg-yellow-500 rounded-full shadow-sm"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Medium (3-5)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-1.5 bg-orange-500 rounded-full shadow-sm"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">High (6-10)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-2 bg-red-500 rounded-full shadow-sm"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Very High (10+)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Node Types:</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full shadow-sm border-2 border-white"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Primary (20+ interactions)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-green-600 to-green-800 rounded-full shadow-sm border-2 border-white"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Secondary (standard)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full shadow-sm border-2 border-white"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Service (10+ contacts)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

      
        </div>
      </div>
    </div>
  );
};