import type { PositionId, TechniqueId } from "./bjj";

/**
 * Defines the user's proficiency level with a specific technique.
 */
export enum TechniqueProficiency {
  Unknown = "Unknown", // Default state, user hasn't indicated knowledge
  Familiar = "Familiar", // User recognizes the technique, understands its basic goal
  Practiced = "Practiced", // User has drilled the technique, understands steps
  Proficient = "Proficient", // User can apply the technique successfully in live training/sparring
  Mastered = "Mastered", // User applies it instinctively, can teach it, understands nuances
}

/**
 * Defines how frequently the user encounters a specific position.
 */
export enum PositionFrequency {
  Never = "Never", // User hasn't encountered this position
  Rarely = "Rarely", // Encountered, but not regularly
  Occasionally = "Occasionally", // Sometimes encounters this position
  Frequently = "Frequently", // Regularly encounters this position
  VeryFrequently = "VeryFrequently", // One of the user's most common positions
}

/**
 * User-specific data associated with a BJJ Position.
 */
export interface PositionUserData {
  /** 
   * A qualitative representation of how often the user finds themselves in this position.
   */
  frequency: PositionFrequency; 
  // Potential future additions:
  // lastVisited?: Date;
  // userNotes?: string;
}

/**
 * User-specific data associated with a BJJ Technique.
 */
export interface TechniqueUserData {
  /** The user's self-assessed proficiency level with this technique. */
  proficiency: TechniqueProficiency;
  // Potential future additions:
  // effectivenessRating?: number; // 1-5 scale on how well it works for them
  // lastPracticed?: Date;
  // userNotes?: string;
}

/**
 * Represents the personalized BJJ data for a specific user.
 */
export interface UserBjjPersonalization<PID extends string = string, TID extends string = string> {
  /** 
   * A record mapping Position IDs to the user's specific data for that position.
   * Only positions the user has data for need to be included.
   */
  positionStats: Partial<Record<PositionId<PID>, PositionUserData>>;

  /** 
   * A record mapping Technique IDs to the user's specific data for that technique.
   * Techniques default to 'Unknown' proficiency if not present.
   */
  techniqueStats: Partial<Record<TechniqueId<TID>, TechniqueUserData>>;
} 