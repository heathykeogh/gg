import { Deck, Preset, SceneCard, Card } from "@/src/types";

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

export const drawScene = (
  decks: Deck[],
  preset: Preset,
  carryOver: SceneCard[],
): SceneCard[] => {
  const scene: SceneCard[] = [];

  // carried-over cards lead the scene
  carryOver.forEach((c) => scene.push({ ...c, carry: true }));

  preset.deckTypes.forEach((type) => {
    const pool = decks.filter((d) => d.type === type);
    let cards: Card[] = pool.flatMap((d) => d.cards);
    if (!preset.freeFlow) {
      cards = cards.filter((c) => c.tier <= preset.intensityMax);
    }
    if (cards.length === 0) return;
    const chosen = preset.weightedDraw ? weightedPick(cards) : pick(cards);
    const deck = pool.find((d) => d.cards.some((c) => c.id === chosen.id));
    scene.push({
      ...chosen,
      deckType: type,
      deckName: deck?.name ?? type,
    });
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
): number => {
  const tier = sceneMaxTier(scene);
  const mult = preset.scoring.tierMultipliers[tier - 1] ?? 1;
  let pts = preset.scoring.pointsPerScene * mult;
  if (preset.momentumMode) {
    pts += momentum * preset.scoring.momentumBonus;
  }
  return Math.round(pts);
};

export const extractCarry = (scene: SceneCard[], preset: Preset): SceneCard[] => {
  if (!preset.momentumMode) return [];
  return scene
    .filter((c) => c.deckType === "Momentum" || c.tags.includes("carry"))
    .map((c) => ({ ...c, carry: true }));
};
