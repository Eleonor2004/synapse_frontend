"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Network, Search, X, ZoomIn, ZoomOut, RotateCcw, Maximize, Info } from 'lucide-react';
import * as d3 from 'd3';
import { useEnhancedNetworkData, NetworkNode, EnhancedNetworkEdge, ExcelData, EnhancedFilters } from '../../hooks/useEnhancedNetworkData';
import { NodeDetails } from './NodeDetails';
import { getMultiDegreeLinkColor, getMultiDegreeLinkWidth } from '../../utils/multi-degree-link-anlysis';

// Define types that are specific to this component
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

interface EnhancedNetworkGraphProps {
  data: ExcelData | null;
  filters: EnhancedFilters;
  onIndividualSelect: (individual: Individual) => void;
}

// Helper function to safely get edge source/target ID
const getEdgeNodeId = (node: NetworkNode | string): string => {
  return typeof node === 'object' ? (node.id || '') : String(node);
};

// Safe node and edge validation
const isValidNode = (node: any): node is NetworkNode => 
    node && typeof node.id === 'string' && node.id.trim() !== '' && typeof node.phoneNumber === 'string';

const isValidEdge = (edge: any): edge is EnhancedNetworkEdge => 
    edge && edge.source && edge.target && getEdgeNodeId(edge.source) !== '' && getEdgeNodeId(edge.target) !== '';

