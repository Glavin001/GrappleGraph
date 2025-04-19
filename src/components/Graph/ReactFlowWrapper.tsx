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
    console.log("Generating graph data..."); // Debug start
    
    const initialNodes: Node<PositionNodeData>[] = [];
    const edgeSet = new Map<string, Edge<TechniqueEdgeData>>();
    const includedPositions = new Set<ConcretePositionId>();
    
    // Step 1: Create nodes (Filter based on showVariants)
    for (const position of Object.values(knowledgeBase.positions)) {
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
        type: 'default', // Revert to default node type
        position: { x: 0, y: 0 },
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
          padding: '10px', // Add padding back
          // Add width/height back for default nodes
          width: position.isVariant ? 150 : 180,
          height: 60,
          fontSize: position.isVariant ? '12px' : '14px',
        },
      };
      initialNodes.push(node);
    }
    console.log(`Created ${initialNodes.length} initial nodes representing ${includedPositions.size} positions.`);

    // Step 2: Create edges based on applicable techniques and outcomes
    console.log("Creating edges from applicable techniques and outcomes...");
    
    // --- Edge Creation Logic --- 
    // Edges represent transitions between POSITIONS based on techniques.
    // An edge is drawn FROM a visible starting position (node) TO a visible ending position 
    // if a technique applicable FROM the starting position has an outcome leading TO the ending position.
    // 
    // Process:
    // 1. Iterate through VISIBLE positions (`initialNodes`).
    // 2. For each starting position, get its `applicableTechniqueIds` from the knowledge base.
    // 3. For each applicable technique found:
    //    a. Apply technique filters (type, difficulty, applicability).
    //    b. Check the technique's `outcomes`.
    //    c. If an outcome has an `endPositionId` AND that `endPositionId` corresponds to a VISIBLE position,
    //       create a directed edge FROM the starting position TO the ending position.
    // 
    // * Important Note on Edge Visualization vs. Applicable Techniques:
    //   The side panel lists *all* techniques defined in `applicableTechniqueIds` for a selected position.
    //   However, the graph edges *only* visualize direct transitions *between position nodes*.
    //   Therefore, an applicable technique WILL NOT have a corresponding edge drawn if:
    //     a) Its outcome is not a position change (e.g., a 'Submission' outcome type often lacks an `endPositionId`).
    //     b) Its outcome *does* lead to a position (`endPositionId` exists), but that target position node
    //        is currently hidden due to active filters (e.g., "Show Position Variants" is off).
    //   The graph edges strictly represent potential *positional changes* to other *visible* positions.
    // ---------------------------
    
    for (const startNode of initialNodes) {
        const startPositionId = startNode.data.positionId;
        const positionData = knowledgeBase.positions[startPositionId];

        if (positionData?.applicableTechniqueIds) {
            for (const techniqueId of positionData.applicableTechniqueIds) {
                const technique = knowledgeBase.techniques[techniqueId];
                if (!technique) continue; // Skip if technique not found

                // Apply technique filters
                if (filters.difficulty !== 'all' && technique.difficulty !== filters.difficulty) continue;
                if (filters.applicability !== 'all' && technique.applicability !== filters.applicability) continue;
                const isTransition = [
                    BJJ_TECHNIQUE_TYPE.Sweep, BJJ_TECHNIQUE_TYPE.Escape, BJJ_TECHNIQUE_TYPE.Transition,
                    BJJ_TECHNIQUE_TYPE.Takedown, BJJ_TECHNIQUE_TYPE.GuardPass, BJJ_TECHNIQUE_TYPE.GuardRecovery,
                ].includes(technique.type);
                if (filters.techniqueType !== 'all' && !isTransition && technique.type !== filters.techniqueType) {
                    continue;
                }

                // Check outcomes for end positions
                for (const [outcomeIndex, outcome] of technique.outcomes.entries()) {
                    if (outcome.endPositionId) {
                        const endPositionId = outcome.endPositionId;
                        // Ensure the target position is also visible
                        if (includedPositions.has(endPositionId)) {
                            const edgeId = `${startPositionId}-via-${technique.id}-to-${endPositionId}-${outcomeIndex}`;
                            if (!edgeSet.has(edgeId)) {
                                console.log(`  Edge: ${startPositionId} -> ${endPositionId} (via outcome of ${technique.name})`);
                                const edge: Edge<TechniqueEdgeData> = {
                                    id: edgeId,
                                    source: startPositionId, // Edge originates from the node where technique is applicable
                                    target: endPositionId,
                                    animated: technique.type === BJJ_TECHNIQUE_TYPE.Submission, // Or maybe only for specific transitions?
                                    style: { stroke: techniqueTypeColors[technique.type] || '#888', strokeWidth: 2 },
                                    type: 'smoothstep',
                                    markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: techniqueTypeColors[technique.type] || '#888' },
                                    data: { techniqueId: technique.id, techniqueType: technique.type, label: technique.name },
                                    label: technique.name,
                                    labelStyle: { fill: '#333', fontSize: 11 },
                                    labelBgStyle: { fill: '#f9fafb', fillOpacity: 0.8 },
                                    labelBgPadding: [4, 2],
                                };
                                edgeSet.set(edgeId, edge);
                            }
                        }
                    }
                }
            }
        }
    }

    // Step 3: Add edges from Setup Techniques (keep previous logic)
    console.log("Creating edges from setup techniques...");
    for (const technique of Object.values(knowledgeBase.techniques)) {
        // Apply filters to the main technique as well, maybe?
        // Or assume setup links are always relevant if both positions exist?
        if (technique.setupTechniqueIds) {
            for (const setupTechId of technique.setupTechniqueIds) {
                const setupTechnique = knowledgeBase.techniques[setupTechId];
                if (setupTechnique) {
                    const setupSourcePosId = setupTechnique.originPositionId;
                    const setupTargetPosId = technique.originPositionId;
                    if (includedPositions.has(setupSourcePosId) && includedPositions.has(setupTargetPosId)) {
                        const edgeId = `setup-${setupTechId}-to-${technique.id}`;
                        if (!edgeSet.has(edgeId)) {
                            console.log(`  Setup Edge: ${setupSourcePosId} -> ${setupTargetPosId} (via setup ${setupTechnique.name} for ${technique.name})`);
                            const edge: Edge<TechniqueEdgeData> = {
                                id: edgeId,
                                source: setupSourcePosId,
                                target: setupTargetPosId,
                                style: { stroke: '#cccccc', strokeWidth: 1, strokeDasharray: '5, 5' }, 
                                type: 'smoothstep',
                                markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#cccccc' },
                                data: { techniqueId: setupTechId, techniqueType: setupTechnique.type, label: `Setup: ${setupTechnique.name}` },
                            };
                            edgeSet.set(edgeId, edge);
                        }
                    }
                }
            }
        }
    }
    
    const initialEdges = Array.from(edgeSet.values());
    console.log(`Created ${initialEdges.length} total edges.`);

    // Apply layout algorithm
    const { layoutNodes, layoutEdges } = await getLayoutedElements(
        initialNodes, 
        initialEdges 
    );

    setBaseNodes(layoutNodes); 
    setBaseEdges(layoutEdges); 
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

  // Update graph when base filters or layout direction change
  useEffect(() => {
    // Call the async generateGraph function
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