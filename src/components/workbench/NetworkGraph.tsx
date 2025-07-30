// Enhanced NetworkGraph with optimized performance and better visualization
'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import { AnimatePresence, motion } from 'framer-motion';
import { ExcelData, Individual } from "@/app/[locale]/workbench/page";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Settings, 
  Filter,
  Search,
  Eye,
  EyeOff,
  Layers,
  Activity
} from "lucide-react";

// Interfaces remain the same...
interface NetworkGraphProps {
  data: ExcelData;
  filters: any;
  onIndividualSelect: (individual: Individual) => void;
}

interface NetworkNode {
  id: string;
  label: string;
  value: number;
  size: number;
  interactions: number;
  calls: number;
  sms: number;
  color: string;
  title: string;
  group?: string;
}

interface NetworkEdge {
  from: string;
  to: string;
  value: number;
  width: number;
  color: string;
  title: string;
  weight: number;
  calls: number;
  sms: number;
}

interface NetworkStats {
  totalNodes: number;
  totalEdges: number;
  totalInteractions: number;
  avgInteractionsPerNode: number;
  maxInteractions: number;
  networkDensity: number;
  clusters: number;
}

const COLOR_SCHEMES = {
  default: {
    low: "#22c55e",
    medium: "#eab308",
    high: "#f97316",
    very_high: "#ef4444"
  }
};


// Helper function to robustly find and map data from various possible column headers.
const normalizeHeadersAndMapData = (listings: any[][]) => {
  if (!listings || listings.length < 2) {
    console.error("NetworkGraph Error: Listings data is missing or incomplete.");
    return null;
  }

  const headers = listings[0].map(h => String(h || '').trim().toLowerCase().replace(/\s+/g, ' '));
  const dataRows = listings.slice(1);

  // ========================================================================
  // CORRECTED: Updated header mapping to match the user's PDF document.
  // ========================================================================
  const headerMapping = {
    source: ["numero appellant", "numéro a", "caller", "source", "from", "émetteur"],
    target: ["numero appelé", "numéro b", "called", "target", "to", "destinataire", "correspondant"],
    date: ["date debut appel", "date", "timestamp", "datetime"],
    duration: ["duree de l'appel", "durée de l'appel", "duration"] // Added duration to determine type
  };

  const columnIndexMap: { [key: string]: number } = {};

  for (const [canonicalName, possibleNames] of Object.entries(headerMapping)) {
    // Find the first matching header from the possibilities
    const foundIndex = headers.findIndex(h => possibleNames.includes(h));
    if (foundIndex !== -1) {
      columnIndexMap[canonicalName] = foundIndex;
    }
  }

  // Critical check: We MUST have a source and a target to build a network.
  if (columnIndexMap.source === undefined || columnIndexMap.target === undefined) {
    console.error(
      "NetworkGraph Error: Could not find required columns. " +
      `Found headers: [${headers.join(", ")}]. ` +
      `Missing 'source' (e.g., 'Numero appellant') or 'target' (e.g., 'Numero appelé').`
    );
    return null;
  }
  
  console.log("NetworkGraph: Column mapping successful", columnIndexMap);

  return dataRows.map(row => {
    const mappedRow: { [key: string]: any } = {};
    for (const [canonicalName, index] of Object.entries(columnIndexMap)) {
      mappedRow[canonicalName] = row[index];
    }
    return mappedRow;
  });
};


