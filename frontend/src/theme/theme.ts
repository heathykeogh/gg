import { DeckType } from "@/src/types";

export const colors = {
  surface: "#0C0C0E",
  onSurface: "#EAE6E1",
  surfaceSecondary: "#16161A",
  onSurfaceSecondary: "#D4CFCA",
  surfaceTertiary: "#222226",
  onSurfaceTertiary: "#AFAAA5",
  surfaceInverse: "#EAE6E1",
  onSurfaceInverse: "#0C0C0E",
  brand: "#8A1C2B",
  brandPrimary: "#A62235",
  onBrandPrimary: "#F9F6F0",
  brandSecondary: "#C5A570",
  onBrandSecondary: "#1A1713",
  brandTertiary: "#3D141B",
  onBrandTertiary: "#EAE6E1",
  success: "#2D5A43",
  onSuccess: "#E8F5E9",
  warning: "#C5A570",
  error: "#8A1C2B",
  onError: "#F9F6F0",
  border: "#2A2A30",
  borderStrong: "#45454C",
  divider: "#1F1F24",
  muted: "#7A746E",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const fonts = {
  display: "Cormorant",
  displaySemi: "Cormorant-SemiBold",
  displayBold: "Cormorant-Bold",
  body: "Manrope",
  bodyMedium: "Manrope-Medium",
  bodySemi: "Manrope-SemiBold",
  bodyBold: "Manrope-Bold",
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 44,
  "5xl": 60,
} as const;

export interface DeckTheme {
  bg: string;
  bgEnd: string;
  accent: string;
  text: string;
  sub: string;
  glow: string;
  icon: string;
}

export const DECK_THEME: Record<DeckType, DeckTheme> = {
  Action: {
    bg: "#2A0E13",
    bgEnd: "#5A1622",
    accent: "#A62235",
    text: "#F6E9EA",
    sub: "#D9A7AD",
    glow: "#A62235",
    icon: "flame",
  },
  Enhancer: {
    bg: "#0E2019",
    bgEnd: "#1C4233",
    accent: "#3E8463",
    text: "#E6F2EC",
    sub: "#9DC4B2",
    glow: "#2D5A43",
    icon: "sparkles",
  },
  Control: {
    bg: "#241E12",
    bgEnd: "#4A3B1F",
    accent: "#C5A570",
    text: "#F6EFDF",
    sub: "#C9B894",
    glow: "#C5A570",
    icon: "git-network",
  },
  Time: {
    bg: "#16161A",
    bgEnd: "#2C2C33",
    accent: "#AFAAA5",
    text: "#EDEAE6",
    sub: "#A8A39E",
    glow: "#3A3A40",
    icon: "time",
  },
  Momentum: {
    bg: "#2A1410",
    bgEnd: "#5A2A18",
    accent: "#C46B33",
    text: "#F7EBE2",
    sub: "#D4A988",
    glow: "#C46B33",
    icon: "trending-up",
  },
  ExtremeControl: {
    bg: "#150407",
    bgEnd: "#3D0A12",
    accent: "#D43B4E",
    text: "#F8E7E9",
    sub: "#D9979F",
    glow: "#D43B4E",
    icon: "lock-closed",
  },
  Wild: {
    bg: "#EAE6E1",
    bgEnd: "#CFC7BC",
    accent: "#8A1C2B",
    text: "#1A1713",
    sub: "#5C544B",
    glow: "#EAE6E1",
    icon: "shuffle",
  },
  Objective: {
    bg: "#191B1F",
    bgEnd: "#2C3138",
    accent: "#8E99A3",
    text: "#EAEDF0",
    sub: "#9AA3AC",
    glow: "#2C3138",
    icon: "flag",
  },
  Custom: {
    bg: "#1B1B20",
    bgEnd: "#33333A",
    accent: "#C5A570",
    text: "#EAE6E1",
    sub: "#AFAAA5",
    glow: "#33333A",
    icon: "layers",
  },
};

export const TIER_LABEL = ["", "Tease", "Build", "Intense"] as const;
export const TIER_COLOR = ["", "#3E8463", "#C5A570", "#A62235"] as const;

export const MENTAL_PRESSURE = [
  "No talking allowed",
  "Maintain eye contact the entire time",
  "Count out loud",
  "Ask permission before every action",
  "You cannot react physically",
  "Move only when instructed",
  "Do not close your eyes",
] as const;