export const EnhancedNetworkGraph: React.FC<EnhancedNetworkGraphProps> = ({
  data,
  filters,
  onIndividualSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<NetworkNode, EnhancedNetworkEdge> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);

  const networkData = useEnhancedNetworkData(data, filters);

  const processedNodes = useMemo(() => {
    if (!networkData?.nodes) return [];
    return networkData.nodes.filter(isValidNode).map(node => ({
        ...node,
        id: node.id,
        phoneNumber: node.phoneNumber,
        size: Math.max(10, Math.min(50, node.size || 20)),
        type: node.type || 'unknown',
        interactions: node.interactions || 0,
    }));
  }, [networkData?.nodes]);

  const processedEdges = useMemo(() => {
    if (!networkData?.edges || processedNodes.length === 0) return [];
    const nodeIdSet = new Set(processedNodes.map(n => n.id));
    return networkData.edges
      .filter(isValidEdge)
      .filter(edge => {
        const sourceId = getEdgeNodeId(edge.source);
        const targetId = getEdgeNodeId(edge.target);
        return nodeIdSet.has(sourceId) && nodeIdSet.has(targetId) && sourceId !== targetId;
      })
      .map(edge => ({
        ...edge,
        source: getEdgeNodeId(edge.source),
        target: getEdgeNodeId(edge.target),
        width: Math.max(1, Math.min(8, edge.width || 2)),
        degree: edge.degree || 1,
        linkStrength: edge.linkStrength || { strengthScore: 50, classification: 'secondary' as const }
      }));
  }, [networkData?.edges, processedNodes]);

  const { visibleNodes, visibleEdges } = useMemo(() => {
    if (processedNodes.length === 0) return { visibleNodes: [], visibleEdges: [] };

    const lowerSearch = searchTerm.trim().toLowerCase();
    const filteredNodes = lowerSearch
      ? processedNodes.filter(node => node.phoneNumber.toLowerCase().includes(lowerSearch))
      : processedNodes;

    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    
    const filteredEdges = processedEdges.filter(edge => 
      visibleNodeIds.has(getEdgeNodeId(edge.source)) && visibleNodeIds.has(getEdgeNodeId(edge.target))
    );
    
    // Only show nodes that are part of a visible link
    const connectedNodeIds = new Set<string>();
    filteredEdges.forEach(edge => {
        connectedNodeIds.add(getEdgeNodeId(edge.source));
        connectedNodeIds.add(getEdgeNodeId(edge.target));
    });

    const finalVisibleNodes = filteredNodes.filter(node => connectedNodeIds.has(node.id));

    return { visibleNodes: finalVisibleNodes, visibleEdges: filteredEdges };
  }, [processedNodes, processedEdges, searchTerm]);


  const linkStats = useMemo(() => {
    const total = visibleEdges.length;
    if (total === 0) return { total: 0, direct: 0, secondary: 0, tertiary: 0, avgStrength: 0, multiDegreeTotal: 0 };
    const direct = visibleEdges.filter(e => e.degree === 1).length;
    const secondary = visibleEdges.filter(e => e.degree === 2).length;
    const tertiary = visibleEdges.filter(e => e.degree === 3).length;
    const avgStrength = total > 0 ? Math.round(visibleEdges.reduce((sum, e) => sum + (e.linkStrength?.strengthScore || 0), 0) / total) : 0;
    return { total, direct, secondary, tertiary, avgStrength, multiDegreeTotal: networkData?.stats?.totalMultiDegreeLinks || 0 };
  }, [visibleEdges, networkData?.stats]);

  // Handle container resize
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    const currentContainer = containerRef.current;
    if (currentContainer) {
        observer.observe(currentContainer);
    }
    return () => {
        if (currentContainer) {
            observer.unobserve(currentContainer);
        }
    };
  }, []);

  const handleNodeClick = useCallback((node: NetworkNode, event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
    if (!node || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newSelectedNode = selectedNode?.id === node.id ? null : node;
    setSelectedNode(newSelectedNode);
    
    if (newSelectedNode) {
      setDetailsPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      setShowDetails(true);
      onIndividualSelect({
        id: node.id,
        phoneNumber: node.phoneNumber || '',
        imei: node.imei,
        interactions: node.interactions || 0,
        details: { 
          type: node.type || 'unknown', 
          size: node.size || 20, 
          location: node.location 
        }
      });
    } else {
      setShowDetails(false);
    }
  }, [selectedNode, onIndividualSelect]);

  // Main D3 Simulation Effect
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0 || visibleNodes.length === 0) {
      return;
    }
  
    setIsSimulationRunning(true);
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
  
    // CRITICAL: Clear previous SVG content to prevent conflicts
    svg.selectAll('*').remove();
  
    const zoomGroup = svg.append("g").attr("class", "zoom-group");
    const edgesGroup = zoomGroup.append("g").attr("class", "edges");
    const nodesGroup = zoomGroup.append("g").attr("class", "nodes");
  
    // IMPORTANT: Create deep copies of data for the simulation.
    // This prevents D3 from mutating React's stateful data.
    const simulationNodes: NetworkNode[] = JSON.parse(JSON.stringify(visibleNodes));
    const simulationEdges: EnhancedNetworkEdge[] = JSON.parse(JSON.stringify(visibleEdges));
  
    const simulation = d3.forceSimulation<NetworkNode>(simulationNodes)
      .force("link", d3.forceLink<NetworkNode, EnhancedNetworkEdge>(simulationEdges)
        .id(d => d.id)
        .distance(d => {
          const baseDistance = 50;
          const degreeMultiplier = d.degree === 1 ? 0.8 : d.degree === 2 ? 1.2 : 1.8;
          return baseDistance * degreeMultiplier;
        })
        .strength(d => d.degree === 1 ? 0.7 : d.degree === 2 ? 0.3 : 0.1)
      )
      .force("charge", d3.forceManyBody<NetworkNode>().strength(-80).distanceMax(300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<NetworkNode>().radius(d => (d.size) / 2 + 6).strength(0.8));
  
    simulationRef.current = simulation;
  
    const edgeElements = edgesGroup.selectAll<SVGLineElement, EnhancedNetworkEdge>(".edge")
      .data(simulationEdges).enter().append("line")
      .attr("class", "edge")
      .attr("stroke", d => getMultiDegreeLinkColor(d.degree || 1))
      .attr("stroke-width", d => getMultiDegreeLinkWidth(d.degree || 1, d.width || 2))
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", d => d.degree === 2 ? "5,5" : d.degree === 3 ? "3,3" : "none");
  
    const nodeElements = nodesGroup.selectAll<SVGCircleElement, NetworkNode>(".node")
      .data(simulationNodes).enter().append("circle")
      .attr("class", "node")
      .attr("r", d => d.size / 2)
      .attr("fill", d => d.type === 'primary' ? 'url(#primaryGradient)' : d.type === 'secondary' ? 'url(#secondaryGradient)' : 'url(#serviceGradient)')
      .attr("stroke", "#fff").attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", (event, d) => handleNodeClick(d, event));
  
    const labelElements = nodesGroup.selectAll<SVGTextElement, NetworkNode>(".node-label")
      .data(simulationNodes).enter().append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle").attr("dy", ".3em")
      .style("font-size", "10px").style("fill", "#374151")
      .style("pointer-events", "none")
      .text(d => d.phoneNumber.slice(-4));
  
    simulation.on("tick", () => {
      edgeElements
        .attr("x1", d => (d.source as NetworkNode).x || 0)
        .attr("y1", d => (d.source as NetworkNode).y || 0)
        .attr("x2", d => (d.target as NetworkNode).x || 0)
        .attr("y2", d => (d.target as NetworkNode).y || 0);
      nodeElements
        .attr("cx", d => d.x || 0)
        .attr("cy", d => d.y || 0);
      labelElements
        .attr("x", d => d.x || 0)
        .attr("y", d => (d.y || 0) + d.size / 2 + 12);
    });
  
    simulation.on("end", () => setIsSimulationRunning(false));
  
    // Setup zoom behavior within the same effect
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => {
            zoomGroup.attr("transform", event.transform.toString());
        });
    svg.call(zoomBehavior);
    zoomRef.current = zoomBehavior;
  
    // PROPER CLEANUP FUNCTION: This runs when dependencies change, before the effect runs again.
    return () => {
      simulation.stop();
      svg.on(".zoom", null); // Detach the zoom listener to prevent memory leaks
    };
  }, [visibleNodes, visibleEdges, dimensions, handleNodeClick]);


  // Control functions now use the zoomRef
  const zoomBy = useCallback((factor: number) => {
    if (svgRef.current && zoomRef.current) {
        d3.select(svgRef.current)
          .transition().duration(300)
          .call(zoomRef.current.scaleBy, factor);
    }
  }, []);

  const resetZoom = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
        d3.select(svgRef.current)
          .transition().duration(750)
          .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  }, []);

  const restartSimulation = useCallback(() => {
    if (simulationRef.current) {
        simulationRef.current.alpha(0.5).restart();
        setIsSimulationRunning(true);
    }
  }, []);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-gray-800 rounded-xl">
        <div className="text-center p-8">
            <Network className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No Data Source</h3>
            <p className="text-gray-600 dark:text-gray-400">Upload a file to begin analysis.</p>
        </div>
      </div>
    );
  }

  if (visibleNodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-gray-800 rounded-xl">
        <div className="text-center p-8">
            <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No Matching Results</h3>
            <p className="text-gray-600 dark:text-gray-400">No interactions found for the current filters or search term.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex-shrink-0 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/80 dark:border-gray-700/80">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Enhanced Network Graph</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <span>{visibleNodes.length} nodes</span>•
                        <span>{linkStats.total} connections</span>•
                        <span>Avg strength: {linkStats.avgStrength}%</span>
                        <button onClick={() => setShowAdvancedInfo(!showAdvancedInfo)} className="flex items-center gap-1 hover:text-blue-600"><Info className="w-3 h-3" />{showAdvancedInfo ? 'Hide' : 'Details'}</button>
                    </div>
                    {showAdvancedInfo && (
                        <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 sm:grid-cols-4 gap-x-4">
                            <div>Direct: <span className="font-medium text-red-600">{linkStats.direct}</span></div>
                            <div>2nd Deg: <span className="font-medium text-amber-600">{linkStats.secondary}</span></div>
                            <div>3rd Deg: <span className="font-medium text-gray-600">{linkStats.tertiary}</span></div>
                            <div>Multi-Total: <span className="font-medium">{linkStats.multiDegreeTotal}</span></div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => zoomBy(1.5)} className="p-2 text-gray-600 hover:text-blue-600 rounded-lg" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                    <button onClick={() => zoomBy(1 / 1.5)} className="p-2 text-gray-600 hover:text-blue-600 rounded-lg" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                    <button onClick={resetZoom} className="p-2 text-gray-600 hover:text-blue-600 rounded-lg" title="Reset Zoom"><Maximize className="w-4 h-4" /></button>
                    <button onClick={restartSimulation} className="p-2 text-gray-600 hover:text-green-600 rounded-lg" title="Restart Layout"><RotateCcw className="w-4 h-4" /></button>
                    {isSimulationRunning && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Simulation running..."></div>}
                </div>
            </div>
            <div className="relative mt-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search phone numbers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-700 border rounded-lg text-sm" />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-800"><X className="w-4 h-4" /></button>}
            </div>
        </div>

      <div ref={containerRef} className="flex-1 relative min-h-0 w-full overflow-hidden">
          <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full cursor-grab active:cursor-grabbing">
            <defs>
                <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#1D4ED8" /></linearGradient>
                <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#047857" /></linearGradient>
                <linearGradient id="serviceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#D97706" /></linearGradient>
            </defs>
          </svg>
        
        {selectedNode && showDetails && (
          <NodeDetails 
            node={selectedNode} 
            edges={visibleEdges} 
            position={detailsPosition} 
            onClose={() => { setShowDetails(false); setSelectedNode(null); }} 
            isVisible={showDetails && selectedNode !== null} 
          />
        )}
      </div>
      
        <div className="flex-shrink-0 w-full border-t p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Node Types</span>
                <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full"></div><span className="text-xs text-gray-700 dark:text-gray-300">Primary</span></div>
                    <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gradient-to-br from-green-600 to-green-800 rounded-full"></div><span className="text-xs text-gray-700 dark:text-gray-300">Secondary</span></div>
                    <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full"></div><span className="text-xs text-gray-700 dark:text-gray-300">Service</span></div>
                </div>
            </div>
            <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Connection Degrees</span>
                <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2"><div className="w-6 h-1 bg-red-500 rounded-full"></div><span className="text-xs text-gray-700 dark:text-gray-300">Direct ({linkStats.direct})</span></div>
                    <div className="flex items-center space-x-2"><div className="w-6 h-1 bg-amber-500 rounded-full" style={{ background: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 3px, transparent 3px, transparent 6px)' }}></div><span className="text-xs text-gray-700 dark:text-gray-300">2nd Deg ({linkStats.secondary})</span></div>
                    <div className="flex items-center space-x-2"><div className="w-6 h-1 bg-gray-400 rounded-full" style={{ background: 'repeating-linear-gradient(90deg, #6b7280 0, #6b7280 2px, transparent 2px, transparent 4px)' }}></div><span className="text-xs text-gray-700 dark:text-gray-300">3rd Deg ({linkStats.tertiary})</span></div>
                </div>
            </div>
            <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Link Quality</span>
                <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2"><div className="w-4 h-1 bg-red-500 rounded-full"></div><span className="text-xs text-gray-700 dark:text-gray-300">High</span></div>
                    <div className="flex items-center space-x-2"><div className="w-4 h-1 bg-amber-500 rounded-full"></div><span className="text-xs text-gray-700 dark:text-gray-300">Medium</span></div>
                    <div className="flex items-center space-x-2"><div className="w-4 h-1 bg-gray-400 rounded-full"></div><span className="text-xs text-gray-700 dark:text-gray-300">Low</span></div>
                </div>
            </div>
        </div>
    </div>
  );
};