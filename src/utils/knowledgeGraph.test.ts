import { generateGraphElements, type KnowledgeGraphFilters } from './knowledgeGraph';
import type { BjjKnowledgeBase, PositionNodeData, TechniqueEdgeData } from '../types/bjj';
import { BjjApplicability, BjjDifficulty, BjjTechniqueType } from '../types/bjj';
import type { Node, Edge } from 'reactflow';
import type { ConcretePositionId, ConcreteTechniqueId } from '../data/bjj_knowledge_base';

// --- Mock Data --- 

// Cast the mock data keys to satisfy the stricter types, or use actual enum values if preferred
type MockPositionId = 'pos-a' | 'pos-b' | 'pos-c' | 'pos-variant';
type MockTechniqueId = 'tech-a1' | 'tech-a2' | 'tech-b1' | 'tech-c1' | 'tech-v1';

const mockPositions: Record<MockPositionId, Partial<BjjKnowledgeBase['positions'][ConcretePositionId]>> = {
  'pos-a': { id: 'pos-a' as ConcretePositionId, name: 'Position A', applicableTechniqueIds: ['tech-a1' as ConcreteTechniqueId, 'tech-a2' as ConcreteTechniqueId], inversePositionId: 'pos-a' as ConcretePositionId },
  'pos-b': { id: 'pos-b' as ConcretePositionId, name: 'Position B', applicableTechniqueIds: ['tech-b1' as ConcreteTechniqueId], inversePositionId: 'pos-b' as ConcretePositionId },
  'pos-c': { id: 'pos-c' as ConcretePositionId, name: 'Position C', applicableTechniqueIds: ['tech-c1' as ConcreteTechniqueId], inversePositionId: 'pos-c' as ConcretePositionId },
  'pos-variant': { id: 'pos-variant' as ConcretePositionId, name: 'Position Variant', isVariant: true, applicableTechniqueIds: ['tech-v1' as ConcreteTechniqueId], inversePositionId: 'pos-variant' as ConcretePositionId },
};

const mockTechniques: Record<MockTechniqueId, Partial<BjjKnowledgeBase['techniques'][ConcreteTechniqueId]>> = {
  'tech-a1': { // Basic transition
    id: 'tech-a1' as ConcreteTechniqueId, name: 'Tech A1', originPositionId: 'pos-a' as ConcretePositionId, type: BjjTechniqueType.Transition, difficulty: BjjDifficulty.Beginner, applicability: BjjApplicability.Both,
    outcomes: [ { type: 'PositionChange', endPositionId: 'pos-b' as ConcretePositionId, description: 'Move to B' } ]
  },
  'tech-a2': { // Submission (no edge), specific filter props
    id: 'tech-a2' as ConcreteTechniqueId, name: 'Tech A2', originPositionId: 'pos-a' as ConcretePositionId, type: BjjTechniqueType.Submission, difficulty: BjjDifficulty.Advanced, applicability: BjjApplicability.Gi,
    outcomes: [ { type: 'Submission', description: 'Submit' } ]
  },
  'tech-b1': { // Transition to non-visible (variant)
    id: 'tech-b1' as ConcreteTechniqueId, name: 'Tech B1', originPositionId: 'pos-b' as ConcretePositionId, type: BjjTechniqueType.Transition, difficulty: BjjDifficulty.Beginner, applicability: BjjApplicability.Both,
    outcomes: [ { type: 'PositionChange', endPositionId: 'pos-variant' as ConcretePositionId, description: 'Move to Variant' } ]
  },
  'tech-c1': { // Setup technique reference
    id: 'tech-c1' as ConcreteTechniqueId, name: 'Tech C1', originPositionId: 'pos-c' as ConcretePositionId, type: BjjTechniqueType.Transition, difficulty: BjjDifficulty.Beginner, applicability: BjjApplicability.Both,
    setupTechniqueIds: ['tech-a1' as ConcreteTechniqueId], // Tech A1 sets up Tech C1
    outcomes: [ { type: 'PositionChange', endPositionId: 'pos-a' as ConcretePositionId, description: 'Move to A' } ]
  },
  'tech-v1': { // Technique from variant
    id: 'tech-v1' as ConcreteTechniqueId, name: 'Tech V1', originPositionId: 'pos-variant' as ConcretePositionId, type: BjjTechniqueType.Transition, difficulty: BjjDifficulty.Beginner, applicability: BjjApplicability.Both,
    outcomes: [ { type: 'PositionChange', endPositionId: 'pos-a' as ConcretePositionId, description: 'Move to A' } ]
  },
};

// Cast the whole mock object to the expected type
const mockKnowledgeBase = {
    positions: mockPositions,
    techniques: mockTechniques,
} as unknown as BjjKnowledgeBase<ConcretePositionId, ConcreteTechniqueId>; 

// Default filters for most tests
const defaultFilters: KnowledgeGraphFilters = {
    techniqueType: 'all',
    difficulty: 'all',
    applicability: 'all',
    showVariants: true,
};

// --- Tests --- 

