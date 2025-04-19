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
import { useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

import type { BjjTechniqueType, BjjDifficulty, BjjApplicability, BjjKnowledgeBase } from '../../types/bjj';
import type { ConcretePositionId, ConcreteTechniqueId } from '../../data/bjj_knowledge_base';
import { BjjTechniqueType as BJJ_TECHNIQUE_TYPE } from '../../types/bjj';

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

// Define custom node data type
type PositionNodeData = {
  label: string;
  positionId: ConcretePositionId;
  advantage?: string;
  isVariant?: boolean;
};

// Define custom edge data type
type TechniqueEdgeData = {
  techniqueId: ConcreteTechniqueId;
  techniqueType: BjjTechniqueType;
  label: string;
};

interface ReactFlowWrapperProps {
  knowledgeBase: BjjKnowledgeBase<ConcretePositionId, ConcreteTechniqueId>;
  filters: {
    techniqueType: 'all' | BjjTechniqueType;
    difficulty: 'all' | BjjDifficulty;
    applicability: 'all' | BjjApplicability;
    showVariants: boolean;
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

// DAG layout settings
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (
  nodes: Node<PositionNodeData>[],
  edges: Edge<TechniqueEdgeData>[],
  direction = 'LR' // LR for horizontal, TB for vertical layout
) => {
  // Clear the graph before running the layout
  dagreGraph.setGraph({});
  
  // Create a copy of the nodes and edges to avoid modifying the originals
  const layoutNodes = nodes.map((node) => ({ ...node }));
  const layoutEdges = edges.map((edge) => ({ ...edge }));

  // Configure the layout algorithm
  dagreGraph.setGraph({ rankdir: direction, ranksep: 150, nodesep: 100 });

  // Add nodes to the graph
  for (const node of layoutNodes) {
    dagreGraph.setNode(node.id, { 
      width: node.data.isVariant ? 150 : 180, 
      height: 60 
    });
  }

  // Add edges to the graph
  for (const edge of layoutEdges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  // Run the layout algorithm
  dagre.layout(dagreGraph);

  // Apply the calculated positions to the nodes
  for (const node of layoutNodes) {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Set the node position based on the layout algorithm
    node.position = {
      x: nodeWithPosition.x - (node.data.isVariant ? 150 : 180) / 2,
      y: nodeWithPosition.y - 60 / 2,
    };
  }

  return { layoutNodes, layoutEdges };
};

export default function ReactFlowWrapper({
  knowledgeBase,
  filters,
  onNodeClick,
  onEdgeClick,
  focusNode,
}: ReactFlowWrapperProps) {
  // State for base nodes and edges (before selection styling)
  const [baseNodes, setBaseNodes] = useState<Node<PositionNodeData>[]>([]);
  const [baseEdges, setBaseEdges] = useState<Edge<TechniqueEdgeData>[]>([]);
  
  // Replace useNodesState/useEdgesState with simple useState for base data
  // const [nodes, setNodes, onNodesChange] = useNodesState<PositionNodeData>([]); // Remove
  // const [edges, setEdges, onEdgesChange] = useEdgesState<TechniqueEdgeData>([]); // Remove
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null); // Use state for instance

  const [loading, setLoading] = useState(true);
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  const initializedRef = useRef(false);
  const reactFlowRef = useRef<HTMLDivElement>(null);
  // const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null); // Remove ref, use state

  // Generate graph data based on knowledge base and filters
  const generateGraph = useCallback(() => {
    setLoading(true);
    
    const initialNodes: Node<PositionNodeData>[] = [];
    const initialEdges: Edge<TechniqueEdgeData>[] = [];
    const includedPositions = new Set<ConcretePositionId>();
    
    // Step 1: Create nodes for positions
    for (const position of Object.values(knowledgeBase.positions)) {
      // Apply filters
      if (!filters.showVariants && position.isVariant) {
        continue;
      }

      includedPositions.add(position.id);

      // Determine if this is a top or bottom position based on ID
      const isTopPosition = position.id.includes('-top');
      const isBottomPosition = position.id.includes('-bottom');
      
      // Extract the base position name for grouping similar positions visually
      let basePositionType: string = position.id; // Explicitly type as string to fix linter error
      if (position.id.includes('-top') || position.id.includes('-bottom')) {
        basePositionType = position.id.split('-').slice(0, -1).join('-');
      }
      
      // Generate a consistent color for positions of the same type (e.g., mount, guard)
      const positionTypeColor = stringToColor(basePositionType); // Use basePositionType (string)
      
      // Create different shades for top/bottom positions of the same type
      let backgroundColor = positionTypeColor;
      if (isTopPosition) {
        backgroundColor = lightenColor(positionTypeColor, 0.2); // Lighter for top positions
      } else if (isBottomPosition) {
        backgroundColor = darkenColor(positionTypeColor, 0.2); // Darker for bottom positions
      }
      
      // Use position advantage color if specified
      if (position.advantage) {
        backgroundColor = advantageColors[position.advantage];
      }

      const node: Node<PositionNodeData> = {
        id: position.id,
        type: 'default',
        position: { x: 0, y: 0 }, // Will be calculated by Dagre
        data: {
          label: position.name,
          positionId: position.id,
          advantage: position.advantage,
          isVariant: position.isVariant,
        },
        style: {
          background: backgroundColor,
          color: '#ffffff',
          borderRadius: '8px',
          padding: '10px',
          width: position.isVariant ? 150 : 180,
          fontSize: position.isVariant ? '12px' : '14px',
        },
      };

      initialNodes.push(node);
    }

    // Step 2: Create edges for techniques
    for (const technique of Object.values(knowledgeBase.techniques)) {
      // Apply filters
      if (filters.techniqueType !== 'all' && technique.type !== filters.techniqueType) {
        continue;
      }

      if (filters.difficulty !== 'all' && technique.difficulty !== filters.difficulty) {
        continue;
      }

      if (filters.applicability !== 'all' && technique.applicability !== filters.applicability) {
        continue;
      }

      // For each outcome that results in a position change, create an edge
      for (const [outcomeIndex, outcome] of technique.outcomes.entries()) {
        if (outcome.endPositionId) {
          // Only create edges between positions that are visible (passed filters)
          if (includedPositions.has(technique.originPositionId) && includedPositions.has(outcome.endPositionId)) {
            const edge: Edge<TechniqueEdgeData> = {
              // Ensure unique edge ID by adding the outcome index
              id: `${technique.id}-${outcome.endPositionId}-${outcomeIndex}`,
              source: technique.originPositionId,
              target: outcome.endPositionId,
              animated: technique.type === BJJ_TECHNIQUE_TYPE.Submission,
              style: {
                stroke: techniqueTypeColors[technique.type] || '#888',
                strokeWidth: 2,
              },
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: techniqueTypeColors[technique.type] || '#888',
              },
              data: {
                techniqueId: technique.id,
                techniqueType: technique.type,
                label: technique.name,
              },
              label: technique.name,
              labelStyle: { fill: '#333', fontSize: 11 },
              labelBgStyle: { fill: '#f9fafb', fillOpacity: 0.8 },
              labelBgPadding: [4, 2],
            };
            initialEdges.push(edge);
          }
        }
      }
    }

    // Apply layout algorithm
    const { layoutNodes, layoutEdges } = getLayoutedElements(initialNodes, initialEdges, layoutDirection);

    setBaseNodes(layoutNodes); // Set base nodes
    setBaseEdges(layoutEdges); // Set base edges
    setLoading(false);
    initializedRef.current = true;
  }, [knowledgeBase, filters.techniqueType, filters.difficulty, filters.applicability, filters.showVariants, layoutDirection]); // Remove filters.selectedPositionId dependency

  // Update graph when base filters or layout direction change
  useEffect(() => {
    generateGraph();
  }, [generateGraph]);

  // --- Apply selection styling using useMemo --- 
  const nodes = useMemo(() => {
    return baseNodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        border: filters.selectedPositionId === node.id ? '3px solid #f97316' : undefined,
        boxShadow: filters.selectedPositionId === node.id ? '0 0 10px 2px rgba(249, 115, 22, 0.7)' : undefined,
        opacity: filters.selectedPositionId && filters.selectedPositionId !== node.id ? 0.7 : 1,
      },
      // Ensure selected node is rendered on top
      zIndex: filters.selectedPositionId === node.id ? 100 : 0,
    }));
  }, [baseNodes, filters.selectedPositionId]);

  const edges = useMemo(() => {
    return baseEdges.map(edge => {
      const isConnected = filters.selectedPositionId ? (edge.source === filters.selectedPositionId || edge.target === filters.selectedPositionId) : true;
      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: isConnected ? 3 : 2,
          opacity: isConnected ? 1 : 0.25, 
        },
        labelStyle: {
          ...edge.labelStyle,
          fill: isConnected ? '#000' : '#999',
        },
        // Ensure connected edges are rendered on top
        zIndex: isConnected ? 1000 : 0,
        animated: isConnected && edge.animated // Only animate connected submission edges
      };
    });
  }, [baseEdges, filters.selectedPositionId]);

  // Store the ReactFlow instance when it's available
  const onInit = useCallback((instance: ReactFlowInstance) => {
    // reactFlowInstanceRef.current = instance; // Use state instead
    setReactFlowInstance(instance);
  }, []);

  // Focus on a specific node when requested
  useEffect(() => {
    if (!focusNode || !initializedRef.current || !reactFlowInstance) return; // Use state instance
    
    // Use the memoized nodes for finding the node to focus
    const nodeToFocus = nodes.find(node => node.id === focusNode);
    
    if (nodeToFocus) {
      // Center view on the node with animation
      const x = nodeToFocus.position.x + (nodeToFocus.data.isVariant ? 75 : 90);
      const y = nodeToFocus.position.y + 30;
      
      // reactFlowInstanceRef.current.setCenter(x, y, { duration: 800, zoom: 1 }); // Use state instance
      reactFlowInstance.setCenter(x, y, { duration: 800, zoom: 1 });
    }
  }, [focusNode, nodes, reactFlowInstance]); // Depend on memoized nodes and state instance

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

  // Toggle layout direction
  const toggleLayoutDirection = useCallback(() => {
    setLayoutDirection(prev => prev === 'LR' ? 'TB' : 'LR');
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading graph...</div>;
  }

  return (
    <div className="h-full w-full" ref={reactFlowRef}>
      <ReactFlow
        // Pass memoized nodes and edges
        nodes={nodes} 
        edges={edges}
        // Remove onNodesChange/onEdgesChange as we manage state differently
        // onNodesChange={onNodesChange} 
        // onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onInit={onInit}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        minZoom={0.1}
        maxZoom={1.5}
        fitView
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
            {layoutDirection === 'LR' ? 'Switch to Vertical Layout' : 'Switch to Horizontal Layout'}
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
} 