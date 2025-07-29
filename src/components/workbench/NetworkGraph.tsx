// src/components/workbench/NetworkGraph.tsx
'use client';

import { useEffect, useRef, useState, useMemo } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import { AnimatePresence, motion } from 'framer-motion';
import { ExcelData, Individual } from "@/app/[locale]/workbench/page";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";

interface NetworkGraphProps {
  data: ExcelData;
  filters: any;
  onIndividualSelect: (individual: Individual) => void;
}

// --- Helper Functions for Styling ---

const getInteractionColor = (count: number, maxCount: number) => {
  const intensity = Math.min(count / maxCount, 1);
  if (intensity <= 0.25) return "#22c55e"; // Green-500
  if (intensity <= 0.5) return "#eab308";  // Yellow-500
  if (intensity <= 0.75) return "#f97316"; // Orange-500
  return "#ef4444"; // Red-500
};

const getNodeSize = (interactions: number, maxInteractions: number) => {
  const baseSize = 15;
  const maxSize = 50;
  const normalized = Math.sqrt(interactions / maxInteractions); // Use sqrt for better distribution
  return baseSize + (normalized * (maxSize - baseSize));
};

// --- Main Component ---

export function NetworkGraph({ data, filters, onIndividualSelect }: NetworkGraphProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkStats, setNetworkStats] = useState({ nodes: 0, edges: 0, interactions: 0 });

  // Memoize the expensive data processing
  const processedData = useMemo(() => {
    setIsLoading(true);
    if (!data || !data.listings || data.listings.length === 0) {
      return null;
    }

    const nodeMap = new Map<string, { id: string; label: string; interactions: number; calls: number; sms: number }>();
    const edgeMap = new Map<string, { from: string; to: string; weight: number; calls: number; sms: number }>();

    data.listings.forEach((listing: any) => {
      const source = String(listing["Numéro A"] || listing.caller || listing.source);
      const target = String(listing["Numéro B"] || listing.called || listing.target);
      const type = String(listing.Type || 'appel').toLowerCase();

      if (!source || !target || source === target) return;

      // Ensure nodes exist
      if (!nodeMap.has(source)) nodeMap.set(source, { id: source, label: source, interactions: 0, calls: 0, sms: 0 });
      if (!nodeMap.has(target)) nodeMap.set(target, { id: target, label: target, interactions: 0, calls: 0, sms: 0 });

      // Update interaction counts for nodes
      const sourceNode = nodeMap.get(source)!;
      const targetNode = nodeMap.get(target)!;
      sourceNode.interactions++;
      targetNode.interactions++;
      if (type === 'sms') {
        sourceNode.sms++;
        targetNode.sms++;
      } else {
        sourceNode.calls++;
        targetNode.calls++;
      }

      // Create or update edges (canonical ID: smaller number first)
      const edgeId = [source, target].sort().join('--');
      if (!edgeMap.has(edgeId)) {
        edgeMap.set(edgeId, { from: source, to: target, weight: 0, calls: 0, sms: 0 });
      }
      const edge = edgeMap.get(edgeId)!;
      edge.weight++;
      if (type === 'sms') {
        edge.sms++;
      } else {
        edge.calls++;
      }
    });

    const nodes = Array.from(nodeMap.values());
    const edges = Array.from(edgeMap.values());

    const maxInteractions = Math.max(1, ...nodes.map(n => n.interactions));
    const maxEdgeWeight = Math.max(1, ...edges.map(e => e.weight));

    const styledNodes = new DataSet(nodes.map(node => ({
      id: node.id,
      label: node.label,
      value: node.interactions,
      size: getNodeSize(node.interactions, maxInteractions),
      title: `${node.label}<br>Interactions: ${node.interactions}`,
      // Store extra data for filtering/info panel
      ...node
    })));

    const styledEdges = new DataSet(edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      value: edge.weight,
      width: Math.max(1, (edge.weight / maxEdgeWeight) * 8),
      color: getInteractionColor(edge.weight, maxEdgeWeight),
      title: `Interactions: ${edge.weight}<br>Calls: ${edge.calls}, SMS: ${edge.sms}`,
      ...edge
    })));

    setNetworkStats({
      nodes: styledNodes.length,
      edges: styledEdges.length,
      interactions: edges.reduce((sum, edge) => sum + edge.weight, 0)
    });

    return { nodes: styledNodes, edges: styledEdges };
  }, [data]);

  // Effect for initializing and updating the network
  useEffect(() => {
    if (!networkRef.current || !processedData) {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
      return;
    }

    const options = {
      nodes: {
        shape: 'dot',
        color: {
          border: 'hsl(var(--secondary))',
          background: 'hsl(var(--primary))',
          highlight: {
            border: 'hsl(var(--secondary))',
            background: 'hsl(var(--primary))',
          },
          hover: {
            border: 'hsl(var(--secondary))',
            background: 'hsl(var(--primary))',
          }
        },
        font: {
          color: 'hsl(var(--primary-foreground))',
          size: 14,
          strokeWidth: 2,
          strokeColor: 'hsl(var(--background))'
        },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        color: {
          inherit: false,
          highlight: 'hsl(var(--primary))',
          hover: 'hsl(var(--primary))',
        },
        smooth: {
          enabled: true,
          type: "dynamic",
          roundness: 0.5
        },
        arrows: {
          to: { enabled: false } // Connections are bidirectional in this model
        },
        width: 2
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -30000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.1
        },
        solver: 'barnesHut',
        stabilization: {
          iterations: 1000,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        navigationButtons: false, // We have custom buttons
      },
      layout: {
        improvedLayout: true,
      }
    };

    networkInstance.current = new Network(networkRef.current, {}, options);
    networkInstance.current.setData(processedData);

    networkInstance.current.on('stabilizationProgress', () => setIsLoading(true));
    networkInstance.current.on('stabilizationIterationsDone', () => setIsLoading(false));
    networkInstance.current.on('startStabilizing', () => setIsLoading(true));
    networkInstance.current.on('stabilized', () => setIsLoading(false));

    networkInstance.current.on('selectNode', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const nodeData = processedData.nodes.get(nodeId);
        if (nodeData) {
          onIndividualSelect({
            id: String(nodeData.id),
            phoneNumber: nodeData.label,
            interactions: nodeData.interactions,
            details: {
              calls: nodeData.calls,
              sms: nodeData.sms,
            }
          });
        }
      }
    });

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [processedData, onIndividualSelect]);

  // ... (keep handleZoomIn, handleZoomOut, handleFit, handleReset functions)
  // ... (keep the JSX return statement)
  const handleZoomIn = () => networkInstance.current?.moveTo({ scale: networkInstance.current.getScale() * 1.2 });
  const handleZoomOut = () => networkInstance.current?.moveTo({ scale: networkInstance.current.getScale() * 0.8 });
  const handleFit = () => networkInstance.current?.fit();
  const handleReset = () => {
    if (networkInstance.current && processedData) {
      setIsLoading(true);
      networkInstance.current.setData(processedData);
      networkInstance.current.fit();
    }
  };

  return (
    <div className="relative h-full flex flex-col bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border flex-shrink-0">
        <div>
          <h3 className="text-base font-semibold text-foreground">Communication Network</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>{networkStats.nodes} individuals</span>
            <span className="text-border">|</span>
            <span>{networkStats.edges} connections</span>
            <span className="text-border">|</span>
            <span>{networkStats.interactions} interactions</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
          {[
            { Icon: ZoomIn, onClick: handleZoomIn, title: "Zoom In" },
            { Icon: ZoomOut, onClick: handleZoomOut, title: "Zoom Out" },
            { Icon: Maximize2, onClick: handleFit, title: "Fit to Screen" },
            { Icon: RotateCcw, onClick: handleReset, title: "Reset View" },
          ].map(({ Icon, onClick, title }, i) => (
            <button key={i} onClick={onClick} className="p-1.5 rounded-sm hover:bg-background transition-colors" title={title}>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative bg-background/50">
        <div ref={networkRef} className="w-full h-full" />
        
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-foreground font-medium">Building network...</span>
                <p className="text-xs text-muted-foreground">This may take a moment for large datasets.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-border bg-card flex-shrink-0">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-semibold text-foreground mb-2">Node Size</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/50" />
              <div className="w-3 h-3 rounded-full bg-primary/75" />
              <div className="w-4 h-4 rounded-full bg-primary" />
              <span className="text-muted-foreground ml-1">Interaction Frequency</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-2">Edge Color</p>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-green-500 rounded-full" />
              <div className="w-4 h-1 bg-yellow-500 rounded-full" />
              <div className="w-4 h-1 bg-orange-500 rounded-full" />
              <div className="w-4 h-1 bg-red-500 rounded-full" />
              <span className="text-muted-foreground ml-1">Interaction Intensity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
