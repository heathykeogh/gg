import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { storage } from "@/src/utils/storage";
import { buildSeedDecks, buildSeedPresets } from "@/src/data/seed";
import {
  AppSettings,
  Card,
  Deck,
  DeckType,
  Player,
  Preset,
  Session,
} from "@/src/types";
import { setHapticsEnabled } from "@/src/utils/haptics";
import { sound } from "@/src/audio/sound";

const KEYS = {
  decks: "tension.decks.v2",
  presets: "tension.presets.v2",
  players: "tension.players.v1",
  settings: "tension.settings.v1",
  session: "tension.session.v1",
};

const uid = (p: string) =>
  `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const DEFAULT_SETTINGS: AppSettings = { sound: true, ambient: true, haptics: true };

interface Ctx {
  loaded: boolean;
  decks: Deck[];
  presets: Preset[];
  players: Player[];
  settings: AppSettings;
  session: Session | null;
  // decks
  addDeck: (name: string, type: DeckType) => void;
  updateDeck: (id: string, patch: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  addCard: (deckId: string, card: Omit<Card, "id">) => void;
  updateCard: (deckId: string, cardId: string, patch: Partial<Card>) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  // presets
  savePreset: (preset: Preset) => void;
  deletePreset: (id: string) => void;
  // players
  addPlayer: (name: string, color: string) => void;
  updatePlayer: (id: string, patch: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  // settings
  updateSettings: (patch: Partial<AppSettings>) => void;
  // session
  setSession: (s: Session | null) => void;
  finalizeSession: (
    winnerId: string | null,
    scores: Record<string, number>,
    streaks: Record<string, number>,
    scenes: Record<string, number>,
  ) => void;
}

const GameContext = createContext<Ctx | null>(null);

export const useGame = () => {
  const c = useContext(GameContext);
  if (!c) throw new Error("useGame must be used within GameProvider");
  return c;
};

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [loaded, setLoaded] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [session, setSessionState] = useState<Session | null>(null);

  useEffect(() => {
    (async () => {
      sound.init();
      const storedDecks = await storage.getItem<string>(KEYS.decks, "");
      const storedPresets = await storage.getItem<string>(KEYS.presets, "");
      const storedPlayers = await storage.getItem<string>(KEYS.players, "");
      const storedSettings = await storage.getItem<string>(KEYS.settings, "");
      const storedSession = await storage.getItem<string>(KEYS.session, "");

      let d: Deck[];
      if (storedDecks) {
        d = JSON.parse(storedDecks);
      } else {
        d = buildSeedDecks();
        storage.setItem(KEYS.decks, JSON.stringify(d));
      }
      let p: Preset[];
      if (storedPresets) {
        p = JSON.parse(storedPresets);
      } else {
        p = buildSeedPresets();
        storage.setItem(KEYS.presets, JSON.stringify(p));
      }
      const pl: Player[] = storedPlayers ? JSON.parse(storedPlayers) : [];
      const st: AppSettings = storedSettings
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) }
        : DEFAULT_SETTINGS;

      setDecks(d);
      setPresets(p);
      setPlayers(pl);
      setSettings(st);
      setHapticsEnabled(st.haptics);
      sound.setSound(st.sound);
      sound.setAmbient(st.ambient);
      if (storedSession) {
        try {
          setSessionState(JSON.parse(storedSession));
        } catch {}
      }
      setLoaded(true);
    })();
  }, []);

  const persistDecks = useCallback((d: Deck[]) => {
    setDecks(d);
    storage.setItem(KEYS.decks, JSON.stringify(d));
  }, []);
  const persistPresets = useCallback((p: Preset[]) => {
    setPresets(p);
    storage.setItem(KEYS.presets, JSON.stringify(p));
  }, []);
  const persistPlayers = useCallback((p: Player[]) => {
    setPlayers(p);
    storage.setItem(KEYS.players, JSON.stringify(p));
  }, []);

  const addDeck = useCallback(
    (name: string, type: DeckType) => {
      persistDecks([...decks, { id: uid("deck"), name, type, cards: [] }]);
    },
    [decks, persistDecks],
  );
  const updateDeck = useCallback(
    (id: string, patch: Partial<Deck>) => {
      persistDecks(decks.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    },
    [decks, persistDecks],
  );
  const deleteDeck = useCallback(
    (id: string) => {
      persistDecks(decks.filter((d) => d.id !== id));
    },
    [decks, persistDecks],
  );
  const addCard = useCallback(
    (deckId: string, card: Omit<Card, "id">) => {
      persistDecks(
        decks.map((d) =>
          d.id === deckId
            ? { ...d, cards: [...d.cards, { ...card, id: uid("card") }] }
            : d,
        ),
      );
    },
    [decks, persistDecks],
  );
  const updateCard = useCallback(
    (deckId: string, cardId: string, patch: Partial<Card>) => {
      persistDecks(
        decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                cards: d.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
              }
            : d,
        ),
      );
    },
    [decks, persistDecks],
  );
  const deleteCard = useCallback(
    (deckId: string, cardId: string) => {
      persistDecks(
        decks.map((d) =>
          d.id === deckId
            ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) }
            : d,
        ),
      );
    },
    [decks, persistDecks],
  );

  const savePreset = useCallback(
    (preset: Preset) => {
      const exists = presets.some((p) => p.id === preset.id);
      persistPresets(
        exists ? presets.map((p) => (p.id === preset.id ? preset : p)) : [...presets, preset],
      );
    },
    [presets, persistPresets],
  );
  const deletePreset = useCallback(
    (id: string) => {
      persistPresets(presets.filter((p) => p.id !== id));
    },
    [presets, persistPresets],
  );

  const addPlayer = useCallback(
    (name: string, color: string) => {
      persistPlayers([
        ...players,
        {
          id: uid("player"),
          name,
          color,
          stats: { wins: 0, points: 0, bestStreak: 0, gamesPlayed: 0, scenesPlayed: 0 },
        },
      ]);
    },
    [players, persistPlayers],
  );
  const updatePlayer = useCallback(
    (id: string, patch: Partial<Player>) => {
      persistPlayers(players.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    },
    [players, persistPlayers],
  );
  const deletePlayer = useCallback(
    (id: string) => {
      persistPlayers(players.filter((p) => p.id !== id));
    },
    [players, persistPlayers],
  );

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      storage.setItem(KEYS.settings, JSON.stringify(next));
      setHapticsEnabled(next.haptics);
      sound.setSound(next.sound);
      sound.setAmbient(next.ambient);
    },
    [settings],
  );

  const setSession = useCallback((s: Session | null) => {
    setSessionState(s);
    if (s) storage.setItem(KEYS.session, JSON.stringify(s));
    else storage.removeItem(KEYS.session);
  }, []);

  const finalizeSession = useCallback(
    (
      winnerId: string | null,
      scores: Record<string, number>,
      streaks: Record<string, number>,
      scenes: Record<string, number>,
    ) => {
      const updated = players.map((p) => {
        if (!(p.id in scores)) return p;
        return {
          ...p,
          stats: {
            wins: p.stats.wins + (p.id === winnerId ? 1 : 0),
            points: p.stats.points + (scores[p.id] || 0),
            bestStreak: Math.max(p.stats.bestStreak, streaks[p.id] || 0),
            gamesPlayed: p.stats.gamesPlayed + 1,
            scenesPlayed: p.stats.scenesPlayed + (scenes[p.id] || 0),
          },
        };
      });
      persistPlayers(updated);
      setSession(null);
    },
    [players, persistPlayers, setSession],
  );

  const value = useMemo<Ctx>(
    () => ({
      loaded,
      decks,
      presets,
      players,
      settings,
      session,
      addDeck,
      updateDeck,
      deleteDeck,
      addCard,
      updateCard,
      deleteCard,
      savePreset,
      deletePreset,
      addPlayer,
      updatePlayer,
      deletePlayer,
      updateSettings,
      setSession,
      finalizeSession,
    }),
    [
      loaded,
      decks,
      presets,
      players,
      settings,
      session,
      addDeck,
      updateDeck,
      deleteDeck,
      addCard,
      updateCard,
      deleteCard,
      savePreset,
      deletePreset,
      addPlayer,
      updatePlayer,
      deletePlayer,
      updateSettings,
      setSession,
      finalizeSession,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export { uid };
