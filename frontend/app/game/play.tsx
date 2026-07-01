import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GlassCard from "@/src/components/GlassCard";
import SceneCard from "@/src/components/SceneCard";
import { sound } from "@/src/audio/sound";
import {
  drawScene,
  extractCarry,
  sceneMaxTier,
  sceneScore,
  rollModifiers,
  computeRestricted,
  powerFlipRoll,
  sceneCommitment,
} from "@/src/game/engine";
import { useGame } from "@/src/store/GameContext";
import { SceneCard as SceneCardType, Session } from "@/src/types";
import { colors, DECK_THEME, fonts, fontSize, radius, spacing, TIER_LABEL } from "@/src/theme/theme";
import { haptic } from "@/src/utils/haptics";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function Play() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, decks, settings, setSession, finalizeSession } = useGame();

  // local mutable game state seeded from session
  const [scene, setScene] = useState<SceneCardType[]>(session?.currentScene ?? []);
  const [next, setNext] = useState<SceneCardType[]>(session?.nextScene ?? []);
  const [round, setRound] = useState(session?.round ?? 1);
  const [momentum, setMomentum] = useState(session?.momentum ?? 0);
  const [activeIndex, setActiveIndex] = useState(session?.activeIndex ?? 0);
  const [scores, setScores] = useState<Record<string, number>>(session?.scores ?? {});
  const [streaks, setStreaks] = useState<Record<string, number>>(session?.streaks ?? {});
  const [elapsed, setElapsed] = useState(session?.elapsed ?? 0);
  const [timeLeft, setTimeLeft] = useState(session?.preset.roundDuration ?? 180);
  const [timeUp, setTimeUp] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [peek, setPeek] = useState(false);
  const [exitAsk, setExitAsk] = useState(false);
  const [modifiers, setModifiers] = useState<string[]>(session?.sceneMods ?? []);
  const [flipShown, setFlipShown] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const lastScore = useRef(0);
  const lockingRef = useRef(false);

  const preset = session?.preset;
  const pulse = useSharedValue(1);

  const gen = useCallback(
    (carry: SceneCardType[]) => (preset ? drawScene(decks, preset, carry) : []),
    [decks, preset],
  );

  // initial draw on first mount of a fresh session
  useEffect(() => {
    if (!session) return;
    if (settings.ambient) sound.startAmbient();
    if (scene.length === 0) {
      const first = gen([]);
      const upcoming = gen([]);
      setScene(first);
      setNext(upcoming);
      setModifiers(rollModifiers(preset!, 0));
      setTimeLeft(preset!.roundDuration);
      setRevealKey((k) => k + 1);
      sound.play("draw");
      haptic.light();
    }
    return () => sound.stopAmbient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // countdown timer
  useEffect(() => {
    if (!preset) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          return 0;
        }
        if (t <= 6) {
          sound.play("tick");
          haptic.select();
        }
        return t - 1;
      });
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [preset]);

  useEffect(() => {
    if (timeLeft === 0 && !timeUp) {
      setTimeUp(true);
      sound.play("lock");
      haptic.warning();
    }
  }, [timeLeft, timeUp]);

  // time-based win
  useEffect(() => {
    if (preset?.win.type === "time" && elapsed >= preset.win.value * 60) {
      endGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  // pulse the lock button when time runs out
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  useEffect(() => {
    if (timeUp) {
      pulse.value = withRepeat(withTiming(1.04, { duration: 600 }), -1, true);
    } else {
      pulse.value = withTiming(1);
    }
  }, [timeUp, pulse]);

  const persist = useCallback(
    (patch: Partial<Session>) => {
      if (!session) return;
      setSession({
        ...session,
        currentScene: scene,
        nextScene: next,
        round,
        momentum,
        activeIndex,
        scores,
        streaks,
        elapsed,
        sceneMods: modifiers,
        ...patch,
      });
    },
    [session, scene, next, round, momentum, activeIndex, scores, streaks, elapsed, modifiers, setSession],
  );

  const cardHeightFor = (c: SceneCardType) => {
    let h = 150;
    if (c.partnerInstruction) h += 50;
    if (c.intensifier) h += 26;
    if (c.chain?.length) h += c.chain.length * 20 + 14;
    return h;
  };

  if (!session || !preset) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>No active session</Text>
        <Pressable testID="go-home" onPress={() => router.replace("/(tabs)")} style={styles.fallbackBtn}>
          <Text style={styles.fallbackBtnText}>Back to home</Text>
        </Pressable>
      </View>
    );
  }

  const activeId = session.playerIds[activeIndex];
  const activeName = session.playerNames[activeIndex];

  const triggerFlip = () => {
    setFlipShown(true);
    haptic.heavy();
    setTimeout(() => setFlipShown(false), 1600);
  };

  const advance = (carry: SceneCardType[], mom: number) => {
    const upcoming = next.length ? next : gen([]);
    const newScene = [...carry, ...upcoming];
    const newNext = gen([]);
    const mods = rollModifiers(preset, mom);
    setScene(newScene);
    setNext(newNext);
    setModifiers(mods);
    setTimeLeft(preset.roundDuration);
    setTimeUp(false);
    setRevealKey((k) => k + 1);
    sound.play("draw");
    haptic.light();
    return { scene: newScene, next: newNext, mods };
  };

  const checkWin = (newScores: Record<string, number>, newRound: number): boolean => {
    if (preset.win.type === "score") {
      return Object.values(newScores).some((v) => v >= preset.win.value);
    }
    if (preset.win.type === "rounds") {
      return newRound > preset.win.value;
    }
    return false;
  };

  const winnerId = (s: Record<string, number>) =>
    Object.entries(s).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const endGame = () => {
    sound.stopAmbient();
    haptic.success();
    const scenesCount: Record<string, number> = {};
    session.playerIds.forEach((id) => {
      scenesCount[id] = Math.ceil(round / 2);
    });
    const wId = winnerId(scores);
    finalizeSession(wId, scores, streaks, scenesCount);
    router.replace({
      pathname: "/game/summary",
      params: {
        names: session.playerNames.join("|"),
        ids: session.playerIds.join("|"),
        scores: session.playerIds.map((id) => scores[id] || 0).join("|"),
        winner: wId ?? "",
        rounds: String(round),
      },
    });
  };

  const lockScene = () => {
    if (lockingRef.current || scene.length === 0 || !canLock) return;
    lockingRef.current = true;
    sound.play("lock");
    haptic.heavy();
    const gained = sceneScore(scene, preset, momentum, modifiers, computeRestricted(scene, modifiers).active);
    lastScore.current = gained;
    const newScores = { ...scores, [activeId]: (scores[activeId] || 0) + gained };
    const newStreaks = { ...streaks, [activeId]: (streaks[activeId] || 0) + 1 };
    const newMomentum = momentum + 1;
    const newRound = round + 1;
    setScores(newScores);
    setStreaks(newStreaks);
    setMomentum(newMomentum);

    if (checkWin(newScores, newRound)) {
      setSession({ ...session, scores: newScores, streaks: newStreaks, round, status: "done" });
      // use latest scores for summary
      const scenesCount: Record<string, number> = {};
      session.playerIds.forEach((id) => (scenesCount[id] = Math.ceil(newRound / 2)));
      const wId = winnerId(newScores);
      sound.stopAmbient();
      haptic.success();
      finalizeSession(wId, newScores, newStreaks, scenesCount);
      router.replace({
        pathname: "/game/summary",
        params: {
          names: session.playerNames.join("|"),
          ids: session.playerIds.join("|"),
          scores: session.playerIds.map((id) => newScores[id] || 0).join("|"),
          winner: wId ?? "",
          rounds: String(newRound - 1),
        },
      });
      return;
    }

    const carry = extractCarry(scene, preset);
    const flip = powerFlipRoll(preset, newMomentum);
    const nextActive = flip ? activeIndex : (activeIndex + 1) % session.playerIds.length;
    if (flip) triggerFlip();
    setActiveIndex(nextActive);
    setRound(newRound);
    const res = advance(carry, newMomentum);
    setTimeout(() => {
      setSession({
        ...session,
        currentScene: res.scene,
        nextScene: res.next,
        sceneMods: res.mods,
        round: newRound,
        momentum: newMomentum,
        activeIndex: nextActive,
        scores: newScores,
        streaks: newStreaks,
        elapsed,
      });
      lockingRef.current = false;
    }, 0);
  };

  const breakFlow = () => {
    haptic.warning();
    sound.play("tap");
    const penalty = preset.scoring.breakPenalty;
    const newScores = { ...scores, [activeId]: Math.max(0, (scores[activeId] || 0) - penalty) };
    const newStreaks = { ...streaks, [activeId]: 0 };
    setScores(newScores);
    setStreaks(newStreaks);
    setMomentum(0);
    const newRound = round + 1;
    const nextActive = (activeIndex + 1) % session.playerIds.length;
    setActiveIndex(nextActive);
    setRound(newRound);
    const res = advance([], 0);
    persist({
      scores: newScores,
      streaks: newStreaks,
      momentum: 0,
      round: newRound,
      activeIndex: nextActive,
      sceneMods: res.mods,
      currentScene: res.scene,
      nextScene: res.next,
    });
  };

  const exit = () => {
    persist({});
    sound.stopAmbient();
    router.replace("/(tabs)");
  };

  const maxTier = scene.length ? sceneMaxTier(scene) : 1;
  const restricted = scene.length
    ? computeRestricted(scene, modifiers)
    : { active: false, movement: false, speech: false, pace: false };
  const commitment = scene.length ? sceneCommitment(scene, preset) : 0;
  const held = preset.roundDuration - timeLeft;
  const canLock = held >= commitment;
  const projected = scene.length ? sceneScore(scene, preset, momentum, modifiers, restricted.active) : 0;

  return (
    <View style={styles.root}>
      {/* HUD */}
      <View style={{ paddingTop: insets.top + spacing.sm }}>
        <GlassCard style={styles.hud}>
          <View style={styles.hudTop}>
            <Pressable testID="exit-game-button" hitSlop={10} onPress={() => setExitAsk(true)} style={styles.iconBtn}>
              <Ionicons name="close" size={20} color={colors.onSurface} />
            </Pressable>
            <View style={styles.timerWrap}>
              <Ionicons name="time-outline" size={16} color={timeUp ? colors.brandPrimary : colors.brandSecondary} />
              <Text style={[styles.timer, timeUp && { color: colors.brandPrimary }]}>{fmt(timeLeft)}</Text>
            </View>
            <View style={styles.hudRight}>
              <Pressable
                testID="help-button"
                hitSlop={10}
                onPress={() => {
                  haptic.light();
                  setHelpOpen(true);
                }}
                style={styles.infoBtn}
              >
                <Ionicons name="help" size={16} color={colors.onSurface} />
              </Pressable>
              <View style={styles.momentum}>
                <Ionicons name="trending-up" size={14} color={colors.brandSecondary} />
                <Text style={styles.momentumText}>x{momentum}</Text>
              </View>
            </View>
          </View>
          <View style={styles.scoreRow}>
            {session.playerIds.map((id, i) => (
              <View
                key={id}
                testID={`score-${i}`}
                style={[styles.scoreChip, activeIndex === i && styles.scoreActive]}
              >
                <Text style={[styles.scoreName, activeIndex === i && { color: colors.onSurface }]} numberOfLines={1}>
                  {session.playerNames[i]}
                </Text>
                <Text style={[styles.scoreValue, activeIndex === i && { color: colors.brandSecondary }]}>
                  {scores[id] || 0}
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>
      </View>

      {/* scene meta */}
      <View style={styles.meta}>
        <Text style={styles.roundText}>
          ROUND {round} · {activeName} LEADS
        </Text>
        <Text style={styles.sceneIntensity}>
          Scene intensity · <Text style={{ color: DECK_THEME.Action.accent }}>{TIER_LABEL[maxTier]}</Text>
        </Text>
        {scene.length > 0 && (
          <View style={styles.coach}>
            <Ionicons name={canLock ? "arrow-forward-circle" : "time"} size={14} color={colors.brandSecondary} />
            <Text style={styles.coachText}>
              {!canLock
                ? `Stay in the scene — Lock unlocks in ${Math.max(0, commitment - held)}s`
                : "Read the top card & follow it together. Tap Lock to score and flow on."}
            </Text>
          </View>
        )}
      </View>

      {scene.length > 0 && (restricted.active || modifiers.length > 0) && (
        <View style={styles.banners}>
          {restricted.active && (
            <View style={styles.restrictedPill} testID="restricted-banner">
              <Ionicons name="lock-closed" size={12} color={colors.brandPrimary} />
              <Text style={styles.restrictedText}>RESTRICTED</Text>
              <Text style={styles.restrictedSub}>
                {[
                  restricted.movement && "movement",
                  restricted.speech && "speech",
                  restricted.pace && "pace",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
          )}
          {modifiers.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modRow}
            >
              {modifiers.map((m) => (
                <View key={m} style={styles.modChip} testID="pressure-chip">
                  <Ionicons name="pulse" size={11} color={colors.brandSecondary} />
                  <Text style={styles.modText}>{m}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* cards */}
      <ScrollView
        contentContainerStyle={styles.cards}
        showsVerticalScrollIndicator={false}
      >
        {scene.length === 0 ? (
          <View style={styles.noCards}>
            <Ionicons name="albums-outline" size={40} color={colors.muted} />
            <Text style={styles.noCardsText}>This preset's decks have no cards. Add cards to play.</Text>
            <Pressable testID="open-decks" onPress={() => router.replace("/(tabs)/decks")} style={styles.fallbackBtn}>
              <Text style={styles.fallbackBtnText}>Manage decks</Text>
            </Pressable>
          </View>
        ) : (
          scene.map((c, i) => (
            <View key={`${c.id}-${i}-${revealKey}`} style={{ marginTop: i === 0 ? 0 : spacing.md }}>
              <SceneCard
                card={c}
                index={i}
                height={cardHeightFor(c)}
                revealKey={`${revealKey}-${i}`}
                onReveal={i === 0 ? () => sound.play("flip") : undefined}
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.secondaryRow}>
          <Pressable testID="break-flow-button" onPress={breakFlow} style={styles.breakBtn}>
            <Ionicons name="hand-left-outline" size={16} color={colors.onSurfaceTertiary} />
            <Text style={styles.breakText}>Break Flow</Text>
          </Pressable>
          <Pressable testID="peek-next-button" onPress={() => { haptic.light(); sound.play("tap"); setPeek(true); }} style={styles.breakBtn}>
            <Ionicons name="eye-outline" size={16} color={colors.onSurfaceTertiary} />
            <Text style={styles.breakText}>Peek Next</Text>
          </Pressable>
        </View>
        <Animated.View style={pulseStyle}>
          <Pressable
            testID="lock-scene-button"
            onPress={lockScene}
            disabled={scene.length === 0 || !canLock}
            style={[styles.lockBtn, (scene.length === 0 || !canLock) && { opacity: 0.5 }]}
          >
            <Ionicons name={canLock ? "flame" : "lock-closed"} size={20} color={colors.onBrandPrimary} />
            <Text style={styles.lockText}>
              {canLock ? "Lock Scene & Continue" : `Hold — ${Math.max(0, commitment - held)}s`}
            </Text>
            <Text style={styles.lockPts}>+{projected}</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* peek modal */}
      <Modal visible={peek} transparent animationType="fade" onRequestClose={() => setPeek(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPeek(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Next Scene</Text>
            <Text style={styles.sheetSub}>Pre-drawn so the flow never breaks.</Text>
            {next.map((c) => {
              const t = DECK_THEME[c.deckType];
              return (
                <View key={c.id} style={styles.peekRow}>
                  <View style={[styles.peekIcon, { backgroundColor: `${t.accent}22` }]}>
                    <Ionicons name={t.icon as any} size={16} color={t.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.peekDeck}>{c.deckName}</Text>
                    <Text style={styles.peekText} numberOfLines={2}>{c.text}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* exit confirm */}
      <Modal visible={exitAsk} transparent animationType="fade" onRequestClose={() => setExitAsk(false)}>
        <View style={[styles.modalRoot, { justifyContent: "center", padding: spacing.xl }]}>
          <Pressable style={styles.backdrop} onPress={() => setExitAsk(false)} />
          <View style={styles.dialog}>
            <Text style={styles.sheetTitle}>Pause this scene?</Text>
            <Text style={styles.sheetSub}>Your progress is saved. Resume any time from the home screen.</Text>
            <Pressable testID="confirm-exit-button" onPress={exit} style={styles.dialogPrimary}>
              <Text style={styles.dialogPrimaryText}>Save & Exit</Text>
            </Pressable>
            <Pressable onPress={() => setExitAsk(false)} style={styles.dialogGhost}>
              <Text style={styles.dialogGhostText}>Keep Playing</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={helpOpen} transparent animationType="fade" onRequestClose={() => setHelpOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setHelpOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>How it works</Text>
            <Text style={styles.sheetSub}>Everything you need mid-scene.</Text>
            <LegendRow icon="trending-up" title="Momentum ×" body="Lock scenes without breaking flow to raise it — higher momentum means bigger bonus points." />
            <LegendRow icon="lock-closed" title="Hold" body="Intense scenes must be held for a few seconds before Lock unlocks. No rushing." />
            <LegendRow icon="shield-half" title="Restricted" body="The scene limits movement, speech or pace. Honour it until you lock." />
            <LegendRow icon="pulse" title="Pressure" body="Extra rules stacked on the scene, like silence or eye contact." />
            <LegendRow icon="hand-left" title="Break Flow" body="Deliberately reset momentum. Costs points but relieves the tension." />
            <LegendRow icon="eye" title="Peek Next" body="Preview the pre-drawn next scene so there's never a pause." />
          </View>
        </View>
      </Modal>

      {flipShown && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(300)}
          style={styles.flipOverlay}
          pointerEvents="none"
        >
          <Ionicons name="swap-horizontal" size={48} color={colors.brandSecondary} />
          <Text style={styles.flipTitle}>POWER FLIP</Text>
          <Text style={styles.flipSub}>The balance of control shifts</Text>
        </Animated.View>
      )}
    </View>
  );
}

function LegendRow({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.legendRow}>
      <View style={styles.legendIcon}>
        <Ionicons name={icon} size={16} color={colors.brandSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.legendTitle}>{title}</Text>
        <Text style={styles.legendBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  hud: { marginHorizontal: spacing.lg, padding: spacing.md },
  hudTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  timerWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  timer: { fontFamily: fonts.bodyBold, fontSize: fontSize.xl, color: colors.onSurface, letterSpacing: 1 },
  momentum: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: `${colors.brandSecondary}1A`, paddingHorizontal: spacing.sm, height: 28, borderRadius: radius.pill },
  momentumText: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.brandSecondary },
  hudRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  infoBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  coach: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  coachText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.onSurfaceSecondary },
  legendRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start", marginBottom: spacing.lg },
  legendIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: `${colors.brandSecondary}1A`, alignItems: "center", justifyContent: "center" },
  legendTitle: { fontFamily: fonts.bodySemi, fontSize: fontSize.base, color: colors.onSurface },
  legendBody: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: 1, lineHeight: 18 },
  scoreRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  scoreChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  scoreActive: { borderColor: colors.brandPrimary, backgroundColor: `${colors.brandPrimary}1A` },
  scoreName: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, flex: 1, marginRight: spacing.sm },
  scoreValue: { fontFamily: fonts.displayBold, fontSize: fontSize.xl, color: colors.onSurfaceTertiary },
  meta: { paddingHorizontal: spacing.xl, marginTop: spacing.lg, marginBottom: spacing.sm },
  roundText: { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, letterSpacing: 2, color: colors.brandSecondary },
  sceneIntensity: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: 2 },
  cards: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  noCards: { alignItems: "center", paddingVertical: spacing.xxxl, gap: spacing.md },
  noCardsText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.onSurfaceTertiary, textAlign: "center", paddingHorizontal: spacing.xl },
  controls: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surfaceSecondary, gap: spacing.md },
  secondaryRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  breakBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  breakText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.onSurfaceTertiary },
  lockBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, height: 60, borderRadius: radius.md, backgroundColor: colors.brandPrimary, shadowColor: colors.brandPrimary, shadowOpacity: 0.55, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  lockText: { fontFamily: fonts.bodySemi, fontSize: fontSize.lg, color: colors.onBrandPrimary },
  lockPts: { fontFamily: fonts.bodyBold, fontSize: fontSize.base, color: colors.onBrandPrimary, opacity: 0.85 },
  fallback: { flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", gap: spacing.lg },
  fallbackText: { fontFamily: fonts.displaySemi, fontSize: fontSize["2xl"], color: colors.onSurface },
  fallbackBtn: { paddingHorizontal: spacing.xl, height: 48, borderRadius: radius.md, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  fallbackBtnText: { fontFamily: fonts.bodySemi, fontSize: fontSize.base, color: colors.onBrandPrimary },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.7)" },
  sheet: { backgroundColor: colors.surfaceSecondary, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  handle: { alignSelf: "center", width: 44, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: spacing.lg },
  sheetTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize["2xl"], color: colors.onSurface },
  sheetSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: 2, marginBottom: spacing.lg },
  peekRow: { flexDirection: "row", gap: spacing.md, alignItems: "center", marginBottom: spacing.md },
  peekIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  peekDeck: { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, letterSpacing: 1, color: colors.brandSecondary, textTransform: "uppercase" },
  peekText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.onSurface, marginTop: 1 },
  dialog: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  dialogPrimary: { height: 52, borderRadius: radius.md, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center" },
  dialogPrimaryText: { fontFamily: fonts.bodySemi, fontSize: fontSize.lg, color: colors.onBrandPrimary },
  dialogGhost: { height: 48, alignItems: "center", justifyContent: "center", marginTop: spacing.sm },
  dialogGhostText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.base, color: colors.onSurfaceTertiary },
  banners: { paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.sm },
  restrictedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: `${colors.brandPrimary}1F`,
    borderWidth: 1,
    borderColor: `${colors.brandPrimary}66`,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  restrictedText: { fontFamily: fonts.bodyBold, fontSize: fontSize.xs, letterSpacing: 1.5, color: colors.brandPrimary },
  restrictedSub: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.onSurfaceTertiary },
  modRow: { gap: spacing.sm, paddingRight: spacing.xl },
  modChip: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: `${colors.brandSecondary}44`,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 30,
  },
  modText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.xs, color: colors.onSurfaceSecondary },
  flipOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12,12,14,0.92)",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  flipTitle: { fontFamily: fonts.displayBold, fontSize: fontSize["4xl"], color: colors.onSurface, letterSpacing: 2 },
  flipSub: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.brandSecondary },
});
