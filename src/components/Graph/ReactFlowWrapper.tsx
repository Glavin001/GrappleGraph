'use client';

import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ConnectionLineType,
  MarkerType,
  Panel,
} from 'reactflow';
import type { 
  Node, 
  Edge, 
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type { BjjTechniqueType, BjjDifficulty, BjjApplicability, BjjKnowledgeBase } from '../../types/bjj';
import type { ConcretePositionId, ConcreteTechniqueId } from '../../data/bjj_knowledge_base';
import { BjjTechniqueType as BJJ_TECHNIQUE_TYPE } from '../../types/bjj';

// Import layout function from utility file
import { getLayoutedElements } from '../../utils/graphLayout'; 
// Import NEW knowledge graph generation function and its filter type
import { generateGraphElements, type KnowledgeGraphFilters } from '../../utils/knowledgeGraph';
// Import types from the central types file now
import type { PositionNodeData, TechniqueEdgeData } from '../../types/bjj';

// Helper function to generate a color from a string
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate more pleasing colors in the blue/purple range
  const h = Math.abs(hash) % 60 + 210; // Hue between 210-270 (blues/purples)
  const s = 70 + (Math.abs(hash) % 20); // Saturation 70-90%
  const l = 45 + (Math.abs(hash) % 15); // Lightness 45-60%
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Helper function to lighten a color
function lightenColor(color: string, amount: number): string {
  if (color.startsWith('#')) {
    // Handle hex colors
    const hex = color.replace('#', '');
    const rgb = {
      r: Number.parseInt(hex.substr(0, 2), 16),
      g: Number.parseInt(hex.substr(2, 2), 16),
      b: Number.parseInt(hex.substr(4, 2), 16),
    };
    
    const newRgb = {
      r: Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount)),
      g: Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount)),
      b: Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount)),
    };
    
    return `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
  }
  
  if (color.startsWith('hsl')) {
    // Handle HSL colors
    const matches = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (matches) {
      const h = Number.parseInt(matches[1], 10);
      const s = Number.parseInt(matches[2], 10);
      const l = Number.parseInt(matches[3], 10);
      const newL = Math.min(100, l + (100 - l) * amount);
      return `hsl(${h}, ${s}%, ${newL}%)`;
    }
  }
  return color;
}

// Helper function to darken a color
function darkenColor(color: string, amount: number): string {
  if (color.startsWith('#')) {
    // Handle hex colors
    const hex = color.replace('#', '');
    const rgb = {
      r: Number.parseInt(hex.substr(0, 2), 16),
      g: Number.parseInt(hex.substr(2, 2), 16),
      b: Number.parseInt(hex.substr(4, 2), 16),
    };
    
    const newRgb = {
      r: Math.max(0, Math.round(rgb.r * (1 - amount))),
      g: Math.max(0, Math.round(rgb.g * (1 - amount))),
      b: Math.max(0, Math.round(rgb.b * (1 - amount))),
    };
    
    return `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`;
  }
  
  if (color.startsWith('hsl')) {
    // Handle HSL colors
    const matches = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (matches) {
      const h = Number.parseInt(matches[1], 10);
      const s = Number.parseInt(matches[2], 10);
      const l = Number.parseInt(matches[3], 10);
      const newL = Math.max(0, l * (1 - amount));
      return `hsl(${h}, ${s}%, ${newL}%)`;
    }
  }
  return color;
}

interface ReactFlowWrapperProps {
  knowledgeBase: BjjKnowledgeBase<ConcretePositionId, ConcreteTechniqueId>;
  filters: KnowledgeGraphFilters & { 
    selectedPositionId: ConcretePositionId | null;
  };
  onNodeClick: (positionId: ConcretePositionId) => void;
  onEdgeClick: (techniqueId: ConcreteTechniqueId) => void;
  focusNode?: ConcretePositionId | null;
}

// Color mapping for nodes based on advantage
const advantageColors: Record<string, string> = {
  Dominant: '#4f46e5', // indigo-600
  Advantageous: '#818cf8', // indigo-400
  Neutral: '#a5b4fc', // indigo-300
  Disadvantageous: '#e11d48', // rose-600
  Inferior: '#fb7185', // rose-400
};

// Color mapping for edges based on technique type
const techniqueTypeColors: Record<BjjTechniqueType, string> = {
  [BJJ_TECHNIQUE_TYPE.Submission]: '#dc2626', // red-600
  [BJJ_TECHNIQUE_TYPE.Sweep]: '#2563eb', // blue-600
  [BJJ_TECHNIQUE_TYPE.Escape]: '#65a30d', // lime-600
  [BJJ_TECHNIQUE_TYPE.Transition]: '#9333ea', // purple-600
  [BJJ_TECHNIQUE_TYPE.Control]: '#0891b2', // cyan-600
  [BJJ_TECHNIQUE_TYPE.Takedown]: '#ea580c', // orange-600
  [BJJ_TECHNIQUE_TYPE.GuardPass]: '#ca8a04', // yellow-600
  [BJJ_TECHNIQUE_TYPE.GuardRecovery]: '#059669', // emerald-600
};

export default function ReactFlowWrapper({
  knowledgeBase,
  filters,
  onNodeClick,
  onEdgeClick,
  focusNode,
}: ReactFlowWrapperProps) {
  const [baseNodes, setBaseNodes] = useState<Node<PositionNodeData>[]>([]);
  const [baseEdges, setBaseEdges] = useState<Edge<TechniqueEdgeData>[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null); 
  const [loading, setLoading] = useState(true);
  const [layoutDirection, setLayoutDirection] = useState<'RIGHT' | 'DOWN'>('RIGHT');
  const initializedRef = useRef(false);
  const reactFlowRef = useRef<HTMLDivElement>(null);

  // Generate graph data
  const generateGraph = useCallback(async () => {
    setLoading(true);
    console.log("Calling generateGraphElements...");

    // --- Step 1: Generate Base Nodes & Edges --- 
    // Get base elements WITHOUT component-specific styling
    const { initialNodes, initialEdges } = generateGraphElements(knowledgeBase, filters);
    
    // --- Step 2: Apply Layout --- 
    console.log("Calling getLayoutedElements...");
    // Pass UNSTYLED base elements to the layout function
    const { layoutNodes, layoutEdges } = await getLayoutedElements(
        initialNodes, 
        initialEdges 
    );

    // --- Step 3: Update State --- 
    // Store the layouted nodes and the original edges (layout doesn't modify edges)
    setBaseNodes(layoutNodes);
    setBaseEdges(layoutEdges); // Store the base edges from generateGraphElements
    setLoading(false);
    initializedRef.current = true;
    console.log("Graph generation complete.");

  }, [
      knowledgeBase, 
      filters.techniqueType, 
      filters.difficulty, 
      filters.applicability, 
      filters.showVariants,
  ]);

  // useEffect to run generateGraph (no changes)
  useEffect(() => {
    generateGraph();
  }, [generateGraph]);

  // useMemo for final nodes: Apply base styling + selection styling
  const nodes = useMemo(() => {
    return baseNodes.map(node => {
      // Base Styling Calculation (moved from generateGraph)
      const position = knowledgeBase.positions[node.data.positionId];
      let backgroundColor = stringToColor(node.id.split('-').slice(0, -1).join('-') || node.id);
      if (position?.id.includes('-top')) {
          backgroundColor = lightenColor(backgroundColor, 0.2);
      } else if (position?.id.includes('-bottom')) {
          backgroundColor = darkenColor(backgroundColor, 0.2);
      }
      if (position?.advantage) {
          backgroundColor = advantageColors[position.advantage] ?? backgroundColor;
      }

      // Selection Styling
      const isSelected = filters.selectedPositionId === node.id;

      return {
        ...node,
        style: {
          ...(node.style ?? {}), // Include width/height from knowledgeGraph
          // Base Styles
          background: backgroundColor,
          color: '#ffffff',
          borderRadius: '8px',
          padding: '10px',
          border: isSelected ? '3px solid #f97316' : '1px solid transparent', // Base border transparent
          // Selection Styles
          boxShadow: isSelected ? '0 0 10px 2px rgba(249, 115, 22, 0.7)' : undefined,
          opacity: filters.selectedPositionId && !isSelected ? 0.7 : 1,
        },
        zIndex: isSelected ? 100 : 0,
      };
    });
  }, [baseNodes, filters.selectedPositionId, knowledgeBase.positions]); // Added knowledgeBase.positions

  // useMemo for final edges: Apply base styling + selection styling
  const edges = useMemo(() => {
    return baseEdges.map(edge => {
      const isSelected = filters.selectedPositionId ? (edge.source === filters.selectedPositionId || edge.target === filters.selectedPositionId) : false;
      const isSetup = edge.data?.isSetupEdge; // Use optional chaining
      const edgeColor = techniqueTypeColors[edge.data?.techniqueType ?? BJJ_TECHNIQUE_TYPE.Transition] || '#888'; // Default type if undefined
      
      return {
        ...edge,
        // Base Styling
        style: {
            stroke: isSetup ? '#aaaaaa' : edgeColor,
            strokeWidth: isSelected ? (isSetup ? 2 : 3) : (isSetup ? 1 : 2), // Apply selection style here
            strokeDasharray: isSetup ? '5, 5' : undefined,
            opacity: !filters.selectedPositionId || isSelected ? 1 : 0.25, // Apply selection style here
        },
        type: 'smoothstep',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: isSetup ? 15 : 20,
            height: isSetup ? 15 : 20,
            color: isSetup ? '#aaaaaa' : edgeColor,
        },
        label: edge.data?.label, // Use optional chaining
        labelStyle: { fill: isSetup? '#666' : '#333', fontSize: isSetup? 9 : 11 },
        labelBgStyle: { fill: '#f9fafb', fillOpacity: 0.8 },
        labelBgPadding: [4, 2] as [number, number], // Explicitly cast tuple type
        animated: isSelected && !isSetup && edge.data?.techniqueType === BJJ_TECHNIQUE_TYPE.Submission, // Optional chaining
        // Selection Styling (applied above via opacity/strokeWidth)
        zIndex: isSelected ? 1000 : 0,
      };
    });
  }, [baseEdges, filters.selectedPositionId]);

  // Store the ReactFlow instance when it's available
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  // Focus on a specific node when requested
  useEffect(() => {
    if (!focusNode || !initializedRef.current || !reactFlowInstance || loading) return; 
    
    const nodeToFocus = nodes.find(node => node.id === focusNode);
    
    if (nodeToFocus?.position) { 
      const width = nodeToFocus.data?.isVariant ? 150 : 180; // Get width from data/defaults
      const height = 60; // Default height
      const x = nodeToFocus.position.x + width / 2;
      const y = nodeToFocus.position.y + height / 2;
      
      reactFlowInstance.setCenter(x, y, { duration: 800, zoom: 1 });
    } else if (nodeToFocus) {
      reactFlowInstance.fitView({ duration: 800, nodes: [nodeToFocus] });
    }
  }, [focusNode, nodes, reactFlowInstance, loading]);

  // Handle node click - show position details
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const positionId = node.data.positionId;
      onNodeClick(positionId);
    },
    [onNodeClick]
  );

  // Handle edge click - show technique details
  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const techniqueId = edge.data?.techniqueId;
      if (techniqueId) {
        onEdgeClick(techniqueId);
      }
    },
    [onEdgeClick]
  );

  // Toggle layout direction using ELK values
  const toggleLayoutDirection = useCallback(() => {
    setLayoutDirection(prev => prev === 'RIGHT' ? 'DOWN' : 'RIGHT');
  }, []);

  if (loading) {
    // Update loading text
    return <div className="flex items-center justify-center h-full">Calculating graph layout...</div>;
  }

  return (
    <div className="h-full w-full" ref={reactFlowRef}>
      <ReactFlow
        nodes={nodes} 
        edges={edges}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onInit={onInit}
        connectionLineType={ConnectionLineType.SmoothStep}
        minZoom={0.1}
        maxZoom={1.5}
        // Fit view initially and on subsequent layouts (nodes/edges change)
        fitView 
        fitViewOptions={{ padding: 0.2 }} // Add more padding
        // Nodes/edges are draggable by default, ensure this isn't disabled
        nodesDraggable={false} // Prevent manual dragging if desired
        nodesConnectable={false} // Prevent manual connection
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background gap={12} size={1} />
        
        <Panel position="top-right">
          <button
            type="button"
            onClick={toggleLayoutDirection}
            className="bg-white dark:bg-gray-700 p-2 rounded shadow text-sm font-medium"
          >
            {/* Update button text based on ELK direction */}
            {layoutDirection === 'RIGHT' ? 'Switch to Vertical Layout' : 'Switch to Horizontal Layout'}
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
} 