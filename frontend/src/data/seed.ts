import { Deck, DeckType, Preset, Tier } from "@/src/types";

let n = 0;
const uid = (p: string) => `${p}_${Date.now().toString(36)}_${(n++).toString(36)}`;

type Raw = [string, Tier, string[]];

const build = (type: DeckType, name: string, raw: Raw[]): Deck => ({
  id: uid("deck"),
  name,
  type,
  cards: raw.map(([text, tier, tags]) => ({ id: uid("card"), text, tier, tags })),
});

const ACTION: Raw[] = [
  ["Focus entirely on your partner's upper body", 1, ["focus", "slow"]],
  ["Focus entirely on your partner's lower body", 2, ["focus"]],
  ["Use hands only", 1, ["hands"]],
  ["Use mouth only", 2, ["mouth"]],
  ["Alternate between soft and firm touch", 2, ["touch", "rhythm"]],
  ["Maintain continuous contact", 2, ["contact", "flow"]],
  ["Focus on one specific area only", 1, ["focus"]],
  ["Gradually explore multiple areas", 2, ["explore"]],
  ["Stay in one position the entire time", 1, ["position"]],
  ["Change positions fluidly throughout", 3, ["position", "flow"]],
  ["Control the pace completely", 2, ["control", "pace"]],
  ["Let your partner guide your movement", 2, ["guided"]],
  ["Focus on slow build-up only", 1, ["slow", "tease"]],
  ["Start slow, finish intense", 3, ["build", "intense"]],
  ["Keep movements minimal and controlled", 1, ["control", "slow"]],
  ["Keep movements varied and unpredictable", 3, ["varied"]],
  ["Mirror your partner's reactions", 2, ["mirror"]],
  ["Focus on teasing rather than intensity", 1, ["tease"]],
  ["Build intensity steadily without stopping", 3, ["build", "flow"]],
  ["Maintain close physical contact throughout", 2, ["contact"]],
];

const ENHANCER: Raw[] = [
  ["Introduce a restraint element", 3, ["restraint"]],
  ["Limit one partner's movement", 2, ["restriction"]],
  ["Add a sensory restriction", 2, ["sensory"]],
  ["Add a prop or accessory", 2, ["prop"]],
  ["Introduce a control dynamic", 2, ["control"]],
  ["Add pressure-based interaction", 2, ["pressure"]],
  ["Add rhythm-based interaction", 2, ["rhythm"]],
  ["Introduce delayed response", 2, ["delay", "tease"]],
  ["Hold positions briefly to build tension", 2, ["tension", "hold"]],
  ["Introduce controlled resistance", 3, ["resistance"]],
  ["No hands restriction", 2, ["restriction"]],
  ["No speaking rule", 1, ["silence"]],
  ["Maintain very close proximity", 1, ["contact"]],
  ["Introduce guided positioning", 2, ["guided"]],
  ["Add a balance challenge", 2, ["challenge"]],
  ["Introduce a coordination challenge", 2, ["challenge"]],
  ["Add an endurance element", 3, ["endurance"]],
  ["Introduce mirrored interaction", 2, ["mirror"]],
  ["Slow only restriction", 1, ["slow", "restriction"]],
  ["Precision only condition", 2, ["precision"]],
];

const CONTROL: Raw[] = [
  ["You remain fully in control", 2, ["dominant"]],
  ["Your partner remains fully in control", 2, ["submissive"]],
  ["No verbal communication allowed", 1, ["silence"]],
  ["Maintain eye contact throughout", 1, ["connection"]],
  ["Slow pace only", 1, ["slow", "pace"]],
  ["Fast pace only", 3, ["fast", "pace"]],
  ["Follow your partner's cues only", 2, ["guided"]],
  ["Partner follows your cues only", 2, ["dominant"]],
  ["Do not break rhythm", 2, ["rhythm", "flow"]],
  ["Pause only when instructed", 2, ["control"]],
  ["Maintain dominant energy", 3, ["dominant"]],
  ["Maintain submissive energy", 2, ["submissive"]],
  ["Switch control halfway through", 3, ["switch"]],
  ["One directs, one executes", 2, ["dynamic"]],
  ["No repositioning once started", 2, ["restriction"]],
  ["Focus on control over speed", 2, ["control"]],
  ["Focus on connection over outcome", 1, ["connection"]],
  ["Keep intensity steady", 1, ["steady"]],
  ["Increase intensity gradually only", 2, ["build"]],
  ["Stay silent but expressive", 1, ["silence", "connection"]],
];

