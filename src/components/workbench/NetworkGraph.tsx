// src/components/NetworkGraph.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Network, Users, Zap, Search, Phone, MapPin, Smartphone, X, Download, ZoomIn, ZoomOut, RotateCcw, Maximize, Link as LinkIcon, TrendingUp } from 'lucide-react';
import * as d3 from 'd3';
import { useNetworkData, ExcelData, Filters, NetworkNode, NetworkEdge } from '../../hooks/useNetworkData'; // Adjust path
import { NodeDetails } from './NodeDetails'; // Adjust path
import { classifyNetworkEdges, EnhancedNetworkEdge, getLinkClassificationColor, getLinkClassificationWidth } from '../../utils/link-classification'; // Adjust path

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

interface NetworkGraphProps {
  data: ExcelData | null;
  filters: Filters;
  onIndividualSelect: (individual: Individual) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ data, filters, onIndividualSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<NetworkNode, EnhancedNetworkEdge> | null>(null);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  // Use the custom hook for data processing
  const networkData = useNetworkData(data, filters);

  // Enhanced edges with classification
  const enhancedEdges = useMemo(() => {
    if (!data?.listings || networkData.edges.length === 0) return [];
    return classifyNetworkEdges(networkData.edges, data.listings);
  }, [networkData.edges, data?.listings]);

