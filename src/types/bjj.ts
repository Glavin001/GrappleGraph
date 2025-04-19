import type { Node, Edge } from 'reactflow'; // Add reactflow types if not already present
import type { ConcretePositionId, ConcreteTechniqueId } from '../data/bjj_knowledge_base'; // Adjust path if needed

export type PositionId<T extends string = string> = T; // Kebab-case unique identifier, e.g., "closed-guard"
export type TechniqueId<T extends string = string> = T; // Kebab-case unique identifier, e.g., "closed-guard-cross-collar-choke"

/** Defines whether a technique is applicable with or without a Gi */
export enum BjjApplicability {
  Gi = "Gi",
  NoGi = "No-Gi",
  Both = "Both",
}

/** Difficulty level of a technique or concept */
export enum BjjDifficulty {
  Beginner = "Beginner", // Typically first 1-2 years
  Intermediate = "Intermediate",
  Advanced = "Advanced",
}

/** Categorizes the primary purpose of a technique */
export enum BjjTechniqueType {
  Submission = "Submission", // Joint locks, chokes
  Sweep = "Sweep", // Reversing position from bottom to top
  Escape = "Escape", // Getting out of a disadvantageous position
  Transition = "Transition", // Moving between positions (e.g., pass, takedown, back take)
  Control = "Control", // Maintaining a position or grip configuration (e.g., Seatbelt, Body Triangle)
  Takedown = "Takedown", // Taking the fight from standing to the ground
  GuardPass = "Guard Pass", // Moving past the opponent's guard
  GuardRecovery = "Guard Recovery", // Regaining guard from a worse position
}

/** Represents a reference to external media like images or videos */
export interface MediaReference {
  url: string;
  type: "image" | "video";
  caption?: string; // Optional description or context for the media
  source?: string; // Optional source attribution (e.g., website name, video title)
}

/** Describes a potential result of attempting a technique */
export interface TechniqueOutcome<PID extends string = string, TID extends string = string> {
  /** The nature of the outcome */
  type: "PositionChange" | "Submission" | "ControlChange" | "Reset" | "Failure" | "Countered";
  /** The single Position ID describing the resulting state of both players relative to each other (from the 'me' perspective), primarily relevant for PositionChange, Reset, and Countered types. */
  endPositionId?: PositionId<PID>;
  /** Description of the outcome (e.g., "Sweep successful, resulting in Mount", "Opponent recovers Closed Guard", "Submission secured", "Attempt fails, remain in Closed Guard", "Opponent passes to Side Control") */
  description: string;
  /** Likelihood or commonality of this specific outcome for the technique */
  likelihood?: "Primary" | "Secondary" | "Possible" | "CommonCounter";
  /** Optionally link to the technique used by the opponent if this outcome is a counter */
  counteredByTechniqueId?: TechniqueId<TID>;
}


/**
 * Represents a distinct position or a variant/sub-position in BJJ.
 * A Position defines the physical relationship and state between two practitioners
 * from the perspective of ONE participant (e.g., 'Mount' for the top person,
 * 'Mounted' for the bottom person). It inherently describes the role/state of both,
 * but is named and described from one viewpoint.
 * Use `inversePositionId` to find the corresponding position for the other participant.
 * Positions are the nodes in the GrappleGraph.
 */
