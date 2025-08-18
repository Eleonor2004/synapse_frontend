// src/components/NetworkGraph.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Network, Search, X, ZoomIn, ZoomOut, RotateCcw, Maximize } from 'lucide-react';
import * as d3 from 'd3';
import { useEnhancedNetworkData, NetworkNode, EnhancedNetworkEdge, ExcelData, EnhancedFilters } from '../../hooks/useEnhancedNetworkData'; // Adjust path
import { NodeDetails } from './NodeDetails'; // Adjust path
// Ensure these utility functions exist and are correctly typed
import { getLinkClassificationColor, getLinkClassificationWidth } from '../../utils/link-analysis'; // Adjust path as needed

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

// Define a type for node positions
type NodePositions = { [key: string]: { x: number; y: number } };

export const EnhancedNetworkGraph: React.FC<EnhancedNetworkGraphProps> = ({
    data,
    filters,
    onIndividualSelect
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const simulationRef = useRef<d3.Simulation<NetworkNode, EnhancedNetworkEdge>>();
    
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });
    const [transform, setTransform] = useState(d3.zoomIdentity);
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    
    // State to hold the positions calculated by D3
    const [nodePositions, setNodePositions] = useState<NodePositions>({});

    const networkData = useEnhancedNetworkData(data, filters);

    // Filter nodes based on search and connectivity
    const visibleNodes = useMemo(() => {
        let filtered = networkData.nodes;
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(node => node.phoneNumber.toLowerCase().includes(lowerSearch));
        }

        const connectedNodeIds = new Set<string>();
        networkData.edges.forEach(edge => {
            connectedNodeIds.add(typeof edge.source === 'string' ? edge.source : edge.source.id);
            connectedNodeIds.add(typeof edge.target === 'string' ? edge.target : edge.target.id);
        });

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

    // Memoized link statistics
    const linkStats = useMemo(() => {
        const primaryLinks = visibleEdges.filter(e => e.linkStrength?.classification === 'primary').length;
        const secondaryLinks = visibleEdges.filter(e => e.linkStrength?.classification === 'secondary').length;
        const weakLinks = visibleEdges.filter(e => e.linkStrength?.classification === 'weak').length;
        return { primary: primaryLinks, secondary: secondaryLinks, weak: weakLinks };
    }, [visibleEdges]);
    
    // D3 Force Simulation Setup
    useEffect(() => {
        if (!svgRef.current || visibleNodes.length === 0) {
            setIsSimulationRunning(false);
            return;
        }
        setIsSimulationRunning(true);
    
        const simulation = simulationRef.current ?? d3.forceSimulation<NetworkNode>();
    
        simulation
            .nodes(visibleNodes)
            .force("link", d3.forceLink<NetworkNode, EnhancedNetworkEdge>(visibleEdges)
                .id(d => d.id)
                .distance(d => d.linkStrength?.classification === 'primary' ? 80 : 120)
                .strength(d => d.linkStrength?.classification === 'primary' ? 0.6 : 0.3)
            )
            .force("charge", d3.forceManyBody<NetworkNode>().strength(-100).distanceMax(250))
            .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
            .force("collision", d3.forceCollide<NetworkNode>().radius(d => d.size / 2 + 8).strength(0.9))
            .alpha(0.3).restart();
    
        simulationRef.current = simulation;
    
        const tickHandler = () => {
            setNodePositions(prev => {
                const newPositions: NodePositions = {};
                simulation.nodes().forEach(node => {
                    newPositions[node.id] = { x: node.x || 0, y: node.y || 0 };
                });
                return newPositions;
            });
        };
    
        simulation.on("tick", tickHandler);
        simulation.on("end", () => setIsSimulationRunning(false));
    
        return () => {
            simulation.stop();
            simulation.on("tick", null); // Clean up the listener
            simulation.on("end", null);
        };
    }, [visibleNodes, visibleEdges, dimensions.width, dimensions.height]);

    // Handle container resize
    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    // D3 Zoom functionality
    useEffect(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 8])
            .on("zoom", (event) => {
                setTransform(event.transform);
            });
        svg.call(zoom);
        // This ensures the zoom transform is maintained on re-renders
        svg.call(zoom.transform, transform);

        return () => {
            // Detach zoom behavior
            svg.on(".zoom", null);
        };
    }, [transform]); // Re-apply if transform state changes from outside

    const handleNodeClick = useCallback((node: NetworkNode, event: React.MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const newSelectedNode = selectedNode?.id === node.id ? null : node;
        setSelectedNode(newSelectedNode);
        if (newSelectedNode) {
            setDetailsPosition({ x: event.clientX - rect.left + 15, y: event.clientY - rect.top + 15 });
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

    // Memoize connected node IDs for performance
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
    const zoomBy = (factor: number) => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        const zoom = d3.zoom<SVGSVGElement, unknown>();
        svg.transition().duration(300).call(zoom.scaleBy, factor);
    };
    const resetZoom = useCallback(() => {
        if (!svgRef.current) return;
        const svg = d3.select(svgRef.current);
        const zoom = d3.zoom<SVGSVGElement, unknown>();
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    }, []);
    const restartSimulation = useCallback(() => {
        if (simulationRef.current) {
            setIsSimulationRunning(true);
            simulationRef.current.alpha(0.5).restart();
        }
    }, []);

    // No Data Fallback
    if (networkData.nodes.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="text-center p-8">
                    <Network className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">No Network Data</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {!data ? 'Please provide a data source.' : 'No interactions match the current filters.'}
                    </p>
                </div>
            </div>
        );
    }
    
    // Main Component Render
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header Controls */}
            <div className="flex-shrink-0 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-600 rounded-lg"><Network className="w-5 h-5 text-white" /></div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Network Graph</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{visibleNodes.length} nodes, {visibleEdges.length} links</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => zoomBy(1.5)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                        <button onClick={() => zoomBy(0.66)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                        <button onClick={resetZoom} className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg" title="Reset View"><Maximize className="w-4 h-4" /></button>
                        <button onClick={restartSimulation} className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg disabled:opacity-50" title="Restart Layout" disabled={isSimulationRunning}><RotateCcw className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="relative mt-3">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search numbers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-8 py-2 bg-white dark:bg-gray-700 border rounded-lg text-sm" />
                    {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1"><X className="w-3 h-3 text-gray-500" /></button>}
                </div>
            </div>

            {/* Network Visualization */}
            <div ref={containerRef} className="flex-1 relative min-h-0 w-full overflow-hidden">
                {dimensions.width > 0 && (
                    <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full cursor-grab active:cursor-grabbing">
                        <defs>
                            <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#1D4ED8" /></linearGradient>
                            <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#047857" /></linearGradient>
                            <linearGradient id="serviceGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#D97706" /></linearGradient>
                            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.4"/></filter>
                        </defs>
                        <g transform={transform.toString()}>
                            {/* Edges */}
                            <g>
                                {visibleEdges.map(edge => {
                                    const sourcePos = nodePositions[(edge.source as NetworkNode).id];
                                    const targetPos = nodePositions[(edge.target as NetworkNode).id];
                                    if (!sourcePos || !targetPos) return null; // Edge is not ready to be rendered

                                    const isHighlighted = selectedNode && connectedNodeIds.has((edge.source as NetworkNode).id) && connectedNodeIds.has((edge.target as NetworkNode).id);
                                    const isDimmed = selectedNode && !isHighlighted;
                                    const edgeColor = getLinkClassificationColor(edge.linkStrength?.classification);
                                    const edgeWidth = getLinkClassificationWidth(edge.linkStrength?.classification, edge.width);

                                    return (
                                        <line key={edge.id} x1={sourcePos.x} y1={sourcePos.y} x2={targetPos.x} y2={targetPos.y}
                                            stroke={isHighlighted ? "#fbbf24" : edgeColor}
                                            strokeWidth={isHighlighted ? edgeWidth + 1.5 : edgeWidth}
                                            opacity={isDimmed ? 0.1 : 0.6}
                                            strokeLinecap="round"
                                            style={{ transition: 'all 250ms ease-out' }}
                                            onMouseEnter={() => setHoveredEdgeId(edge.id)}
                                            onMouseLeave={() => setHoveredEdgeId(null)}
                                        />
                                    );
                                })}
                            </g>
                            {/* Nodes */}
                            <g>
                                {visibleNodes.map(node => {
                                    const pos = nodePositions[node.id];
                                    if (!pos) return null; // Node is not ready to be rendered

                                    const isSelected = selectedNode?.id === node.id;
                                    const isHovered = hoveredNodeId === node.id;
                                    const isConnected = selectedNode && connectedNodeIds.has(node.id);
                                    const isDimmed = selectedNode && !isConnected;
                                    const gradientId = node.type === 'primary' ? 'primaryGradient' : node.type === 'service' ? 'serviceGradient' : 'secondaryGradient';

                                    return (
                                        <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}
                                            onClick={(e) => handleNodeClick(node, e as any)}
                                            onMouseEnter={() => setHoveredNodeId(node.id)}
                                            onMouseLeave={() => setHoveredNodeId(null)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {isSelected && <circle r={node.size / 2 + 6} fill="none" stroke="#fbbf24" strokeWidth="2.5" className="animate-pulse" />}
                                            <circle r={node.size / 2} fill={`url(#${gradientId})`} stroke="#fff" strokeWidth="2" opacity={isDimmed ? 0.3 : 1} style={{ filter: isSelected || isHovered ? 'url(#shadow)' : 'none', transition: 'all 250ms ease-out' }}/>
                                            {(isHovered || isSelected) && (
                                                <text y={node.size / 2 + 15} textAnchor="middle" fontSize="11px" fill="#fff" stroke="#000" strokeWidth="3px" paintOrder="stroke" fontWeight="500" style={{ pointerEvents: 'none' }}>
                                                    {node.phoneNumber}
                                                </text>
                                            )}
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
            <div className="flex-shrink-0 w-full border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="px-4 py-3 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4"><span className="text-sm font-semibold">Node Types:</span>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-600 rounded-full"></div><span className="text-xs">Primary</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-600 rounded-full"></div><span className="text-xs">Secondary</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded-full"></div><span className="text-xs">Service</span></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4"><span className="text-sm font-semibold">Link Strength:</span>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5"><div className="w-5 h-1 bg-red-500 rounded-full"></div><span className="text-xs">Primary ({linkStats.primary})</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-5 h-1 bg-amber-500 rounded-full"></div><span className="text-xs">Secondary ({linkStats.secondary})</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-5 h-1 bg-gray-400 rounded-full"></div><span className="text-xs">Weak ({linkStats.weak})</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};