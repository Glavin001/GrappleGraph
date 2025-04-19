import type { Node, Edge } from 'reactflow';
// Import ELK
import ELK, { type ElkNode, type LayoutOptions, type ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
// Import types from the central types file
import type { PositionNodeData, TechniqueEdgeData } from '../types/bjj';

// Instantiate ELK
const elk = new ELK();

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 60;
const VARIANT_NODE_WIDTH = 150;
const VARIANT_NODE_HEIGHT = 60;

// Default ELK layout options - LAYERED ALGORITHM with ORTHOGONAL routing
const defaultLayoutOptions: LayoutOptions = {
  'elk.algorithm': 'layered',
  'org.eclipse.elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF', // Good standard for layered
  'org.eclipse.elk.edgeRouting': 'ORTHOGONAL',
  // Spacing options for layered/orthogonal
  'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': '100', // Space between layers
  'org.eclipse.elk.spacing.nodeNode': '80',                      // Space between nodes in the same layer
  'org.eclipse.elk.layered.spacing.edgeNodeBetweenLayers': '50', // Space between edge and node vertically
  'org.eclipse.elk.layered.spacing.edgeEdgeBetweenLayers': '50', // Space between edges vertically
  'org.eclipse.elk.spacing.edgeNode': '50',                      // Space between edge and node horizontally
  'org.eclipse.elk.spacing.edgeEdge': '50',                      // Space between edges horizontally
  'org.eclipse.elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES', // Helps maintain some order
  'elk.direction': 'DOWN', // Set default direction to DOWN
};

export const getLayoutedElements = async (
  nodes: Node<PositionNodeData>[],
  edges: Edge<TechniqueEdgeData>[],
  // Direction parameter is not used by force algorithm, keep signature for compatibility
  direction: 'RIGHT' | 'DOWN' = 'DOWN' // Default to DOWN
): Promise<{ layoutNodes: Node<PositionNodeData>[], layoutEdges: Edge<TechniqueEdgeData>[] }> => {
  
  const elkNodes: ElkNode[] = nodes.map(node => ({
    id: node.id,
    width: node.data.isVariant ? VARIANT_NODE_WIDTH : DEFAULT_NODE_WIDTH,
    height: node.data.isVariant ? VARIANT_NODE_HEIGHT : DEFAULT_NODE_HEIGHT,
  }));

  const elkEdges: ElkExtendedEdge[] = edges.map(edge => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  // Pass the direction to the layout options
  const layoutOptions = {
      ...defaultLayoutOptions,
      // 'elk.direction': direction // Apply the direction passed as argument (already set in defaults now)
  };
  
  const graphToLayout: ElkNode = {
    id: 'root',
    layoutOptions: layoutOptions, // Use potentially modified options
    children: elkNodes,
    edges: elkEdges,
  };

  try {
    const layoutedGraph = await elk.layout(graphToLayout);
    
    const newLayoutNodes = nodes.map(node => {
      const elkNode = layoutedGraph.children?.find(n => n.id === node.id);
      // Preserve original node data and style, only update position
      return {
        ...node,
        position: { 
          x: elkNode?.x ?? node.position?.x ?? 0, // Fallback to existing or 0
          y: elkNode?.y ?? node.position?.y ?? 0, // Fallback to existing or 0
        },
      };
    });

    // Return the original edges as ELK doesn't modify them in this structure
    // Edge routing points would be in layoutedGraph.edges if needed later
    return { layoutNodes: newLayoutNodes, layoutEdges: edges };

  } catch (error) {
    console.error("ELK layout failed:", error);
    // Fallback: return original nodes and edges without applying new layout
    return { layoutNodes: nodes, layoutEdges: edges };
  }
};

// Remove type export, types are defined in src/types/bjj.ts
// export type { PositionNodeData, TechniqueEdgeData }; 