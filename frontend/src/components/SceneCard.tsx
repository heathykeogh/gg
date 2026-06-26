import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors, DECK_THEME, fonts, fontSize, radius, spacing, TIER_COLOR, TIER_LABEL } from "@/src/theme/theme";
import { SceneCard as SceneCardType } from "@/src/types";

interface Props {
  card: SceneCardType;
  index: number;
  height?: number;
  onReveal?: () => void;
  revealKey?: string | number;
}

export default function SceneCard({ card, index, height = 168, onReveal, revealKey }: Props) {
  const theme = DECK_THEME[card.deckType];
  const spin = useSharedValue(0);
  const ty = useSharedValue(40);
  const op = useSharedValue(0);

  useEffect(() => {
    const delay = index * 240;
    op.value = 0;
    ty.value = 40;
    spin.value = 0;
    op.value = withDelay(delay, withTiming(1, { duration: 320 }));
    ty.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 110 }));
    spin.value = withDelay(
      delay + 220,
      withTiming(1, { duration: 640, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished && onReveal) runOnJS(onReveal)();
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealKey]);

  const container = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }],
  }));
  const front = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(spin.value, [0, 1], [180, 360])}deg` },
    ],
  }));
  const back = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(spin.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const lightText = card.deckType !== "Wild";

  return (
    <Animated.View style={[styles.wrap, { height }, container]}>
      {/* Back face */}
      <Animated.View style={[styles.face, styles.faceBack, back, { borderColor: `${theme.glow}66` }]}>
        <View style={styles.backInner}>
          <Ionicons name="diamond-outline" size={26} color={colors.brandSecondary} />
          <Text style={styles.backMark}>TENSION</Text>
        </View>
      </Animated.View>

      {/* Front face */}
      <Animated.View style={[styles.face, front]}>
        <LinearGradient
          colors={[theme.bg, theme.bgEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.frontGrad, { borderColor: `${theme.accent}55` }]}
        >
          <View style={styles.topRow}>
            <View style={[styles.deckChip, { backgroundColor: `${theme.accent}26` }]}>
              <Ionicons name={theme.icon as any} size={13} color={theme.accent} />
              <Text style={[styles.deckLabel, { color: theme.accent }]}>{card.deckName}</Text>
            </View>
            {card.carry ? (
              <View style={[styles.carryBadge, { borderColor: theme.accent }]}>
                <Ionicons name="repeat" size={11} color={theme.accent} />
                <Text style={[styles.carryText, { color: theme.accent }]}>CARRY</Text>
              </View>
            ) : (
              <View style={[styles.tierDot, { backgroundColor: TIER_COLOR[card.tier] }]} />
            )}
          </View>

          <Text style={[styles.cardText, { color: theme.text }]} numberOfLines={4}>
            {card.text}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={[styles.tierText, { color: theme.sub }]}>{TIER_LABEL[card.tier]}</Text>
            <View style={styles.tags}>
              {card.tags.slice(0, 2).map((t) => (
                <Text key={t} style={[styles.tag, { color: theme.sub, borderColor: `${theme.sub}44` }]}>
                  {t}
                </Text>
              ))}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  face: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
    backfaceVisibility: "hidden",
  },
  faceBack: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backInner: { alignItems: "center", gap: spacing.sm },
  backMark: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize.lg,
    letterSpacing: 6,
    color: colors.brandSecondary,
  },
  frontGrad: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  deckChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  deckLabel: { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, letterSpacing: 0.5 },
  tierDot: { width: 10, height: 10, borderRadius: 5 },
  carryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  carryText: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 0.8 },
  cardText: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize["2xl"],
    lineHeight: 28,
    marginVertical: spacing.sm,
  },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tierText: { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, letterSpacing: 1, textTransform: "uppercase" },
  tags: { flexDirection: "row", gap: spacing.xs },
  tag: {
    fontFamily: fonts.body,
    fontSize: 10,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
