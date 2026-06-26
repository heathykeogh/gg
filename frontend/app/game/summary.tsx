import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GradientButton from "@/src/components/GradientButton";
import ScreenBackground from "@/src/components/ScreenBackground";
import { colors, fonts, fontSize, radius, spacing } from "@/src/theme/theme";
import { haptic } from "@/src/utils/haptics";

export default function Summary() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    names: string;
    ids: string;
    scores: string;
    winner: string;
    rounds: string;
  }>();

  const names = (params.names ?? "").split("|");
  const ids = (params.ids ?? "").split("|");
  const scores = (params.scores ?? "").split("|").map((s) => parseInt(s, 10) || 0);
  const winnerIdx = ids.indexOf(params.winner ?? "");
  const tie = scores.length === 2 && scores[0] === scores[1];

  useEffect(() => {
    haptic.success();
  }, []);

  return (
    <ScreenBackground hero>
      <View style={[styles.wrap, { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl }]}>
        <Animated.View entering={FadeIn.duration(700)} style={styles.crownWrap}>
          <LinearGradient colors={[colors.brandSecondary, "#8C7038"]} style={styles.crown}>
            <Ionicons name="trophy" size={40} color={colors.surface} />
          </LinearGradient>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(150)} style={styles.kicker}>
          SCENE COMPLETE
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(220)} style={styles.winner}>
          {tie ? "A Perfect Tie" : `${names[winnerIdx] ?? "Player"} Wins`}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(280)} style={styles.sub}>
          {params.rounds} rounds of unbroken tension
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(360)} style={styles.scoreCard}>
          {names.map((nm, i) => {
            const win = i === winnerIdx && !tie;
            return (
              <View key={i} style={[styles.scoreRow, win && styles.scoreRowWin]} testID={`summary-score-${i}`}>
                <View style={styles.scoreLeft}>
                  {win && <Ionicons name="star" size={16} color={colors.brandSecondary} />}
                  <Text style={[styles.scoreName, win && { color: colors.onSurface }]}>{nm}</Text>
                </View>
                <Text style={[styles.scoreVal, win && { color: colors.brandSecondary }]}>{scores[i]}</Text>
              </View>
            );
          })}
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Animated.View entering={FadeInDown.delay(440)} style={styles.actions}>
          <GradientButton
            testID="play-again-button"
            label="Play Again"
            icon="refresh"
            onPress={() => router.replace("/game/setup")}
          />
          <GradientButton
            testID="summary-home-button"
            label="Back to Home"
            variant="ghost"
            onPress={() => router.replace("/(tabs)")}
            style={{ marginTop: spacing.sm }}
          />
        </Animated.View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: spacing.xl, alignItems: "center" },
  crownWrap: { marginBottom: spacing.xl },
  crown: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", shadowColor: colors.brandSecondary, shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  kicker: { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, letterSpacing: 3, color: colors.brandSecondary },
  winner: { fontFamily: fonts.displayBold, fontSize: fontSize["4xl"], color: colors.onSurface, textAlign: "center", marginTop: spacing.sm },
  sub: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.onSurfaceTertiary, marginTop: spacing.xs },
  scoreCard: { alignSelf: "stretch", marginTop: spacing.xxl, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.sm },
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderRadius: radius.md },
  scoreRowWin: { backgroundColor: `${colors.brandPrimary}1A` },
  scoreLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  scoreName: { fontFamily: fonts.bodySemi, fontSize: fontSize.xl, color: colors.onSurfaceTertiary },
  scoreVal: { fontFamily: fonts.displayBold, fontSize: fontSize["3xl"], color: colors.onSurfaceTertiary },
  actions: { alignSelf: "stretch" },
});
