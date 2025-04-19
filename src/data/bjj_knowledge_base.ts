import {
  type BjjKnowledgeBase,
  type Position,
  type Technique,
  BjjApplicability,
  BjjDifficulty,
  BjjTechniqueType,
} from '../types/bjj';

// --- Helper function to create media references (optional, for cleaner code) ---
const media = (url: string, type: 'image' | 'video', caption?: string, source?: string): { url: string; type: 'image' | 'video'; caption?: string, source?: string } => ({ url, type, caption, source });

// --- Define Position IDs ---
// Note: Using conventions like '-top', '-bottom', 'in-' prefix for clarity on perspective
const POSITIONS = {
  SUBMISSION: 'submission',
  STANDING: 'standing',
  // Mount
  MOUNT_TOP: 'mount-top',
  MOUNT_BOTTOM: 'mount-bottom', // Being mounted
  MOUNT_HIGH_TOP: 'mount-high-top',
  MOUNT_HIGH_BOTTOM: 'mount-high-bottom',
  MOUNT_LOW_TOP: 'mount-low-top',
  MOUNT_LOW_BOTTOM: 'mount-low-bottom',
  MOUNT_S_TOP: 'mount-s-top', // Technical Mount
  MOUNT_S_BOTTOM: 'mount-s-bottom',
  // Side Control
  SIDE_CONTROL_TOP: 'side-control-top',
  SIDE_CONTROL_BOTTOM: 'side-control-bottom',
  KESAGATAME_TOP: 'kesagatame-top', // Scarf Hold
  KESAGATAME_BOTTOM: 'kesagatame-bottom',
  NORTH_SOUTH_TOP: 'north-south-top',
  NORTH_SOUTH_BOTTOM: 'north-south-bottom',
  // Back Control
  BACK_CONTROL_TOP: 'back-control-top', // Taking the back
  BACK_CONTROL_BOTTOM: 'back-control-bottom', // Back taken
  BODY_TRIANGLE_TOP: 'body-triangle-top', // Specific control from back
  BODY_TRIANGLE_BOTTOM: 'body-triangle-bottom',
  // Knee On Belly
  KNEE_ON_BELLY_TOP: 'knee-on-belly-top',
  KNEE_ON_BELLY_BOTTOM: 'knee-on-belly-bottom',
  // Turtle
  TURTLE_TOP: 'turtle-top', // Attacking turtle
  TURTLE_BOTTOM: 'turtle-bottom', // Being turtled
  // Closed Guard
  CLOSED_GUARD_BOTTOM: 'closed-guard-bottom', // Playing closed guard
  CLOSED_GUARD_TOP: 'closed-guard-top', // Inside closed guard
  // Half Guard
  HALF_GUARD_BOTTOM: 'half-guard-bottom',
  HALF_GUARD_TOP: 'half-guard-top',
  DEEP_HALF_GUARD_BOTTOM: 'deep-half-guard-bottom',
  DEEP_HALF_GUARD_TOP: 'deep-half-guard-top',
  Z_GUARD_BOTTOM: 'z-guard-bottom', // Half guard w/ knee shield
  Z_GUARD_TOP: 'z-guard-top',
  // --- Open Guards (Primarily Bottom Perspective, add Top perspectives as needed) ---
  // Define Top perspective (e.g., 'in-butterfly-guard-top') when specific techniques/goals differ significantly from general 'guard-top'
  OPEN_GUARD_BOTTOM: 'open-guard-bottom', // Generic open guard
  OPEN_GUARD_TOP: 'open-guard-top', // Generic opponent in open guard
  BUTTERFLY_GUARD_BOTTOM: 'butterfly-guard-bottom',
  BUTTERFLY_GUARD_TOP: 'butterfly-guard-top', // In butterfly guard
  SPIDER_GUARD_BOTTOM: 'spider-guard-bottom', // Gi Only
  SPIDER_GUARD_TOP: 'spider-guard-top', // In spider guard
  DE_LA_RIVA_GUARD_BOTTOM: 'de-la-riva-guard-bottom', // DLR
  DE_LA_RIVA_GUARD_TOP: 'de-la-riva-guard-top', // In DLR
  REVERSE_DE_LA_RIVA_GUARD_BOTTOM: 'reverse-de-la-riva-guard-bottom', // RDLR
  REVERSE_DE_LA_RIVA_GUARD_TOP: 'reverse-de-la-riva-guard-top', // In RDLR
  // TODO: Add X-Guard, Single-Leg X, 50/50, Lasso, Lapel/Worm etc.
} as const;


// --- Define Technique IDs ---
const TECHNIQUES = {
  // Standing
  STANDING_DOUBLE_LEG: 'standing-double-leg-takedown',
  STANDING_SINGLE_LEG: 'standing-single-leg-takedown',
  STANDING_OSOTO_GARI: 'standing-osoto-gari',
  STANDING_GUARD_PULL: 'standing-guard-pull',
  STANDING_GUILLOTINE: 'standing-guillotine-choke',
  // Closed Guard (Bottom)
  CG_BOTTOM_CROSS_COLLAR_CHOKE: 'closed-guard-bottom-cross-collar-choke',
  CG_BOTTOM_KIMURA: 'closed-guard-bottom-kimura',
  CG_BOTTOM_GUILLOTINE: 'closed-guard-bottom-guillotine',
  CG_BOTTOM_TRIANGLE_CHOKE: 'closed-guard-bottom-triangle-choke',
  CG_BOTTOM_ARMBAR: 'closed-guard-bottom-armbar',
  CG_BOTTOM_OMOPLATA: 'closed-guard-bottom-omoplata',
  CG_BOTTOM_HIP_BUMP_SWEEP: 'closed-guard-bottom-hip-bump-sweep',
  CG_BOTTOM_SCISSOR_SWEEP: 'closed-guard-bottom-scissor-sweep',
  CG_BOTTOM_FLOWER_SWEEP: 'closed-guard-bottom-flower-sweep',
  CG_BOTTOM_DOUBLE_ANKLE_SWEEP: 'closed-guard-bottom-double-ankle-sweep',
  CG_BOTTOM_ARM_DRAG_TO_BACK: 'closed-guard-bottom-arm-drag-to-back',
  // Closed Guard (Top)
  CG_TOP_GUARD_BREAK_PASS: 'closed-guard-top-guard-break-pass', // Generic break + pass concept
  CG_TOP_POSTURE_UP: 'closed-guard-top-posture-up',
  CG_TOP_ELBOW_KNEE_BREAK: 'closed-guard-top-elbow-knee-break',
  CG_TOP_STAND_BREAK: 'closed-guard-top-stand-break',
  CG_TOP_OVER_UNDER_PASS: 'closed-guard-top-over-under-pass',
  CG_TOP_TOREANDO_PASS: 'closed-guard-top-toreando-pass', // Often after standing break
  // Mount (Top)
  MOUNT_TOP_ARMBAR: 'mount-top-armbar',
  MOUNT_TOP_AMERICANA: 'mount-top-americana',
  MOUNT_TOP_CROSS_COLLAR_CHOKE: 'mount-top-cross-collar-choke',
  MOUNT_TOP_EZEKIEL_CHOKE: 'mount-top-ezekiel-choke',
  MOUNT_TOP_ARM_TRIANGLE: 'mount-top-arm-triangle-choke',
  MOUNT_TOP_S_MOUNT_TRANSITION: 'mount-top-s-mount-transition',
  MOUNT_TOP_BACK_TAKE_GIFT_WRAP: 'mount-top-back-take-gift-wrap',
  // Mount (Bottom) - Escapes
  MOUNT_BOTTOM_UPA_ESCAPE: 'mount-bottom-upa-escape',
  MOUNT_BOTTOM_ELBOW_KNEE_ESCAPE: 'mount-bottom-elbow-knee-escape',
  // Side Control (Top)
  SC_TOP_AMERICANA: 'side-control-top-americana',
  SC_TOP_KIMURA: 'side-control-top-kimura',
  SC_TOP_ARMBAR: 'side-control-top-armbar',
  SC_TOP_ARM_TRIANGLE: 'side-control-top-arm-triangle-choke',
  SC_TOP_PAPER_CUTTER_CHOKE: 'side-control-top-paper-cutter-choke',
  SC_TOP_KNEE_ON_BELLY_TRANSITION: 'side-control-top-knee-on-belly-transition',
  SC_TOP_MOUNT_TRANSITION: 'side-control-top-mount-transition',
  SC_TOP_BACK_TAKE: 'side-control-top-back-take',
  SC_TOP_NORTH_SOUTH_TRANSITION: 'side-control-top-north-south-transition',
  SC_TOP_KESAGATAME_TRANSITION: 'side-control-top-kesagatame-transition',
  // Side Control (Bottom) - Escapes
  SC_BOTTOM_SHRIMP_ESCAPE: 'side-control-bottom-shrimp-escape',
  SC_BOTTOM_BRIDGE_ROLL_ESCAPE: 'side-control-bottom-bridge-roll-escape',
  SC_BOTTOM_UNDERHOOK_ESCAPE_KNEES: 'side-control-bottom-underhook-escape-knees',
  // Back Control (Top)
  BC_TOP_RNC: 'back-control-top-rear-naked-choke',
  BC_TOP_BOW_ARROW_CHOKE: 'back-control-top-bow-arrow-choke',
  BC_TOP_BODY_TRIANGLE_CONTROL: 'back-control-top-body-triangle-control',
  BC_TOP_SEATBELT_CONTROL: 'back-control-top-seatbelt-control',
  // Back Control (Bottom) - Escapes
  BC_BOTTOM_TURN_IN_ESCAPE: 'back-control-bottom-turn-in-escape',
  BC_BOTTOM_CHAIR_SIT_ESCAPE: 'back-control-bottom-chair-sit-escape',
  BC_BOTTOM_WRIST_CONTROL_ESCAPE: 'back-control-bottom-wrist-control-escape',
  // Knee on Belly (Top)
  KOB_TOP_FAR_SIDE_ARMBAR: 'knee-on-belly-top-far-side-armbar',
  KOB_TOP_BASEBALL_CHOKE: 'knee-on-belly-top-baseball-choke',
  KOB_TOP_MOUNT_TRANSITION: 'knee-on-belly-top-mount-transition',
  KOB_TOP_BACKSTEP_SIDE_CONTROL: 'knee-on-belly-top-backstep-side-control',
  // Knee on Belly (Bottom) - Escapes
  KOB_BOTTOM_SHRIMP_ESCAPE: 'knee-on-belly-bottom-shrimp-escape',
  KOB_BOTTOM_BRIDGE_UNDERHOOK_ESCAPE: 'knee-on-belly-bottom-bridge-underhook-escape',
  // Turtle (Top)
  TURTLE_TOP_BACK_TAKE_ROLL: 'turtle-top-back-take-roll',
  TURTLE_TOP_BACK_TAKE_DRAG: 'turtle-top-back-take-drag',
  TURTLE_TOP_CLOCK_CHOKE: 'turtle-top-clock-choke',
  TURTLE_TOP_ANACONDA_CHOKE: 'turtle-top-anaconda-choke',
  TURTLE_TOP_DARCE_CHOKE: 'turtle-top-darce-choke',
  TURTLE_TOP_BREAKDOWN_TO_SIDE_CONTROL: 'turtle-top-breakdown-to-side-control',
  // Turtle (Bottom) - Escapes
  TURTLE_BOTTOM_GRANBY_ROLL: 'turtle-bottom-granby-roll',
  TURTLE_BOTTOM_SIT_OUT: 'turtle-bottom-sit-out',
  TURTLE_BOTTOM_STAND_UP: 'turtle-bottom-stand-up',
  TURTLE_BOTTOM_PULL_GUARD: 'turtle-bottom-pull-guard',
  // Butterfly Guard (Bottom)
  BFG_BOTTOM_SWEEP: 'butterfly-guard-bottom-sweep',
  BFG_BOTTOM_ARM_DRAG: 'butterfly-guard-bottom-arm-drag',
  // Half Guard (Bottom)
  HG_BOTTOM_OLD_SCHOOL_SWEEP: 'half-guard-bottom-old-school-sweep',
  HG_BOTTOM_BACK_TAKE: 'half-guard-bottom-back-take',
  // Half Guard (Top)
  HG_TOP_KNEE_CUT_PASS: 'half-guard-top-knee-cut-pass',
  HG_TOP_CROSSFACE_UNDERHOOK_CONTROL: 'half-guard-top-crossface-underhook-control',
  // Placeholder Techniques for Connectivity
  KESAGATAME_BOTTOM_ESCAPE: 'kesagatame-bottom-escape',
  NORTH_SOUTH_BOTTOM_ESCAPE: 'north-south-bottom-escape',
  BODY_TRIANGLE_BOTTOM_ESCAPE: 'body-triangle-bottom-escape',
  DEEP_HALF_GUARD_BOTTOM_SWEEP: 'deep-half-guard-bottom-sweep',
  DEEP_HALF_GUARD_TOP_PASS: 'deep-half-guard-top-pass',
  Z_GUARD_BOTTOM_SWEEP: 'z-guard-bottom-sweep',
  Z_GUARD_TOP_PASS: 'z-guard-top-pass',
  SPIDER_GUARD_BOTTOM_SWEEP: 'spider-guard-bottom-sweep',
  SPIDER_GUARD_TOP_PASS: 'spider-guard-top-pass',
  DE_LA_RIVA_GUARD_BOTTOM_SWEEP: 'de-la-riva-guard-bottom-sweep',
  DE_LA_RIVA_GUARD_TOP_PASS: 'de-la-riva-guard-top-pass',
  REVERSE_DE_LA_RIVA_GUARD_BOTTOM_SWEEP: 'reverse-de-la-riva-guard-bottom-sweep',
  REVERSE_DE_LA_RIVA_GUARD_TOP_PASS: 'reverse-de-la-riva-guard-top-pass',
  BUTTERFLY_GUARD_TOP_PASS: 'butterfly-guard-top-pass',
} as const;

// --- Derive concrete types from constants ---
export type ConcretePositionId = typeof POSITIONS[keyof typeof POSITIONS];
export type ConcreteTechniqueId = typeof TECHNIQUES[keyof typeof TECHNIQUES];

