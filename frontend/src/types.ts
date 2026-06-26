export type DeckType =
  | "Action"
  | "Enhancer"
  | "Control"
  | "Time"
  | "Momentum"
  | "Wild"
  | "Objective"
  | "ExtremeControl"
  | "Custom";

export type Tier = 1 | 2 | 3;

export interface Card {
  id: string;
  text: string;
  tags: string[];
  tier: Tier;
  image?: string;
  partnerInstruction?: string;
  tone?: string;
  intensifier?: string;
  chain?: string[];
  holdSeconds?: number;
}

export interface Deck {
  id: string;
  name: string;
  type: DeckType;
  cards: Card[];
}

export interface ScoringConfig {
  pointsPerScene: number;
  tierMultipliers: [number, number, number];
  momentumBonus: number;
  breakPenalty: number;
}

export type WinType = "score" | "rounds" | "time";

export interface WinCondition {
  type: WinType;
  value: number; // score target | round count | minutes
}

export interface Preset {
  id: string;
  name: string;
  deckTypes: DeckType[]; // which deck types compose each scene
  roundDuration: number; // seconds per scene
  momentumMode: boolean;
  freeFlow: boolean;
  weightedDraw: boolean;
  mentalPressure?: boolean;
  powerReversals?: boolean;
  intensityMax: Tier;
  scoring: ScoringConfig;
  win: WinCondition;
}

export interface PlayerStats {
  wins: number;
  points: number;
  bestStreak: number;
  gamesPlayed: number;
  scenesPlayed: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  stats: PlayerStats;
}

export interface SceneCard extends Card {
  deckType: DeckType;
  deckName: string;
  carry?: boolean;
}

export interface Session {
  id: string;
  presetId: string;
  preset: Preset;
  playerIds: string[];
  playerNames: string[];
  scores: Record<string, number>;
  streaks: Record<string, number>;
  round: number;
  momentum: number;
  activeIndex: number;
  carryOver: SceneCard[];
  currentScene: SceneCard[];
  nextScene: SceneCard[];
  sceneMods?: string[];
  startedAt: number;
  elapsed: number;
  status: "active" | "done";
}

export interface AppSettings {
  sound: boolean;
  ambient: boolean;
  haptics: boolean;
}
