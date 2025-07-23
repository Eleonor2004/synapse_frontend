import { AnalysisToolbar } from './AnalysisToolbar';

interface GraphCanvasProps {
  onSelectNode: () => void;
}

export const GraphCanvas = ({ onSelectNode }: GraphCanvasProps) => {
  return (
    <div className="w-full h-full bg-muted/40 relative overflow-hidden">
      <AnalysisToolbar />
      {/* This is where the graph visualization library (e.g., Cytoscape.js) would be mounted. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Graph Canvas Area</p>
          <p className="text-sm">Select a dataset to begin visualization.</p>
          <button onClick={onSelectNode} className="mt-4 text-xs bg-primary/20 text-primary p-2 rounded">
            (Dev: Simulate Node Selection)
          </button>
        </div>
      </div>
    </div>
  );
};