  // Updated section of NetworkGraph.tsx - Replace the filteredEnhancedEdges useMemo

const filteredEnhancedEdges = useMemo(() => {
  if (!enhancedEdges || enhancedEdges.length === 0) return [];
  
  // Provide safe defaults for all filter properties that might be undefined
  const safeFilters = {
    linkTypes: filters.linkTypes || ['primary', 'secondary', 'weak'],
    minStrengthScore: filters.minStrengthScore ?? 0,
    showWeakLinks: filters.showWeakLinks ?? true,
  };
  
  return enhancedEdges.filter(edge => {
    // Safe to use .includes() now since we guaranteed linkTypes is an array
    if (!safeFilters.linkTypes.includes(edge.linkStrength.classification)) {
      return false;
    }
    
    if (edge.linkStrength.strengthScore < safeFilters.minStrengthScore) {
      return false;
    }
    
    if (!safeFilters.showWeakLinks && edge.linkStrength.classification === 'weak') {
      return false;
    }
    
    return true;
  });
}, [enhancedEdges, filters]);
  // Filter nodes based on search and connected edges
  const visibleNodes = useMemo(() => {
    let filtered = networkData.nodes;
    
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(node => 
        node.phoneNumber.toLowerCase().includes(lowerSearch)
      );
    }
    
    const connectedNodeIds = new Set<string>();
    filteredEnhancedEdges.forEach(edge => {
      connectedNodeIds.add(typeof edge.source === 'string' ? edge.source : edge.source.id);
      connectedNodeIds.add(typeof edge.target === 'string' ? edge.target : edge.target.id);
    });
    
    // Only return nodes that are part of a visible edge, unless there are no visible edges
    if (filteredEnhancedEdges.length > 0) {
      return filtered.filter(node => connectedNodeIds.has(node.id));
    }
    return filtered;

  }, [networkData.nodes, searchTerm, filteredEnhancedEdges]);

  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return filteredEnhancedEdges.filter(edge => 
      visibleNodeIds.has(typeof edge.source === 'object' ? edge.source.id : edge.source) &&
      visibleNodeIds.has(typeof edge.target === 'object' ? edge.target.id : edge.target)
    );
  }, [filteredEnhancedEdges, visibleNodes]);

  // Link statistics for display
  const linkStats = useMemo(() => {
    const total = enhancedEdges.length;
    const primary = enhancedEdges.filter(e => e.linkStrength.classification === 'primary').length;
    const secondary = enhancedEdges.filter(e => e.linkStrength.classification === 'secondary').length;
    const weak = enhancedEdges.filter(e => e.linkStrength.classification === 'weak').length;
    const avgStrength = enhancedEdges.length > 0 
      ? Math.round(enhancedEdges.reduce((sum, e) => sum + e.linkStrength.strengthScore, 0) / enhancedEdges.length)
      : 0;
    
    return { total, primary, secondary, weak, avgStrength };
  }, [enhancedEdges]);

  // D3 Force Simulation Setup
  useEffect(() => {
    if (!svgRef.current || visibleNodes.length === 0) return;

    setIsSimulationRunning(true);

    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;

    const simulation = d3.forceSimulation<NetworkNode>(visibleNodes)
      .force("link", d3.forceLink<NetworkNode, EnhancedNetworkEdge>(visibleEdges)
        .id(d => d.id)
        .distance(d => {
          const baseDistance = Math.min(120, 40 + d.width * 5);
          const strengthMultiplier = d.linkStrength ? 
            (d.linkStrength.classification === 'primary' ? 0.7 : 
             d.linkStrength.classification === 'secondary' ? 0.85 : 1.2) : 1;
          return baseDistance * strengthMultiplier;
        })
        .strength(d => d.linkStrength ? (d.linkStrength.classification === 'primary' ? 0.5 : d.linkStrength.classification === 'secondary' ? 0.4 : 0.2) : 0.3)
      )
      .force("charge", d3.forceManyBody<NetworkNode>()
        .strength(d => (visibleNodes.length > 100 ? -30 : -50) * (d.size / 20))
        .distanceMax(200)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<NetworkNode>().radius(d => d.size / 2 + 5).strength(0.8))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    simulationRef.current = simulation;

    simulation.on("tick", () => {
      svg.selectAll<SVGCircleElement, NetworkNode>(".node").attr("cx", d => d.x || 0).attr("cy", d => d.y || 0);
      svg.selectAll<SVGLineElement, EnhancedNetworkEdge>(".edge").attr("x1", d => (d.source as NetworkNode).x || 0).attr("y1", d => (d.source as NetworkNode).y || 0).attr("x2", d => (d.target as NetworkNode).x || 0).attr("y2", d => (d.target as NetworkNode).y || 0);
      svg.selectAll<SVGTextElement, NetworkNode>(".node-label").attr("x", d => d.x || 0).attr("y", d => (d.y || 0) + d.size / 2 + 15);
    });

    simulation.on("end", () => setIsSimulationRunning(false));
    return () => simulation.stop();
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
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 10]).on("zoom", (event) => {
      setTransform(event.transform);
      g.attr("transform", event.transform.toString());
    });
    svg.call(zoom);
    svg.call(zoom.transform, transform);
    return () => { svg.on(".zoom", null); };
  }, [transform]);

  const handleNodeClick = useCallback((node: NetworkNode, event: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newSelectedNode = selectedNode?.id === node.id ? null : node;
    setSelectedNode(newSelectedNode);
    if (newSelectedNode) {
      setDetailsPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      setShowDetails(true);
      onIndividualSelect({ id: node.id, phoneNumber: node.phoneNumber, imei: node.imei, interactions: node.interactions, details: { type: node.type, size: node.size, location: node.location } });
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
  
  // Control functions
  const resetZoom = useCallback(() => { if (svgRef.current) d3.select(svgRef.current).transition().duration(750).call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity); }, []);
  const zoomIn = useCallback(() => { if (svgRef.current) d3.select(svgRef.current).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.5); }, []);
  const zoomOut = useCallback(() => { if (svgRef.current) d3.select(svgRef.current).transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1 / 1.5); }, []);
  const restartSimulation = useCallback(() => { if (simulationRef.current) { simulationRef.current.alpha(0.3).restart(); setIsSimulationRunning(true); } }, []);

  if (networkData.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
            <Network className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Network Data Available</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            {!data?.listings ? 'No data source provided.' : 'No interactions found matching the current filters.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Controls */}
      <div className="flex-shrink-0 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"><Network className="w-5 h-5 text-white" /></div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Network Graph</h3>
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>{visibleNodes.length} visible nodes</span><span>•</span><span>{visibleEdges.length} visible links</span><span>•</span><span>Avg strength: {linkStats.avgStrength}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={zoomIn} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={zoomOut} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
            <button onClick={resetZoom} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg" title="Reset Zoom"><Maximize className="w-4 h-4" /></button>
            <button onClick={restartSimulation} className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg" title="Restart Layout"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search phone numbers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg text-sm" />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1"><X className="w-3 h-3" /></button>}
        </div>
      </div>
      
      {/* Network Visualization */}
      <div ref={containerRef} className="flex-1 relative min-h-0 w-full overflow-hidden">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full cursor-grab active:cursor-grabbing">
            {/* SVG Defs */}
            <defs>
              <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#1D4ED8" /></linearGradient>
              <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#047857" /></linearGradient>
              <linearGradient id="serviceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#D97706" /></linearGradient>
              <filter id="shadow"><feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/></filter>
              <filter id="linkGlow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <g className="zoom-group">
              {/* Edges */}
              <g className="edges">
                {visibleEdges.map(edge => {
                  const sourceNode = edge.source as NetworkNode;
                  const targetNode = edge.target as NetworkNode;
                  const isHighlighted = selectedNode && (connectedNodeIds.has(sourceNode.id) && connectedNodeIds.has(targetNode.id));
                  const isHovered = hoveredEdgeId === edge.id;
                  const isDimmed = selectedNode && !isHighlighted;
                  const edgeColor = getLinkClassificationColor(edge.linkStrength.classification);
                  const edgeWidth = getLinkClassificationWidth(edge.linkStrength.classification, edge.width);
                  
                  return (
                    <g key={edge.id}>
                      <line className="edge" x1={sourceNode.x || 0} y1={sourceNode.y || 0} x2={targetNode.x || 0} y2={targetNode.y || 0} stroke={isHighlighted ? "#fbbf24" : edgeColor} strokeWidth={isHighlighted ? edgeWidth + 2 : edgeWidth} opacity={isDimmed ? 0.15 : isHighlighted || isHovered ? 0.9 : 0.7} strokeLinecap="round" style={{ transition: 'all 0.3s ease', filter: isHighlighted || isHovered ? 'url(#linkGlow)' : 'none', cursor: 'pointer' }} onMouseEnter={() => setHoveredEdgeId(edge.id)} onMouseLeave={() => setHoveredEdgeId(null)} />
                      {isHovered && (
                        <g style={{ pointerEvents: 'none' }}>
                           <rect x={((sourceNode.x || 0) + (targetNode.x || 0)) / 2 - 40} y={((sourceNode.y || 0) + (targetNode.y || 0)) / 2 - 25} width="80" height="20" fill="rgba(0,0,0,0.8)" rx="4"/>
                           <text x={((sourceNode.x || 0) + (targetNode.x || 0)) / 2} y={((sourceNode.y || 0) + (targetNode.y || 0)) / 2 - 10} textAnchor="middle" fontSize="10px" fill="white">Strength: {edge.linkStrength.strengthScore}%</text>
                        </g>
                      )}
                    </g>
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
                  const gradientId = node.type === 'primary' ? 'primaryGradient' : node.type === 'service' ? 'serviceGradient' : 'secondaryGradient';
                  return (
                    <g key={node.id} className="node-group">
                      {isSelected && <circle cx={node.x || 0} cy={node.y || 0} r={node.size / 2 + 8} fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.8" className="animate-pulse" />}
                      <circle cx={node.x || 0} cy={node.y || 0} r={node.size / 2} fill="rgba(0,0,0,0.1)" transform="translate(2,2)" />
                      <circle className="node" cx={node.x || 0} cy={node.y || 0} r={node.size / 2} fill={`url(#${gradientId})`} stroke="white" strokeWidth="3" opacity={isDimmed ? 0.3 : 1} style={{ cursor: 'pointer', transition: 'all 0.3s ease', filter: isSelected || isHovered ? 'url(#shadow)' : 'none' }} onClick={(e) => handleNodeClick(node, e as any)} onMouseEnter={() => setHoveredNodeId(node.id)} onMouseLeave={() => setHoveredNodeId(null)} />
                      {(isHovered || isSelected) && <text className="node-label" x={node.x || 0} y={(node.y || 0) + node.size / 2 + 20} textAnchor="middle" fontSize="12px" fill="white" stroke="rgba(0,0,0,0.8)" strokeWidth="3" paintOrder="stroke" fontWeight="600" style={{ pointerEvents: 'none' }}>{node.phoneNumber}</text>}
                      {node.interactions > 10 && !isDimmed && <g transform={`translate(${(node.x || 0) + node.size / 2 - 8}, ${(node.y || 0) - node.size / 2 + 8})`}><circle r="10" fill="#ef4444" /><text textAnchor="middle" y="4" fontSize="8px" fill="white" fontWeight="bold">{node.interactions > 99 ? '99+' : node.interactions}</text></g>}
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
        )}
        <NodeDetails node={selectedNode} edges={visibleEdges} position={detailsPosition} onClose={() => { setShowDetails(false); setSelectedNode(null); }} isVisible={showDetails && selectedNode !== null} />
      </div>
      
      {/* Legend */}
      <div className="flex-shrink-0 w-full border-t bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-4"><span className="text-sm font-semibold">Node Types:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full"></div><span className="text-xs">Primary</span></div>
                <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gradient-to-br from-green-600 to-green-800 rounded-full"></div><span className="text-xs">Secondary</span></div>
                <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full"></div><span className="text-xs">Service</span></div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-4"><span className="text-sm font-semibold">Link Strength:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2"><div className="w-6 h-1 bg-red-500 rounded-full"></div><span className="text-xs">Primary ({linkStats.primary})</span></div>
                <div className="flex items-center space-x-2"><div className="w-6 h-1 bg-amber-500 rounded-full"></div><span className="text-xs">Secondary ({linkStats.secondary})</span></div>
                <div className="flex items-center space-x-2"><div className="w-6 h-1 bg-gray-400 rounded-full"></div><span className="text-xs">Weak ({linkStats.weak})</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};