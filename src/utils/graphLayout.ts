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

// Default ELK layout options - FORCE ALGORITHM
const defaultLayoutOptions: LayoutOptions = {
  'elk.algorithm': 'force',
  // Increase spacing further
  'org.eclipse.elk.spacing.nodeNode': '250', // Min distance between nodes
  'org.eclipse.elk.force.idealEdgeLength': '250', // Preferred edge length
  'org.eclipse.elk.edgeRouting': 'POLYLINE',
};

export const getLayoutedElements = async (
  nodes: Node<PositionNodeData>[],
  edges: Edge<TechniqueEdgeData>[],
  // Direction parameter is not used by force algorithm, keep signature for compatibility
  direction: 'RIGHT' | 'DOWN' = 'RIGHT' 
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

  const graphToLayout: ElkNode = {
    id: 'root',
    layoutOptions: defaultLayoutOptions,
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