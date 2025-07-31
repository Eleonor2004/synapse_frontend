"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Network, Users, Activity, Search } from 'lucide-react';
import { GraphData, GraphNode as ApiNode, GraphEdge as ApiEdge } from '@/types/api';

// Define a local type for nodes that includes position, as this is a UI concern
interface UINode extends ApiNode {
  x?: number;
  y?: number;
  size: number;
}

interface NetworkGraphProps {
  data: GraphData;
  // We can add this back later if needed
  // onIndividualSelect: (individual: any) => void;
}

// Helper to calculate node size based on connections
const getNodeSize = (node: ApiNode, edges: ApiEdge[]): number => {
  const connections = edges.filter(e => e.source === node.id || e.target === node.id).length;
  const minSize = 15;
  const maxSize = 50;
  const maxConnections = 10; // Cap the scaling for very connected nodes
  const ratio = Math.min(connections / maxConnections, 1);
  return minSize + (maxSize - minSize) * ratio;
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // The data is already processed! We just add UI-specific properties.
  const uiNodes = useMemo<UINode[]>(() => {
    return data.nodes.map(node => ({
      ...node,
      size: getNodeSize(node, data.edges),
    }));
  }, [data.nodes, data.edges]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) return uiNodes;
    const searchLower = searchTerm.toLowerCase();
    return uiNodes.filter(node =>
      node.properties.phoneNumber?.toLowerCase().includes(searchLower)
    );
  }, [uiNodes, searchTerm]);

  // A very simple force simulation for positioning nodes
  const positionedNodes = useMemo(() => {
    const nodes = [...filteredNodes];
    if (nodes.length === 0) return [];

    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    // Initialize random positions if they don't exist
    nodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) {
        node.x = centerX + (Math.random() - 0.5) * width * 0.5;
        node.y = centerY + (Math.random() - 0.5) * height * 0.5;
      }
    });

    // This is a placeholder for a real physics engine like d3-force.
    // For now, it just renders the initialized positions.
    return nodes;
  }, [filteredNodes, dimensions]);

  if (!data || data.nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center p-4">
        <div>
          <Network className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium text-foreground">No Network Data</h3>
          <p className="text-sm text-muted-foreground">
            This analysis set does not contain any network graph information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-card overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Network className="w-5 h-5" />
            Network Graph
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{data.nodes.length} Nodes</span>
            <span className="flex items-center gap-1"><Activity className="w-4 h-4" />{data.edges.length} Edges</span>
          </div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nodes by phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-background">
        <svg width={dimensions.width} height={dimensions.height} className="w-full h-full">
          <g className="edges">
            {data.edges.map(edge => {
              const fromNode = positionedNodes.find(n => n.id === edge.source);
              const toNode = positionedNodes.find(n => n.id === edge.target);
              if (!fromNode || !toNode) return null;

              return (
                <line
                  key={edge.id}
                  x1={fromNode.x} y1={fromNode.y}
                  x2={toNode.x} y2={toNode.y}
                  stroke="rgba(128, 128, 128, 0.3)"
                  strokeWidth={1}
                />
              );
            })}
          </g>
          <g className="nodes">
            {positionedNodes.map(node => (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => setSelectedNodeId(node.id)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size / 2}
                  fill={node.label === 'Subscriber' ? '#3b82f6' : '#10b981'}
                  stroke={selectedNodeId === node.id ? '#f59e0b' : 'white'}
                  strokeWidth={2}
                />
                <text
                  x={node.x}
                  y={node.y ? node.y + node.size / 2 + 12 : 0}
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  className="pointer-events-none select-none"
                >
                  {node.properties.phoneNumber}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};