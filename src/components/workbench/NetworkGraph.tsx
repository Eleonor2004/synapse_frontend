// src/components/workbench/NetworkGraph.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import { ExcelData, Individual } from "@/app/[locale]/workbench/page";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Settings } from "lucide-react";

interface NetworkGraphProps {
  data: ExcelData;
  filters: any;
  onIndividualSelect: (individual: Individual) => void;
}

export function NetworkGraph({ data, filters, onIndividualSelect }: NetworkGraphProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkStats, setNetworkStats] = useState({
    nodes: 0,
    edges: 0,
    interactions: 0
  });

  const getInteractionColor = (count: number, maxCount: number) => {
    const intensity = count / maxCount;
    if (intensity <= 0.25) return "#10b981"; // Green
    if (intensity <= 0.5) return "#f59e0b";  // Yellow
    if (intensity <= 0.75) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const getNodeSize = (interactions: number, maxInteractions: number) => {
    const baseSize = 20;
    const maxSize = 60;
    const normalized = interactions / maxInteractions;
    return baseSize + (normalized * (maxSize - baseSize));
  };

  const processNetworkData = () => {
    if (!data.listings || data.listings.length === 0) {
      setIsLoading(false);
      return;
    }

    // Process listings to create nodes and edges
    const nodeMap = new Map();
    const edgeMap = new Map();
    
    data.listings.forEach((listing: any) => {
      const source = listing.caller || listing.source || listing.from;
      const target = listing.called || listing.target || listing.to;
      const type = listing.type || listing.interaction_type || "call";
      
      if (!source || !target) return;

      // Create or update nodes
      if (!nodeMap.has(source)) {
        nodeMap.set(source, {
          id: source,
          label: source,
          interactions: 0,
          calls: 0,
          sms: 0
        });
      }
      
      if (!nodeMap.has(target)) {
        nodeMap.set(target, {
          id: target,
          label: target,
          interactions: 0,
          calls: 0,
          sms: 0
        });
      }

      // Update interaction counts
      const sourceNode = nodeMap.get(source);
      const targetNode = nodeMap.get(target);
      
      sourceNode.interactions++;
      targetNode.interactions++;
      
      if (type.toLowerCase().includes('sms')) {
        sourceNode.sms++;
        targetNode.sms++;
      } else {
        sourceNode.calls++;
        targetNode.calls++;
      }

      // Create or update edges
      const edgeId = `${source}-${target}`;
      const reverseEdgeId = `${target}-${source}`;
      
      if (!edgeMap.has(edgeId) && !edgeMap.has(reverseEdgeId)) {
        edgeMap.set(edgeId, {
          id: edgeId,
          from: source,
          to: target,
          weight: 1,
          calls: type.toLowerCase().includes('sms') ? 0 : 1,
          sms: type.toLowerCase().includes('sms') ? 1 : 0
        });
      } else {
        const existingEdge = edgeMap.get(edgeId) || edgeMap.get(reverseEdgeId);
        existingEdge.weight++;
        if (type.toLowerCase().includes('sms')) {
          existingEdge.sms++;
        } else {
          existingEdge.calls++;
        }
      }
    });

    // Convert to arrays and apply styling
    const nodes = Array.from(nodeMap.values());
    const edges = Array.from(edgeMap.values());
    
    const maxInteractions = Math.max(...nodes.map(n => n.interactions));
    const maxEdgeWeight = Math.max(...edges.map(e => e.weight));

    // Style nodes
    const styledNodes = nodes.map(node => ({
      id: node.id,
      label: node.label,
      size: getNodeSize(node.interactions, maxInteractions),
      color: {
        background: `hsl(${240 + (node.interactions / maxInteractions) * 60}, 70%, 50%)`,
        border: '#1e0546',
        highlight: {
          background: '#8e43ff',
          border: '#1e0546'
        }
      },
      font: {
        color: '#ffffff',
        size: 12,
        face: 'Arial'
      },
      borderWidth: 2,
      borderWidthSelected: 4,
      interactions: node.interactions,
      calls: node.calls,
      sms: node.sms
    }));

    // Style edges
    const styledEdges = edges.map(edge => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      width: Math.max(1, (edge.weight / maxEdgeWeight) * 8),
      color: {
        color: getInteractionColor(edge.weight, maxEdgeWeight),
        highlight: '#8e43ff',
        hover: '#8e43ff'
      },
      smooth: {
        type: 'continuous',
        roundness: 0.2
      },
      weight: edge.weight,
      calls: edge.calls,
      sms: edge.sms
    }));

    setNetworkStats({
      nodes: styledNodes.length,
      edges: styledEdges.length,
      interactions: edges.reduce((sum, edge) => sum + edge.weight, 0)
    });

    return { nodes: styledNodes, edges: styledEdges };
  };

  useEffect(() => {
    if (!networkRef.current) return;

    const networkData = processNetworkData();
    if (!networkData) return;

    const nodes = new DataSet(networkData.nodes);
    const edges = new DataSet(networkData.edges);

    const options = {
      nodes: {
        shape: 'dot',
        scaling: {
          min: 20,
          max: 60
        },
        font: {
          size: 12,
          color: '#ffffff'
        }
      },
      edges: {
        smooth: {
          type: 'continuous',
          roundness: 0.2
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.5
          }
        }
      },
      physics: {
        enabled: true,
        forceAtlas2Based: {
          gravitationalConstant: -26,
          centralGravity: 0.005,
          springLength: 230,
          springConstant: 0.18
        },
        maxVelocity: 146,
        solver: 'forceAtlas2Based',
        timestep: 0.35,
        stabilization: {
          enabled: true,
          iterations: 80,
          updateInterval: 25
        }
      },
      interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true,
        selectConnectedEdges: true
      },
      layout: {
        improvedLayout: true
      }
    };

    networkInstance.current = new Network(
      networkRef.current,
      { nodes, edges },
      options
    );

    // Event listeners
    networkInstance.current.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const nodeData = nodes.get(nodeId);
        
        if (nodeData) {
          const individual: Individual = {
            id: nodeData.id,
            phoneNumber: nodeData.label,
            interactions: nodeData.interactions,
            details: {
              calls: nodeData.calls,
              sms: nodeData.sms,
              totalInteractions: nodeData.interactions
            }
          };
          onIndividualSelect(individual);
        }
      }
    });

    networkInstance.current.on('stabilizationIterationsDone', () => {
      setIsLoading(false);
    });

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
      }
    };
  }, [data, filters]);

  const handleZoomIn = () => {
    if (networkInstance.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({
        scale: scale * 1.2
      });
    }
  };

  const handleZoomOut = () => {
    if (networkInstance.current) {
      const scale = networkInstance.current.getScale();
      networkInstance.current.moveTo({
        scale: scale * 0.8
      });
    }
  };

  const handleFit = () => {
    if (networkInstance.current) {
      networkInstance.current.fit();
    }
  };

  const handleReset = () => {
    if (networkInstance.current) {
      networkInstance.current.setData(processNetworkData());
      networkInstance.current.fit();
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Communication Network</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span>{networkStats.nodes} individuals</span>
            <span>•</span>
            <span>{networkStats.edges} connections</span>
            <span>•</span>
            <span>{networkStats.interactions} interactions</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative">
        <div
          ref={networkRef}
          className="w-full h-full"
          style={{ background: 'var(--background)' }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              <span className="text-foreground font-medium">Building network...</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/30">
        <h4 className="text-sm font-medium text-foreground mb-3">Legend</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-medium text-foreground mb-2">Node Size</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-muted-foreground">Interaction frequency</span>
              </div>
            </div>
          </div>
          <div>
            <p className="font-medium text-foreground mb-2">Edge Colors</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-green-500 rounded" />
                <span className="text-muted-foreground">Low activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-yellow-500 rounded" />
                <span className="text-muted-foreground">Medium activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500 rounded" />
                <span className="text-muted-foreground">High activity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}