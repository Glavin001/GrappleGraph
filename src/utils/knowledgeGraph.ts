import type { Node, Edge } from 'reactflow';
import type {
    BjjKnowledgeBase,
    BjjTechniqueType,
    BjjDifficulty,
    PositionNodeData,
    TechniqueEdgeData,
} from '../types/bjj';
import { BjjTechniqueType as BJJ_TECHNIQUE_TYPE, BjjApplicability } from '../types/bjj';
import type { ConcretePositionId, ConcreteTechniqueId } from '../data/bjj_knowledge_base';

// Re-use color mappings or define them here if needed for edge styling
// For now, assume styling is handled later or passed in if required
const techniqueTypeColors: Record<BjjTechniqueType, string> = {
  [BJJ_TECHNIQUE_TYPE.Submission]: '#dc2626', 
  [BJJ_TECHNIQUE_TYPE.Sweep]: '#2563eb', 
  [BJJ_TECHNIQUE_TYPE.Escape]: '#65a30d', 
  [BJJ_TECHNIQUE_TYPE.Transition]: '#9333ea', 
  [BJJ_TECHNIQUE_TYPE.Control]: '#0891b2', 
  [BJJ_TECHNIQUE_TYPE.Takedown]: '#ea580c', 
  [BJJ_TECHNIQUE_TYPE.GuardPass]: '#ca8a04', 
  [BJJ_TECHNIQUE_TYPE.GuardRecovery]: '#059669',
};

// Define the structure for filters needed by this function
export interface KnowledgeGraphFilters {
  techniqueType: 'all' | BjjTechniqueType;
  difficulty: 'all' | BjjDifficulty;
  applicability: 'all' | BjjApplicability;
  showVariants: boolean;
}

/**
 * Generates React Flow nodes and edges from the BJJ Knowledge Base based on filters.
 * Edges represent positional transitions derived from technique outcomes and setups.
 * 
 * @param knowledgeBase The BJJ knowledge data.
 * @param filters Filters to apply for node and edge visibility.
 * @returns An object containing arrays of initialNodes and initialEdges.
 */