export const bjjKnowledgeBase: BjjKnowledgeBase<ConcretePositionId, ConcreteTechniqueId> = {
  positions: {
    [POSITIONS.SUBMISSION]: {
      id: POSITIONS.SUBMISSION,
      name: 'Submission (Applied)',
      description: 'A submission has been applied and the match is considered finished unless the opponent escapes. This is a terminal state in the grappling exchange.',
      advantage: 'Disadvantageous', // 'Terminal',
      applicableTechniqueIds: [],
      inversePositionId: POSITIONS.SUBMISSION, // No inverse; terminal state
    },

    // --- Standing ---
    [POSITIONS.STANDING]: {
      id: POSITIONS.STANDING,
      name: 'Standing (Neutral)',
      description: 'Both fighters are standing, neither has a dominant ground position. The goal is usually to transition to the ground in a favorable position via takedown or guard pull.',
      advantage: 'Neutral',
      applicableTechniqueIds: [
        TECHNIQUES.STANDING_DOUBLE_LEG,
        TECHNIQUES.STANDING_SINGLE_LEG,
        TECHNIQUES.STANDING_OSOTO_GARI,
        TECHNIQUES.STANDING_GUARD_PULL,
        TECHNIQUES.STANDING_GUILLOTINE,
      ],
      inversePositionId: POSITIONS.STANDING, // Inverse of standing is standing
    },

    // --- Closed Guard ---
    [POSITIONS.CLOSED_GUARD_BOTTOM]: {
      id: POSITIONS.CLOSED_GUARD_BOTTOM,
      name: 'Closed Guard (Bottom)',
      aliases: ['Full Guard'],
      description: 'Playing guard with legs locked around the opponent\'s waist. Offers high control and offensive options (sweeps, submissions) for the bottom player. Goal: Attack or transition to open guard/sweep.',
      advantage: 'Neutral', // Often considered neutral or slightly advantageous for bottom in pure BJJ
      media: [media('https://commons.wikimedia.org/wiki/File:Brazilian_Jiu-jitsu-Closed_guard.jpg', 'image', 'Closed Guard')],
      applicableTechniqueIds: [
        TECHNIQUES.CG_BOTTOM_CROSS_COLLAR_CHOKE,
        TECHNIQUES.CG_BOTTOM_KIMURA,
        TECHNIQUES.CG_BOTTOM_GUILLOTINE,
        TECHNIQUES.CG_BOTTOM_TRIANGLE_CHOKE,
        TECHNIQUES.CG_BOTTOM_ARMBAR,
        TECHNIQUES.CG_BOTTOM_OMOPLATA,
        TECHNIQUES.CG_BOTTOM_HIP_BUMP_SWEEP,
        TECHNIQUES.CG_BOTTOM_SCISSOR_SWEEP,
        TECHNIQUES.CG_BOTTOM_FLOWER_SWEEP,
        TECHNIQUES.CG_BOTTOM_DOUBLE_ANKLE_SWEEP,
        TECHNIQUES.CG_BOTTOM_ARM_DRAG_TO_BACK,
      ],
      inversePositionId: POSITIONS.CLOSED_GUARD_TOP,
    },
    [POSITIONS.CLOSED_GUARD_TOP]: {
      id: POSITIONS.CLOSED_GUARD_TOP,
      name: 'Closed Guard (Top)',
      aliases: ['In Closed Guard'],
      description: 'Positioned inside the opponent\'s locked guard. Difficult to attack from. Goal: Maintain posture, break the guard open, and pass to a dominant position (Side Control, Mount).',
      advantage: 'Neutral', // Or slightly disadvantageous due to limited offense
      applicableTechniqueIds: [
        TECHNIQUES.CG_TOP_GUARD_BREAK_PASS,
        TECHNIQUES.CG_TOP_POSTURE_UP,
        TECHNIQUES.CG_TOP_ELBOW_KNEE_BREAK,
        TECHNIQUES.CG_TOP_STAND_BREAK,
        TECHNIQUES.CG_TOP_OVER_UNDER_PASS, // Typically after break
        TECHNIQUES.CG_TOP_TOREANDO_PASS, // Typically after standing break
      ],
      inversePositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
    },

     // --- Mount ---
     [POSITIONS.MOUNT_TOP]: {
      id: POSITIONS.MOUNT_TOP,
      name: 'Mount (Top)',
      aliases: ['Full Mount'],
      description: 'Sitting astride the opponent\'s torso, knees often pinched. Highly dominant position offering gravity advantage for control and submissions. Goal: Maintain position, isolate limbs/neck for submissions, transition to back if opponent turns.',
      advantage: 'Dominant',
      media: [media('https://commons.wikimedia.org/wiki/File:Gina_Carano_ground-and-pound.jpg', 'image', 'Full Mount in MMA (concept illustration)')],
      variantIds: [POSITIONS.MOUNT_HIGH_TOP, POSITIONS.MOUNT_LOW_TOP, POSITIONS.MOUNT_S_TOP],
      applicableTechniqueIds: [
        TECHNIQUES.MOUNT_TOP_ARMBAR,
        TECHNIQUES.MOUNT_TOP_AMERICANA,
        TECHNIQUES.MOUNT_TOP_CROSS_COLLAR_CHOKE,
        TECHNIQUES.MOUNT_TOP_EZEKIEL_CHOKE,
        TECHNIQUES.MOUNT_TOP_ARM_TRIANGLE,
        TECHNIQUES.MOUNT_TOP_S_MOUNT_TRANSITION,
        TECHNIQUES.MOUNT_TOP_BACK_TAKE_GIFT_WRAP,
      ],
      inversePositionId: POSITIONS.MOUNT_BOTTOM,
    },
    [POSITIONS.MOUNT_BOTTOM]: {
      id: POSITIONS.MOUNT_BOTTOM,
      name: 'Mount (Bottom)',
      aliases: ['Mounted'],
      description: 'Opponent is sitting on your torso. Highly disadvantageous position. Goal: Create space using bridges (upa) and hip escapes (shrimping) to escape back to guard (closed or half) or create scrambles.',
      advantage: 'Inferior',
      applicableTechniqueIds: [
        TECHNIQUES.MOUNT_BOTTOM_UPA_ESCAPE,
        TECHNIQUES.MOUNT_BOTTOM_ELBOW_KNEE_ESCAPE,
        // TODO: Add Hip Push, Back Door escapes
      ],
      inversePositionId: POSITIONS.MOUNT_TOP,
    },
    // --- Mount Variants ---
    [POSITIONS.MOUNT_HIGH_TOP]: {
      id: POSITIONS.MOUNT_HIGH_TOP,
      name: 'High Mount (Top)',
      description: 'Mount variant where the top player sits higher on the opponent\'s chest, making arm attacks easier.',
      advantage: 'Dominant',
      parentPositionId: POSITIONS.MOUNT_TOP,
      isVariant: true,
      applicableTechniqueIds: [
        TECHNIQUES.MOUNT_TOP_ARMBAR, // More common from high mount
        TECHNIQUES.MOUNT_TOP_EZEKIEL_CHOKE,
      ],
      inversePositionId: POSITIONS.MOUNT_HIGH_BOTTOM,
    },
    [POSITIONS.MOUNT_HIGH_BOTTOM]: {
      id: POSITIONS.MOUNT_HIGH_BOTTOM,
      name: 'High Mount (Bottom)',
      description: 'Opponent is mounted high on the chest, making breathing difficult and escapes harder.',
      advantage: 'Inferior',
      parentPositionId: POSITIONS.MOUNT_BOTTOM,
      isVariant: true,
      applicableTechniqueIds: [
        TECHNIQUES.MOUNT_BOTTOM_UPA_ESCAPE, // Harder to execute
        TECHNIQUES.MOUNT_BOTTOM_ELBOW_KNEE_ESCAPE, // Still viable
      ],
      inversePositionId: POSITIONS.MOUNT_HIGH_TOP,
    },
    [POSITIONS.MOUNT_LOW_TOP]: {
      id: POSITIONS.MOUNT_LOW_TOP,
      name: 'Low Mount (Top)',
      description: 'Mount variant where the top player sits lower towards the opponent\'s hips, focusing on base and control.',
      advantage: 'Dominant',
      parentPositionId: POSITIONS.MOUNT_TOP,
      isVariant: true,
      applicableTechniqueIds: [
        TECHNIQUES.MOUNT_TOP_AMERICANA, // Easier setup
      ],
      inversePositionId: POSITIONS.MOUNT_LOW_BOTTOM,
    },
    [POSITIONS.MOUNT_LOW_BOTTOM]: {
      id: POSITIONS.MOUNT_LOW_BOTTOM,
      name: 'Low Mount (Bottom)',
      description: 'Opponent is mounted low near the hips, potentially allowing more hip movement for escapes.',
      advantage: 'Inferior',
      parentPositionId: POSITIONS.MOUNT_BOTTOM,
      isVariant: true,
      applicableTechniqueIds: [
        TECHNIQUES.MOUNT_BOTTOM_UPA_ESCAPE, // Potentially easier
        TECHNIQUES.MOUNT_BOTTOM_ELBOW_KNEE_ESCAPE,
      ],
      inversePositionId: POSITIONS.MOUNT_LOW_TOP,
    },
    [POSITIONS.MOUNT_S_TOP]: {
      id: POSITIONS.MOUNT_S_TOP,
      name: 'S-Mount (Top)',
      aliases: ['Technical Mount'],
      description: 'Mount variant where one leg is across the belly and the other knee is high near the head, forming an \'S\'. Excellent for isolating an arm.',
      advantage: 'Dominant',
      parentPositionId: POSITIONS.MOUNT_TOP,
      isVariant: true,
      applicableTechniqueIds: [
        TECHNIQUES.MOUNT_TOP_ARMBAR, // Primary attack
        TECHNIQUES.MOUNT_TOP_ARM_TRIANGLE, // Can transition
        TECHNIQUES.MOUNT_TOP_BACK_TAKE_GIFT_WRAP, // If opponent turns
      ],
      inversePositionId: POSITIONS.MOUNT_S_BOTTOM,
    },
    [POSITIONS.MOUNT_S_BOTTOM]: {
      id: POSITIONS.MOUNT_S_BOTTOM,
      name: 'S-Mount (Bottom)',
      description: 'Opponent has achieved S-Mount, putting one arm at high risk.',
      advantage: 'Inferior',
      parentPositionId: POSITIONS.MOUNT_BOTTOM,
      isVariant: true,
      applicableTechniqueIds: [
        // Escapes are specific and difficult, often pre-emptive defence is key
        TECHNIQUES.MOUNT_BOTTOM_ELBOW_KNEE_ESCAPE, // Must address the S-configuration
      ],
      inversePositionId: POSITIONS.MOUNT_S_TOP,
    },

    // --- Side Control ---
    [POSITIONS.SIDE_CONTROL_TOP]: {
      id: POSITIONS.SIDE_CONTROL_TOP,
      name: 'Side Control (Top)',
      aliases: ['Side Mount', 'Cross Side'],
      description: 'Controlling opponent chest-to-chest from the side. Dominant position using crossface and underhook/overhook for control. Goal: Maintain control, transition to Mount, Knee-on-Belly, North-South, or Back Control, or apply submissions.',
      advantage: 'Dominant',
      variantIds: [POSITIONS.KESAGATAME_TOP, POSITIONS.NORTH_SOUTH_TOP], // Add modified Kesa later
      applicableTechniqueIds: [
        TECHNIQUES.SC_TOP_AMERICANA,
        TECHNIQUES.SC_TOP_KIMURA,
        TECHNIQUES.SC_TOP_ARMBAR,
        TECHNIQUES.SC_TOP_ARM_TRIANGLE,
        TECHNIQUES.SC_TOP_PAPER_CUTTER_CHOKE,
        TECHNIQUES.SC_TOP_KNEE_ON_BELLY_TRANSITION,
        TECHNIQUES.SC_TOP_MOUNT_TRANSITION,
        TECHNIQUES.SC_TOP_BACK_TAKE,
        TECHNIQUES.SC_TOP_NORTH_SOUTH_TRANSITION,
        TECHNIQUES.SC_TOP_KESAGATAME_TRANSITION,
      ],
      inversePositionId: POSITIONS.SIDE_CONTROL_BOTTOM,
    },
    [POSITIONS.SIDE_CONTROL_BOTTOM]: {
      id: POSITIONS.SIDE_CONTROL_BOTTOM,
      name: 'Side Control (Bottom)',
      description: 'Pinned underneath opponent who is controlling from the side. Disadvantageous position. Goal: Create frames, use hip escapes (shrimp) to recover guard, bridge and roll, or transition to turtle.',
      advantage: 'Inferior',
      applicableTechniqueIds: [
        TECHNIQUES.SC_BOTTOM_SHRIMP_ESCAPE,
        TECHNIQUES.SC_BOTTOM_BRIDGE_ROLL_ESCAPE,
        TECHNIQUES.SC_BOTTOM_UNDERHOOK_ESCAPE_KNEES,
        // TODO: Add Rolling Escape (Bridge to Single Leg)
      ],
      inversePositionId: POSITIONS.SIDE_CONTROL_TOP,
    },
    // --- Side Control Variants ---
    [POSITIONS.KESAGATAME_TOP]: {
      id: POSITIONS.KESAGATAME_TOP,
      name: 'Kesa Gatame (Top)',
      aliases: ['Scarf Hold'],
      description: 'Side control variant where the top player controls the opponent\'s head and arm, sitting perpendicular.',
      advantage: 'Advantageous',
      parentPositionId: POSITIONS.SIDE_CONTROL_TOP,
      isVariant: true,
      applicableTechniqueIds: [
        // Add Kesa-specific subs like Americana, Armbar variation
      ],
      inversePositionId: POSITIONS.KESAGATAME_BOTTOM,
    },
    [POSITIONS.KESAGATAME_BOTTOM]: {
      id: POSITIONS.KESAGATAME_BOTTOM,
      name: 'Kesa Gatame (Bottom)',
      aliases: ['In Scarf Hold'],
      description: 'Opponent is controlling head and arm using Kesa Gatame.',
      advantage: 'Disadvantageous',
      parentPositionId: POSITIONS.SIDE_CONTROL_BOTTOM,
      isVariant: true,
      applicableTechniqueIds: [
        // Add specific Kesa escapes
        TECHNIQUES.KESAGATAME_BOTTOM_ESCAPE,
      ],
      inversePositionId: POSITIONS.KESAGATAME_TOP,
    },
    [POSITIONS.NORTH_SOUTH_TOP]: {
      id: POSITIONS.NORTH_SOUTH_TOP,
      name: 'North-South (Top)',
      description: 'Side control variant where the top player faces the opponent\'s legs, chest on chest.',
      advantage: 'Advantageous',
      parentPositionId: POSITIONS.SIDE_CONTROL_TOP,
      isVariant: true,
      applicableTechniqueIds: [
        // Add N/S Choke, Kimura
      ],
      inversePositionId: POSITIONS.NORTH_SOUTH_BOTTOM,
    },
    [POSITIONS.NORTH_SOUTH_BOTTOM]: {
      id: POSITIONS.NORTH_SOUTH_BOTTOM,
      name: 'North-South (Bottom)',
      description: 'Opponent is in North-South position on top.',
      advantage: 'Disadvantageous',
      parentPositionId: POSITIONS.SIDE_CONTROL_BOTTOM,
      isVariant: true,
      applicableTechniqueIds: [
        // Add N/S escapes
        TECHNIQUES.NORTH_SOUTH_BOTTOM_ESCAPE,
      ],
      inversePositionId: POSITIONS.NORTH_SOUTH_TOP,
    },

     // --- Back Control ---
    [POSITIONS.BACK_CONTROL_TOP]: {
      id: POSITIONS.BACK_CONTROL_TOP,
      name: 'Back Control (Top)',
      aliases: ['Back Mount', 'Rear Mount'],
      description: 'Positioned behind the opponent, chest-to-back, typically with hooks in or body triangle. Considered the most dominant attacking position. Goal: Maintain control (seatbelt grip), apply chokes (RNC, Gi chokes).',
      advantage: 'Dominant', // Often considered most dominant
      variantIds: [POSITIONS.BODY_TRIANGLE_TOP], // Add Hooks variant if needed
      applicableTechniqueIds: [
        TECHNIQUES.BC_TOP_RNC,
        TECHNIQUES.BC_TOP_BOW_ARROW_CHOKE,
        TECHNIQUES.BC_TOP_BODY_TRIANGLE_CONTROL, // Control technique
        TECHNIQUES.BC_TOP_SEATBELT_CONTROL, // Control technique
        // TODO: Add Rear Triangle & Armbar Combo
      ],
      inversePositionId: POSITIONS.BACK_CONTROL_BOTTOM,
    },
    [POSITIONS.BACK_CONTROL_BOTTOM]: {
      id: POSITIONS.BACK_CONTROL_BOTTOM,
      name: 'Back Control (Bottom)',
      aliases: ['Back Taken'],
      description: 'Opponent is on your back with control (hooks or body triangle). Extremely disadvantageous, vulnerable to chokes. Goal: Protect neck, strip grips/hooks, escape by turning in to face opponent (usually into their guard).',
      advantage: 'Inferior', // Often considered worst position
      applicableTechniqueIds: [
        TECHNIQUES.BC_BOTTOM_TURN_IN_ESCAPE,
        TECHNIQUES.BC_BOTTOM_CHAIR_SIT_ESCAPE,
        TECHNIQUES.BC_BOTTOM_WRIST_CONTROL_ESCAPE,
        // TODO: Add Peel Hooks, Flatten Out Prevention concepts
      ],
      inversePositionId: POSITIONS.BACK_CONTROL_TOP,
    },
    // --- Back Control Variants ---
    [POSITIONS.BODY_TRIANGLE_TOP]: {
      id: POSITIONS.BODY_TRIANGLE_TOP,
      name: 'Body Triangle (Top)',
      description: 'Back control variant using legs locked in a triangle around the opponent\'s torso for strong control.',
      advantage: 'Dominant',
      parentPositionId: POSITIONS.BACK_CONTROL_TOP,
      isVariant: true,
      applicableTechniqueIds: [
        TECHNIQUES.BC_TOP_RNC,
        TECHNIQUES.BC_TOP_BOW_ARROW_CHOKE,
      ],
      inversePositionId: POSITIONS.BODY_TRIANGLE_BOTTOM,
    },
    [POSITIONS.BODY_TRIANGLE_BOTTOM]: {
      id: POSITIONS.BODY_TRIANGLE_BOTTOM,
      name: 'Body Triangle (Bottom)',
      description: 'Opponent has secured a body triangle from the back.',
      advantage: 'Inferior',
      parentPositionId: POSITIONS.BACK_CONTROL_BOTTOM,
      isVariant: true,
      applicableTechniqueIds: [
        // Specific escapes targeting the triangle lock
        TECHNIQUES.BODY_TRIANGLE_BOTTOM_ESCAPE,
      ],
      inversePositionId: POSITIONS.BODY_TRIANGLE_TOP,
    },

    // --- Knee On Belly ---
    [POSITIONS.KNEE_ON_BELLY_TOP]: {
        id: POSITIONS.KNEE_ON_BELLY_TOP,
        name: 'Knee on Belly (Top)',
        aliases: ['Knee Ride', 'Knee Mount'],
        description: 'Positioning one knee on opponent\'s torso while posting other leg. Transitional dominant position offering pressure, mobility, and submission opportunities. Goal: Maintain balance, transition to Mount or Back, attack submissions (armbars).',
        advantage: 'Advantageous', // Dominant but transitional
        applicableTechniqueIds: [
          TECHNIQUES.KOB_TOP_FAR_SIDE_ARMBAR,
          TECHNIQUES.KOB_TOP_BASEBALL_CHOKE,
          TECHNIQUES.KOB_TOP_MOUNT_TRANSITION,
          TECHNIQUES.KOB_TOP_BACKSTEP_SIDE_CONTROL,
          // TODO: Add Near Side Armbar, Loop Choke, Bow/Arrow
        ],
        inversePositionId: POSITIONS.KNEE_ON_BELLY_BOTTOM,
      },
    [POSITIONS.KNEE_ON_BELLY_BOTTOM]: {
        id: POSITIONS.KNEE_ON_BELLY_BOTTOM,
        name: 'Knee on Belly (Bottom)',
        description: 'Opponent has placed their knee on your torso. Uncomfortable and unstable defensive position. Goal: Relieve pressure, push knee off, shrimp escape to recover guard, or bridge to disrupt balance.',
        advantage: 'Inferior',
        applicableTechniqueIds: [
          TECHNIQUES.KOB_BOTTOM_SHRIMP_ESCAPE,
          TECHNIQUES.KOB_BOTTOM_BRIDGE_UNDERHOOK_ESCAPE,
          // TODO: Add Foot Grab Sweep, Turn to Turtle, Leg Trap Roll
        ],
        inversePositionId: POSITIONS.KNEE_ON_BELLY_TOP,
      },

    // --- Turtle ---
    [POSITIONS.TURTLE_TOP]: {
        id: POSITIONS.TURTLE_TOP,
        name: 'Turtle (Top)',
        aliases: ['Attacking Turtle'],
        description: 'Opponent is turtled on hands and knees. Opportunity to attack the back, apply chokes, or break down the turtle. Goal: Take the back, secure front headlock chokes, or flatten opponent to side control/mount.',
        advantage: 'Advantageous',
        applicableTechniqueIds: [
          TECHNIQUES.TURTLE_TOP_BACK_TAKE_ROLL,
          TECHNIQUES.TURTLE_TOP_BACK_TAKE_DRAG,
          TECHNIQUES.TURTLE_TOP_CLOCK_CHOKE,
          TECHNIQUES.TURTLE_TOP_ANACONDA_CHOKE,
          TECHNIQUES.TURTLE_TOP_DARCE_CHOKE,
          TECHNIQUES.TURTLE_TOP_BREAKDOWN_TO_SIDE_CONTROL,
          // TODO: Add RNC (attacking turtle), Peruvian Necktie, Crucifix
        ],
        inversePositionId: POSITIONS.TURTLE_BOTTOM,
      },
    [POSITIONS.TURTLE_BOTTOM]: {
        id: POSITIONS.TURTLE_BOTTOM,
        name: 'Turtle (Bottom)',
        description: 'Defensive position on hands and knees, often temporary after escaping a worse position. Vulnerable to back takes and chokes. Goal: Avoid back take, recover guard (Granby roll, pull guard), stand up, or perform sit-out/reversal.',
        advantage: 'Disadvantageous', // Defensive, not pinned but vulnerable
        applicableTechniqueIds: [
          TECHNIQUES.TURTLE_BOTTOM_GRANBY_ROLL,
          TECHNIQUES.TURTLE_BOTTOM_SIT_OUT,
          TECHNIQUES.TURTLE_BOTTOM_STAND_UP,
          TECHNIQUES.TURTLE_BOTTOM_PULL_GUARD,
          // TODO: Add Peek Out (Peterson Roll)
        ],
        inversePositionId: POSITIONS.TURTLE_TOP,
      },

      // --- Half Guard ---
      [POSITIONS.HALF_GUARD_BOTTOM]: {
        id: POSITIONS.HALF_GUARD_BOTTOM,
        name: 'Half Guard (Bottom)',
        description: 'Playing guard having trapped one of the opponent\'s legs between yours. Can be offensive (sweeps, back takes, submissions) or defensive (preventing pass, regaining full guard). Goal: Sweep, take back, submit, or recover full guard.',
        advantage: 'Neutral', // Can be offensive or defensive
        variantIds: [POSITIONS.DEEP_HALF_GUARD_BOTTOM, POSITIONS.Z_GUARD_BOTTOM],
        applicableTechniqueIds: [
          TECHNIQUES.HG_BOTTOM_OLD_SCHOOL_SWEEP,
          TECHNIQUES.HG_BOTTOM_BACK_TAKE,
          // TODO: Add Deep Half Sweep, HG Kimura, HG Guillotine
        ],
        inversePositionId: POSITIONS.HALF_GUARD_TOP,
      },
      [POSITIONS.HALF_GUARD_TOP]: {
          id: POSITIONS.HALF_GUARD_TOP,
          name: 'Half Guard (Top)',
          aliases: ['In Half Guard'],
          description: 'Opponent has trapped one of your legs. You aim to pass their guard. Goal: Maintain top pressure (crossface, underhook), free trapped leg, pass to Side Control or Mount.',
          advantage: 'Neutral', // Opportunity to pass
          applicableTechniqueIds: [
            TECHNIQUES.HG_TOP_KNEE_CUT_PASS,
            TECHNIQUES.HG_TOP_CROSSFACE_UNDERHOOK_CONTROL, // Control technique
            // TODO: Add Americana, Kimura, D'Arce from Top Half
          ],
          inversePositionId: POSITIONS.HALF_GUARD_BOTTOM,
      },
      // --- Half Guard Variants ---
      [POSITIONS.DEEP_HALF_GUARD_BOTTOM]: {
        id: POSITIONS.DEEP_HALF_GUARD_BOTTOM,
        name: 'Deep Half Guard (Bottom)',
        description: 'Half guard variant where the bottom player is underneath the opponent\'s hips, often looking for sweeps.',
        advantage: 'Neutral', // Can be offensive
        parentPositionId: POSITIONS.HALF_GUARD_BOTTOM,
        isVariant: true,
        applicableTechniqueIds: [
          // Add Deep Half sweeps (Waiter Sweep, Homer Simpson)
          TECHNIQUES.DEEP_HALF_GUARD_BOTTOM_SWEEP,
        ],
        inversePositionId: POSITIONS.DEEP_HALF_GUARD_TOP,
      },
      [POSITIONS.DEEP_HALF_GUARD_TOP]: {
        id: POSITIONS.DEEP_HALF_GUARD_TOP,
        name: 'Deep Half Guard (Top)',
        aliases: ['In Deep Half Guard'],
        description: 'Opponent is playing Deep Half Guard underneath your hips.',
        advantage: 'Neutral', // Vulnerable to sweeps
        parentPositionId: POSITIONS.HALF_GUARD_TOP,
        isVariant: true,
        applicableTechniqueIds: [
          // Add passes vs Deep Half, back takes
          TECHNIQUES.DEEP_HALF_GUARD_TOP_PASS,
        ],
        inversePositionId: POSITIONS.DEEP_HALF_GUARD_BOTTOM,
      },
      [POSITIONS.Z_GUARD_BOTTOM]: {
        id: POSITIONS.Z_GUARD_BOTTOM,
        name: 'Z-Guard (Bottom)',
        aliases: ['Knee Shield Half Guard'],
        description: 'Half guard variant using a knee shield across the opponent\'s hip/belly to manage distance.',
        advantage: 'Neutral',
        parentPositionId: POSITIONS.HALF_GUARD_BOTTOM,
        isVariant: true,
        applicableTechniqueIds: [
          // Add Z-Guard sweeps, transitions to other guards
          TECHNIQUES.Z_GUARD_BOTTOM_SWEEP,
        ],
        inversePositionId: POSITIONS.Z_GUARD_TOP,
      },
      [POSITIONS.Z_GUARD_TOP]: {
        id: POSITIONS.Z_GUARD_TOP,
        name: 'Z-Guard (Top)',
        aliases: ['In Z-Guard'],
        description: 'Opponent is playing Z-Guard (knee shield half guard). Need to deal with the knee shield to pass.',
        advantage: 'Neutral',
        parentPositionId: POSITIONS.HALF_GUARD_TOP,
        isVariant: true,
        applicableTechniqueIds: [
          // Add passes vs Z-Guard (e.g., windshield wiper)
          TECHNIQUES.Z_GUARD_TOP_PASS,
        ],
        inversePositionId: POSITIONS.Z_GUARD_BOTTOM,
      },

      // --- Open Guards --- (Placeholders)
      [POSITIONS.OPEN_GUARD_BOTTOM]: {
        id: POSITIONS.OPEN_GUARD_BOTTOM,
        name: 'Open Guard (Bottom)',
        description: 'Generic term for any guard where the legs are not locked around the opponent (unlike Closed Guard).',
        advantage: 'Neutral',
        // variantIds: [ Includes many specific open guards like Butterfly, Spider, DLR, etc. ],
        applicableTechniqueIds: [],
        inversePositionId: POSITIONS.OPEN_GUARD_TOP,
      },
      [POSITIONS.OPEN_GUARD_TOP]: {
        id: POSITIONS.OPEN_GUARD_TOP,
        name: 'Open Guard (Top)',
        aliases: ['In Open Guard'],
        description: 'Opponent is playing some form of open guard. Goal is to pass.',
        advantage: 'Neutral',
        applicableTechniqueIds: [
          // Generic passing concepts, specific passes depend on opponent's guard type
        ],
        inversePositionId: POSITIONS.OPEN_GUARD_BOTTOM,
      },
      [POSITIONS.SPIDER_GUARD_BOTTOM]: {
        id: POSITIONS.SPIDER_GUARD_BOTTOM,
        name: 'Spider Guard (Bottom)',
        description: 'Gi-specific open guard using grips on sleeves and feet on biceps/hips.',
        advantage: 'Neutral', // Gi dependent
        parentPositionId: POSITIONS.OPEN_GUARD_BOTTOM,
        isVariant: true,
        applicableTechniqueIds: [
          // Add Spider Guard sweeps, triangle, omoplata
          TECHNIQUES.SPIDER_GUARD_BOTTOM_SWEEP,
        ],
        inversePositionId: POSITIONS.SPIDER_GUARD_TOP,
      },
      [POSITIONS.SPIDER_GUARD_TOP]: {
        id: POSITIONS.SPIDER_GUARD_TOP,
        name: 'Spider Guard (Top)',
        aliases: ['In Spider Guard'],
        description: 'Opponent is playing Spider Guard. Need to break grips and pass.',
        advantage: 'Neutral', // Gi dependent
        parentPositionId: POSITIONS.OPEN_GUARD_TOP,
        isVariant: true,
        applicableTechniqueIds: [
          // Add Spider Guard passes
          TECHNIQUES.SPIDER_GUARD_TOP_PASS,
        ],
        inversePositionId: POSITIONS.SPIDER_GUARD_BOTTOM,
      },
      [POSITIONS.DE_LA_RIVA_GUARD_BOTTOM]: {
        id: POSITIONS.DE_LA_RIVA_GUARD_BOTTOM,
        name: 'De La Riva Guard (Bottom)',
        aliases: ['DLR'],
        description: 'Open guard involving wrapping one leg around the opponent\'s lead leg from the outside.',
        advantage: 'Neutral',
        parentPositionId: POSITIONS.OPEN_GUARD_BOTTOM,
        isVariant: true,
        applicableTechniqueIds: [
          // Add DLR sweeps, back takes, Berimbolo
          TECHNIQUES.DE_LA_RIVA_GUARD_BOTTOM_SWEEP,
        ],
        inversePositionId: POSITIONS.DE_LA_RIVA_GUARD_TOP,
      },
      [POSITIONS.DE_LA_RIVA_GUARD_TOP]: {
        id: POSITIONS.DE_LA_RIVA_GUARD_TOP,
        name: 'De La Riva Guard (Top)',
        aliases: ['In DLR'],
        description: 'Opponent is playing De La Riva guard. Need to address the DLR hook to pass.',
        advantage: 'Neutral',
        parentPositionId: POSITIONS.OPEN_GUARD_TOP,
        isVariant: true,
        applicableTechniqueIds: [
          // Add DLR passes (e.g., Leg Drag, Knee Cut variation)
          TECHNIQUES.DE_LA_RIVA_GUARD_TOP_PASS,
        ],
        inversePositionId: POSITIONS.DE_LA_RIVA_GUARD_BOTTOM,
      },
      [POSITIONS.REVERSE_DE_LA_RIVA_GUARD_BOTTOM]: {
        id: POSITIONS.REVERSE_DE_LA_RIVA_GUARD_BOTTOM,
        name: 'Reverse De La Riva Guard (Bottom)',
        aliases: ['RDLR'],
        description: 'Open guard variant where the outside leg hooks behind the opponent\'s knee from the inside.',
        advantage: 'Neutral',
        parentPositionId: POSITIONS.OPEN_GUARD_BOTTOM,
        isVariant: true,
        applicableTechniqueIds: [
          // Add RDLR sweeps, K-Guard entries
          TECHNIQUES.REVERSE_DE_LA_RIVA_GUARD_BOTTOM_SWEEP,
        ],
        inversePositionId: POSITIONS.REVERSE_DE_LA_RIVA_GUARD_TOP,
      },
      [POSITIONS.REVERSE_DE_LA_RIVA_GUARD_TOP]: {
        id: POSITIONS.REVERSE_DE_LA_RIVA_GUARD_TOP,
        name: 'Reverse De La Riva Guard (Top)',
        aliases: ['In RDLR'],
        description: 'Opponent is playing Reverse De La Riva guard.',
        advantage: 'Neutral',
        parentPositionId: POSITIONS.OPEN_GUARD_TOP,
        isVariant: true,
        applicableTechniqueIds: [
          // Add RDLR passes
          TECHNIQUES.REVERSE_DE_LA_RIVA_GUARD_TOP_PASS,
        ],
        inversePositionId: POSITIONS.REVERSE_DE_LA_RIVA_GUARD_BOTTOM,
      },

      // --- Butterfly Guard (Bottom)
      [POSITIONS.BUTTERFLY_GUARD_BOTTOM]: {
          id: POSITIONS.BUTTERFLY_GUARD_BOTTOM,
          name: 'Butterfly Guard (Bottom)',
          parentPositionId: POSITIONS.OPEN_GUARD_BOTTOM, // Example parent linkage
          isVariant: true,
          description: 'Sitting guard with feet hooked inside opponent\'s thighs. Good for sweeps and elevation. Common in No-Gi. Goal: Sweep, elevate for back takes or submissions.',
          advantage: 'Neutral', // Offensive potential
          applicableTechniqueIds: [
              TECHNIQUES.BFG_BOTTOM_SWEEP,
              TECHNIQUES.BFG_BOTTOM_ARM_DRAG,
              // TODO: Add Guillotine from BFG
          ],
          inversePositionId: POSITIONS.BUTTERFLY_GUARD_TOP, // Requires defining the TOP perspective
      },
      [POSITIONS.BUTTERFLY_GUARD_TOP]: {
        id: POSITIONS.BUTTERFLY_GUARD_TOP,
        name: 'Butterfly Guard (Top)',
        aliases: ['In Butterfly Guard'],
        parentPositionId: POSITIONS.OPEN_GUARD_TOP,
        isVariant: true,
        description: 'Opponent is using butterfly hooks. Need to control posture, nullify hooks, and pass. Vulnerable to sweeps if posture broken. Goal: Maintain base, clear hooks, pass guard.',
        advantage: 'Neutral', // Opportunity to pass, risk of sweep
        applicableTechniqueIds: [
          // TODO: Add specific passes vs Butterfly Guard
          TECHNIQUES.BUTTERFLY_GUARD_TOP_PASS,
        ],
        inversePositionId: POSITIONS.BUTTERFLY_GUARD_BOTTOM,
    },
    // TODO: Define other Open Guards (Spider, DLR, RDLR etc.) and their Top counterparts

  },
  techniques: {
    // --- Standing Techniques ---
    [TECHNIQUES.STANDING_DOUBLE_LEG]: {
      id: TECHNIQUES.STANDING_DOUBLE_LEG,
      name: 'Double Leg Takedown',
      description: 'A fundamental takedown involving shooting low, grabbing both opponent legs, and driving forward to secure top position.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Takedown,
      originPositionId: POSITIONS.STANDING,
      media: [media('https://www.youtube.com/watch?v=U3D4I8_yONE', 'video', 'Double Leg Basics')],
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Successfully take opponent down, landing past guard into Side Control.', likelihood: 'Primary' },
        { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Take opponent down, but they establish Closed Guard.', likelihood: 'Secondary' },
        { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_TOP, description: 'Take opponent down, landing in their Half Guard.', likelihood: 'Secondary' },
        { type: 'Failure', endPositionId: POSITIONS.STANDING, description: 'Takedown attempt fails or is sprawled on, remain standing.', likelihood: 'Possible' },
        { type: 'Countered', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Opponent counters with a Guillotine Choke attempt.', likelihood: 'CommonCounter', counteredByTechniqueId: TECHNIQUES.STANDING_GUILLOTINE }, // Example counter link
      ],
    },
    [TECHNIQUES.STANDING_SINGLE_LEG]: {
      id: TECHNIQUES.STANDING_SINGLE_LEG,
      name: 'Single Leg Takedown',
      description: 'Securing one of the opponent\'s legs, lifting or driving to off-balance and complete the takedown.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Takedown,
      originPositionId: POSITIONS.STANDING,
      media: [media('https://www.youtube.com/watch?v=8pUj9Ub5DM8', 'video', 'Single Leg Takedown')],
       outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Successfully take opponent down, landing past guard into Side Control.', likelihood: 'Primary' },
        { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_TOP, description: 'Take opponent down, often landing in Half Guard due to the single leg control.', likelihood: 'Primary' },
        { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Take opponent down, but they establish Closed Guard.', likelihood: 'Secondary' },
        { type: 'Failure', endPositionId: POSITIONS.STANDING, description: 'Takedown attempt fails, opponent defends or sprawls, remain standing.', likelihood: 'Possible' },
      ],
    },
     [TECHNIQUES.STANDING_OSOTO_GARI]: {
      id: TECHNIQUES.STANDING_OSOTO_GARI,
      name: 'Osoto Gari (Major Outer Reap)',
      description: 'Judo throw involving reaping the opponent\'s supporting leg while pulling them off balance backward.',
      applicability: BjjApplicability.Both, // Easier with Gi grips
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Takedown,
      originPositionId: POSITIONS.STANDING,
      media: [media('https://www.youtube.com/watch?v=0KXL5NYlSYo', 'video', 'Osoto Gari Throw')],
       outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Successfully throw opponent, landing in Side Control.', likelihood: 'Primary' },
        { type: 'PositionChange', endPositionId: POSITIONS.KESAGATAME_TOP, description: 'Successfully throw opponent, landing directly in Kesa Gatame (Scarf Hold).', likelihood: 'Secondary' },
        { type: 'Failure', endPositionId: POSITIONS.STANDING, description: 'Throw attempt fails or is countered, remain standing.', likelihood: 'Possible' },
      ],
    },
     [TECHNIQUES.STANDING_GUARD_PULL]: {
      id: TECHNIQUES.STANDING_GUARD_PULL,
      name: 'Guard Pull',
      description: 'Intentionally sitting down and pulling the opponent into your Closed Guard, conceding the takedown but establishing a preferred bottom position.',
      applicability: BjjApplicability.Both, // Common in Gi
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Transition, // Concedes top position for guard
      originPositionId: POSITIONS.STANDING,
      media: [media('https://www.youtube.com/watch?v=9VTh3I6jpAk', 'video', 'Pulling Guard')],
       outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Successfully pull opponent into Closed Guard.', likelihood: 'Primary' },
        { type: 'PositionChange', endPositionId: POSITIONS.OPEN_GUARD_BOTTOM, description: 'Pull guard but only manage to establish Open Guard.', likelihood: 'Secondary' },
        // Failure case is less common unless opponent disengages entirely.
      ],
    },
    [TECHNIQUES.STANDING_GUILLOTINE]: {
      id: TECHNIQUES.STANDING_GUILLOTINE,
      name: 'Guillotine Choke (Standing)',
      description: 'Applying a front headlock choke while standing, often as a counter to an opponent\'s takedown attempt or when clinching.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.STANDING,
      media: [media('https://www.youtube.com/watch?v=8dP3K8JvnL0', 'video', 'Standing Guillotine')],
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply choke, opponent taps while standing.', likelihood: 'Possible' },
        { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Apply choke and pull guard simultaneously, finishing from Closed Guard.', likelihood: 'Secondary' },
         { type: 'Failure', endPositionId: POSITIONS.STANDING, description: 'Choke attempt fails, opponent defends posture, remain standing.', likelihood: 'Primary' }, // Often defended
         { type: 'Countered', endPositionId: POSITIONS.SIDE_CONTROL_BOTTOM, description: 'Opponent defends choke and completes takedown, landing in Side Control.', likelihood: 'Possible' },
      ],
    },

    // --- Closed Guard (Bottom) Techniques ---
    [TECHNIQUES.CG_BOTTOM_CROSS_COLLAR_CHOKE]: {
      id: TECHNIQUES.CG_BOTTOM_CROSS_COLLAR_CHOKE,
      name: 'Cross Collar Choke',
      description: 'Using cross grips on the opponent\'s collars to apply a blood choke from Closed Guard.',
      applicability: BjjApplicability.Gi,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
      media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Cross-Collar Choke Setup (Conceptual)')], // Placeholder link
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply choke, opponent taps.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Choke attempt fails, opponent defends posture or strips grips.', likelihood: 'Possible' },
      ],
    },
     [TECHNIQUES.CG_BOTTOM_KIMURA]: {
      id: TECHNIQUES.CG_BOTTOM_KIMURA,
      name: 'Kimura',
      description: 'Applying a figure-four grip on the opponent\'s wrist and arm to attack the shoulder joint from Closed Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
       media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Guard Kimura Setup (Conceptual)')], // Placeholder link
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply Kimura lock, opponent taps.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Kimura attempt fails, opponent defends or pulls arm free.', likelihood: 'Possible' },
        // Can also lead to sweeps or back takes if opponent reacts incorrectly
      ],
      followUpTechniqueIds: [TECHNIQUES.CG_BOTTOM_HIP_BUMP_SWEEP, TECHNIQUES.CG_BOTTOM_ARM_DRAG_TO_BACK, TECHNIQUES.CG_BOTTOM_ARMBAR, TECHNIQUES.CG_BOTTOM_TRIANGLE_CHOKE], // Added potential follow-ups
    },
     [TECHNIQUES.CG_BOTTOM_GUILLOTINE]: {
      id: TECHNIQUES.CG_BOTTOM_GUILLOTINE,
      name: 'Guillotine Choke',
      description: 'Wrapping the opponent\'s head and arm to apply a choke, often when they posture down or drive forward in Closed Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
       media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Arm-in Guillotine (Conceptual)')], // Placeholder link
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply Guillotine choke, opponent taps.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Choke attempt fails, opponent postures up or defends neck.', likelihood: 'Possible' },
         { type: 'Countered', endPositionId: POSITIONS.SIDE_CONTROL_BOTTOM, description: 'Opponent defends choke by passing guard (e.g., Von Flue choke counter possibility in Gi).', likelihood: 'Possible' },
      ],
      followUpTechniqueIds: [TECHNIQUES.CG_BOTTOM_ARMBAR, TECHNIQUES.CG_BOTTOM_OMOPLATA], // Example follow-ups
      setupTechniqueIds: [TECHNIQUES.CG_BOTTOM_KIMURA, TECHNIQUES.CG_BOTTOM_OMOPLATA], // Added setups
    },
    [TECHNIQUES.CG_BOTTOM_TRIANGLE_CHOKE]: {
      id: TECHNIQUES.CG_BOTTOM_TRIANGLE_CHOKE,
      name: 'Triangle Choke',
      description: 'Using legs in a figure-four configuration around the opponent\'s neck and one arm to apply a blood choke.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
      media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Triangle Choke from Guard (Conceptual)')], // Placeholder link
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply Triangle choke, opponent taps.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Choke attempt fails, opponent postures, stacks, or clears legs.', likelihood: 'Possible' },
        // Can transition to Armbar or Omoplata if triangle is defended certain ways
      ],
      followUpTechniqueIds: [TECHNIQUES.CG_BOTTOM_ARMBAR, TECHNIQUES.CG_BOTTOM_OMOPLATA], // Example follow-ups
      setupTechniqueIds: [TECHNIQUES.CG_BOTTOM_KIMURA, TECHNIQUES.CG_BOTTOM_OMOPLATA], // Added setups
    },
    [TECHNIQUES.CG_BOTTOM_ARMBAR]: {
      id: TECHNIQUES.CG_BOTTOM_ARMBAR,
      name: 'Armbar (Straight Arm Lock)',
      description: 'Isolating an opponent\'s arm and using legs and hips to hyperextend the elbow joint.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
      media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Armbar from Guard (Conceptual)')], // Placeholder link
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply Armbar, opponent taps.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Armbar attempt fails, opponent pulls arm out or stacks.', likelihood: 'Possible' },
        // Can transition to Triangle or Omoplata
      ],
       followUpTechniqueIds: [TECHNIQUES.CG_BOTTOM_TRIANGLE_CHOKE, TECHNIQUES.CG_BOTTOM_OMOPLATA],
       setupTechniqueIds: [TECHNIQUES.CG_BOTTOM_TRIANGLE_CHOKE, TECHNIQUES.CG_BOTTOM_FLOWER_SWEEP, TECHNIQUES.CG_BOTTOM_KIMURA], // Added setups
    },
     [TECHNIQUES.CG_BOTTOM_OMOPLATA]: {
      id: TECHNIQUES.CG_BOTTOM_OMOPLATA,
      name: 'Omoplata',
      description: 'A shoulder lock applied by using the legs in a figure-four around the opponent\'s arm and shoulder, turning the hips.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.Submission, // Can also be used as a sweep
      originPositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
      media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Omoplata Setup (Conceptual)')], // Placeholder link
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply Omoplata lock, opponent taps.', likelihood: 'Secondary' }, // Often harder to finish than setup
        { type: 'PositionChange', endPositionId: POSITIONS.OPEN_GUARD_TOP, description: 'Opponent rolls forward to defend, resulting in a sweep to top (opponent often in turtle or trying to recover guard).', likelihood: 'Primary' }, // Often used as a sweep
        { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Attempt fails, opponent postures out or clears leg.', likelihood: 'Possible' },
      ],
      followUpTechniqueIds: [TECHNIQUES.CG_BOTTOM_TRIANGLE_CHOKE], // Added potential follow-up
      setupTechniqueIds: [TECHNIQUES.CG_BOTTOM_TRIANGLE_CHOKE, TECHNIQUES.CG_BOTTOM_ARMBAR], // Added setups
    },
    [TECHNIQUES.CG_BOTTOM_HIP_BUMP_SWEEP]: {
      id: TECHNIQUES.CG_BOTTOM_HIP_BUMP_SWEEP,
      name: 'Hip Bump Sweep',
      description: 'Sitting up from Closed Guard, posting a hand, and bumping the hips forward/sideways into the opponent to sweep them over.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Sweep,
      originPositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
       media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Hip Bump Sweep (Conceptual)')], // Placeholder link
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.MOUNT_TOP, description: 'Successfully sweep opponent, landing in Mount.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Sweep attempt fails, opponent bases out.', likelihood: 'Possible' },
        // Can transition to Kimura or Guillotine if opponent bases incorrectly
      ],
       followUpTechniqueIds: [TECHNIQUES.CG_BOTTOM_KIMURA, TECHNIQUES.CG_BOTTOM_GUILLOTINE],
       counteredByTechniqueIds: [TECHNIQUES.CG_BOTTOM_DOUBLE_ANKLE_SWEEP], // Added explicit counter ID
    },
     [TECHNIQUES.CG_BOTTOM_SCISSOR_SWEEP]: {
      id: TECHNIQUES.CG_BOTTOM_SCISSOR_SWEEP,
      name: 'Scissor Sweep',
      description: 'Using one shin across the opponent\'s torso and the other leg chopping their base ("scissoring") to sweep them sideways.',
      applicability: BjjApplicability.Both, // Often easier with Gi grips
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Sweep,
      originPositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
      media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Scissor Sweep Setup (Conceptual)')], // Placeholder link
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.MOUNT_TOP, description: 'Successfully sweep opponent, landing in Mount.', likelihood: 'Primary' },
         { type: 'PositionChange', endPositionId: POSITIONS.KNEE_ON_BELLY_TOP, description: 'Sweep opponent but only achieve Knee on Belly.', likelihood: 'Secondary' },
        { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Sweep attempt fails, opponent bases out or postures.', likelihood: 'Possible' },
      ],
    },
    [TECHNIQUES.CG_BOTTOM_FLOWER_SWEEP]: {
        id: TECHNIQUES.CG_BOTTOM_FLOWER_SWEEP,
        name: 'Flower Sweep (Pendulum Sweep)',
        description: 'Underhooking one leg and swinging legs in a pendulum motion to off-balance and sweep the opponent, often setting up an armbar.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Sweep,
        originPositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
        media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Pendulum/Flower Sweep (Conceptual)')], // Placeholder link
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.MOUNT_TOP, description: 'Successfully sweep opponent, landing in Mount.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Sweep attempt fails, opponent bases out.', likelihood: 'Possible' },
        ],
        followUpTechniqueIds: [TECHNIQUES.CG_BOTTOM_ARMBAR], // Commonly combined
      },
     [TECHNIQUES.CG_BOTTOM_DOUBLE_ANKLE_SWEEP]: {
        id: TECHNIQUES.CG_BOTTOM_DOUBLE_ANKLE_SWEEP,
        name: 'Double Ankle Sweep (Lumberjack Sweep)',
        description: 'When opponent stands in Closed Guard, grab both ankles and use knees/feet to push their hips backward, sweeping them down.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Sweep,
        originPositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
        media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Double Ankle Sweep (Conceptual)')], // Placeholder link
        outcomes: [
          // Often results in opponent falling and initiator coming up into opponent's open guard
          { type: 'PositionChange', endPositionId: POSITIONS.OPEN_GUARD_TOP, description: 'Sweep opponent down, come up into their Open Guard.', likelihood: 'Primary' },
          { type: 'PositionChange', endPositionId: POSITIONS.STANDING, description: 'Sweep fails, opponent disengages back to standing.', likelihood: 'Secondary' },
          { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Sweep attempt fails, opponent maintains balance.', likelihood: 'Possible' },
        ],
      },
      [TECHNIQUES.CG_BOTTOM_ARM_DRAG_TO_BACK]: {
        id: TECHNIQUES.CG_BOTTOM_ARM_DRAG_TO_BACK,
        name: 'Arm Drag to Back Take',
        description: 'From Closed Guard, pulling opponent\'s arm across their body (arm drag) to create an angle and transition to Back Control.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.CLOSED_GUARD_BOTTOM,
        media: [media('https://www.youtube.com/watch?v=9JzGd__jAT0', 'video', 'Arm Drag to Back')],
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.BACK_CONTROL_TOP, description: 'Successfully execute arm drag and take the opponent\'s back.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Arm drag fails, opponent pulls arm back or squares up.', likelihood: 'Possible' },
        ],
      },

    // --- Closed Guard (Top) Techniques ---
    [TECHNIQUES.CG_TOP_GUARD_BREAK_PASS]: {
      id: TECHNIQUES.CG_TOP_GUARD_BREAK_PASS,
      name: 'Guard Break & Pass',
      description: 'General concept for the top player: First, break open the opponent\'s closed guard using posture and leverage (standing or kneeling). Second, execute a pass (e.g., Knee Cut, Toreando, Over-Under) to achieve a dominant position.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner, // Concept is beginner, specific passes vary
      type: BjjTechniqueType.GuardPass, // Encompasses break + pass
      originPositionId: POSITIONS.CLOSED_GUARD_TOP,
      media: [media('https://www.youtube.com/watch?v=C_GzX2CyLbU', 'video', 'Basic Guard Pass (Concept)')],
      setupTechniqueIds: [TECHNIQUES.CG_TOP_POSTURE_UP, TECHNIQUES.CG_TOP_ELBOW_KNEE_BREAK, TECHNIQUES.CG_TOP_STAND_BREAK], // Breaking methods are setups
      followUpTechniqueIds: [TECHNIQUES.HG_TOP_KNEE_CUT_PASS, TECHNIQUES.CG_TOP_OVER_UNDER_PASS, TECHNIQUES.CG_TOP_TOREANDO_PASS], // Specific passes are follow-ups
      outcomes: [
         { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Successfully break guard and pass to Side Control.', likelihood: 'Primary' },
         { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_TOP, description: 'Break guard but opponent recovers Half Guard.', likelihood: 'Secondary' },
         { type: 'PositionChange', endPositionId: POSITIONS.OPEN_GUARD_TOP, description: 'Break guard but opponent recovers Open Guard.', likelihood: 'Secondary' },
         { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Fail to break guard or pass attempt is stopped, remain in Closed Guard.', likelihood: 'Possible' },
         { type: 'Countered', endPositionId: POSITIONS.MOUNT_BOTTOM, description: 'Get swept during the pass attempt (e.g., by Hip Bump).', likelihood: 'CommonCounter', counteredByTechniqueId: TECHNIQUES.CG_BOTTOM_HIP_BUMP_SWEEP }, // Example counter
      ],
    },
     // Add specific breaking and passing techniques here...
     [TECHNIQUES.CG_TOP_POSTURE_UP]: {
      id: TECHNIQUES.CG_TOP_POSTURE_UP,
      name: 'Posture Up',
      description: 'Regaining upright posture inside Closed Guard to prevent attacks and begin breaking grips/opening guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Control, // Control posture
      originPositionId: POSITIONS.CLOSED_GUARD_TOP,
      outcomes: [
        { type: 'ControlChange', description: 'Posture improved, reducing opponent attack options.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Opponent breaks posture back down.', likelihood: 'Possible' },
      ],
      followUpTechniqueIds: [TECHNIQUES.CG_TOP_ELBOW_KNEE_BREAK, TECHNIQUES.CG_TOP_STAND_BREAK],
    },
    [TECHNIQUES.CG_TOP_ELBOW_KNEE_BREAK]: {
      id: TECHNIQUES.CG_TOP_ELBOW_KNEE_BREAK,
      name: 'Elbow-Knee Guard Break',
      description: 'Using elbow pressure inside opponent\'s thigh while pushing their knee down to break the Closed Guard lock (kneeling).',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Transition, // Part of guard pass
      originPositionId: POSITIONS.CLOSED_GUARD_TOP,
      setupTechniqueIds: [TECHNIQUES.CG_TOP_POSTURE_UP],
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.OPEN_GUARD_TOP, description: 'Guard broken, transition to passing Open Guard.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Guard break fails.', likelihood: 'Possible' },
      ],
      followUpTechniqueIds: [TECHNIQUES.CG_TOP_OVER_UNDER_PASS, TECHNIQUES.HG_TOP_KNEE_CUT_PASS], // Leads to passing
    },
    [TECHNIQUES.CG_TOP_STAND_BREAK]: {
      id: TECHNIQUES.CG_TOP_STAND_BREAK,
      name: 'Stand Up Guard Break',
      description: 'Standing up inside Closed Guard to use gravity and leg leverage to break the lock.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Transition, // Part of guard pass
      originPositionId: POSITIONS.CLOSED_GUARD_TOP,
      setupTechniqueIds: [TECHNIQUES.CG_TOP_POSTURE_UP],
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.OPEN_GUARD_TOP, description: 'Stand up and break guard, transition to passing Open Guard (standing).', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Unable to stand or break guard.', likelihood: 'Possible' },
        { type: 'Countered', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Opponent sweeps during stand up (e.g., Double Ankle Sweep). ', likelihood: 'CommonCounter', counteredByTechniqueId: TECHNIQUES.CG_BOTTOM_DOUBLE_ANKLE_SWEEP },
      ],
      followUpTechniqueIds: [TECHNIQUES.CG_TOP_TOREANDO_PASS], // Often used after standing break
    },
    [TECHNIQUES.CG_TOP_OVER_UNDER_PASS]: {
      id: TECHNIQUES.CG_TOP_OVER_UNDER_PASS,
      name: 'Over-Under Pass',
      description: 'Guard pass (often after breaking closed guard kneeling) involving one arm over the leg and one arm under, driving forward.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.GuardPass,
      originPositionId: POSITIONS.OPEN_GUARD_TOP, // Typically applied once guard is open
      setupTechniqueIds: [TECHNIQUES.CG_TOP_ELBOW_KNEE_BREAK], // Follows a kneeling break
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Successfully pass to Side Control.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.OPEN_GUARD_TOP, description: 'Pass attempt fails, opponent regains guard.', likelihood: 'Possible' },
        { type: 'Countered', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Opponent counters pass and regains Closed Guard or potentially Triangle setup.', likelihood: 'Possible' },
      ],
    },
    [TECHNIQUES.CG_TOP_TOREANDO_PASS]: {
      id: TECHNIQUES.CG_TOP_TOREANDO_PASS,
      name: 'Toreando Pass (Bullfighter Pass)',
      description: 'Guard pass (often after standing break) involving controlling opponent\'s legs/pants and moving around them like a bullfighter.',
      applicability: BjjApplicability.Both, // Easier with Gi grips
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.GuardPass,
      originPositionId: POSITIONS.OPEN_GUARD_TOP, // Applied once guard is open and often standing
      setupTechniqueIds: [TECHNIQUES.CG_TOP_STAND_BREAK],
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Successfully pass to Side Control.', likelihood: 'Primary' },
        { type: 'PositionChange', endPositionId: POSITIONS.KNEE_ON_BELLY_TOP, description: 'Pass leads directly to Knee on Belly.', likelihood: 'Secondary' },
        { type: 'Failure', endPositionId: POSITIONS.OPEN_GUARD_TOP, description: 'Pass attempt fails, opponent regains guard.', likelihood: 'Possible' },
      ],
    },

    // --- Mount (Top) Techniques ---
    [TECHNIQUES.MOUNT_TOP_ARMBAR]: {
      id: TECHNIQUES.MOUNT_TOP_ARMBAR,
      name: 'Armbar',
      description: 'Isolating an opponent\'s arm from Mount, swinging a leg over their head, and dropping back to hyperextend the elbow.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.MOUNT_TOP,
      media: [media('https://www.grapplearts.com/wp-content/uploads/2015/01/mount-armbar-1024x768.jpg', 'image', 'Mounted Armbar Setup')],
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply Armbar, opponent taps.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.MOUNT_TOP, description: 'Armbar attempt fails, opponent pulls arm free or defends, potentially remain in Mount.', likelihood: 'Possible' },
        { type: 'Countered', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Opponent escapes during attempt, possibly recovering guard.', likelihood: 'Possible' },
      ],
    },
    [TECHNIQUES.MOUNT_TOP_AMERICANA]: {
      id: TECHNIQUES.MOUNT_TOP_AMERICANA,
      name: 'Americana (Keylock)',
      description: 'Applying a figure-four "paintbrush" shoulder lock from Mount, typically on the arm the opponent uses to push.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.MOUNT_TOP,
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply Americana, opponent taps.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.MOUNT_TOP, description: 'Attempt fails, opponent defends or straightens arm.', likelihood: 'Possible' },
      ],
       followUpTechniqueIds: [TECHNIQUES.MOUNT_TOP_ARMBAR], // Often transitions to armbar if defended
    },
    // TODO: Add more Mount Top Techniques (X-Collar, Ezekiel, Arm Triangle, S-Mount, Back Take)
    [TECHNIQUES.MOUNT_TOP_CROSS_COLLAR_CHOKE]: {
      id: TECHNIQUES.MOUNT_TOP_CROSS_COLLAR_CHOKE,
      name: 'Cross Collar Choke',
      description: 'Applying a cross collar choke from Mount.',
      applicability: BjjApplicability.Gi,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.MOUNT_TOP,
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply choke.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.MOUNT_TOP, description: 'Choke fails.', likelihood: 'Possible' },
      ],
    },
    [TECHNIQUES.MOUNT_TOP_EZEKIEL_CHOKE]: {
      id: TECHNIQUES.MOUNT_TOP_EZEKIEL_CHOKE,
      name: 'Ezekiel Choke',
      description: 'Sleeve choke applied from Mount (can be Gi or No-Gi grip variation).' , 
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.MOUNT_TOP,
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply choke.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.MOUNT_TOP, description: 'Choke fails.', likelihood: 'Possible' },
      ],
    },
    [TECHNIQUES.MOUNT_TOP_ARM_TRIANGLE]: {
      id: TECHNIQUES.MOUNT_TOP_ARM_TRIANGLE,
      name: 'Arm Triangle Choke',
      description: 'Head and arm choke applied from Mount, often transitioning towards side.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.MOUNT_TOP,
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply choke.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.MOUNT_TOP, description: 'Choke fails.', likelihood: 'Possible' },
        { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Choke attempt fails, transition to Side Control to finish or reset.', likelihood: 'Secondary' },
      ],
    },
    [TECHNIQUES.MOUNT_TOP_S_MOUNT_TRANSITION]: {
      id: TECHNIQUES.MOUNT_TOP_S_MOUNT_TRANSITION,
      name: 'S-Mount Transition',
      description: 'Transitioning from standard Mount to S-Mount to isolate an arm.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.Transition,
      originPositionId: POSITIONS.MOUNT_TOP,
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.MOUNT_S_TOP, description: 'Successfully transition to S-Mount.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.MOUNT_TOP, description: 'Transition fails.', likelihood: 'Possible' },
      ],
      followUpTechniqueIds: [TECHNIQUES.MOUNT_TOP_ARMBAR],
    },
    [TECHNIQUES.MOUNT_TOP_BACK_TAKE_GIFT_WRAP]: {
      id: TECHNIQUES.MOUNT_TOP_BACK_TAKE_GIFT_WRAP,
      name: 'Back Take (Gift Wrap)',
      description: 'When opponent turns while mounted, securing a \"gift wrap\" control (wrist control across body) and taking the back.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.Transition,
      originPositionId: POSITIONS.MOUNT_TOP,
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.BACK_CONTROL_TOP, description: 'Successfully take the back.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.MOUNT_TOP, description: 'Back take fails, opponent turns back or escapes.', likelihood: 'Possible' },
      ],
    },

    // --- Mount (Bottom) Techniques ---
    [TECHNIQUES.MOUNT_BOTTOM_UPA_ESCAPE]: {
       id: TECHNIQUES.MOUNT_BOTTOM_UPA_ESCAPE,
       name: 'Upa Escape (Bridge & Roll)',
       description: 'Fundamental mount escape: trap an arm and leg on one side, bridge hips explosively, and roll opponent over to land in their guard.',
       applicability: BjjApplicability.Both,
       difficulty: BjjDifficulty.Beginner,
       type: BjjTechniqueType.Escape, // Results in a reversal (sweep)
       originPositionId: POSITIONS.MOUNT_BOTTOM,
       outcomes: [
         { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Successfully bridge and roll, landing in opponent\'s Closed Guard.', likelihood: 'Primary' },
         { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_TOP, description: 'Bridge and roll initiated, but only achieve Half Guard top.', likelihood: 'Secondary' },
         { type: 'Failure', endPositionId: POSITIONS.MOUNT_BOTTOM, description: 'Escape attempt fails, opponent bases out or maintains mount.', likelihood: 'Possible' },
       ],
     },
     [TECHNIQUES.MOUNT_BOTTOM_ELBOW_KNEE_ESCAPE]: {
      id: TECHNIQUES.MOUNT_BOTTOM_ELBOW_KNEE_ESCAPE,
      name: 'Elbow-Knee Escape (Shrimp Escape)',
      description: 'Using elbow frames and hip movement (shrimping) to create space and insert a knee, recovering Half Guard or potentially Closed Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Escape,
      originPositionId: POSITIONS.MOUNT_BOTTOM,
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_BOTTOM, description: 'Successfully shrimp and recover Half Guard.', likelihood: 'Primary' },
        { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Successfully shrimp and recover full Closed Guard.', likelihood: 'Secondary' },
        { type: 'Failure', endPositionId: POSITIONS.MOUNT_BOTTOM, description: 'Escape attempt fails, opponent counters pressure or blocks knee insertion.', likelihood: 'Possible' },
      ],
    },

     // --- Side Control (Top) Techniques ---
    [TECHNIQUES.SC_TOP_AMERICANA]: {
       id: TECHNIQUES.SC_TOP_AMERICANA,
       name: 'Americana (Keylock)',
       description: 'Applying figure-four shoulder lock on the near-side arm from Side Control.',
       applicability: BjjApplicability.Both,
       difficulty: BjjDifficulty.Beginner,
       type: BjjTechniqueType.Submission,
       originPositionId: POSITIONS.SIDE_CONTROL_TOP,
       media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Americana from Side Control (Conceptual)')], // Placeholder link
       outcomes: [
         { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply Americana, opponent taps.', likelihood: 'Primary' },
         { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Attempt fails, opponent defends.', likelihood: 'Possible' },
       ],
       followUpTechniqueIds: [TECHNIQUES.SC_TOP_KIMURA, TECHNIQUES.SC_TOP_ARMBAR], // Part of a submission chain
     },
     [TECHNIQUES.SC_TOP_KIMURA]: {
      id: TECHNIQUES.SC_TOP_KIMURA,
      name: 'Kimura (Far-Side)',
      description: 'Applying figure-four shoulder lock on the far-side arm from Side Control, often when opponent pushes.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate, // Slightly harder setup than Americana
      type: BjjTechniqueType.Submission,
      originPositionId: POSITIONS.SIDE_CONTROL_TOP,
      outcomes: [
        { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply Kimura, opponent taps.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Attempt fails, opponent defends.', likelihood: 'Possible' },
      ],
       followUpTechniqueIds: [TECHNIQUES.SC_TOP_ARMBAR, TECHNIQUES.SC_TOP_BACK_TAKE], // Can lead to other attacks if defended
    },
     [TECHNIQUES.SC_TOP_MOUNT_TRANSITION]: {
        id: TECHNIQUES.SC_TOP_MOUNT_TRANSITION,
        name: 'Mount Transition (Knee Slide)',
        description: 'Fundamental transition: blocking opponent\'s far hip and sliding the near knee across their belly to achieve Mount.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.SIDE_CONTROL_TOP,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.MOUNT_TOP, description: 'Successfully transition to Mount.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Transition blocked, opponent frames or recovers half guard.', likelihood: 'Possible' },
           { type: 'Countered', endPositionId: POSITIONS.HALF_GUARD_BOTTOM, description: 'Opponent recovers Half Guard during the transition attempt.', likelihood: 'CommonCounter' },
        ],
      },
       [TECHNIQUES.SC_TOP_KNEE_ON_BELLY_TRANSITION]: {
        id: TECHNIQUES.SC_TOP_KNEE_ON_BELLY_TRANSITION,
        name: 'Knee on Belly Transition',
        description: 'Popping up from Side Control to place the near knee on the opponent\'s torso, creating pressure and opening transitions/submissions.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.SIDE_CONTROL_TOP,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.KNEE_ON_BELLY_TOP, description: 'Successfully transition to Knee on Belly.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Transition fails or opponent immediately escapes Knee on Belly back to Side Control bottom.', likelihood: 'Possible' },
        ],
         followUpTechniqueIds: [TECHNIQUES.KOB_TOP_MOUNT_TRANSITION, TECHNIQUES.KOB_TOP_FAR_SIDE_ARMBAR],
      },
      // TODO: Add more SC Top Techniques (Armbar, Arm Tri, Paper Cutter, N/S Choke, Back Take, Kesa Switch/Sub)
      [TECHNIQUES.SC_TOP_ARMBAR]: {
        id: TECHNIQUES.SC_TOP_ARMBAR,
        name: 'Armbar',
        description: 'Applying a straight armbar from Side Control, often on the far arm.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Submission,
        originPositionId: POSITIONS.SIDE_CONTROL_TOP,
        outcomes: [
          { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply armbar.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Armbar fails.', likelihood: 'Possible' },
        ],
        setupTechniqueIds: [TECHNIQUES.SC_TOP_AMERICANA, TECHNIQUES.SC_TOP_KIMURA], // Added setups
      },
      [TECHNIQUES.SC_TOP_ARM_TRIANGLE]: {
        id: TECHNIQUES.SC_TOP_ARM_TRIANGLE,
        name: 'Arm Triangle Choke',
        description: 'Applying a head and arm choke from Side Control.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Submission,
        originPositionId: POSITIONS.SIDE_CONTROL_TOP,
        outcomes: [
          { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply choke.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Choke fails.', likelihood: 'Possible' },
        ],
        setupTechniqueIds: [TECHNIQUES.SC_TOP_KIMURA], // Added setup
      },
      [TECHNIQUES.SC_TOP_PAPER_CUTTER_CHOKE]: {
        id: TECHNIQUES.SC_TOP_PAPER_CUTTER_CHOKE,
        name: 'Paper Cutter Choke',
        description: 'Gi choke from Side Control using lapel grip under neck and fist/forearm across.',
        applicability: BjjApplicability.Gi,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Submission,
        originPositionId: POSITIONS.SIDE_CONTROL_TOP,
        outcomes: [
          { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply choke.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Choke fails.', likelihood: 'Possible' },
        ],
      },
      [TECHNIQUES.SC_TOP_BACK_TAKE]: {
        id: TECHNIQUES.SC_TOP_BACK_TAKE,
        name: 'Back Take',
        description: 'Transitioning from Side Control to Back Control, often when opponent turns in.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.SIDE_CONTROL_TOP,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.BACK_CONTROL_TOP, description: 'Successfully take the back.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Back take fails.', likelihood: 'Possible' },
        ],
        setupTechniqueIds: [TECHNIQUES.SC_TOP_KIMURA], // Added setup
      },
       [TECHNIQUES.SC_TOP_NORTH_SOUTH_TRANSITION]: {
        id: TECHNIQUES.SC_TOP_NORTH_SOUTH_TRANSITION,
        name: 'North-South Transition',
        description: 'Transitioning from standard Side Control to North-South position.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.SIDE_CONTROL_TOP,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.NORTH_SOUTH_TOP, description: 'Successfully transition to North-South.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Transition fails.', likelihood: 'Possible' },
        ],
      },
      [TECHNIQUES.SC_TOP_KESAGATAME_TRANSITION]: {
        id: TECHNIQUES.SC_TOP_KESAGATAME_TRANSITION,
        name: 'Kesa Gatame Transition',
        description: 'Transitioning from standard Side Control to Kesa Gatame (Scarf Hold).',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.SIDE_CONTROL_TOP,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.KESAGATAME_TOP, description: 'Successfully transition to Kesa Gatame.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Transition fails.', likelihood: 'Possible' },
        ],
      },

    // --- Side Control (Bottom) Techniques ---
     [TECHNIQUES.SC_BOTTOM_SHRIMP_ESCAPE]: {
      id: TECHNIQUES.SC_BOTTOM_SHRIMP_ESCAPE,
      name: 'Shrimp Escape (Hip Escape to Guard)',
      description: 'Fundamental escape: creating frames, bridging to make space, hip escaping (shrimping) out, and inserting knee/leg to recover guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Escape,
      originPositionId: POSITIONS.SIDE_CONTROL_BOTTOM,
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Successfully escape and recover Closed Guard.', likelihood: 'Primary' },
        { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_BOTTOM, description: 'Successfully escape and recover Half Guard.', likelihood: 'Primary' },
         { type: 'PositionChange', endPositionId: POSITIONS.OPEN_GUARD_BOTTOM, description: 'Escape attempt results in Open Guard recovery.', likelihood: 'Secondary' },
        { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_BOTTOM, description: 'Escape attempt fails, opponent maintains Side Control.', likelihood: 'Possible' },
      ],
    },
     [TECHNIQUES.SC_BOTTOM_BRIDGE_ROLL_ESCAPE]: {
      id: TECHNIQUES.SC_BOTTOM_BRIDGE_ROLL_ESCAPE,
      name: 'Bridge and Roll Escape',
      description: 'Explosively bridging into an off-balanced opponent and rolling them over, often landing in their guard or initiating a scramble.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Escape, // Often a reversal
      originPositionId: POSITIONS.SIDE_CONTROL_BOTTOM,
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Successfully bridge and roll, landing in opponent\'s Closed Guard.', likelihood: 'Primary' },
         { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_TOP, description: 'Bridge and roll results in landing in opponent\'s Half Guard.', likelihood: 'Secondary' },
        { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_BOTTOM, description: 'Escape attempt fails, opponent bases out.', likelihood: 'Possible' },
      ],
    },
     [TECHNIQUES.SC_BOTTOM_UNDERHOOK_ESCAPE_KNEES]: {
        id: TECHNIQUES.SC_BOTTOM_UNDERHOOK_ESCAPE_KNEES,
        name: 'Underhook Escape to Knees (Ghost Escape)',
        description: 'Securing an underhook, using it to create space and turn belly-down to the knees (Turtle position).',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Escape,
        originPositionId: POSITIONS.SIDE_CONTROL_BOTTOM,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.TURTLE_BOTTOM, description: 'Successfully escape to Turtle position.', likelihood: 'Primary' },
          { type: 'PositionChange', endPositionId: POSITIONS.STANDING, description: 'Escape to knees and manage to stand up.', likelihood: 'Secondary' }, // If opponent disengages
          { type: 'Failure', endPositionId: POSITIONS.SIDE_CONTROL_BOTTOM, description: 'Escape attempt fails, opponent flattens you back out or counters underhook.', likelihood: 'Possible' },
          // Can sometimes lead directly to taking opponent's back if they overcommit countering
        ],
      },
      // TODO: Add Rolling Escape (Bridge to Single Leg)

    // --- Back Control (Top) Techniques ---
    [TECHNIQUES.BC_TOP_RNC]: {
       id: TECHNIQUES.BC_TOP_RNC,
       name: 'Rear Naked Choke (RNC)',
       description: 'Signature back control submission: applying a figure-four choke around the opponent\'s neck using the arms.',
       applicability: BjjApplicability.Both,
       difficulty: BjjDifficulty.Beginner,
       type: BjjTechniqueType.Submission,
       originPositionId: POSITIONS.BACK_CONTROL_TOP,
       media: [media('https://www.youtube.com/watch?v=br4AC0WhUXM', 'video', 'Rear Naked Choke Basics')],
       setupTechniqueIds: [TECHNIQUES.BC_TOP_SEATBELT_CONTROL],
       outcomes: [
         { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply RNC, opponent taps.', likelihood: 'Primary' },
         { type: 'Failure', endPositionId: POSITIONS.BACK_CONTROL_TOP, description: 'Choke attempt fails, opponent defends neck or strips grips.', likelihood: 'Possible' },
         { type: 'Countered', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Opponent successfully executes escape during choke attempt, landing you in their guard.', likelihood: 'CommonCounter', counteredByTechniqueId: TECHNIQUES.BC_BOTTOM_TURN_IN_ESCAPE }, // Example counter link
       ],
     },
      [TECHNIQUES.BC_TOP_BOW_ARROW_CHOKE]: {
       id: TECHNIQUES.BC_TOP_BOW_ARROW_CHOKE,
       name: 'Bow and Arrow Choke',
       description: 'Powerful Gi choke from Back Control using opponent\'s collar and leg control to create leverage.',
       applicability: BjjApplicability.Gi,
       difficulty: BjjDifficulty.Intermediate,
       type: BjjTechniqueType.Submission,
       originPositionId: POSITIONS.BACK_CONTROL_TOP,
        setupTechniqueIds: [TECHNIQUES.BC_TOP_SEATBELT_CONTROL],
       outcomes: [
         { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply Bow and Arrow choke, opponent taps.', likelihood: 'Primary' },
         { type: 'Failure', endPositionId: POSITIONS.BACK_CONTROL_TOP, description: 'Choke attempt fails, opponent defends grips or posture.', likelihood: 'Possible' },
       ],
     },
      [TECHNIQUES.BC_TOP_BODY_TRIANGLE_CONTROL]: {
        id: TECHNIQUES.BC_TOP_BODY_TRIANGLE_CONTROL,
        name: 'Body Triangle',
        description: 'Using legs in a figure-four around the opponent\'s torso for tight control from the back, limiting their escapes.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Control, // Primarily control, not a submission itself
        originPositionId: POSITIONS.BACK_CONTROL_TOP,
        outcomes: [
          { type: 'ControlChange', endPositionId: POSITIONS.BODY_TRIANGLE_TOP, description: 'Establish Body Triangle control.', likelihood: 'Primary' },
          // Outcome could be maintaining this position while working other subs
        ],
      },
      [TECHNIQUES.BC_TOP_SEATBELT_CONTROL]: {
        id: TECHNIQUES.BC_TOP_SEATBELT_CONTROL,
        name: 'Seatbelt Grip',
        description: 'Fundamental Back Control grip (one arm over shoulder, one under armpit, hands clasped) securing chest-to-back connection.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Control,
        originPositionId: POSITIONS.BACK_CONTROL_TOP, // Can be applied from other spots too, but defines BC
        outcomes: [
          { type: 'ControlChange', description: 'Seatbelt grip secured.', likelihood: 'Primary' },
        ],
         followUpTechniqueIds: [TECHNIQUES.BC_TOP_RNC, TECHNIQUES.BC_TOP_BOW_ARROW_CHOKE], // Setup for attacks
      },
       // TODO: Add Rear Triangle & Armbar Combo

    // --- Back Control (Bottom) Techniques ---
    [TECHNIQUES.BC_BOTTOM_TURN_IN_ESCAPE]: {
      id: TECHNIQUES.BC_BOTTOM_TURN_IN_ESCAPE,
      name: 'Turn In Escape',
      description: 'Fundamental back escape: protect neck, strip bottom hook, get shoulders to mat, and turn into opponent to establish guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Escape,
      originPositionId: POSITIONS.BACK_CONTROL_BOTTOM,
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_TOP, description: 'Successfully escape back control, landing opponent in your Closed Guard.', likelihood: 'Primary' },
        { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_TOP, description: 'Escape results in opponent landing in your Half Guard.', likelihood: 'Secondary' },
        { type: 'Failure', endPositionId: POSITIONS.BACK_CONTROL_BOTTOM, description: 'Escape attempt fails, opponent maintains back control or re-secures hooks/choke.', likelihood: 'Possible' },
      ],
    },
     // TODO: Add Chair Sit, Wrist Control escapes for Back Control Bottom
     [TECHNIQUES.BC_BOTTOM_CHAIR_SIT_ESCAPE]: {
      id: TECHNIQUES.BC_BOTTOM_CHAIR_SIT_ESCAPE,
      name: 'Chair Sit Escape',
      description: 'Back escape variant involving creating space and pivoting as if sitting in a chair to face the opponent.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.Escape,
      originPositionId: POSITIONS.BACK_CONTROL_BOTTOM,
      outcomes: [
        { type: 'PositionChange', endPositionId: POSITIONS.OPEN_GUARD_TOP, description: 'Successfully escape, often results in a scramble or opponent in open guard.', likelihood: 'Primary' },
        { type: 'Failure', endPositionId: POSITIONS.BACK_CONTROL_BOTTOM, description: 'Escape fails.', likelihood: 'Possible' },
      ],
    },
    [TECHNIQUES.BC_BOTTOM_WRIST_CONTROL_ESCAPE]: {
      id: TECHNIQUES.BC_BOTTOM_WRIST_CONTROL_ESCAPE,
      name: 'Wrist Control Escape',
      description: 'Focusing on controlling/stripping opponent\'s hands (especially choking arm) to prevent submission and facilitate other escapes.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner, // Concept
      type: BjjTechniqueType.Escape, // Defensive aspect
      originPositionId: POSITIONS.BACK_CONTROL_BOTTOM,
      outcomes: [
        { type: 'ControlChange', description: 'Temporarily control/strip grips, creating escape window.', likelihood: 'Primary' },
        // This often precedes another escape like Turn In
      ],
      followUpTechniqueIds: [TECHNIQUES.BC_BOTTOM_TURN_IN_ESCAPE],
    },

    // --- Knee On Belly (Top) Techniques ---
    [TECHNIQUES.KOB_TOP_FAR_SIDE_ARMBAR]: {
        id: TECHNIQUES.KOB_TOP_FAR_SIDE_ARMBAR,
        name: 'Far Side Armbar (Spinning Armbar)',
        description: 'From Knee on Belly, capitalizing on opponent pushing the knee by gripping their far arm and spinning over their head for an armbar.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Submission,
        originPositionId: POSITIONS.KNEE_ON_BELLY_TOP,
        outcomes: [
          { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply spinning armbar, opponent taps.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.KNEE_ON_BELLY_TOP, description: 'Armbar attempt fails, opponent pulls arm free or defends.', likelihood: 'Possible' },
           { type: 'Countered', endPositionId: POSITIONS.HALF_GUARD_BOTTOM, description: 'Opponent bridges or shrimps during spin, potentially recovering half guard.', likelihood: 'Possible' },
        ],
      },
      [TECHNIQUES.KOB_TOP_MOUNT_TRANSITION]: {
        id: TECHNIQUES.KOB_TOP_MOUNT_TRANSITION,
        name: 'Mount Transition',
        description: 'Sliding the knee across the opponent\'s body from Knee on Belly to establish full Mount.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.KNEE_ON_BELLY_TOP,
        media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Mount Transition from Knee Ride (Conceptual)')], // Placeholder link
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.MOUNT_TOP, description: 'Successfully transition to Mount.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.KNEE_ON_BELLY_TOP, description: 'Transition attempt blocked, opponent prevents knee slide.', likelihood: 'Possible' },
           { type: 'Countered', endPositionId: POSITIONS.HALF_GUARD_BOTTOM, description: 'Opponent recovers Half Guard during transition.', likelihood: 'CommonCounter' },
        ],
      },
      // TODO: Add more KOB Top Techniques (Baseball Choke, Near Armbar, etc.)
      [TECHNIQUES.KOB_TOP_BASEBALL_CHOKE]: {
        id: TECHNIQUES.KOB_TOP_BASEBALL_CHOKE,
        name: 'Baseball Bat Choke',
        description: 'Gi choke applied from Knee on Belly (or side control) using cross-collar grips.',
        applicability: BjjApplicability.Gi,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Submission,
        originPositionId: POSITIONS.KNEE_ON_BELLY_TOP,
        outcomes: [
          { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply choke.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.KNEE_ON_BELLY_TOP, description: 'Choke fails.', likelihood: 'Possible' },
        ],
      },
      [TECHNIQUES.KOB_TOP_BACKSTEP_SIDE_CONTROL]: {
        id: TECHNIQUES.KOB_TOP_BACKSTEP_SIDE_CONTROL,
        name: 'Backstep to Side Control',
        description: 'Transitioning from Knee on Belly back to Side Control, often by stepping the posted leg back around.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.KNEE_ON_BELLY_TOP,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Successfully transition back to Side Control.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.KNEE_ON_BELLY_TOP, description: 'Transition fails.', likelihood: 'Possible' },
        ],
      },

      // --- Knee On Belly (Bottom) Techniques ---
      [TECHNIQUES.KOB_BOTTOM_SHRIMP_ESCAPE]: {
        id: TECHNIQUES.KOB_BOTTOM_SHRIMP_ESCAPE,
        name: 'Shrimp and Replace Guard',
        description: 'Pushing opponent\'s knee off the belly while hip escaping (shrimping) to create space and insert knee/leg to recover guard.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Escape,
        originPositionId: POSITIONS.KNEE_ON_BELLY_BOTTOM,
        outcomes: [
           { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_BOTTOM, description: 'Successfully escape KOB and recover Half Guard.', likelihood: 'Primary' },
           { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Escape leads to recovering full Closed Guard.', likelihood: 'Secondary' },
           { type: 'Failure', endPositionId: POSITIONS.KNEE_ON_BELLY_BOTTOM, description: 'Escape fails, opponent maintains KOB pressure.', likelihood: 'Possible' },
        ],
      },
      // TODO: Add more KOB Bottom Escapes (Bridge/Underhook, Foot Grab, Turtle)
      [TECHNIQUES.KOB_BOTTOM_BRIDGE_UNDERHOOK_ESCAPE]: {
        id: TECHNIQUES.KOB_BOTTOM_BRIDGE_UNDERHOOK_ESCAPE,
        name: 'Bridge and Underhook Escape',
        description: 'Escaping Knee on Belly by bridging opponent off balance, securing an underhook, and shrimping/turning.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Escape,
        originPositionId: POSITIONS.KNEE_ON_BELLY_BOTTOM,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_BOTTOM, description: 'Escape to Half Guard.', likelihood: 'Primary' },
          { type: 'PositionChange', endPositionId: POSITIONS.TURTLE_BOTTOM, description: 'Escape results in Turtle position.', likelihood: 'Secondary' },
          { type: 'Failure', endPositionId: POSITIONS.KNEE_ON_BELLY_BOTTOM, description: 'Escape fails.', likelihood: 'Possible' },
        ],
      },

      // --- Turtle (Top) Techniques ---
      [TECHNIQUES.TURTLE_TOP_BACK_TAKE_ROLL]: {
        id: TECHNIQUES.TURTLE_TOP_BACK_TAKE_ROLL,
        name: 'Roll Through Back Take (Turtle Flip)',
        description: 'Securing a hook and hip grip on a turtled opponent, then rolling diagonally over the shoulder to land in Back Control.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate, // Requires timing
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.TURTLE_TOP,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.BACK_CONTROL_TOP, description: 'Successfully roll opponent and establish Back Control.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.TURTLE_TOP, description: 'Roll fails, opponent bases out or counters roll.', likelihood: 'Possible' },
        ],
      },
       [TECHNIQUES.TURTLE_TOP_BACK_TAKE_DRAG]: {
        id: TECHNIQUES.TURTLE_TOP_BACK_TAKE_DRAG,
        name: 'Pull into Back Mount (Seatbelt & Drag)',
        description: 'Securing a seatbelt grip on a turtled opponent, falling backward to the side, and pulling them into Back Control, inserting hooks.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.TURTLE_TOP,
        setupTechniqueIds: [TECHNIQUES.BC_TOP_SEATBELT_CONTROL], // Seatbelt is key
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.BACK_CONTROL_TOP, description: 'Successfully drag opponent into Back Control.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.TURTLE_TOP, description: 'Drag fails, opponent resists or maintains turtle.', likelihood: 'Possible' },
           { type: 'Countered', endPositionId: POSITIONS.OPEN_GUARD_BOTTOM, description: 'Opponent performs Granby Roll during drag attempt, potentially ending in your Open Guard.', likelihood: 'CommonCounter', counteredByTechniqueId: TECHNIQUES.TURTLE_BOTTOM_GRANBY_ROLL },
        ],
      },
       [TECHNIQUES.TURTLE_TOP_CLOCK_CHOKE]: {
        id: TECHNIQUES.TURTLE_TOP_CLOCK_CHOKE,
        name: 'Clock Choke',
        description: 'Gi choke from attacking turtle: feeding a collar grip around the neck, posting head, and walking legs around ("clock") to tighten.',
        applicability: BjjApplicability.Gi,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Submission,
        originPositionId: POSITIONS.TURTLE_TOP,
        outcomes: [
          { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply Clock Choke, opponent taps.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.TURTLE_TOP, description: 'Choke fails, opponent defends grip or creates space.', likelihood: 'Possible' },
        ],
      },
      // TODO: Add more Turtle Top attacks (Anaconda, Darce, Breakdown)
      [TECHNIQUES.TURTLE_TOP_ANACONDA_CHOKE]: {
        id: TECHNIQUES.TURTLE_TOP_ANACONDA_CHOKE,
        name: 'Anaconda Choke',
        description: 'Front headlock choke (arm triangle variation) applied often against a turtled opponent.',
        applicability: BjjApplicability.NoGi, // Primarily No-Gi but possible in Gi
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Submission,
        originPositionId: POSITIONS.TURTLE_TOP,
        outcomes: [
          { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply choke.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.TURTLE_TOP, description: 'Choke fails.', likelihood: 'Possible' },
        ],
        followUpTechniqueIds: [TECHNIQUES.TURTLE_TOP_DARCE_CHOKE], // Often related setups
      },
      [TECHNIQUES.TURTLE_TOP_DARCE_CHOKE]: {
        id: TECHNIQUES.TURTLE_TOP_DARCE_CHOKE,
        name: 'D\'Arce Choke (Brabo Choke)',
        description: 'Front headlock choke (arm triangle variation, opposite side of Anaconda) applied often against a turtled opponent.',
        applicability: BjjApplicability.NoGi, // Primarily No-Gi but possible in Gi
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Submission,
        originPositionId: POSITIONS.TURTLE_TOP,
        outcomes: [
          { type: 'Submission', endPositionId: POSITIONS.SUBMISSION, description: 'Successfully apply choke.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.TURTLE_TOP, description: 'Choke fails.', likelihood: 'Possible' },
        ],
        followUpTechniqueIds: [TECHNIQUES.TURTLE_TOP_ANACONDA_CHOKE],
      },
      [TECHNIQUES.TURTLE_TOP_BREAKDOWN_TO_SIDE_CONTROL]: {
        id: TECHNIQUES.TURTLE_TOP_BREAKDOWN_TO_SIDE_CONTROL,
        name: 'Turtle Breakdown to Side Control',
        description: 'Using grips and leverage to flatten a turtled opponent out into Side Control.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.TURTLE_TOP,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Successfully break down turtle to Side Control.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.TURTLE_TOP, description: 'Breakdown fails.', likelihood: 'Possible' },
        ],
      },

      // --- Turtle (Bottom) Techniques ---
      [TECHNIQUES.TURTLE_BOTTOM_GRANBY_ROLL]: {
        id: TECHNIQUES.TURTLE_BOTTOM_GRANBY_ROLL,
        name: 'Granby Roll',
        description: 'Escape from Turtle by tucking head and performing a forward shoulder roll to invert under opponent, aiming to recover guard.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Escape,
        originPositionId: POSITIONS.TURTLE_BOTTOM,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.OPEN_GUARD_BOTTOM, description: 'Successfully Granby roll and recover Open Guard.', likelihood: 'Primary' },
           { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Roll leads to recovering Closed Guard.', likelihood: 'Secondary' },
          { type: 'Failure', endPositionId: POSITIONS.TURTLE_BOTTOM, description: 'Roll blocked or opponent follows, remain in Turtle.', likelihood: 'Possible' },
           { type: 'Countered', endPositionId: POSITIONS.BACK_CONTROL_BOTTOM, description: 'Opponent anticipates roll and takes the back.', likelihood: 'CommonCounter' },
        ],
      },
       [TECHNIQUES.TURTLE_BOTTOM_STAND_UP]: {
        id: TECHNIQUES.TURTLE_BOTTOM_STAND_UP,
        name: 'Stand Up (Technical Stand)',
        description: 'Escaping Turtle by building a base, controlling opponent posture if possible, and executing a technical stand-up.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Escape,
        originPositionId: POSITIONS.TURTLE_BOTTOM,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.STANDING, description: 'Successfully stand up to neutral position.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.TURTLE_BOTTOM, description: 'Stand up attempt fails, opponent prevents base or drags back down.', likelihood: 'Possible' },
           { type: 'Countered', endPositionId: POSITIONS.BACK_CONTROL_BOTTOM, description: 'Opponent takes back during stand up attempt.', likelihood: 'CommonCounter' },
        ],
      },
       // TODO: Add more Turtle Bottom escapes (Sit-Out, Pull Guard, Peek Out)
      [TECHNIQUES.TURTLE_BOTTOM_SIT_OUT]: {
        id: TECHNIQUES.TURTLE_BOTTOM_SIT_OUT,
        name: 'Sit Out',
        description: 'Escape/reversal from Turtle (or referee\'s position in wrestling) by pivoting on hand/knee and swinging leg through.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Escape, // Can be a reversal
        originPositionId: POSITIONS.TURTLE_BOTTOM,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.OPEN_GUARD_BOTTOM, description: 'Successfully sit out, potentially leading to Open Guard.', likelihood: 'Primary' },
          { type: 'PositionChange', endPositionId: POSITIONS.STANDING, description: 'Sit out leads to a scramble and potentially standing.', likelihood: 'Secondary' },
          { type: 'Failure', endPositionId: POSITIONS.TURTLE_BOTTOM, description: 'Sit out fails.', likelihood: 'Possible' },
        ],
      },
      [TECHNIQUES.TURTLE_BOTTOM_PULL_GUARD]: {
        id: TECHNIQUES.TURTLE_BOTTOM_PULL_GUARD,
        name: 'Pull Guard from Turtle',
        description: 'Transitioning from Turtle directly into a Guard position (e.g., Half Guard, Closed Guard) by rolling or sitting back.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.GuardRecovery,
        originPositionId: POSITIONS.TURTLE_BOTTOM,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_BOTTOM, description: 'Successfully pull Half Guard.', likelihood: 'Primary' },
          { type: 'PositionChange', endPositionId: POSITIONS.CLOSED_GUARD_BOTTOM, description: 'Successfully pull Closed Guard.', likelihood: 'Secondary' },
          { type: 'Failure', endPositionId: POSITIONS.TURTLE_BOTTOM, description: 'Failed to establish guard.', likelihood: 'Possible' },
        ],
      },

      // --- Butterfly Guard (Bottom) Techniques ---
      [TECHNIQUES.BFG_BOTTOM_SWEEP]: {
        id: TECHNIQUES.BFG_BOTTOM_SWEEP,
        name: 'Butterfly Sweep (Elevator Sweep)',
        description: 'Using butterfly hooks to elevate opponent and sweep them sideways or overhead.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Sweep,
        originPositionId: POSITIONS.BUTTERFLY_GUARD_BOTTOM,
        media: [media('https://www.youtube.com/watch?v=IR2KTZC3weM', 'video', 'Butterfly Sweep')],
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.MOUNT_TOP, description: 'Successfully sweep opponent, landing in Mount.', likelihood: 'Primary' },
          { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Sweep leads to Side Control top.', likelihood: 'Secondary' },
          { type: 'Failure', endPositionId: POSITIONS.BUTTERFLY_GUARD_BOTTOM, description: 'Sweep fails, opponent maintains base.', likelihood: 'Possible' },
        ],
      },
      // TODO: Add more BFG techniques (Arm Drag, Guillotine)
      [TECHNIQUES.BFG_BOTTOM_ARM_DRAG]: {
        id: TECHNIQUES.BFG_BOTTOM_ARM_DRAG,
        name: 'Arm Drag',
        description: 'Using an arm drag from Butterfly Guard to create an angle for back takes or sweeps.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.BUTTERFLY_GUARD_BOTTOM,
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.BACK_CONTROL_TOP, description: 'Arm drag leads to taking the back.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.BUTTERFLY_GUARD_BOTTOM, description: 'Arm drag fails.', likelihood: 'Possible' },
        ],
      },

       // --- Half Guard (Bottom) Techniques ---
      [TECHNIQUES.HG_BOTTOM_OLD_SCHOOL_SWEEP]: {
        id: TECHNIQUES.HG_BOTTOM_OLD_SCHOOL_SWEEP,
        name: 'Old School Sweep',
        description: 'From Half Guard bottom, achieving an underhook, driving forward and coming up on the side to take top position.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Sweep,
        originPositionId: POSITIONS.HALF_GUARD_BOTTOM,
        media: [media('https://www.infighting.ca/bjj/the-90-essential-bjj-beginner-techniques/', 'image', 'Old School Half Guard Sweep (Conceptual)')], // Placeholder link
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Successfully sweep, landing in Side Control top.', likelihood: 'Primary' },
          { type: 'PositionChange', endPositionId: POSITIONS.HALF_GUARD_TOP, description: 'Sweep results in ending up in opponent\'s Half Guard.', likelihood: 'Secondary' },
          { type: 'Failure', endPositionId: POSITIONS.HALF_GUARD_BOTTOM, description: 'Sweep attempt fails, opponent counters underhook (whizzer) or maintains base.', likelihood: 'Possible' },
        ],
         followUpTechniqueIds: [TECHNIQUES.HG_BOTTOM_BACK_TAKE], // Often possible if opponent whizzers
      },
       // TODO: Add more HG Bottom techniques (Back Take, Deep Half, Kimura, Guillotine)
      [TECHNIQUES.HG_BOTTOM_BACK_TAKE]: {
        id: TECHNIQUES.HG_BOTTOM_BACK_TAKE,
        name: 'Back Take from Half Guard',
        description: 'Securing underhook and using leverage from Half Guard bottom to transition to Back Control.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Intermediate,
        type: BjjTechniqueType.Transition,
        originPositionId: POSITIONS.HALF_GUARD_BOTTOM,
        setupTechniqueIds: [TECHNIQUES.HG_BOTTOM_OLD_SCHOOL_SWEEP], // Can come from failed sweep
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.BACK_CONTROL_TOP, description: 'Successfully take the back.', likelihood: 'Primary' },
          { type: 'Failure', endPositionId: POSITIONS.HALF_GUARD_BOTTOM, description: 'Back take attempt fails.', likelihood: 'Possible' },
        ],
      },

       // --- Half Guard (Top) Techniques ---
       [TECHNIQUES.HG_TOP_KNEE_CUT_PASS]: {
        id: TECHNIQUES.HG_TOP_KNEE_CUT_PASS,
        name: 'Knee Cut Pass',
        description: 'Fundamental pass from Top Half Guard: establish crossface and underhook, then cut the free knee across opponent\'s trapped leg/hip to pass to Side Control.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.GuardPass,
        originPositionId: POSITIONS.HALF_GUARD_TOP,
        setupTechniqueIds: [TECHNIQUES.HG_TOP_CROSSFACE_UNDERHOOK_CONTROL, TECHNIQUES.CG_TOP_ELBOW_KNEE_BREAK], // Added Elbow-Knee Break as setup
        outcomes: [
          { type: 'PositionChange', endPositionId: POSITIONS.SIDE_CONTROL_TOP, description: 'Successfully pass Half Guard using Knee Cut, achieving Side Control.', likelihood: 'Primary' },
           { type: 'PositionChange', endPositionId: POSITIONS.KNEE_ON_BELLY_TOP, description: 'Pass leads directly into Knee on Belly.', likelihood: 'Secondary' },
           { type: 'Failure', endPositionId: POSITIONS.HALF_GUARD_TOP, description: 'Pass attempt fails, opponent defends knee cut or recovers guard.', likelihood: 'Possible' },
            { type: 'Countered', endPositionId: POSITIONS.BACK_CONTROL_BOTTOM, description: 'Opponent takes back during pass attempt.', likelihood: 'CommonCounter', counteredByTechniqueId: TECHNIQUES.HG_BOTTOM_BACK_TAKE }, // Example counter
        ],
      },
       [TECHNIQUES.HG_TOP_CROSSFACE_UNDERHOOK_CONTROL]: {
        id: TECHNIQUES.HG_TOP_CROSSFACE_UNDERHOOK_CONTROL,
        name: 'Crossface & Underhook Control',
        description: 'Establishing dominant head and arm control (crossface on neck, underhook on far arm) from Top Half Guard to flatten opponent and prepare pass.',
        applicability: BjjApplicability.Both,
        difficulty: BjjDifficulty.Beginner,
        type: BjjTechniqueType.Control,
        originPositionId: POSITIONS.HALF_GUARD_TOP,
        outcomes: [
          { type: 'ControlChange', description: 'Crossface and underhook control established.', likelihood: 'Primary' },
        ],
        followUpTechniqueIds: [TECHNIQUES.HG_TOP_KNEE_CUT_PASS], // Sets up passes
      },
      // TODO: Add more HG Top techniques (Americana, Kimura, Darce)
      // Placeholder for HG Top Americana
      // [TECHNIQUES.HG_TOP_AMERICANA]: { ... }, 
      // Placeholder for HG Top Kimura
      // [TECHNIQUES.HG_TOP_KIMURA]: { ... }, 
      // Placeholder for HG Top D'Arce - Ensure ID exists in TECHNIQUES const
      // [TECHNIQUES.HG_TOP_DARCE]: { ... }, 

    // ... Add techniques for other guards (Spider, DLR, RDLR, etc.) ...

    // --- Placeholder Technique Definitions for Connectivity ---
    [TECHNIQUES.KESAGATAME_BOTTOM_ESCAPE]: {
      id: TECHNIQUES.KESAGATAME_BOTTOM_ESCAPE,
      name: 'Kesa Gatame Escape (Placeholder)',
      description: 'Placeholder description for escaping Kesa Gatame.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Escape,
      originPositionId: POSITIONS.KESAGATAME_BOTTOM,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.KESAGATAME_BOTTOM, description: 'Escape attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.NORTH_SOUTH_BOTTOM_ESCAPE]: {
      id: TECHNIQUES.NORTH_SOUTH_BOTTOM_ESCAPE,
      name: 'North-South Escape (Placeholder)',
      description: 'Placeholder description for escaping North-South bottom.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Escape,
      originPositionId: POSITIONS.NORTH_SOUTH_BOTTOM,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.NORTH_SOUTH_BOTTOM, description: 'Escape attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.BODY_TRIANGLE_BOTTOM_ESCAPE]: {
      id: TECHNIQUES.BODY_TRIANGLE_BOTTOM_ESCAPE,
      name: 'Body Triangle Escape (Placeholder)',
      description: 'Placeholder description for escaping body triangle bottom.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate, // Body triangle escapes are harder
      type: BjjTechniqueType.Escape,
      originPositionId: POSITIONS.BODY_TRIANGLE_BOTTOM,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.BODY_TRIANGLE_BOTTOM, description: 'Escape attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.DEEP_HALF_GUARD_BOTTOM_SWEEP]: {
      id: TECHNIQUES.DEEP_HALF_GUARD_BOTTOM_SWEEP,
      name: 'Deep Half Sweep (Placeholder)',
      description: 'Placeholder description for sweeping from Deep Half Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.Sweep,
      originPositionId: POSITIONS.DEEP_HALF_GUARD_BOTTOM,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.DEEP_HALF_GUARD_BOTTOM, description: 'Sweep attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.DEEP_HALF_GUARD_TOP_PASS]: {
      id: TECHNIQUES.DEEP_HALF_GUARD_TOP_PASS,
      name: 'Deep Half Pass (Placeholder)',
      description: 'Placeholder description for passing Deep Half Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.GuardPass,
      originPositionId: POSITIONS.DEEP_HALF_GUARD_TOP,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.DEEP_HALF_GUARD_TOP, description: 'Pass attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.Z_GUARD_BOTTOM_SWEEP]: {
      id: TECHNIQUES.Z_GUARD_BOTTOM_SWEEP,
      name: 'Z-Guard Sweep (Placeholder)',
      description: 'Placeholder description for sweeping from Z-Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.Sweep,
      originPositionId: POSITIONS.Z_GUARD_BOTTOM,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.Z_GUARD_BOTTOM, description: 'Sweep attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.Z_GUARD_TOP_PASS]: {
      id: TECHNIQUES.Z_GUARD_TOP_PASS,
      name: 'Z-Guard Pass (Placeholder)',
      description: 'Placeholder description for passing Z-Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Beginner,
      type: BjjTechniqueType.GuardPass,
      originPositionId: POSITIONS.Z_GUARD_TOP,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.Z_GUARD_TOP, description: 'Pass attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.SPIDER_GUARD_BOTTOM_SWEEP]: {
      id: TECHNIQUES.SPIDER_GUARD_BOTTOM_SWEEP,
      name: 'Spider Guard Sweep (Placeholder)',
      description: 'Placeholder description for sweeping from Spider Guard.',
      applicability: BjjApplicability.Gi, // Spider guard is Gi specific
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.Sweep,
      originPositionId: POSITIONS.SPIDER_GUARD_BOTTOM,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.SPIDER_GUARD_BOTTOM, description: 'Sweep attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.SPIDER_GUARD_TOP_PASS]: {
      id: TECHNIQUES.SPIDER_GUARD_TOP_PASS,
      name: 'Spider Guard Pass (Placeholder)',
      description: 'Placeholder description for passing Spider Guard.',
      applicability: BjjApplicability.Gi,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.GuardPass,
      originPositionId: POSITIONS.SPIDER_GUARD_TOP,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.SPIDER_GUARD_TOP, description: 'Pass attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.DE_LA_RIVA_GUARD_BOTTOM_SWEEP]: {
      id: TECHNIQUES.DE_LA_RIVA_GUARD_BOTTOM_SWEEP,
      name: 'De La Riva Sweep (Placeholder)',
      description: 'Placeholder description for sweeping from De La Riva Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.Sweep,
      originPositionId: POSITIONS.DE_LA_RIVA_GUARD_BOTTOM,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.DE_LA_RIVA_GUARD_BOTTOM, description: 'Sweep attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.DE_LA_RIVA_GUARD_TOP_PASS]: {
      id: TECHNIQUES.DE_LA_RIVA_GUARD_TOP_PASS,
      name: 'De La Riva Pass (Placeholder)',
      description: 'Placeholder description for passing De La Riva Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.GuardPass,
      originPositionId: POSITIONS.DE_LA_RIVA_GUARD_TOP,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.DE_LA_RIVA_GUARD_TOP, description: 'Pass attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.REVERSE_DE_LA_RIVA_GUARD_BOTTOM_SWEEP]: {
      id: TECHNIQUES.REVERSE_DE_LA_RIVA_GUARD_BOTTOM_SWEEP,
      name: 'Reverse De La Riva Sweep (Placeholder)',
      description: 'Placeholder description for sweeping from Reverse De La Riva Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.Sweep,
      originPositionId: POSITIONS.REVERSE_DE_LA_RIVA_GUARD_BOTTOM,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.REVERSE_DE_LA_RIVA_GUARD_BOTTOM, description: 'Sweep attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.REVERSE_DE_LA_RIVA_GUARD_TOP_PASS]: {
      id: TECHNIQUES.REVERSE_DE_LA_RIVA_GUARD_TOP_PASS,
      name: 'Reverse De La Riva Pass (Placeholder)',
      description: 'Placeholder description for passing Reverse De La Riva Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.GuardPass,
      originPositionId: POSITIONS.REVERSE_DE_LA_RIVA_GUARD_TOP,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.REVERSE_DE_LA_RIVA_GUARD_TOP, description: 'Pass attempt fails.', likelihood: 'Possible' }],
    },
    [TECHNIQUES.BUTTERFLY_GUARD_TOP_PASS]: {
      id: TECHNIQUES.BUTTERFLY_GUARD_TOP_PASS,
      name: 'Butterfly Guard Pass (Placeholder)',
      description: 'Placeholder description for passing Butterfly Guard.',
      applicability: BjjApplicability.Both,
      difficulty: BjjDifficulty.Intermediate,
      type: BjjTechniqueType.GuardPass,
      originPositionId: POSITIONS.BUTTERFLY_GUARD_TOP,
      outcomes: [{ type: 'Failure', endPositionId: POSITIONS.BUTTERFLY_GUARD_TOP, description: 'Pass attempt fails.', likelihood: 'Possible' }],
    },

  },
}; 