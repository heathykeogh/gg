import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, fontSize, radius, spacing } from "@/src/theme/theme";
import { haptic } from "@/src/utils/haptics";
import { sound } from "@/src/audio/sound";

interface Slide {
  icon: keyof typeof Ionicons.glyphMap;
  kicker: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: "diamond-outline",
    kicker: "A TWO-PLAYER RITUAL",
    title: "One unbroken scene",
    body: "Tension builds a single, escalating scene between the two of you. Nothing resets — every round flows into the next.",
  },
  {
    icon: "layers-outline",
    kicker: "DRAW & LAYER",
    title: "Cards stack into a scene",
    body: "Each turn draws cards from your decks — Action, Control, Time and more. Read the top card and follow the instruction underneath it. Your partner follows too.",
  },
  {
    icon: "trending-up",
    kicker: "MOMENTUM & HOLD",
    title: "Keep the flow alive",
    body: "Lock scenes without stopping to grow your Momentum (×) for bonus points. Intense scenes must be held for a few seconds before you can lock them — no rushing.",
  },
  {
    icon: "trophy-outline",
    kicker: "LEAD & WIN",
    title: "Take turns, reach the goal",
    body: "The lead alternates each scene. Lock to score, or Break Flow to reset momentum. First to the goal wins. That's it — let it build.",
  },
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const s = SLIDES[i];

  const next = () => {
    haptic.light();
    sound.play("tap");
    if (last) onDone();
    else setI((v) => v + 1);
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.root}>
        <LinearGradient
          colors={[colors.brandTertiary, colors.surface, colors.surface]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.content, { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl }]}>
          <Pressable testID="onboarding-skip" onPress={onDone} style={styles.skip} hitSlop={10}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>

          <Animated.View key={`icon-${i}`} entering={FadeIn.duration(400)} style={styles.iconWrap}>
            <LinearGradient colors={[colors.brandPrimary, colors.brand]} style={styles.iconCircle}>
              <Ionicons name={s.icon} size={40} color={colors.onBrandPrimary} />
            </LinearGradient>
          </Animated.View>

          <View style={styles.textWrap}>
            <Animated.Text key={`k-${i}`} entering={FadeInRight.duration(400)} style={styles.kicker}>
              {s.kicker}
            </Animated.Text>
            <Animated.Text key={`t-${i}`} entering={FadeInRight.delay(60).duration(400)} style={styles.title}>
              {s.title}
            </Animated.Text>
            <Animated.Text key={`b-${i}`} entering={FadeInRight.delay(120).duration(400)} style={styles.body}>
              {s.body}
            </Animated.Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.dots}>
              {SLIDES.map((_, idx) => (
                <View key={idx} style={[styles.dot, idx === i && styles.dotActive]} />
              ))}
            </View>
            <Pressable testID="onboarding-next" onPress={next} style={styles.cta}>
              <LinearGradient colors={[colors.brandPrimary, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGrad}>
                <Text style={styles.ctaText}>{last ? "Start Playing" : "Next"}</Text>
                <Ionicons name={last ? "flame" : "arrow-forward"} size={18} color={colors.onBrandPrimary} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, paddingHorizontal: spacing.xl },
  skip: { position: "absolute", right: spacing.xl, top: 0, paddingTop: spacing.xxxl },
  skipText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.base, color: colors.onSurfaceTertiary },
  iconWrap: { alignItems: "center", marginTop: spacing.xxl },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brandPrimary,
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
  },
  textWrap: { flex: 1, justifyContent: "center" },
  kicker: { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, letterSpacing: 3, color: colors.brandSecondary, marginBottom: spacing.md },
  title: { fontFamily: fonts.displayBold, fontSize: fontSize["4xl"], color: colors.onSurface, marginBottom: spacing.lg, lineHeight: 46 },
  body: { fontFamily: fonts.body, fontSize: fontSize.lg, color: colors.onSurfaceSecondary, lineHeight: 26 },
  footer: { gap: spacing.xl },
  dots: { flexDirection: "row", gap: spacing.sm, justifyContent: "center" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.borderStrong },
  dotActive: { width: 22, backgroundColor: colors.brandSecondary },
  cta: { borderRadius: radius.md, overflow: "hidden" },
  ctaGrad: { height: 58, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  ctaText: { fontFamily: fonts.bodySemi, fontSize: fontSize.lg, color: colors.onBrandPrimary, letterSpacing: 0.3 },
});