export interface Position<PID extends string = string, TID extends string = string> {
  /** Unique identifier (e.g., "closed-guard", "mount-high-mount") */
  id: PositionId<PID>;
  /** Display name (e.g., "Closed Guard", "High Mount") */
  name: string;
  /** Detailed description of the position, key control points, goals for top/bottom. */
  description: string;
  /** Alternative names (e.g., "Full Guard" for Closed Guard) */
  aliases?: string[];
  /** If this is a variant/sub-position, ID of the parent (e.g., "mount" for "high-mount") */
  parentPositionId?: PositionId<PID>;
  /** List of IDs for direct variants or sub-positions (e.g., Mount lists High Mount, Low Mount, S-Mount) */
  variantIds?: PositionId<PID>[];
  /** True if this position is a specific variant of a parent position. */
  isVariant?: boolean;
  /** General assessment of positional advantage (Top perspective unless specified) */
  advantage?: "Dominant" | "Advantageous" | "Neutral" | "Disadvantageous" | "Inferior";
  /** Images or videos visually representing the position */
  media?: MediaReference[];
  /** List of technique IDs that can be initiated *from* this position. */
  applicableTechniqueIds?: TechniqueId<TID>[];
  /** The ID of the position describing the state from the *other* participant's perspective. */
  inversePositionId: PositionId<PID>;
  // Future potential fields:
  // keyControlPoints?: string[];
  // commonMistakes?: string[];
  // situationalRelevance?: string; // e.g., "Good for smaller person", "Risky in MMA"
}

/**
 * Represents a specific technique (move) in BJJ.
 * Techniques are the actions that lead to outcomes (potentially transitions/edges in the graph).
 */
export interface Technique<PID extends string = string, TID extends string = string> {
  /** Unique identifier (e.g., "closed-guard-armbar", "standing-double-leg") */
  id: TechniqueId<TID>;
  /** Display name (e.g., "Armbar from Closed Guard", "Double Leg Takedown") */
  name: string;
  /** Detailed description, setup, execution, and finishing details */
  description: string;
  /** Alternative names or common variations (e.g., "Straight Arm Lock" for Armbar) */
  aliases?: string[];
  /** Gi / No-Gi / Both */
  applicability: BjjApplicability;
  /** Beginner / Intermediate / Advanced */
  difficulty: BjjDifficulty;
  /** Submission / Sweep / Escape / Transition / Control / Takedown / GuardPass / GuardRecovery */
  type: BjjTechniqueType;
  /** The Position ID from which this technique is typically initiated */
  originPositionId: PositionId<PID>;
  /** Possible outcomes when this technique is applied. Captures transitions, submissions, counters, etc. */
  outcomes: TechniqueOutcome<PID, TID>[];
  /** Techniques commonly used *by the opponent* to counter this one */
  counteredByTechniqueIds?: TechniqueId<TID>[];
   /** Techniques commonly chained *by the initiator* after successfully applying this one (or during setup) */
  followUpTechniqueIds?: TechniqueId<TID>[];
  /** Techniques that commonly set up this technique */
  setupTechniqueIds?: TechniqueId<TID>[];
  /** Images or videos demonstrating the technique */
  media?: MediaReference[];
  /** Optional step-by-step instructions */
  steps?: string[];
  /** Additional context, variations, common mistakes, or strategic notes */
  notes?: string;
  // Optional: Add risk/reward assessment?
  // riskLevel?: 'Low' | 'Medium' | 'High'; // Risk for the initiator
  // requiredAttributes?: string[]; // e.g., "Flexibility", "Strength", "Long Limbs"
}

/** Represents the entire knowledge base */
export interface BjjKnowledgeBase<PID extends string = string, TID extends string = string> {
  positions: Record<PositionId<PID>, Position<PID, TID>>;
  techniques: Record<TechniqueId<TID>, Technique<PID, TID>>;
} 

// --- Add Graph Specific Types --- 

/** Custom React Flow node data for BJJ Positions */
export type PositionNodeData = {
  label: string;
  positionId: ConcretePositionId;
  advantage?: string;
  isVariant?: boolean;
};

/** Custom React Flow edge data for BJJ Techniques */
export type TechniqueEdgeData = {
  techniqueId: ConcreteTechniqueId;
  techniqueType: BjjTechniqueType;
  label: string;
};

// Optional: Define the full Node/Edge types using these data types
// export type BjjPositionNode = Node<PositionNodeData>;
// export type BjjTechniqueEdge = Edge<TechniqueEdgeData>; 