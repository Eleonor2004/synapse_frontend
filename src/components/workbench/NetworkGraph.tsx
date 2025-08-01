"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Network, Users, Activity, Search } from 'lucide-react';
import { GraphData, GraphNode as ApiNode, GraphEdge as ApiEdge } from '@/types/api';

// UI-specific node type
interface UINode extends ApiNode {
  x: number;
  y: number;
  size: number;
  color: string;
}

// The component now accepts the clean GraphData prop directly
interface NetworkGraphProps {
  data: GraphData | null;
}

// Helper functions
const getNodeSize = (node: ApiNode, allEdges: ApiEdge[]): number => {
  const connections = allEdges.filter(e => e.source === node.id || e.target === node.id).length;
  const minSize = 15;
  const maxSize = 40;
  const maxConnections = 10;
  const ratio = Math.min(connections / maxConnections, 1);
  return minSize + (maxSize - minSize) * ratio;
};

const getNodeColor = (node: ApiNode): string => {
  switch (node.label) {
    case 'Subscriber': return '#3B82F6'; // Blue
    case 'Device': return '#10B981'; // Green
    case 'CellTower': return '#8B5CF6'; // Purple
    case 'Communication': return '#F59E0B'; // Amber
    default: return '#6B7280'; // Gray
  }
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<UINode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<UINode | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // This logic is now much simpler: it just adds UI properties to the clean data.
  const positionedNodes = useMemo<UINode[]>(() => {
    if (!data?.nodes) return [];
    const { width, height } = dimensions;
    return data.nodes.map(node => ({
      ...node,
      x: Math.random() * width,
      y: Math.random() * height,
      size: getNodeSize(node, data.edges),
      color: getNodeColor(node),
    }));
  }, [data, dimensions]);

  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) return positionedNodes;
    const searchLower = searchTerm.toLowerCase();
    return positionedNodes.filter(node =>
      node.properties.phoneNumber?.toLowerCase().includes(searchLower) ||
      node.properties.imei?.toLowerCase().includes(searchLower)
    );
  }, [positionedNodes, searchTerm]);

  if (!data || data.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center p-4">
        <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No Network Data</h3>
        <p className="text-sm text-muted-foreground">This analysis does not contain any network information to visualize.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-card overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Network className="w-5 h-5" /> Network Graph</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{data.nodes.length} Nodes</span>
            <span className="flex items-center gap-1"><Activity className="w-4 h-4" />{data.edges.length} Edges</span>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search nodes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm" />
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-background">
        <svg width={dimensions.width} height={dimensions.height} className="w-full h-full">
          <g className="edges">
            {data.edges.map(edge => {
              const sourceNode = positionedNodes.find(n => n.id === edge.source);
              const targetNode = positionedNodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;
              return <line key={edge.id} x1={sourceNode.x} y1={sourceNode.y} x2={targetNode.x} y2={targetNode.y} stroke="rgba(128, 128, 128, 0.3)" strokeWidth={1} />;
            })}
          </g>
          <g className="nodes">
            {filteredNodes.map(node => (
              <g key={node.id} className="cursor-pointer" transform={`translate(${node.x}, ${node.y})`}>
                <circle r={node.size / 2} fill={node.color} />
                <text y={node.size / 2 + 12} textAnchor="middle" fontSize="10" fill="currentColor">{node.properties.phoneNumber}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};