export const generateGraphElements = (
  knowledgeBase: BjjKnowledgeBase<ConcretePositionId, ConcreteTechniqueId>,
  filters: KnowledgeGraphFilters
): { initialNodes: Node<PositionNodeData>[], initialEdges: Edge<TechniqueEdgeData>[] } => {
  console.log("[knowledgeGraph] Generating elements with filters:", filters);
  
  const initialNodes: Node<PositionNodeData>[] = [];
  const edgeSet = new Map<string, Edge<TechniqueEdgeData>>();
  const includedPositions = new Set<ConcretePositionId>();

  // Step 1: Create Nodes (Filter based on showVariants)
  for (const position of Object.values(knowledgeBase.positions)) {
    if (!filters.showVariants && position.isVariant) {
      continue;
    }
    includedPositions.add(position.id);
    
    // Basic node structure - styling is applied in ReactFlowWrapper
    const node: Node<PositionNodeData> = {
      id: position.id,
      type: 'default', // Use default nodes
      position: { x: 0, y: 0 }, // Layout engine will overwrite this
      data: {
        label: position.name,
        positionId: position.id,
        advantage: position.advantage,
        isVariant: position.isVariant,
      },
      // Width/height might be needed by layout engine, pass basic info
      // Actual styling (colors, etc.) is handled in the component
      style: { 
          width: position.isVariant ? 150 : 180, 
          height: 60, 
          fontSize: position.isVariant ? '12px' : '14px' // Pass font size for potential use
      }
    };
    initialNodes.push(node);
  }
  console.log(`[knowledgeGraph] Created ${initialNodes.length} nodes representing ${includedPositions.size} positions.`);

  // Step 2: Create Edges from Applicable Techniques & Outcomes
  console.log("[knowledgeGraph] Creating edges from applicable techniques/outcomes...");
  for (const startNode of initialNodes) {
    const startPositionId = startNode.data.positionId;
    const positionData = knowledgeBase.positions[startPositionId];

    if (positionData?.applicableTechniqueIds) {
      for (const techniqueId of positionData.applicableTechniqueIds) {
        const technique = knowledgeBase.techniques[techniqueId];
        if (!technique) continue;

        // Apply technique filters
        if (filters.difficulty !== 'all' && technique.difficulty !== filters.difficulty) continue;
        if (filters.applicability !== 'all' && 
            technique.applicability !== filters.applicability && 
            technique.applicability !== BjjApplicability.Both) {
            continue;
        }
        const isTransition = [
            BJJ_TECHNIQUE_TYPE.Sweep, BJJ_TECHNIQUE_TYPE.Escape, BJJ_TECHNIQUE_TYPE.Transition,
            BJJ_TECHNIQUE_TYPE.Takedown, BJJ_TECHNIQUE_TYPE.GuardPass, BJJ_TECHNIQUE_TYPE.GuardRecovery,
        ].includes(technique.type);
        if (filters.techniqueType !== 'all' && !isTransition && technique.type !== filters.techniqueType) {
            continue;
        }

        // Check outcomes for positional changes
        for (const [outcomeIndex, outcome] of technique.outcomes.entries()) {
          if (outcome.endPositionId) {
            const endPositionId = outcome.endPositionId;
            if (includedPositions.has(endPositionId)) {
              const edgeId = `${startPositionId}-via-${technique.id}-to-${endPositionId}-${outcomeIndex}`;
              if (!edgeSet.has(edgeId)) {
                console.log(`[knowledgeGraph]   Edge: ${startPositionId} -> ${endPositionId} (via ${technique.name})`);
                const edge: Edge<TechniqueEdgeData> = {
                  id: edgeId,
                  source: startPositionId,
                  target: endPositionId,
                  // Basic edge data, styling applied in component
                  data: { techniqueId: technique.id, techniqueType: technique.type, label: technique.name },
                  // Store type for potential styling later
                  // style: { stroke: techniqueTypeColors[technique.type] || '#888', strokeWidth: 2 },
                  // type: 'smoothstep',
                  // markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: techniqueTypeColors[technique.type] || '#888' },
                  // label: technique.name, // Let component handle label rendering from data
                };
                edgeSet.set(edgeId, edge);
              }
            }
          }
        }
      }
    }
  }

  // Step 3: Create Edges from Setup Techniques
  console.log("[knowledgeGraph] Creating edges from setup techniques...");
  for (const technique of Object.values(knowledgeBase.techniques)) {
    if (technique.setupTechniqueIds) {
      for (const setupTechId of technique.setupTechniqueIds) {
        const setupTechnique = knowledgeBase.techniques[setupTechId];
        if (setupTechnique) {
          const setupSourcePosId = setupTechnique.originPositionId;
          const setupTargetPosId = technique.originPositionId;
          if (includedPositions.has(setupSourcePosId) && includedPositions.has(setupTargetPosId)) {
            const edgeId = `setup-${setupTechId}-to-${technique.id}`;
            if (!edgeSet.has(edgeId)) {
              console.log(`[knowledgeGraph]   Setup Edge: ${setupSourcePosId} -> ${setupTargetPosId} (via setup ${setupTechnique.name})`);
              const edge: Edge<TechniqueEdgeData> = {
                id: edgeId,
                source: setupSourcePosId,
                target: setupTargetPosId,
                // Mark as setup edge in data for potential different styling
                data: { 
                  techniqueId: setupTechId, 
                  techniqueType: setupTechnique.type, 
                  label: `Setup: ${setupTechnique.name}`,
                  isSetupEdge: true // Add flag
                },
                // Basic style or type can be set here if desired
                // style: { stroke: '#cccccc', strokeWidth: 1, strokeDasharray: '5, 5' }, 
                // type: 'smoothstep',
                // markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#cccccc' },
              };
              edgeSet.set(edgeId, edge);
            }
          }
        }
      }
    }
  }
  
  const initialEdges = Array.from(edgeSet.values());
  console.log(`[knowledgeGraph] Created ${initialEdges.length} total edges.`);

  return { initialNodes, initialEdges };
}; 