const TIME: Raw[] = [
  ["3 minutes continuous", 1, ["timed"]],
  ["5 minutes continuous", 2, ["timed"]],
  ["7 minutes continuous", 2, ["timed"]],
  ["10 minutes continuous", 3, ["timed", "endurance"]],
  ["Until your partner reacts", 2, ["condition"]],
  ["Until rhythm breaks", 2, ["condition", "rhythm"]],
  ["Until told to stop", 2, ["condition"]],
  ["Until intensity increases naturally", 2, ["build"]],
  ["Until a natural position change", 2, ["condition", "position"]],
  ["Until both sync rhythm", 2, ["rhythm", "connection"]],
  ["As long as possible", 3, ["endurance"]],
  ["Hold the moment without rushing", 1, ["slow", "tease"]],
  ["Push slightly beyond comfort", 3, ["intense"]],
  ["Continue without stopping", 2, ["flow"]],
  ["Flow directly into next round", 2, ["flow", "carry"]],
  ["Maintain steady pacing", 1, ["steady"]],
  ["Until tension builds strongly", 3, ["tension"]],
  ["Until partner signals continuation", 2, ["condition"]],
  ["Sustain without losing flow", 2, ["flow", "endurance"]],
  ["Seamless transition into next", 2, ["carry", "flow"]],
];

const MOMENTUM: Raw[] = [
  ["Carry the current intensity into the next scene", 2, ["carry"]],
  ["Keep the previous restriction active", 2, ["carry", "restriction"]],
  ["Double down — escalate from where you left off", 3, ["carry", "intense"]],
  ["Maintain the same rhythm across rounds", 2, ["carry", "rhythm"]],
  ["The dominant role stays the same next round", 2, ["carry", "dominant"]],
  ["No reset — flow straight into the next draw", 2, ["carry", "flow"]],
  ["Keep eye contact rule for the next two scenes", 1, ["carry", "connection"]],
  ["Stack a new sensation on top of the last one", 3, ["carry"]],
  ["Hold the built tension — do not release yet", 3, ["carry", "tension"]],
  ["Let the heat from last round set the pace", 2, ["carry", "pace"]],
];

const WILD: Raw[] = [
  ["Swap roles immediately", 2, ["switch"]],
  ["Blindfold for the next scene", 3, ["sensory"]],
  ["Partner chooses the next action card", 2, ["choice"]],
  ["Whisper one desire before continuing", 1, ["connection"]],
  ["Freeze for 20 seconds at peak tension", 2, ["tension", "hold"]],
  ["Reverse the current rule entirely", 2, ["reverse"]],
  ["Add one prop of the other's choosing", 2, ["prop", "choice"]],
  ["Combine two action cards at once", 3, ["combo", "intense"]],
  ["Slow everything to half speed instantly", 1, ["slow"]],
  ["Wildcard: invent a rule together right now", 2, ["choice"]],
];

const OBJECTIVE: Raw[] = [
  ["Make your partner break their composure", 2, ["goal"]],
  ["Sustain unbroken flow for the whole scene", 2, ["goal", "flow"]],
  ["Discover a new sensitive spot", 1, ["goal", "explore"]],
  ["Reach peak tension without releasing it", 3, ["goal", "tension"]],
  ["Stay perfectly silent the entire round", 1, ["goal", "silence"]],
  ["Keep your partner guessing your next move", 2, ["goal", "varied"]],
  ["Earn a verbal request to continue", 2, ["goal"]],
  ["Hold a single position to completion", 2, ["goal", "position"]],
  ["Build anticipation for sixty seconds first", 1, ["goal", "tease"]],
  ["Escalate intensity every minute", 3, ["goal", "build"]],
];

interface RawX {
  text: string;
  tier: Tier;
  tags: string[];
  partner?: string;
  tone?: string;
  intensifier?: string;
  hold?: number;
  chain?: string[];
}

const buildX = (type: DeckType, name: string, raw: RawX[]): Deck => ({
  id: uid("deck"),
  name,
  type,
  cards: raw.map((r) => ({
    id: uid("card"),
    text: r.text,
    tier: r.tier,
    tags: r.tags,
    partnerInstruction: r.partner,
    tone: r.tone,
    intensifier: r.intensifier,
    holdSeconds: r.hold,
    chain: r.chain,
  })),
});

