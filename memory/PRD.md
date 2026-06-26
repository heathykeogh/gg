# Tension — Product Requirements & Build Log

## Original Problem Statement
A premium, cinematic two-player intimate card game. Modular decks combine into a continuous, escalating "scene" with stacking + momentum carry-over and no hard resets. Full customization (decks/cards/presets), player profiles + stats, local leaderboard, customizable scoring, timed scene rounds, pre-drawing, save/resume, Momentum & Free Flow modes. Dark cinematic UI, card flip animations, haptics, ambient + interaction audio. Tasteful/suggestive, not explicit.

## User Choices
- Scope priority: Full game flow (decks, draw, scene-building, momentum) + customization.
- Imagery: built-in curated abstract/silhouette art (no AI).
- Storage: fully local & offline, no login, no backend.
- Audio: include subtle ambient + interaction sounds.
- Seed tasteful suggestive starter content across all deck types.

## Architecture
- Expo Router (file-based). Tabs: Play / Decks / Players / Settings. Stack routes: game/setup, game/play, game/summary, deck/[id].
- State: React Context (`src/store/GameContext.tsx`) persisted on-device via `@/src/utils/storage` (AsyncStorage). No backend used.
- Game logic: `src/game/engine.ts` (weighted/random draw, tier scoring, momentum carry).
- Audio: `src/audio/sound.ts` (expo-audio, generated WAV SFX + ambient loop). Haptics: `src/utils/haptics.ts` (expo-haptics).
- Theme: `src/theme/theme.ts` — "Luxe DARK" palette, Cormorant Garamond (display) + Manrope (body), per-deck visual identities.
- Animations: react-native-reanimated (3D card flip-in, staggered reveal, pulse). Keyboard: react-native-keyboard-controller.

## User Personas
- Couples seeking a guided, escalating, customizable intimate game.
- Power users who want to author their own decks/cards/presets and scoring.

## Core Requirements (static)
- 7 deck types each with distinct visual identity; CRUD decks & cards; custom presets.
- Continuous scene draws with stacking + momentum carry-over (no reset).
- Player profiles + stats, local leaderboard, customizable scoring & win conditions.
- Timed rounds, pre-draw/peek, save/resume, Momentum & Free Flow modes.

## Implemented (2026-06-26)
- Home: cinematic hero, stats, Start a Scene, quick links, resume-session card.
- Decks: list of 7 seeded decks (~110 cards), create deck (name+type), deck detail with tier filter chips, card CRUD (text/tier/tags), delete deck.
- Players: add profiles (name+color), leaderboard (points/wins), profile detail with stats + delete.
- Setup: choose preset, assign players to slots, toggle Momentum/Free Flow/Weighted draw, max intensity, round duration & win condition (score/rounds/time) with steppers.
- Play (core): auto-draws scenes as stacked flip cards (per-deck colors), HUD timer countdown + momentum + dual scores, Lock Scene (awards tier×momentum points, switches lead, continuous next draw), Break Flow (penalty + momentum reset), Peek Next (pre-draw preview), Save & Exit.
- Win → Summary (winner, score breakdown, Play Again / Home). Stats persist to profiles + leaderboard.
- Settings: sound / ambient / haptics toggles, reset-to-defaults.
- Verified end-to-end on web preview; fixed a hooks-order crash on win.

## Backlog
- P1: Save edited config as a new named preset from Setup; preset delete UI; per-card optional imagery picker.
- P1: Custom scoring editor (points/bonus/penalty/multipliers) in Setup.
- P2: Session history log; tag-based filtering across decks; richer Skia-based card textures; iOS NativeTabs.
- P2: Onboarding/guided first-run tour & tooltips.

## Next Tasks
- Add "Save as preset" + preset management.
- Custom scoring editor UI.
- Optional onboarding flow.

## Notes
- Audio/haptics are no-ops on web preview; validate on a device/build.
- No mocked APIs. No authentication.
