// src/components/NetworkGraph.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Network, Users, Zap, Search, Phone, MapPin, Smartphone, X, Download, ZoomIn, ZoomOut, RotateCcw, Maximize, Link as LinkIcon, TrendingUp, GitBranch, Info } from 'lucide-react';
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

// Helper functions remain the same
const getNodeId = (node: NetworkNode | string | undefined | null): string => {
  if (!node) return '';
  return typeof node === 'string' ? node : (node.id || '');
};

const getEdgeNodeId = (node: NetworkNode | string | undefined | null): string => {
  if (!node) return '';
  return typeof node === 'object' ? (node.id || '') : String(node);
};

const isValidNode = (node: any): node is NetworkNode => {
  return node && 
         typeof node === 'object' && 
         typeof node.id === 'string' && 
         node.id.trim() !== '' &&
         typeof node.phoneNumber === 'string';
};

const isValidEdge = (edge: any): edge is EnhancedNetworkEdge => {
  return edge && 
         typeof edge === 'object' && 
         edge.source && 
         edge.target &&
         getEdgeNodeId(edge.source) !== '' &&
         getEdgeNodeId(edge.target) !== '';
};

export const EnhancedNetworkGraph: React.FC<EnhancedNetworkGraphProps> = ({
  data,
  filters,
  onIndividualSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<NetworkNode, EnhancedNetworkEdge> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const isInitializedRef = useRef(false);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Safely process and validate nodes
  const processedNodes = useMemo(() => {
    if (!networkData?.nodes || !Array.isArray(networkData.nodes)) return [];
    
    return networkData.nodes
      .filter(isValidNode)
      .map(node => ({
        ...node,
        id: node.id || String(Math.random()),
        phoneNumber: node.phoneNumber || '',
        size: Math.max(10, Math.min(50, node.size || 20)),
        x: node.x || 0,
        y: node.y || 0,
        type: node.type || 'unknown',
        interactions: node.interactions || 0
      }));
  }, [networkData?.nodes]);

  // Safely process and validate edges
  const processedEdges = useMemo(() => {
    if (!networkData?.edges || !Array.isArray(networkData.edges) || processedNodes.length === 0) return [];
    
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

  // Filter nodes based on search
  const visibleNodes = useMemo(() => {
    if (!processedNodes || processedNodes.length === 0) return [];
    
    let filtered = processedNodes;

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(node => 
        node.phoneNumber.toLowerCase().includes(lowerSearch)
      );
    }

    if (processedEdges && processedEdges.length > 0) {
      const connectedNodeIds = new Set<string>();
      processedEdges.forEach(edge => {
        connectedNodeIds.add(getEdgeNodeId(edge.source));
        connectedNodeIds.add(getEdgeNodeId(edge.target));
      });

      return filtered.filter(node => connectedNodeIds.has(node.id));
    }
    
    return filtered;
  }, [processedNodes, searchTerm, processedEdges]);

  // Filter edges based on visible nodes
  const visibleEdges = useMemo(() => {
    if (!processedEdges || processedEdges.length === 0 || !visibleNodes || visibleNodes.length === 0) return [];
    
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return processedEdges.filter(edge => {
      const sourceId = getEdgeNodeId(edge.source);
      const targetId = getEdgeNodeId(edge.target);
      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });
  }, [processedEdges, visibleNodes]);

  // Enhanced link statistics for display
  const linkStats = useMemo(() => {
    if (!visibleEdges || visibleEdges.length === 0) {
      return {
        total: 0,
        direct: 0,
        secondary: 0,
        tertiary: 0,
        avgStrength: 0,
        multiDegreeTotal: networkData?.stats?.totalMultiDegreeLinks || 0
      };
    }

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
      multiDegreeTotal: networkData?.stats?.totalMultiDegreeLinks || 0
    };
  }, [visibleEdges, networkData?.stats]);

  // CRITICAL: Comprehensive cleanup function
  const cleanupSimulation = useCallback(() => {
    // Clear any pending timeouts
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }

    // Stop simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
      simulationRef.current = null;
    }

    // Clean up zoom behavior
    if (zoomRef.current && svgRef.current) {
      try {
        d3.select(svgRef.current).on('.zoom', null);
        zoomRef.current = null;
      } catch (error) {
        console.warn('Error cleaning up zoom:', error);
      }
    }

    // Clear SVG content ONLY if the element exists and has content
    if (svgRef.current) {
      try {
        const svg = d3.select(svgRef.current);
        if (!svg.empty()) {
          svg.selectAll('*').remove();
        }
      } catch (error) {
        console.warn('Error clearing SVG content:', error);
      }
    }

    setIsSimulationRunning(false);
    isInitializedRef.current = false;
  }, []);

  // Handle container resize with debouncing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDimensions({ width: rect.width, height: rect.height });
        }
      }
    };

    const debouncedResize = debounce(handleResize, 100);
    
    const observer = new ResizeObserver(debouncedResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
      handleResize();
    }

    return () => {
      observer.disconnect();
      debouncedResize.cancel();
    };
  }, []);

  // Node click handler
  const handleNodeClick = useCallback((node: NetworkNode, event: MouseEvent) => {
    if (!node || !containerRef.current) return;
    
    try {
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
    } catch (error) {
      console.error('Error handling node click:', error);
    }
  }, [selectedNode, onIndividualSelect]);

  // Main D3 visualization effect
  useEffect(() => {
    // Early exit conditions
    if (!svgRef.current || !containerRef.current || !visibleNodes || visibleNodes.length === 0) {
      cleanupSimulation();
      return;
    }

    // Prevent re-initialization during the same render cycle
    if (dimensions.width <= 0 || dimensions.height <= 0) {
      return;
    }

    // Clean up previous simulation
    cleanupSimulation();
    
    // Set running state
    setIsSimulationRunning(true);

    // Add a small delay to ensure DOM is ready
    cleanupTimeoutRef.current = setTimeout(() => {
      if (!svgRef.current || !containerRef.current) {
        setIsSimulationRunning(false);
        return;
      }

      try {
        initializeVisualization();
      } catch (error) {
        console.error('Error initializing visualization:', error);
        setIsSimulationRunning(false);
      }
    }, 10);

    return cleanupSimulation;
  }, [visibleNodes, visibleEdges, dimensions, cleanupSimulation]);

  // Separate initialization function to reduce complexity
  const initializeVisualization = () => {
    if (!svgRef.current || !visibleNodes || visibleNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;

    // Create main group for zoom transforms
    const zoomGroup = svg.append("g").attr("class", "zoom-group");

    // Add gradients and filters
    const defs = svg.append("defs");
    
    // Primary gradient
    const primaryGradient = defs.append("linearGradient")
      .attr("id", "primaryGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    primaryGradient.append("stop").attr("offset", "0%").attr("stop-color", "#3B82F6");
    primaryGradient.append("stop").attr("offset", "100%").attr("stop-color", "#1D4ED8");

    // Secondary gradient
    const secondaryGradient = defs.append("linearGradient")
      .attr("id", "secondaryGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    secondaryGradient.append("stop").attr("offset", "0%").attr("stop-color", "#10B981");
    secondaryGradient.append("stop").attr("offset", "100%").attr("stop-color", "#047857");

    // Service gradient
    const serviceGradient = defs.append("linearGradient")
      .attr("id", "serviceGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    serviceGradient.append("stop").attr("offset", "0%").attr("stop-color", "#F59E0B");
    serviceGradient.append("stop").attr("offset", "100%").attr("stop-color", "#D97706");

    // Create a safe copy of nodes with required properties
    const simulationNodes: NetworkNode[] = visibleNodes.map(node => ({
      ...node,
      x: node.x || width / 2 + (Math.random() - 0.5) * 100,
      y: node.y || height / 2 + (Math.random() - 0.5) * 100,
      vx: 0,
      vy: 0
    }));

    // Create simulation
    const simulation = d3.forceSimulation<NetworkNode>(simulationNodes)
      .force("link", d3.forceLink<NetworkNode, EnhancedNetworkEdge>(visibleEdges)
        .id(d => d.id || '')
        .distance(d => {
          const baseDistance = Math.min(120, 40 + (d.width || 1) * 5);
          let degreeMultiplier = 1;
          if (d.degree === 1) degreeMultiplier = 0.7;
          else if (d.degree === 2) degreeMultiplier = 1.2;
          else if (d.degree === 3) degreeMultiplier = 1.8;
          
          const strengthMultiplier = d.linkStrength ? 
            (d.linkStrength.classification === 'primary' ? 0.8 : 
             d.linkStrength.classification === 'secondary' ? 1.0 : 1.3) : 1;
          
          return baseDistance * degreeMultiplier * strengthMultiplier;
        })
        .strength(d => {
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

    // Create groups
    const edgesGroup = zoomGroup.append("g").attr("class", "edges");
    const nodesGroup = zoomGroup.append("g").attr("class", "nodes");

    // Draw edges
    const edgeElements = edgesGroup.selectAll<SVGLineElement, EnhancedNetworkEdge>(".edge")
      .data(visibleEdges)
      .enter()
      .append("line")
      .attr("class", "edge")
      .attr("stroke", d => {
        const color = getMultiDegreeLinkColor?.(d.degree || 1) || '#999';
        return color;
      })
      .attr("stroke-width", d => {
        const width = getMultiDegreeLinkWidth?.(d.degree || 1, d.width || 2) || 2;
        return width;
      })
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", d => d.degree === 2 ? "5,5" : d.degree === 3 ? "3,3" : "none");

    // Draw nodes
    const nodeElements = nodesGroup.selectAll<SVGCircleElement, NetworkNode>(".node")
      .data(simulationNodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", d => d.size / 2)
      .attr("fill", d => {
        switch(d.type) {
          case 'primary': return 'url(#primaryGradient)';
          case 'secondary': return 'url(#secondaryGradient)';
          case 'service': return 'url(#serviceGradient)';
          default: return '#6b7280';
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        event.stopPropagation();
        handleNodeClick(d, event);
      })
      .on("mouseover", function(event, d) {
        setHoveredNodeId(d.id);
      })
      .on("mouseout", function() {
        setHoveredNodeId(null);
      });

    // Add labels
    const labelElements = nodesGroup.selectAll<SVGTextElement, NetworkNode>(".node-label")
      .data(simulationNodes)
      .enter()
      .append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .style("font-size", "10px")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .text(d => d.phoneNumber.substring(d.phoneNumber.length - 4));

    // Simulation tick handler
    simulation.on("tick", () => {
      try {
        edgeElements
          .attr("x1", d => (d.source as NetworkNode)?.x || 0)
          .attr("y1", d => (d.source as NetworkNode)?.y || 0)
          .attr("x2", d => (d.target as NetworkNode)?.x || 0)
          .attr("y2", d => (d.target as NetworkNode)?.y || 0);
        
        nodeElements
          .attr("cx", d => d.x || 0)
          .attr("cy", d => d.y || 0);
        
        labelElements
          .attr("x", d => d.x || 0)
          .attr("y", d => (d.y || 0) + d.size / 2 + 15);
      } catch (error) {
        console.warn('Error updating positions:', error);
      }
    });

    simulation.on("end", () => setIsSimulationRunning(false));

    // Setup zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        try {
          setTransform(event.transform);
          zoomGroup.attr("transform", event.transform.toString());
        } catch (error) {
          console.warn('Error during zoom:', error);
        }
      });

    svg.call(zoom);
    svg.call(zoom.transform, transform);
    zoomRef.current = zoom;

    isInitializedRef.current = true;
  };

  const connectedNodeIds = useMemo(() => {
    if (!selectedNode || !visibleEdges) return new Set<string>();
    
    const connected = new Set<string>([selectedNode.id]);
    visibleEdges.forEach(edge => {
      const sourceId = getEdgeNodeId(edge.source);
      const targetId = getEdgeNodeId(edge.target);
      
      if (sourceId === selectedNode.id) connected.add(targetId);
      if (targetId === selectedNode.id) connected.add(sourceId);
    });
    return connected;
  }, [selectedNode, visibleEdges]);

  // Control functions
  const resetZoom = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      try {
        d3.select(svgRef.current)
          .transition()
          .duration(750)
          .call(zoomRef.current.transform, d3.zoomIdentity);
      } catch (error) {
        console.warn('Error resetting zoom:', error);
      }
    }
  }, []);

  const zoomIn = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      try {
        d3.select(svgRef.current)
          .transition()
          .duration(300)
          .call(zoomRef.current.scaleBy, 1.5);
      } catch (error) {
        console.warn('Error zooming in:', error);
      }
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      try {
        d3.select(svgRef.current)
          .transition()
          .duration(300)
          .call(zoomRef.current.scaleBy, 1 / 1.5);
      } catch (error) {
        console.warn('Error zooming out:', error);
      }
    }
  }, []);

  const restartSimulation = useCallback(() => {
    if (simulationRef.current) {
      try {
        simulationRef.current.alpha(0.3).restart();
        setIsSimulationRunning(true);
      } catch (error) {
        console.warn('Error restarting simulation:', error);
      }
    }
  }, []);

  // Early return for no data
  if (!networkData || !processedNodes || processedNodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
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
                <span>{visibleNodes?.length || 0} nodes</span>
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
            {/* SVG content will be managed by D3 */}
          </svg>
        )}
        
        {selectedNode && showDetails && (
          <NodeDetails 
            node={selectedNode} 
            edges={visibleEdges || []} 
            position={detailsPosition} 
            onClose={() => { 
              setShowDetails(false); 
              setSelectedNode(null); 
            }} 
            isVisible={showDetails && selectedNode !== null} 
          />
        )}
      </div>
      
      {/* Enhanced Legend */}
      <div className="flex-shrink-0 w-full border-t bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Node Types:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full"></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Primary</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-green-600 to-green-800 rounded-full"></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Secondary</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full"></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Service</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Connection Degrees:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-1 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Direct ({linkStats.direct})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-1 bg-amber-500 rounded-full" style={{ background: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 3px, transparent 3px, transparent 6px)' }}></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">2nd Deg ({linkStats.secondary})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-1 bg-gray-400 rounded-full" style={{ background: 'repeating-linear-gradient(90deg, #6b7280 0, #6b7280 2px, transparent 2px, transparent 4px)' }}></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">3rd Deg ({linkStats.tertiary})</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Link Quality:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-amber-500 rounded-full"></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}