const EXTREME: RawX[] = [
  {
    text: "Total Control Position",
    tier: 3,
    tags: ["control_extreme", "control", "restraint"],
    partner: "You must not move unless directly instructed",
    tone: "Strict · controlled · dominant",
    intensifier: "Reset them every time they break position",
    hold: 45,
  },
  {
    text: "Mirror Exposure",
    tier: 3,
    tags: ["control_extreme", "exposure"],
    partner: "Maintain eye contact with yourself while following instructions",
    tone: "Intense · self-aware · vulnerable",
    intensifier: "Narrate exactly what you're making them do",
    hold: 40,
  },
  {
    text: "Limited Movement",
    tier: 3,
    tags: ["control_extreme", "restraint", "restriction"],
    partner: "You may only move when told",
    tone: "Controlled · deliberate",
    hold: 40,
  },
  {
    text: "Rapid Commands",
    tier: 3,
    tags: ["control_extreme", "obedience"],
    partner: "Follow each command instantly — hesitation restarts the chain",
    tone: "Sharp · commanding",
    chain: ["Look down", "Move closer", "Hold perfectly still", "Hands behind your back", "Wait for the next word"],
  },
  {
    text: "Obedience Hold",
    tier: 3,
    tags: ["control_extreme", "obedience", "silence"],
    partner: "Ask permission before every single action",
    tone: "Strict · patient",
    intensifier: "Deny the first request, make them ask again",
    hold: 50,
  },
  {
    text: "Stillness Test",
    tier: 3,
    tags: ["control_extreme", "restraint"],
    partner: "Do not move, do not speak",
    tone: "Quiet · unrelenting",
    intensifier: "Reset the timer on any movement",
    hold: 45,
  },
  {
    text: "Sudden Flip",
    tier: 3,
    tags: ["control_extreme", "reversal"],
    partner: "The moment it lands, control changes hands",
    tone: "Unpredictable · charged",
    intensifier: "The new leader gives three commands immediately",
  },
  {
    text: "Kneel & Wait",
    tier: 3,
    tags: ["control_extreme", "obedience", "control"],
    partner: "Take the position and hold it until released",
    tone: "Commanding · slow",
    intensifier: "Make them wait longer than is comfortable",
    hold: 35,
  },
];

export const buildSeedDecks = (): Deck[] => [
  build("Action", "Action", ACTION),
  build("Enhancer", "Enhancer", ENHANCER),
  build("Control", "Control", CONTROL),
  build("Time", "Time / Condition", TIME),
  build("Momentum", "Momentum", MOMENTUM),
  build("Wild", "Wild Card", WILD),
  build("Objective", "Objective", OBJECTIVE),
  buildX("ExtremeControl", "Extreme Control", EXTREME),
];

export const buildSeedPresets = (): Preset[] => [
  {
    id: uid("preset"),
    name: "Slow Burn",
    deckTypes: ["Action", "Enhancer", "Time"],
    roundDuration: 180,
    momentumMode: true,
    freeFlow: false,
    weightedDraw: false,
    intensityMax: 2,
    scoring: { pointsPerScene: 10, tierMultipliers: [1, 1.5, 2], momentumBonus: 3, breakPenalty: 5 },
    win: { type: "score", value: 100 },
  },
  {
    id: uid("preset"),
    name: "Full Tension",
    deckTypes: ["Action", "Enhancer", "Control", "Time", "Objective"],
    roundDuration: 240,
    momentumMode: true,
    freeFlow: false,
    weightedDraw: true,
    intensityMax: 3,
    mentalPressure: true,
    powerReversals: true,
    scoring: { pointsPerScene: 15, tierMultipliers: [1, 1.6, 2.4], momentumBonus: 5, breakPenalty: 8 },
    win: { type: "score", value: 150 },
  },
  {
    id: uid("preset"),
    name: "Free Flow",
    deckTypes: ["Action", "Wild", "Momentum"],
    roundDuration: 300,
    momentumMode: true,
    freeFlow: true,
    weightedDraw: true,
    intensityMax: 3,
    scoring: { pointsPerScene: 12, tierMultipliers: [1, 1.5, 2], momentumBonus: 6, breakPenalty: 0 },
    win: { type: "rounds", value: 12 },
    mentalPressure: true,
    powerReversals: true,
  },
  {
    id: uid("preset"),
    name: "Dominance",
    deckTypes: ["ExtremeControl", "Control", "Time"],
    roundDuration: 300,
    momentumMode: true,
    freeFlow: false,
    weightedDraw: true,
    intensityMax: 3,
    mentalPressure: true,
    powerReversals: true,
    scoring: { pointsPerScene: 18, tierMultipliers: [1, 1.7, 2.6], momentumBonus: 7, breakPenalty: 12 },
    win: { type: "score", value: 180 },
  },
];

export const PLAYER_COLORS = ["#A62235", "#C5A570", "#3E8463", "#C46B33", "#8E99A3", "#9B5BA6"];