export function NetworkGraph({ data, filters, onIndividualSelect }: NetworkGraphProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({ totalNodes: 0, totalEdges: 0, totalInteractions: 0, avgInteractionsPerNode: 0, maxInteractions: 0, networkDensity: 0, clusters: 0 });
  const [layoutSettings, setLayoutSettings] = useState({ physics: true, layout: 'forceAtlas2Based', clustering: false, showLabels: true, nodeSize: 'interactions', edgeColor: 'intensity', stabilizationSteps: 1000 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [highlightMode, setHighlightMode] = useState<'none' | 'connected' | 'path'>('none');

  const processedData = useMemo(() => {
    setIsLoading(true);
    const startTime = performance.now();

    const objectListings = normalizeHeadersAndMapData(data?.listings);

    if (!objectListings) {
      setIsLoading(false);
      return null;
    }
    
    const nodeMap = new Map<string, { id: string; interactions: number; calls: number; sms: number; incomingCalls: number; outgoingCalls: number; incomingSms: number; outgoingSms: number; contacts: Set<string>; timePattern: Map<number, number>; lastActivity: Date | null; }>();
    const edgeMap = new Map<string, { from: string; to: string; weight: number; calls: number; sms: number; timestamps: Date[]; }>();

    const filteredListings = objectListings.filter((listing: any) => {
      // ========================================================================
      // CORRECTED: Interaction type filter now uses the new logic.
      // ========================================================================
      const isSms = String(listing.duration || '').toUpperCase() === 'SMS';
      if (filters.interactionType === 'calls' && isSms) return false;
      if (filters.interactionType === 'sms' && !isSms) return false;

      if (filters.dateRange.start || filters.dateRange.end) {
        const date = new Date(listing.date);
        if (isNaN(date.getTime())) return true;
        if (filters.dateRange.start && date < new Date(filters.dateRange.start)) return false;
        if (filters.dateRange.end && date > new Date(filters.dateRange.end)) return false;
      }

      return true;
    });

    filteredListings.forEach((listing: any) => {
      const source = String(listing.source || '').trim();
      const target = String(listing.target || '').trim();
      const timestamp = new Date(listing.date);

      // ========================================================================
      // CORRECTED: Determine interaction type from the 'duration' column.
      // ========================================================================
      const type = String(listing.duration || '').toUpperCase() === 'SMS' ? 'sms' : 'call';
      // ========================================================================

      if (!source || !target || source === target) return;

      if (!nodeMap.has(source)) nodeMap.set(source, { id: source, interactions: 0, calls: 0, sms: 0, incomingCalls: 0, outgoingCalls: 0, incomingSms: 0, outgoingSms: 0, contacts: new Set(), timePattern: new Map(), lastActivity: null });
      if (!nodeMap.has(target)) nodeMap.set(target, { id: target, interactions: 0, calls: 0, sms: 0, incomingCalls: 0, outgoingCalls: 0, incomingSms: 0, outgoingSms: 0, contacts: new Set(), timePattern: new Map(), lastActivity: null });

      const sourceNode = nodeMap.get(source)!;
      const targetNode = nodeMap.get(target)!;

      sourceNode.interactions++;
      targetNode.interactions++;
      sourceNode.contacts.add(target);
      targetNode.contacts.add(source);

      if (!isNaN(timestamp.getTime())) {
        if (!sourceNode.lastActivity || timestamp > sourceNode.lastActivity) sourceNode.lastActivity = timestamp;
        if (!targetNode.lastActivity || timestamp > targetNode.lastActivity) targetNode.lastActivity = timestamp;
        const hour = timestamp.getHours();
        sourceNode.timePattern.set(hour, (sourceNode.timePattern.get(hour) || 0) + 1);
        targetNode.timePattern.set(hour, (targetNode.timePattern.get(hour) || 0) + 1);
      }

      if (type === 'sms') {
        sourceNode.sms++;
        sourceNode.outgoingSms++;
        targetNode.sms++;
        targetNode.incomingSms++;
      } else {
        sourceNode.calls++;
        sourceNode.outgoingCalls++;
        targetNode.calls++;
        targetNode.incomingCalls++;
      }

      const edgeId = [source, target].sort().join('--');
      if (!edgeMap.has(edgeId)) edgeMap.set(edgeId, { from: source, to: target, weight: 0, calls: 0, sms: 0, timestamps: [] });
      
      const edge = edgeMap.get(edgeId)!;
      edge.weight++;
      if (!isNaN(timestamp.getTime())) edge.timestamps.push(timestamp);
      
      if (type === 'sms') edge.sms++;
      else edge.calls++;
    });

    const filteredNodes = Array.from(nodeMap.values()).filter(node => node.interactions >= filters.minInteractions);
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = Array.from(edgeMap.values()).filter(edge => nodeIds.has(edge.from) && nodeIds.has(edge.to));

    if (filteredNodes.length === 0) {
      console.warn("No nodes match the current filters. Try adjusting the 'Minimum Interactions' filter.");
      setIsLoading(false);
      return null;
    }

    const maxInteractions = Math.max(1, ...filteredNodes.map(n => n.interactions));
    const maxEdgeWeight = Math.max(1, ...filteredEdges.map(e => e.weight));
    const totalInteractions = filteredEdges.reduce((sum, edge) => sum + edge.weight, 0);
    const avgInteractions = totalInteractions / filteredNodes.length;
    const possibleEdges = (filteredNodes.length * (filteredNodes.length - 1)) / 2;
    const networkDensity = possibleEdges > 0 ? filteredEdges.length / possibleEdges : 0;

    const getNodeSize = (interactions: number): number => {
      const minSize = 15;
      const maxSize = 60;
      const normalized = Math.pow(interactions / maxInteractions, 0.6);
      return minSize + (normalized * (maxSize - minSize));
    };

    const getNodeColor = (node: any): string => {
      const scheme = COLOR_SCHEMES.default;
      const intensity = node.interactions / maxInteractions;
      if (intensity <= 0.25) return scheme.low;
      if (intensity <= 0.5) return scheme.medium;
      if (intensity <= 0.75) return scheme.high;
      return scheme.very_high;
    };

    const getEdgeColor = (edge: any): string => {
      const intensity = edge.weight / maxEdgeWeight;
      if (intensity <= 0.25) return COLOR_SCHEMES.default.low;
      if (intensity <= 0.5) return COLOR_SCHEMES.default.medium;
      if (intensity <= 0.75) return COLOR_SCHEMES.default.high;
      return COLOR_SCHEMES.default.very_high;
    };

    const styledNodes: NetworkNode[] = filteredNodes.map(node => ({
      id: node.id,
      label: layoutSettings.showLabels ? node.id : '',
      value: node.interactions,
      size: layoutSettings.nodeSize === 'uniform' ? 25 : getNodeSize(node.interactions),
      interactions: node.interactions,
      calls: node.calls,
      sms: node.sms,
      color: getNodeColor(node),
      title: `<div style="max-width: 200px;"><strong>${node.id}</strong><hr style="margin: 5px 0;"/>📊 Total Interactions: ${node.interactions}<br/>📞 Calls: ${node.calls} (📤 ${node.outgoingCalls}, 📥 ${node.incomingCalls})<br/>💬 SMS: ${node.sms} (📤 ${node.outgoingSms}, 📥 ${node.incomingSms})<br/>👥 Unique Contacts: ${node.contacts.size}<br/>🕒 Last Activity: ${node.lastActivity?.toLocaleDateString() || 'Unknown'}</div>`,
    }));

    const styledEdges: NetworkEdge[] = filteredEdges.map(edge => ({
      from: edge.from,
      to: edge.to,
      value: edge.weight,
      width: Math.max(1, (edge.weight / maxEdgeWeight) * 10),
      color: getEdgeColor(edge),
      weight: edge.weight,
      calls: edge.calls,
      sms: edge.sms,
      title: `<div style="max-width: 180px;"><strong>${edge.from} ↔ ${edge.to}</strong><hr style="margin: 5px 0;"/>🔗 Total Interactions: ${edge.weight}<br/>📞 Calls: ${edge.calls}<br/>💬 SMS: ${edge.sms}</div>`
    }));

    setNetworkStats({ totalNodes: styledNodes.length, totalEdges: styledEdges.length, totalInteractions, avgInteractionsPerNode: avgInteractions, maxInteractions, networkDensity, clusters: 0 });
    
    const processingTime = performance.now() - startTime;
    console.log(`Network data processed in ${processingTime.toFixed(2)}ms - ${styledNodes.length} nodes, ${styledEdges.length} edges`);

    return { nodes: new DataSet(styledNodes), edges: new DataSet(styledEdges) };
  }, [data, filters, layoutSettings]);

  // The rest of the component (useEffect, handlers, JSX) remains the same as it was correct.
  // ...
  // Network initialization and updates
  useEffect(() => {
    if (!networkRef.current || !processedData) {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
      setIsLoading(false);
      return;
    }

    const nodeCount = processedData.nodes.length;
    const isLargeNetwork = nodeCount > 50;

    const options = {
      nodes: {
        shape: 'dot',
        borderWidth: 2,
        borderWidthSelected: 4,
        color: {
          border: '#fff',
          highlight: { border: '#000', background: '#ff0000' },
          hover: { border: '#000', background: '#ffff00' }
        },
        font: {
          size: layoutSettings.showLabels ? (isLargeNetwork ? 12 : 14) : 0,
          color: '#2d3748',
          strokeWidth: 2,
          strokeColor: '#ffffff'
        },
        shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 5, x: 2, y: 2 },
        scaling: { min: 15, max: isLargeNetwork ? 40 : 60 }
      },
      edges: {
        color: { inherit: false, highlight: '#ff0000', hover: '#ffff00' },
        smooth: { enabled: !isLargeNetwork, type: "dynamic", roundness: 0.3 },
        arrows: { to: { enabled: false } },
        scaling: { min: 1, max: isLargeNetwork ? 8 : 12 },
        shadow: layoutSettings.physics
      },
      physics: {
        enabled: layoutSettings.physics,
        solver: layoutSettings.layout,
        stabilization: { enabled: true, iterations: isLargeNetwork ? 500 : layoutSettings.stabilizationSteps, updateInterval: 50, onlyDynamicEdges: false, fit: true },
        forceAtlas2Based: { gravitationalConstant: isLargeNetwork ? -15 : -30, centralGravity: 0.005, springLength: isLargeNetwork ? 100 : 150, springConstant: 0.18, damping: 0.4, avoidOverlap: isLargeNetwork ? 0.5 : 1 },
        barnesHut: { gravitationalConstant: isLargeNetwork ? -15000 : -30000, centralGravity: 0.3, springLength: isLargeNetwork ? 100 : 150, springConstant: 0.04, damping: 0.09, avoidOverlap: isLargeNetwork ? 0.5 : 1 }
      },
      interaction: { hover: true, tooltipDelay: 200, navigationButtons: false, keyboard: true, multiselect: true, selectConnectedEdges: highlightMode === 'connected' },
      layout: { improvedLayout: !isLargeNetwork, randomSeed: layoutSettings.clustering ? undefined : 42 }
    };

    try {
      networkInstance.current = new Network(networkRef.current, {}, options);
      networkInstance.current.setData(processedData);

      networkInstance.current.on('stabilizationProgress', () => setIsLoading(true));
      networkInstance.current.on('stabilizationIterationsDone', () => setIsLoading(false));
      networkInstance.current.on('stabilized', () => setIsLoading(false));

      networkInstance.current.on('selectNode', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const nodeData = processedData.nodes.get(nodeId);
          if (nodeData) {
            onIndividualSelect({
              id: String(nodeData.id),
              phoneNumber: nodeData.label || nodeData.id,
              interactions: nodeData.interactions,
              details: { calls: nodeData.calls, sms: nodeData.sms, value: nodeData.value }
            });
            setSelectedNodes(new Set([nodeId]));
            if (highlightMode === 'connected') highlightConnectedNodes(nodeId);
          }
        }
      });

      networkInstance.current.on('deselectNode', () => {
        setSelectedNodes(new Set());
        if (highlightMode !== 'none') resetHighlight();
      });

    } catch (error) {
      console.error('Error initializing network:', error);
      setIsLoading(false);
    }

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [processedData, layoutSettings, highlightMode, onIndividualSelect]);

  const highlightConnectedNodes = useCallback((nodeId: string) => {
    if (!networkInstance.current || !processedData) return;
    const allNodes = processedData.nodes.getIds();
    const allEdges = processedData.edges.getIds();
    const connectedNodes = networkInstance.current.getConnectedNodes(nodeId);
    const connectedEdges = networkInstance.current.getConnectedEdges(nodeId);
    
    const nodeUpdates = allNodes.map(id => ({ id, color: connectedNodes.includes(id) || id === nodeId ? undefined : { background: '#e2e8f0', border: '#cbd5e0' }, opacity: connectedNodes.includes(id) || id === nodeId ? 1 : 0.3 }));
    const edgeUpdates = allEdges.map(id => ({ id, color: connectedEdges.includes(id) ? undefined : '#e2e8f0', opacity: connectedEdges.includes(id) ? 1 : 0.1 }));

    processedData.nodes.update(nodeUpdates);
    processedData.edges.update(edgeUpdates);
  }, [processedData]);

  const resetHighlight = useCallback(() => {
    if (!networkInstance.current || !processedData) return;
    const allNodes = processedData.nodes.getIds();
    const allEdges = processedData.edges.getIds();
    const nodeUpdates = allNodes.map(id => ({ id, opacity: 1 }));
    const edgeUpdates = allEdges.map(id => ({ id, opacity: 1 }));
    processedData.nodes.update(nodeUpdates);
    processedData.edges.update(edgeUpdates);
  }, [processedData]);

  useEffect(() => {
    if (!searchQuery || !networkInstance.current || !processedData) return;
    const matchingNodes = processedData.nodes.get({ filter: (node: any) => node.id.toLowerCase().includes(searchQuery.toLowerCase()) });
    if (matchingNodes.length > 0) {
      networkInstance.current.selectNodes([matchingNodes[0].id]);
      networkInstance.current.focus(matchingNodes[0].id, { animation: true });
    }
  }, [searchQuery, processedData]);

  const handleZoomIn = () => networkInstance.current?.moveTo({ scale: Math.min(networkInstance.current.getScale() * 1.2, 3) });
  const handleZoomOut = () => networkInstance.current?.moveTo({ scale: Math.max(networkInstance.current.getScale() * 0.8, 0.1) });
  const handleFit = () => networkInstance.current?.fit({ animation: true });
  const handleReset = () => {
    if (networkInstance.current && processedData) {
      setIsLoading(true);
      setSelectedNodes(new Set());
      resetHighlight();
      networkInstance.current.setData(processedData);
      networkInstance.current.fit();
    }
  };
  const togglePhysics = () => setLayoutSettings(prev => ({ ...prev, physics: !prev.physics }));
  const toggleLabels = () => setLayoutSettings(prev => ({ ...prev, showLabels: !prev.showLabels }));

  if (!processedData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center p-8">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Network Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload data with valid columns (e.g., 'Numero appellant', 'Numero appelé') or adjust filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Communication Network</h3>
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>{networkStats.totalNodes} nodes</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>{networkStats.totalEdges} connections</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div>{networkStats.totalInteractions} interactions</span>
                <span className="text-gray-500">Density: {(networkStats.networkDensity * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 w-48 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
            <button onClick={toggleLabels} className={`p-1.5 rounded-sm transition-colors ${layoutSettings.showLabels ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'}`} title={layoutSettings.showLabels ? "Hide Labels" : "Show Labels"}>{layoutSettings.showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
            <button onClick={togglePhysics} className={`p-1.5 rounded-sm transition-colors ${layoutSettings.physics ? 'bg-green-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'}`} title={layoutSettings.physics ? "Disable Physics" : "Enable Physics"}><Layers className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
            {[{ Icon: ZoomIn, onClick: handleZoomIn, title: "Zoom In" }, { Icon: ZoomOut, onClick: handleZoomOut, title: "Zoom Out" }, { Icon: Maximize2, onClick: handleFit, title: "Fit to Screen" }, { Icon: RotateCcw, onClick: handleReset, title: "Reset View" }].map(({ Icon, onClick, title }, i) => (<button key={i} onClick={onClick} className="p-1.5 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" title={title}><Icon className="w-4 h-4" /></button>))}
          </div>
        </div>
      </div>
      <div className="flex-1 relative bg-gray-50 dark:bg-gray-900">
        <div ref={networkRef} className="w-full h-full" />
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /><div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full" /></div>
                <div><span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Optimizing Network Layout</span><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{networkStats.totalNodes > 50 ? "Large network detected - using optimized rendering" : "Calculating optimal node positions..."}</p></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
        {/* Legend JSX remains the same */}
      </div>
    </div>
  );
}