describe('generateGraphElements', () => {

    it('should create nodes for all non-variant positions when showVariants is false', () => {
        const filters = { ...defaultFilters, showVariants: false };
        const { initialNodes } = generateGraphElements(mockKnowledgeBase, filters);
        expect(initialNodes).toHaveLength(3);
        expect(initialNodes.find(n => n.id === 'pos-variant')).toBeUndefined();
        expect(initialNodes.map(n => n.id)).toEqual(expect.arrayContaining(['pos-a', 'pos-b', 'pos-c']));
    });

    it('should create nodes for all positions when showVariants is true', () => {
        const filters = { ...defaultFilters, showVariants: true };
        const { initialNodes } = generateGraphElements(mockKnowledgeBase, filters);
        expect(initialNodes).toHaveLength(4);
        expect(initialNodes.find(n => n.id === 'pos-variant')).toBeDefined();
    });

    it('should create an edge for a basic position change outcome', () => {
        const { initialEdges } = generateGraphElements(mockKnowledgeBase, defaultFilters);
        const edge = initialEdges.find(e => e.source === 'pos-a' && e.target === 'pos-b');
        expect(edge).toBeDefined();
        expect(edge?.data?.techniqueId).toBe('tech-a1' as ConcreteTechniqueId);
    });

    it('should NOT create an edge for a submission outcome', () => {
        const { initialEdges } = generateGraphElements(mockKnowledgeBase, defaultFilters);
        const submissionEdge = initialEdges.find(e => e.data?.techniqueId === ('tech-a2' as ConcreteTechniqueId));
        expect(submissionEdge).toBeUndefined();
    });

    it('should create an edge for a setup technique linking origin positions', () => {
        const { initialEdges } = generateGraphElements(mockKnowledgeBase, defaultFilters);
        const setupEdge = initialEdges.find(e => e.source === ('pos-a' as ConcretePositionId) && e.target === ('pos-c' as ConcretePositionId) && e.data?.isSetupEdge);
        expect(setupEdge).toBeDefined();
        expect(setupEdge?.data?.techniqueId).toBe('tech-a1' as ConcreteTechniqueId);
        expect(setupEdge?.data?.label).toContain('Setup: Tech A1');
    });

    it('should NOT create an outcome edge if the target position is hidden by filters', () => {
        const filters = { ...defaultFilters, showVariants: false }; // Hide pos-variant
        const { initialEdges } = generateGraphElements(mockKnowledgeBase, filters);
        const edgeToVariant = initialEdges.find(e => e.source === ('pos-b' as ConcretePositionId) && e.target === ('pos-variant' as ConcretePositionId));
        expect(edgeToVariant).toBeUndefined();
    });

    it('should filter edges based on technique type', () => {
        const filters = { ...defaultFilters, techniqueType: BjjTechniqueType.Transition };
        const { initialEdges } = generateGraphElements(mockKnowledgeBase, filters);
        expect(initialEdges.some(e => e.data?.techniqueId === ('tech-a1' as ConcreteTechniqueId))).toBe(true);
        expect(initialEdges.some(e => e.data?.techniqueId === ('tech-c1' as ConcreteTechniqueId) && !e.data?.isSetupEdge)).toBe(true);
    });
    
    it('should NOT filter transition-type techniques when filtering by non-transition type', () => {
        const filters = { ...defaultFilters, techniqueType: BjjTechniqueType.Submission };
        const { initialEdges } = generateGraphElements(mockKnowledgeBase, filters);
        expect(initialEdges.some(e => e.data?.techniqueId === ('tech-a1' as ConcreteTechniqueId) && !e.data?.isSetupEdge)).toBe(true);
        expect(initialEdges.some(e => e.data?.techniqueId === ('tech-c1' as ConcreteTechniqueId) && !e.data?.isSetupEdge)).toBe(true);
         expect(initialEdges.some(e => e.data?.techniqueId === ('tech-a1' as ConcreteTechniqueId) && e.data?.isSetupEdge)).toBe(true);
    });

    it('should filter edges based on difficulty', () => {
        const filters = { ...defaultFilters, difficulty: BjjDifficulty.Beginner };
        const { initialEdges } = generateGraphElements(mockKnowledgeBase, filters);
        expect(initialEdges.some(e => e.data?.techniqueId === ('tech-a1' as ConcreteTechniqueId))).toBe(true);
        expect(initialEdges.some(e => e.data?.techniqueId === ('tech-c1' as ConcreteTechniqueId) && !e.data?.isSetupEdge)).toBe(true); 
        expect(initialEdges.some(e => e.data?.isSetupEdge && e.data?.techniqueId === ('tech-a1' as ConcreteTechniqueId))).toBe(true);
    });

    it('should filter edges based on applicability', () => {
        const filters = { ...defaultFilters, applicability: BjjApplicability.NoGi };
        const { initialEdges } = generateGraphElements(mockKnowledgeBase, filters);
        expect(initialEdges.some(e => e.data?.techniqueId === ('tech-a1' as ConcreteTechniqueId))).toBe(true);
        expect(initialEdges.some(e => e.data?.techniqueId === ('tech-c1' as ConcreteTechniqueId) && !e.data?.isSetupEdge)).toBe(true); 
        expect(initialEdges.some(e => e.data?.isSetupEdge && e.data?.techniqueId === ('tech-a1' as ConcreteTechniqueId))).toBe(true);
    });

    // Add more tests: missing data, duplicate edge prevention (implicitly tested by map), etc.

}); 