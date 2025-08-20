// src/components/NetworkGraph.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Network, Users, Zap, Search, Phone, MapPin, Smartphone, X, Download, ZoomIn, ZoomOut, RotateCcw, Maximize, Link as LinkIcon, TrendingUp, GitBranch, Info } from 'lucide-react';
import * as d3 from 'd3';
import { useEnhancedNetworkData, NetworkNode, EnhancedNetworkEdge, ExcelData, EnhancedFilters } from '../../hooks/useEnhancedNetworkData'; // Adjust path
import { NodeDetails } from './NodeDetails'; // Adjust path
import { getMultiDegreeLinkColor, getMultiDegreeLinkWidth } from '../../utils/multi-degree-link-anlysis'; // Adjust path

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

export const EnhancedNetworkGraph: React.FC<EnhancedNetworkGraphProps> = ({ 
  data, 
  filters, 
  onIndividualSelect 
}) => {
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
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);

  // Use the enhanced hook for data processing
  const networkData = useEnhancedNetworkData(data, filters);

  // Filter nodes based on search
  const visibleNodes = useMemo(() => {
    let filtered = networkData.nodes;
    
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(node => 
        node.phoneNumber.toLowerCase().includes(lowerSearch)
      );
    }
    
    // If there are contact filters, ensure we only show connected nodes
    const connectedNodeIds = new Set<string>();
    networkData.edges.forEach(edge => {
      connectedNodeIds.add(typeof edge.source === 'string' ? edge.source : edge.source.id);
      connectedNodeIds.add(typeof edge.target === 'string' ? edge.target : edge.target.id);
    });
    
    // Only return nodes that are part of a visible edge, unless there are no visible edges
    if (networkData.edges.length > 0) {
      return filtered.filter(node => connectedNodeIds.has(node.id));
    }
    return filtered;

  }, [networkData.nodes, searchTerm, networkData.edges]);

  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return networkData.edges.filter(edge => 
      visibleNodeIds.has(typeof edge.source === 'object' ? edge.source.id : edge.source) &&
      visibleNodeIds.has(typeof edge.target === 'object' ? edge.target.id : edge.target)
    );
  }, [networkData.edges, visibleNodes]);

  // Enhanced link statistics for display
  const linkStats = useMemo(() => {
    const directLinks = visibleEdges.filter(e => e.degree === 1).length;
    const secondaryLinks = visibleEdges.filter(e => e.degree === 2).length;
    const tertiaryLinks = visibleEdges.filter(e => e.degree === 3).length;
    const totalLinks = visibleEdges.length;
    
    const avgStrength = visibleEdges.length > 0 
      ? Math.round(visibleEdges.reduce((sum, e) => 
          sum + (e.linkStrength?.strengthScore || 0), 0) / visibleEdges.length)
      : 0;
    
    return { 
      total: totalLinks,
      direct: directLinks, 
      secondary: secondaryLinks, 
      tertiary: tertiaryLinks, 
      avgStrength,
      multiDegreeTotal: networkData.stats.totalMultiDegreeLinks
    };
  }, [visibleEdges, networkData.stats]);

  // D3 Force Simulation Setup with enhanced multi-degree support
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
          
          // Adjust distance based on connection degree
          let degreeMultiplier = 1;
          if (d.degree === 1) degreeMultiplier = 0.7; // Closer for direct connections
          else if (d.degree === 2) degreeMultiplier = 1.2; // Medium distance for 2nd degree
          else if (d.degree === 3) degreeMultiplier = 1.8; // Farther for 3rd degree
          
          // Adjust based on link strength
          const strengthMultiplier = d.linkStrength ? 
            (d.linkStrength.classification === 'primary' ? 0.8 : 
             d.linkStrength.classification === 'secondary' ? 1.0 : 1.3) : 1;
          
          return baseDistance * degreeMultiplier * strengthMultiplier;
        })
        .strength(d => {
          // Stronger forces for direct connections, weaker for multi-degree
          if (d.degree === 1) return 0.6;
          else if (d.degree === 2) return 0.3;
          else if (d.degree === 3) return 0.1;
          return 0.2;
        })
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
      svg.selectAll<SVGCircleElement, NetworkNode>(".node")
        .attr("cx", d => d.x || 0)
        .attr("cy", d => d.y || 0);
      
      svg.selectAll<SVGLineElement, EnhancedNetworkEdge>(".edge")
        .attr("x1", d => (d.source as NetworkNode).x || 0)
        .attr("y1", d => (d.source as NetworkNode).y || 0)
        .attr("x2", d => (d.target as NetworkNode).x || 0)
        .attr("y2", d => (d.target as NetworkNode).y || 0);
      
      svg.selectAll<SVGTextElement, NetworkNode>(".node-label")
        .attr("x", d => d.x || 0)
        .attr("y", d => (d.y || 0) + d.size / 2 + 15);
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
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
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
      onIndividualSelect({ 
        id: node.id, 
        phoneNumber: node.phoneNumber, 
        imei: node.imei, 
        interactions: node.interactions, 
        details: { type: node.type, size: node.size, location: node.location } 
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
  
  // Control functions
  const resetZoom = useCallback(() => { 
    if (svgRef.current) 
      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity); 
  }, []);
  
  const zoomIn = useCallback(() => { 
    if (svgRef.current) 
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.5); 
  }, []);
  
  const zoomOut = useCallback(() => { 
    if (svgRef.current) 
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1 / 1.5); 
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
            {!data?.listings ? 'No data source provided.' : 'No interactions found matching the current filters.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Enhanced Header Controls */}
      <div className="flex-shrink-0 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Enhanced Network Graph</h3>
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>{visibleNodes.length} nodes</span>
                <span>•</span>
                <span>{linkStats.total} connections</span>
                <span>•</span>
                <span>Avg strength: {linkStats.avgStrength}%</span>
                <button
                  onClick={() => setShowAdvancedInfo(!showAdvancedInfo)}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Info className="w-3 h-3" />
                  {showAdvancedInfo ? 'Less' : 'More'}
                </button>
              </div>
              {showAdvancedInfo && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="grid grid-cols-4 gap-4">
                    <div>Direct: <span className="font-medium text-red-600">{linkStats.direct}</span></div>
                    <div>2nd Degree: <span className="font-medium text-amber-600">{linkStats.secondary}</span></div>
                    <div>3rd Degree: <span className="font-medium text-gray-600">{linkStats.tertiary}</span></div>
                    <div>Multi-total: <span className="font-medium">{linkStats.multiDegreeTotal}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={zoomIn} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={zoomOut} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={resetZoom} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg" title="Reset Zoom">
              <Maximize className="w-4 h-4" />
            </button>
            <button onClick={restartSimulation} className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg" title="Restart Layout">
              <RotateCcw className="w-4 h-4" />
            </button>
            {isSimulationRunning && (
              <div className="flex items-center gap-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-700 dark:text-blue-300">Calculating...</span>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search phone numbers..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border rounded-lg text-sm" 
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      
      {/* Network Visualization */}
      <div ref={containerRef} className="flex-1 relative min-h-0 w-full overflow-hidden">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full cursor-grab active:cursor-grabbing">
            {/* Enhanced SVG Defs */}
            <defs>
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
              <filter id="shadow">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
              </filter>
              <filter id="linkGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="multiDegreeGlow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Patterns for multi-degree links */}
              <pattern id="secondaryPattern" patternUnits="userSpaceOnUse" width="8" height="8">
                <rect width="8" height="8" fill="#f59e0b" opacity="0.3"/>
                <rect width="4" height="4" fill="#f59e0b" opacity="0.6"/>
              </pattern>
              <pattern id="tertiaryPattern" patternUnits="userSpaceOnUse" width="6" height="6">
                <circle cx="3" cy="3" r="1" fill="#6b7280" opacity="0.5"/>
              </pattern>
            </defs>
            <g className="zoom-group">
              {/* Enhanced Edges with Multi-Degree Support */}
              <g className="edges">
                {visibleEdges.map(edge => {
                  const sourceNode = edge.source as NetworkNode;
                  const targetNode = edge.target as NetworkNode;
                  const isHighlighted = selectedNode && (connectedNodeIds.has(sourceNode.id) && connectedNodeIds.has(targetNode.id));
                  const isHovered = hoveredEdgeId === edge.id;
                  const isDimmed = selectedNode && !isHighlighted;
                  
                  // Enhanced edge styling based on degree and classification
                  const edgeColor = edge.degree 
                    ? getMultiDegreeLinkColor(edge.degree as 1 | 2 | 3)
                    : (edge.linkStrength?.classification === 'primary' ? '#ef4444' : 
                       edge.linkStrength?.classification === 'secondary' ? '#f59e0b' : '#6b7280');
                  
                  const edgeWidth = edge.degree 
                    ? getMultiDegreeLinkWidth(edge.degree as 1 | 2 | 3, edge.width)
                    : Math.max(1, edge.width);
                  
                  const strokeDasharray = edge.degree === 2 ? "5,3" : edge.degree === 3 ? "2,2" : "none";
                  
                  return (
                    <g key={edge.id}>
                      <line 
                        className="edge" 
                        x1={sourceNode.x || 0} 
                        y1={sourceNode.y || 0} 
                        x2={targetNode.x || 0} 
                        y2={targetNode.y || 0} 
                        stroke={isHighlighted ? "#fbbf24" : edgeColor} 
                        strokeWidth={isHighlighted ? edgeWidth + 2 : edgeWidth} 
                        strokeDasharray={strokeDasharray}
                        opacity={isDimmed ? 0.15 : isHighlighted || isHovered ? 0.9 : (edge.degree === 1 ? 0.8 : 0.6)} 
                        strokeLinecap="round" 
                        style={{ 
                          transition: 'all 0.3s ease', 
                          filter: isHighlighted || isHovered ? 'url(#linkGlow)' : edge.degree === 1 ? 'none' : 'url(#multiDegreeGlow)',
                          cursor: 'pointer' 
                        }} 
                        onMouseEnter={() => setHoveredEdgeId(edge.id)} 
                        onMouseLeave={() => setHoveredEdgeId(null)} 
                      />
                      {isHovered && (
                        <g style={{ pointerEvents: 'none' }}>
                           <rect 
                             x={((sourceNode.x || 0) + (targetNode.x || 0)) / 2 - 45} 
                             y={((sourceNode.y || 0) + (targetNode.y || 0)) / 2 - 30} 
                             width="90" 
                             height="25" 
                             fill="rgba(0,0,0,0.8)" 
                             rx="4"
                           />
                           <text 
                             x={((sourceNode.x || 0) + (targetNode.x || 0)) / 2} 
                             y={((sourceNode.y || 0) + (targetNode.y || 0)) / 2 - 18} 
                             textAnchor="middle" 
                             fontSize="9px" 
                             fill="white"
                           >
                             {edge.degree === 1 ? 'Direct' : edge.degree === 2 ? '2nd Degree' : '3rd Degree'}
                           </text>
                           <text 
                             x={((sourceNode.x || 0) + (targetNode.x || 0)) / 2} 
                             y={((sourceNode.y || 0) + (targetNode.y || 0)) / 2 - 8} 
                             textAnchor="middle" 
                             fontSize="9px" 
                             fill="white"
                           >
                             Strength: {edge.linkStrength?.strengthScore || 0}%
                           </text>
                           {edge.degree && edge.degree > 1 && edge.path && (
                             <text 
                               x={((sourceNode.x || 0) + (targetNode.x || 0)) / 2} 
                               y={((sourceNode.y || 0) + (targetNode.y || 0)) / 2 + 2} 
                               textAnchor="middle" 
                               fontSize="8px" 
                               fill="#fbbf24"
                             >
                               Path: {edge.path.length - 2} intermediate{edge.path.length - 2 !== 1 ? 's' : ''}
                             </text>
                           )}
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
              
              {/* Enhanced Nodes */}
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
                      <circle 
                        cx={node.x || 0} 
                        cy={node.y || 0} 
                        r={node.size / 2} 
                        fill="rgba(0,0,0,0.1)" 
                        transform="translate(2,2)" 
                      />
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
                          filter: isSelected || isHovered ? 'url(#shadow)' : 'none' 
                        }} 
                        onClick={(e) => handleNodeClick(node, e as any)} 
                        onMouseEnter={() => setHoveredNodeId(node.id)} 
                        onMouseLeave={() => setHoveredNodeId(null)} 
                      />
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
                      {node.interactions > 10 && !isDimmed && (
                        <g transform={`translate(${(node.x || 0) + node.size / 2 - 8}, ${(node.y || 0) - node.size / 2 + 8})`}>
                          <circle r="10" fill="#ef4444" />
                          <text 
                            textAnchor="middle" 
                            y="4" 
                            fontSize="8px" 
                            fill="white" 
                            fontWeight="bold"
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
      </div>
      
      {/* Enhanced Legend */}
      <div className="flex-shrink-0 w-full border-t bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold">Node Types:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full"></div>
                  <span className="text-xs">Primary</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-green-600 to-green-800 rounded-full"></div>
                  <span className="text-xs">Secondary</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full"></div>
                  <span className="text-xs">Service</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold">Connection Degrees:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-1 bg-red-500 rounded-full"></div>
                  <span className="text-xs">Direct ({linkStats.direct})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-1 bg-amber-500 rounded-full" style={{ background: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 3px, transparent 3px, transparent 6px)' }}></div>
                  <span className="text-xs">2nd Deg ({linkStats.secondary})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-1 bg-gray-400 rounded-full" style={{ background: 'repeating-linear-gradient(90deg, #6b7280 0, #6b7280 2px, transparent 2px, transparent 4px)' }}></div>
                  <span className="text-xs">3rd Deg ({linkStats.tertiary})</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold">Link Quality:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-red-500 rounded-full"></div>
                  <span className="text-xs">High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-amber-500 rounded-full"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-gray-400 rounded-full"></div>
                  <span className="text-xs">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};