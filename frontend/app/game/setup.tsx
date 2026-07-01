import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GradientButton from "@/src/components/GradientButton";
import Header from "@/src/components/Header";
import ScreenBackground from "@/src/components/ScreenBackground";
import { useGame } from "@/src/store/GameContext";
import { Preset, Session, Tier, WinType } from "@/src/types";
import { colors, DECK_THEME, fonts, fontSize, radius, spacing } from "@/src/theme/theme";
import { haptic } from "@/src/utils/haptics";

const uid = (p: string) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

const WIN_TYPES: { type: WinType; label: string; unit: string }[] = [
  { type: "score", label: "Score", unit: "pts" },
  { type: "rounds", label: "Rounds", unit: "rds" },
  { type: "time", label: "Time", unit: "min" },
];

export default function Setup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { presets, players, setSession, decks, updateDeck } = useGame();

  const [presetId, setPresetId] = useState(presets[0]?.id ?? "");
  const base = presets.find((p) => p.id === presetId) ?? presets[0];

  const [cfg, setCfg] = useState<Preset>(base);
  const [slots, setSlots] = useState<[string | null, string | null]>([
    players[0]?.id ?? null,
    players[1]?.id ?? null,
  ]);

  const selectPreset = (p: Preset) => {
    haptic.select();
    setPresetId(p.id);
    setCfg(p);
  };

  const assignSlot = (slot: 0 | 1, pid: string) => {
    haptic.select();
    setSlots((prev) => {
      const next: [string | null, string | null] = [...prev];
      // avoid duplicate selection across slots
      const other = slot === 0 ? 1 : 0;
      if (next[other] === pid) next[other] = null;
      next[slot] = next[slot] === pid ? null : pid;
      return next;
    });
  };

  const nameFor = (pid: string | null, fallback: string) =>
    players.find((p) => p.id === pid)?.name ?? fallback;

  const start = () => {
    const p1Id = slots[0] ?? "guest_1";
    const p2Id = slots[1] ?? "guest_2";
    const ids = [p1Id, p2Id];
    const names = [nameFor(slots[0], "Player One"), nameFor(slots[1], "Player Two")];
    const session: Session = {
      id: uid("session"),
      presetId: cfg.id,
      preset: cfg,
      playerIds: ids,
      playerNames: names,
      scores: { [p1Id]: 0, [p2Id]: 0 },
      streaks: { [p1Id]: 0, [p2Id]: 0 },
      round: 1,
      momentum: 0,
      activeIndex: 0,
      carryOver: [],
      currentScene: [],
      nextScene: [],
      startedAt: Date.now(),
      elapsed: 0,
      status: "active",
    };
    setSession(session);
    haptic.success();
    router.replace("/game/play");
  };

  const duration = useMemo(() => Math.round(cfg.roundDuration / 60), [cfg.roundDuration]);

  const turnDecks = useMemo(
    () => decks.filter((d) => cfg.deckTypes.includes(d.type)),
    [decks, cfg.deckTypes],
  );

  return (
    <ScreenBackground>
      <Header title="New Scene" subtitle="Tune the ritual, then begin" back />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Preset */}
        <Text style={styles.label}>PRESET</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
          {presets.map((p) => {
            const active = p.id === presetId;
            return (
              <Pressable
                key={p.id}
                testID={`preset-${p.id}`}
                onPress={() => selectPreset(p)}
                style={[styles.preset, active && styles.presetActive]}
              >
                <Text style={[styles.presetName, active && { color: colors.onSurface }]}>{p.name}</Text>
                <Text style={styles.presetMeta}>{p.deckTypes.length} decks</Text>
                <View style={styles.presetTags}>
                  {p.deckTypes.slice(0, 4).map((t) => (
                    <View key={t} style={[styles.dot, { backgroundColor: DECK_THEME[t].accent }]} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Players */}
        <Text style={[styles.label, { marginTop: spacing.xl }]}>PLAYERS</Text>
        <View style={styles.slotRow}>
          {[0, 1].map((i) => (
            <View key={i} style={styles.slot}>
              <Text style={styles.slotTitle}>{i === 0 ? "Player One" : "Player Two"}</Text>
              <Text style={styles.slotName} numberOfLines={1}>
                {nameFor(slots[i], i === 0 ? "Guest" : "Guest")}
              </Text>
            </View>
          ))}
        </View>
        {players.length > 0 ? (
          <>
            <Text style={styles.helper}>Tap to assign saved players to slots</Text>
            {([0, 1] as const).map((slot) => (
              <View key={slot} style={styles.pickRow}>
                <Text style={styles.pickLabel}>{slot === 0 ? "P1" : "P2"}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickChips}>
                  {players.map((p) => {
                    const active = slots[slot] === p.id;
                    return (
                      <Pressable
                        key={p.id}
                        testID={`assign-${slot}-${p.id}`}
                        onPress={() => assignSlot(slot, p.id)}
                        style={[styles.pchip, active && { borderColor: p.color, backgroundColor: `${p.color}33` }]}
                      >
                        <View style={[styles.pdot, { backgroundColor: p.color }]} />
                        <Text style={[styles.pchipText, active && { color: colors.onSurface }]}>{p.name}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.helper}>No saved players — you'll play as Guests. Add profiles in the Players tab to track stats.</Text>
        )}

        {/* Config */}
        <Text style={[styles.label, { marginTop: spacing.xl }]}>RULES</Text>
        <View style={styles.group}>
          <ToggleLine
            testID="cfg-momentum"
            label="Momentum mode"
            sub="Intense & momentum cards carry forward"
            value={cfg.momentumMode}
            onChange={(v) => setCfg({ ...cfg, momentumMode: v })}
          />
          <Divider />
          <ToggleLine
            testID="cfg-freeflow"
            label="Free flow"
            sub="Relax intensity limits & penalties"
            value={cfg.freeFlow}
            onChange={(v) => setCfg({ ...cfg, freeFlow: v })}
          />
          <Divider />
          <ToggleLine
            testID="cfg-weighted"
            label="Weighted draw"
            sub="Favor higher intensity over time"
            value={cfg.weightedDraw}
            onChange={(v) => setCfg({ ...cfg, weightedDraw: v })}
          />
          <Divider />
          <ToggleLine
            testID="cfg-mentalpressure"
            label="Mental pressure"
            sub="Stack random rules: silence, eye contact, permission"
            value={!!cfg.mentalPressure}
            onChange={(v) => setCfg({ ...cfg, mentalPressure: v })}
          />
          <Divider />
          <ToggleLine
            testID="cfg-powerreversals"
            label="Power reversals"
            sub="Control can suddenly flip mid-flow"
            value={!!cfg.powerReversals}
            onChange={(v) => setCfg({ ...cfg, powerReversals: v })}
          />
        </View>

        <View style={[styles.group, { marginTop: spacing.md }]}>
          <View style={styles.cfgLine}>
            <Text style={styles.cfgLabel}>Max intensity</Text>
            <View style={styles.segment}>
              {([1, 2, 3] as Tier[]).map((t) => (
                <Pressable
                  key={t}
                  testID={`cfg-intensity-${t}`}
                  onPress={() => {
                    haptic.select();
                    setCfg({ ...cfg, intensityMax: t });
                  }}
                  style={[styles.segBtn, cfg.intensityMax === t && styles.segActive]}
                >
                  <Text style={[styles.segText, cfg.intensityMax === t && { color: colors.onSurface }]}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Divider />
          <Stepper
            testID="cfg-duration"
            label="Round duration"
            value={`${duration} min`}
            onMinus={() => setCfg({ ...cfg, roundDuration: Math.max(60, cfg.roundDuration - 60) })}
            onPlus={() => setCfg({ ...cfg, roundDuration: Math.min(900, cfg.roundDuration + 60) })}
          />
        </View>

        <View style={[styles.group, { marginTop: spacing.md }]}>
          <View style={styles.cfgLine}>
            <Text style={styles.cfgLabel}>Win condition</Text>
            <View style={styles.segment}>
              {WIN_TYPES.map((w) => (
                <Pressable
                  key={w.type}
                  testID={`cfg-win-${w.type}`}
                  onPress={() => {
                    haptic.select();
                    const value = w.type === "score" ? 100 : w.type === "rounds" ? 12 : 20;
                    setCfg({ ...cfg, win: { type: w.type, value } });
                  }}
                  style={[styles.segBtn, cfg.win.type === w.type && styles.segActive]}
                >
                  <Text style={[styles.segText, cfg.win.type === w.type && { color: colors.onSurface }]}>{w.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Divider />
          <Stepper
            testID="cfg-winvalue"
            label="Target"
            value={`${cfg.win.value} ${WIN_TYPES.find((w) => w.type === cfg.win.type)?.unit}`}
            onMinus={() => setCfg({ ...cfg, win: { ...cfg.win, value: Math.max(1, cfg.win.value - (cfg.win.type === "score" ? 10 : 1)) } })}
            onPlus={() => setCfg({ ...cfg, win: { ...cfg.win, value: cfg.win.value + (cfg.win.type === "score" ? 10 : 1) } })}
          />
        </View>

        <Text style={[styles.label, { marginTop: spacing.xl }]}>CARDS PER TURN</Text>
        <Text style={[styles.helper, { marginTop: 0, marginBottom: spacing.md }]}>
          How many cards each deck draws every turn. Set to 0 to skip a deck.
        </Text>
        <View style={styles.group}>
          {turnDecks.length === 0 ? (
            <Text style={[styles.cfgSub, { paddingVertical: spacing.lg }]}>No decks for this preset.</Text>
          ) : (
            turnDecks.map((d, idx) => {
              const cpt = d.cardsPerTurn ?? 1;
              return (
                <View key={d.id}>
                  {idx > 0 && <Divider />}
                  <View style={styles.cfgLine}>
                    <View style={[styles.cptIcon, { backgroundColor: `${DECK_THEME[d.type].accent}22` }]}>
                      <Ionicons name={DECK_THEME[d.type].icon as any} size={15} color={DECK_THEME[d.type].accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cfgLabel}>{d.name}</Text>
                      <Text style={styles.cfgSub}>
                        {cpt === 0 ? "Skipped this turn" : `${cpt} card${cpt > 1 ? "s" : ""} per turn`}
                      </Text>
                    </View>
                    <View style={styles.stepper}>
                      <Pressable
                        testID={`cpt-${d.id}-minus`}
                        onPress={() => {
                          haptic.light();
                          updateDeck(d.id, { cardsPerTurn: Math.max(0, cpt - 1) });
                        }}
                        style={styles.stepBtn}
                      >
                        <Ionicons name="remove" size={18} color={colors.onSurface} />
                      </Pressable>
                      <Text testID={`cpt-${d.id}-value`} style={styles.stepValue}>{cpt}</Text>
                      <Pressable
                        testID={`cpt-${d.id}-plus`}
                        onPress={() => {
                          haptic.light();
                          updateDeck(d.id, { cardsPerTurn: Math.min(4, cpt + 1) });
                        }}
                        style={styles.stepBtn}
                      >
                        <Ionicons name="add" size={18} color={colors.onSurface} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <GradientButton testID="begin-scene-button" label="Begin Scene" icon="flame" onPress={start} />
      </View>
    </ScreenBackground>
  );
}

function ToggleLine({
  label,
  sub,
  value,
  onChange,
  testID,
}: {
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
  testID: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        haptic.light();
        onChange(!value);
      }}
      style={styles.cfgLine}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cfgLabel}>{label}</Text>
        <Text style={styles.cfgSub}>{sub}</Text>
      </View>
      <View style={[styles.check, value && styles.checkOn]}>
        {value && <Ionicons name="checkmark" size={16} color={colors.onBrandPrimary} />}
      </View>
    </Pressable>
  );
}

function Stepper({
  label,
  value,
  onMinus,
  onPlus,
  testID,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  testID: string;
}) {
  return (
    <View style={styles.cfgLine}>
      <Text style={styles.cfgLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          testID={`${testID}-minus`}
          onPress={() => {
            haptic.light();
            onMinus();
          }}
          style={styles.stepBtn}
        >
          <Ionicons name="remove" size={18} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable
          testID={`${testID}-plus`}
          onPress={() => {
            haptic.light();
            onPlus();
          }}
          style={styles.stepBtn}
        >
          <Ionicons name="add" size={18} color={colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  label: { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, letterSpacing: 2, color: colors.onSurfaceTertiary, marginBottom: spacing.md },
  presetRow: { gap: spacing.md, paddingRight: spacing.lg },
  preset: {
    width: 150,
    flexShrink: 0,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  presetActive: { borderColor: colors.brandPrimary, backgroundColor: `${colors.brandPrimary}1A` },
  presetName: { fontFamily: fonts.displaySemi, fontSize: fontSize.xl, color: colors.onSurfaceSecondary },
  presetMeta: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: 2 },
  presetTags: { flexDirection: "row", gap: 5, marginTop: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4 },
  slotRow: { flexDirection: "row", gap: spacing.md },
  slot: { flex: 1, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg },
  slotTitle: { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, letterSpacing: 1, color: colors.brandSecondary, textTransform: "uppercase" },
  slotName: { fontFamily: fonts.displaySemi, fontSize: fontSize.xl, color: colors.onSurface, marginTop: 4 },
  helper: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, marginTop: spacing.md, lineHeight: 19 },
  pickRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.md },
  pickLabel: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, width: 24 },
  pickChips: { gap: spacing.sm, paddingRight: spacing.lg },
  pchip: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  pdot: { width: 10, height: 10, borderRadius: 5 },
  pchipText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.onSurfaceTertiary },
  group: { backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.lg },
  cfgLine: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, gap: spacing.md },
  cfgLabel: { flex: 0, fontFamily: fonts.bodySemi, fontSize: fontSize.lg, color: colors.onSurface },
  cfgSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.divider },
  check: { marginLeft: "auto", width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  segment: { flexDirection: "row", marginLeft: "auto", backgroundColor: colors.surface, borderRadius: radius.md, padding: 3, gap: 3 },
  segBtn: { paddingHorizontal: spacing.md, height: 34, minWidth: 40, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  segActive: { backgroundColor: colors.brandPrimary },
  segText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.base, color: colors.muted },
  stepper: { flexDirection: "row", alignItems: "center", marginLeft: "auto", gap: spacing.md },
  stepBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  stepValue: { fontFamily: fonts.bodySemi, fontSize: fontSize.base, color: colors.onSurface, minWidth: 64, textAlign: "center" },
  cptIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
