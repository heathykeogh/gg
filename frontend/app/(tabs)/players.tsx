import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "@/src/components/EmptyState";
import GradientButton from "@/src/components/GradientButton";
import Header from "@/src/components/Header";
import ScreenBackground from "@/src/components/ScreenBackground";
import { PLAYER_COLORS } from "@/src/data/seed";
import { useGame } from "@/src/store/GameContext";
import { Player } from "@/src/types";
import { colors, fonts, fontSize, radius, spacing } from "@/src/theme/theme";
import { haptic } from "@/src/utils/haptics";

export default function Players() {
  const insets = useSafeAreaInsets();
  const { players, addPlayer, deletePlayer } = useGame();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PLAYER_COLORS[0]);
  const [selected, setSelected] = useState<Player | null>(null);

  const ranked = useMemo(
    () => [...players].sort((a, b) => b.stats.points - a.stats.points || b.stats.wins - a.stats.wins),
    [players],
  );

  const create = () => {
    if (!name.trim()) return;
    addPlayer(name.trim(), color);
    setName("");
    setColor(PLAYER_COLORS[0]);
    setModal(false);
    haptic.success();
  };

  return (
    <ScreenBackground>
      <Header title="Players" subtitle={`${players.length} profiles · local leaderboard`} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {players.length === 0 ? (
          <EmptyState title="No players yet" subtitle="Add profiles to track wins, points and streaks.">
            <GradientButton label="Add a Player" icon="person-add" onPress={() => setModal(true)} />
          </EmptyState>
        ) : (
          <>
            <Text style={styles.sectionLabel}>LEADERBOARD</Text>
            {ranked.map((p, i) => (
              <View key={p.id} style={styles.lbRow} testID={`leaderboard-row-${p.id}`}>
                <Text style={[styles.rank, i === 0 && { color: colors.brandSecondary }]}>{i + 1}</Text>
                <View style={[styles.avatar, { backgroundColor: p.color }]}>
                  <Text style={styles.avatarText}>{p.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lbName}>{p.name}</Text>
                  <Text style={styles.lbMeta}>
                    {p.stats.wins}W · best streak {p.stats.bestStreak} · {p.stats.gamesPlayed} games
                  </Text>
                </View>
                <Text style={styles.lbPoints}>{p.stats.points}</Text>
              </View>
            ))}

            <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>PROFILES</Text>
            <View style={styles.grid}>
              {players.map((p) => (
                <Pressable
                  key={p.id}
                  testID={`player-card-${p.id}`}
                  onPress={() => {
                    haptic.light();
                    setSelected(p);
                  }}
                  style={styles.profileCard}
                >
                  <View style={[styles.avatarLg, { backgroundColor: p.color }]}>
                    <Text style={styles.avatarTextLg}>{p.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.profileName} numberOfLines={1}>{p.name}</Text>
                  <View style={styles.miniStats}>
                    <Text style={styles.miniStat}>{p.stats.wins} wins</Text>
                    <Text style={styles.miniStat}>{p.stats.points} pts</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {players.length > 0 && (
        <Pressable
          testID="add-player-fab"
          onPress={() => {
            haptic.medium();
            setModal(true);
          }}
          style={[styles.fab, { bottom: insets.bottom + 84 }]}
        >
          <Ionicons name="person-add" size={24} color={colors.onBrandPrimary} />
        </Pressable>
      )}

      {/* Add player modal */}
      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalRoot}
        >
          <Pressable style={styles.backdrop} onPress={() => setModal(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>New Player</Text>
            <TextInput
              testID="player-name-input"
              value={name}
              onChangeText={setName}
              placeholder="Player name"
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoFocus
            />
            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {PLAYER_COLORS.map((c) => (
                <Pressable
                  key={c}
                  testID={`color-${c}`}
                  onPress={() => {
                    haptic.select();
                    setColor(c);
                  }}
                  style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorActive]}
                />
              ))}
            </View>
            <GradientButton
              testID="create-player-button"
              label="Add Player"
              onPress={create}
              disabled={!name.trim()}
              style={{ marginTop: spacing.xl }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Player detail modal */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setSelected(null)} />
          {selected && (
            <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
              <View style={styles.handle} />
              <View style={styles.detailHead}>
                <View style={[styles.avatarLg, { backgroundColor: selected.color }]}>
                  <Text style={styles.avatarTextLg}>{selected.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.sheetTitle}>{selected.name}</Text>
              </View>
              <View style={styles.detailStats}>
                <DetailStat label="Wins" value={selected.stats.wins} />
                <DetailStat label="Points" value={selected.stats.points} />
                <DetailStat label="Best Streak" value={selected.stats.bestStreak} />
                <DetailStat label="Games" value={selected.stats.gamesPlayed} />
                <DetailStat label="Scenes" value={selected.stats.scenesPlayed} />
              </View>
              <GradientButton
                testID="delete-player-button"
                label="Delete Player"
                variant="ghost"
                icon="trash-outline"
                onPress={() => {
                  haptic.warning();
                  deletePlayer(selected.id);
                  setSelected(null);
                }}
                style={{ marginTop: spacing.lg }}
              />
            </View>
          )}
        </View>
      </Modal>
    </ScreenBackground>
  );
}

function DetailStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.detailStat}>
      <Text style={styles.detailValue}>{value}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    letterSpacing: 2,
    color: colors.onSurfaceTertiary,
    marginBottom: spacing.md,
  },
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rank: { fontFamily: fonts.displayBold, fontSize: fontSize.xl, color: colors.muted, width: 24, textAlign: "center" },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.bodyBold, fontSize: fontSize.lg, color: "#fff" },
  lbName: { fontFamily: fonts.bodySemi, fontSize: fontSize.lg, color: colors.onSurface },
  lbMeta: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.onSurfaceTertiary, marginTop: 2 },
  lbPoints: { fontFamily: fonts.displayBold, fontSize: fontSize.xl, color: colors.brandSecondary },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  profileCard: {
    width: "47.5%",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  avatarLg: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  avatarTextLg: { fontFamily: fonts.bodyBold, fontSize: fontSize["2xl"], color: "#fff" },
  profileName: { fontFamily: fonts.bodySemi, fontSize: fontSize.lg, color: colors.onSurface },
  miniStats: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  miniStat: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.onSurfaceTertiary },
  fab: {
    position: "absolute",
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brandPrimary,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  handle: { alignSelf: "center", width: 44, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: spacing.lg },
  sheetTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize["2xl"], color: colors.onSurface },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    marginTop: spacing.lg,
  },
  fieldLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.onSurfaceTertiary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  colorRow: { flexDirection: "row", gap: spacing.md, flexWrap: "wrap" },
  colorDot: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "transparent" },
  colorActive: { borderColor: colors.onSurface, transform: [{ scale: 1.1 }] },
  detailHead: { alignItems: "center", marginBottom: spacing.lg },
  detailStats: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, justifyContent: "center" },
  detailStat: {
    width: "30%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  detailValue: { fontFamily: fonts.displayBold, fontSize: fontSize["2xl"], color: colors.brandSecondary },
  detailLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.onSurfaceTertiary, letterSpacing: 0.5 },
});
