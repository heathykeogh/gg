import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GradientButton from "@/src/components/GradientButton";
import Header from "@/src/components/Header";
import ScreenBackground from "@/src/components/ScreenBackground";
import { useGame } from "@/src/store/GameContext";
import { storage } from "@/src/utils/storage";
import { colors, fonts, fontSize, radius, spacing } from "@/src/theme/theme";
import { haptic } from "@/src/utils/haptics";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useGame();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);

  const reset = async () => {
    await storage.removeItem("tension.decks.v1");
    await storage.removeItem("tension.presets.v1");
    await storage.removeItem("tension.players.v1");
    await storage.removeItem("tension.session.v1");
    haptic.success();
    setConfirm(false);
    // simplest reliable refresh of seeded data
    if (typeof globalThis !== "undefined" && (globalThis as any).location) {
      (globalThis as any).location.reload();
    }
  };

  return (
    <ScreenBackground>
      <Header title="Settings" subtitle="Atmosphere & data" />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>ATMOSPHERE</Text>
        <View style={styles.group}>
          <ToggleRow
            testID="toggle-sound"
            icon="volume-high"
            label="Interaction sounds"
            sub="Soft feedback on draws and locks"
            value={settings.sound}
            onChange={(v) => updateSettings({ sound: v })}
          />
          <Divider />
          <ToggleRow
            testID="toggle-ambient"
            icon="musical-notes"
            label="Ambient soundscape"
            sub="Looping atmosphere during play"
            value={settings.ambient}
            onChange={(v) => updateSettings({ ambient: v })}
          />
          <Divider />
          <ToggleRow
            testID="toggle-haptics"
            icon="phone-portrait"
            label="Haptic feedback"
            sub="Tactile pulses on key moments"
            value={settings.haptics}
            onChange={(v) => updateSettings({ haptics: v })}
          />
        </View>

        <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>GUIDE & DATA</Text>
        <View style={styles.group}>
          <Pressable
            testID="replay-tutorial-row"
            style={styles.row}
            onPress={() => {
              haptic.light();
              updateSettings({ onboarded: false });
              router.push("/(tabs)");
            }}
          >
            <View style={[styles.iconBox, { backgroundColor: `${colors.brandSecondary}22` }]}>
              <Ionicons name="school" size={18} color={colors.brandSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>How to play</Text>
              <Text style={styles.rowSub}>Replay the quick tutorial</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
          <Divider />
          <Pressable testID="reset-data-row" style={styles.row} onPress={() => setConfirm(true)}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.error}22` }]}>
              <Ionicons name="refresh" size={18} color={colors.brandPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Reset to defaults</Text>
              <Text style={styles.rowSub}>Restore seed decks & clear players</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.about}>
          <Ionicons name="diamond-outline" size={20} color={colors.brandSecondary} />
          <Text style={styles.aboutTitle}>Tension</Text>
          <Text style={styles.aboutText}>An offline, private two-player ritual. v1.0</Text>
        </View>
      </ScrollView>

      <Modal visible={confirm} transparent animationType="fade" onRequestClose={() => setConfirm(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setConfirm(false)} />
          <View style={[styles.dialog]}>
            <Text style={styles.dialogTitle}>Reset everything?</Text>
            <Text style={styles.dialogText}>
              This restores the default decks and removes all players and the active session. This
              cannot be undone.
            </Text>
            <GradientButton testID="confirm-reset-button" label="Reset all data" icon="trash-outline" onPress={reset} />
            <GradientButton label="Cancel" variant="ghost" onPress={() => setConfirm(false)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
}

function ToggleRow({
  icon,
  label,
  sub,
  value,
  onChange,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
  testID: string;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: `${colors.brandSecondary}22` }]}>
        <Ionicons name={icon} size={18} color={colors.brandSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch
        testID={testID}
        value={value}
        onValueChange={(v) => {
          haptic.light();
          onChange(v);
        }}
        trackColor={{ false: colors.surfaceTertiary, true: colors.brand }}
        thumbColor={value ? colors.brandSecondary : colors.muted}
      />
    </View>
  );
}

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    letterSpacing: 2,
    color: colors.onSurfaceTertiary,
    marginBottom: spacing.md,
  },
  group: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  iconBox: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontFamily: fonts.bodySemi, fontSize: fontSize.lg, color: colors.onSurface },
  rowSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: 48 },
  about: { alignItems: "center", marginTop: spacing.xxxl, gap: spacing.xs },
  aboutTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize.xl, color: colors.onSurface, letterSpacing: 2 },
  aboutText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.muted },
  modalRoot: { flex: 1, justifyContent: "center", padding: spacing.xl },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.7)" },
  dialog: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  dialogTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize["2xl"], color: colors.onSurface, marginBottom: spacing.sm },
  dialogText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.onSurfaceSecondary, lineHeight: 20, marginBottom: spacing.xl },
});
