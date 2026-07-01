import { Deck, Preset, SceneCard, Card } from "@/src/types";
import { MENTAL_PRESSURE } from "@/src/theme/theme";

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const weightedPick = (cards: Card[]): Card => {
  // higher tier => slightly higher weight, builds escalation
  const weights = cards.map((c) => c.tier);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < cards.length; i++) {
    r -= weights[i];
    if (r <= 0) return cards[i];
  }
  return cards[cards.length - 1];
};

// runTurnDraw — the single source of truth for composing a turn's scene.
// Each participating deck contributes `cardsPerTurn` cards (default 1, skipped if 0).
// Repeats are allowed when cardsPerTurn exceeds available cards (simplest, no reshuffle).
export const drawScene = (
  decks: Deck[],
  preset: Preset,
  carryOver: SceneCard[],
): SceneCard[] => {
  const scene: SceneCard[] = [];

  // carried-over cards lead the scene
  carryOver.forEach((c) => scene.push({ ...c, carry: true }));

  decks.forEach((deck) => {
    if (!preset.deckTypes.includes(deck.type)) return;
    const count = deck.cardsPerTurn ?? 1;
    if (count <= 0) return; // cardsPerTurn = 0 => skip entirely

    let cards: Card[] = deck.cards;
    if (!preset.freeFlow) {
      cards = cards.filter((c) => c.tier <= preset.intensityMax);
    }
    if (cards.length === 0) return;

    for (let i = 0; i < count; i++) {
      const chosen = preset.weightedDraw ? weightedPick(cards) : pick(cards);
      scene.push({ ...chosen, deckType: deck.type, deckName: deck.name });
    }
  });

  return scene;
};

export const sceneMaxTier = (scene: SceneCard[]): 1 | 2 | 3 => {
  let max = 1;
  scene.forEach((c) => {
    if (c.tier > max) max = c.tier;
  });
  return max as 1 | 2 | 3;
};

export const sceneScore = (
  scene: SceneCard[],
  preset: Preset,
  momentum: number,
  modifiers: string[] = [],
  restricted = false,
): number => {
  const tier = sceneMaxTier(scene);
  const mult = preset.scoring.tierMultipliers[tier - 1] ?? 1;
  let pts = preset.scoring.pointsPerScene * mult;
  if (preset.momentumMode) {
    pts += momentum * preset.scoring.momentumBonus;
  }
  // intensity stacking bonuses
  pts += modifiers.length * 2;
  if (restricted) pts += 5;
  if (scene.some((c) => c.deckType === "ExtremeControl")) pts += 6;
  return Math.round(pts);
};

export const extractCarry = (scene: SceneCard[], preset: Preset): SceneCard[] => {
  if (!preset.momentumMode) return [];
  return scene
    .filter((c) => c.deckType === "Momentum" || c.tags.includes("carry"))
    .map((c) => ({ ...c, carry: true }));
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Mental-pressure modifiers stacked on a scene. Count scales with intensity & momentum.
export const rollModifiers = (preset: Preset, momentum: number): string[] => {
  if (!preset.mentalPressure) return [];
  let count = 0;
  if (preset.intensityMax >= 3) count += 1;
  if (momentum >= 2) count += 1;
  if (count === 0 && Math.random() < 0.35) count = 1;
  count = Math.min(2, count);
  return shuffle([...MENTAL_PRESSURE]).slice(0, count);
};

export interface Restricted {
  active: boolean;
  movement: boolean;
  speech: boolean;
  pace: boolean;
}

export const computeRestricted = (scene: SceneCard[], modifiers: string[]): Restricted => {
  const tags = new Set(scene.flatMap((c) => c.tags));
  const hasExtreme = scene.some(
    (c) => c.deckType === "ExtremeControl" || c.tags.includes("control_extreme"),
  );
  const movement =
    hasExtreme ||
    tags.has("restraint") ||
    tags.has("restriction") ||
    modifiers.includes("Move only when instructed");
  const speech = tags.has("silence") || modifiers.includes("No talking allowed");
  const pace = hasExtreme || tags.has("control") || tags.has("pace");
  return { active: movement || speech || pace, movement, speech, pace };
};

export const powerFlipRoll = (preset: Preset, momentum: number): boolean => {
  if (!preset.powerReversals) return false;
  const chance = 0.06 + Math.min(0.18, momentum * 0.03);
  return Math.random() < chance;
};

// Seconds the leader must hold before the scene can be locked (commitment / no early stop).
export const sceneCommitment = (scene: SceneCard[], preset: Preset): number => {
  let s = 0;
  scene.forEach((c) => {
    if (c.holdSeconds) s = Math.max(s, c.holdSeconds);
  });
  const tier = sceneMaxTier(scene);
  if (tier === 3) s = Math.max(s, 30);
  else if (tier === 2) s = Math.max(s, 12);
  if (scene.some((c) => c.deckType === "ExtremeControl")) s = Math.max(s, 45);
  return Math.min(s, preset.roundDuration);
};
