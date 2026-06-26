import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import GlassCard from "@/src/components/GlassCard";
import GradientButton from "@/src/components/GradientButton";
import ScreenBackground from "@/src/components/ScreenBackground";
import { useGame } from "@/src/store/GameContext";
import { colors, fonts, fontSize, radius, spacing } from "@/src/theme/theme";
import { haptic } from "@/src/utils/haptics";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { decks, players, session } = useGame();

  const totalCards = decks.reduce((a, d) => a + d.cards.length, 0);

  return (
    <ScreenBackground hero>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.xxxl, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.heroText}>
          <Text style={styles.kicker}>A TWO-PLAYER RITUAL</Text>
          <Text style={styles.title}>Tension</Text>
          <Text style={styles.tagline}>
            Draw, layer, and build a single unbroken scene. Momentum carries — nothing resets.
          </Text>
        </Animated.View>

        <View style={styles.body}>
          {session && (
            <Animated.View entering={FadeInDown.delay(100)}>
              <Pressable
                testID="resume-session-card"
                onPress={() => {
                  haptic.medium();
                  router.push("/game/play");
                }}
              >
                <LinearGradient
                  colors={[colors.brandTertiary, colors.surfaceSecondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.resume}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resumeLabel}>RESUME SESSION</Text>
                    <Text style={styles.resumeTitle}>{session.preset.name}</Text>
                    <Text style={styles.resumeMeta}>
                      Round {session.round} · {session.playerNames.join(" vs ")}
                    </Text>
                  </View>
                  <Ionicons name="play-circle" size={44} color={colors.brandSecondary} />
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(160)}>
            <GradientButton
              testID="start-scene-button"
              label="Start a Scene"
              icon="sparkles"
              onPress={() => router.push("/game/setup")}
              style={{ marginTop: session ? spacing.lg : 0 }}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(220)} style={styles.quickRow}>
            <QuickTile
              testID="quick-decks"
              icon="albums"
              label="Decks"
              value={`${decks.length} decks`}
              onPress={() => router.push("/(tabs)/decks")}
            />
            <QuickTile
              testID="quick-players"
              icon="people"
              label="Players"
              value={`${players.length} saved`}
              onPress={() => router.push("/(tabs)/players")}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(280)}>
            <GlassCard style={styles.statCard}>
              <View style={styles.statRow}>
                <Stat label="Decks" value={decks.length} />
                <View style={styles.statDivider} />
                <Stat label="Cards" value={totalCards} />
                <View style={styles.statDivider} />
                <Stat label="Players" value={players.length} />
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(340)} style={styles.hint}>
            <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
            <Text style={styles.hintText}>
              Tip: Enable Momentum so intense cards carry into the next round for a continuous build.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

function QuickTile({
  icon,
  label,
  value,
  onPress,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={styles.tile}
    >
      <Ionicons name={icon} size={22} color={colors.brandSecondary} />
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroText: { paddingHorizontal: spacing.xl, marginBottom: spacing.xxl },
  kicker: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    letterSpacing: 3,
    color: colors.brandSecondary,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: fontSize["5xl"],
    color: colors.onSurface,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    color: colors.onSurfaceSecondary,
    lineHeight: 24,
    marginTop: spacing.sm,
    maxWidth: "92%",
  },
  body: { paddingHorizontal: spacing.xl },
  resume: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.brandPrimary}55`,
  },
  resumeLabel: { fontFamily: fonts.bodySemi, fontSize: fontSize.xs, letterSpacing: 2, color: colors.brandSecondary },
  resumeTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize["2xl"], color: colors.onSurface, marginTop: 2 },
  resumeMeta: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: 2 },
  quickRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  tile: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  tileLabel: { fontFamily: fonts.bodySemi, fontSize: fontSize.lg, color: colors.onSurface, marginTop: spacing.sm },
  tileValue: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.onSurfaceTertiary },
  statCard: { marginTop: spacing.lg, padding: spacing.lg },
  statRow: { flexDirection: "row", alignItems: "center" },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: fonts.displayBold, fontSize: fontSize["3xl"], color: colors.brandSecondary },
  statLabel: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.onSurfaceTertiary, letterSpacing: 1, textTransform: "uppercase" },
  statDivider: { width: 1, height: 32, backgroundColor: colors.divider },
  hint: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl, alignItems: "flex-start", paddingRight: spacing.md },
  hintText: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted, lineHeight: 19 },
});
