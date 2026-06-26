import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { useGame } from "@/src/store/GameContext";
import { DeckType } from "@/src/types";
import { colors, DECK_THEME, fonts, fontSize, radius, spacing } from "@/src/theme/theme";
import { haptic } from "@/src/utils/haptics";

const TYPES: DeckType[] = [
  "Action",
  "Enhancer",
  "Control",
  "Time",
  "Momentum",
  "Wild",
  "Objective",
  "Custom",
];

export default function Decks() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { decks, addDeck } = useGame();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<DeckType>("Action");

  const create = () => {
    if (!name.trim()) return;
    addDeck(name.trim(), type);
    setName("");
    setType("Action");
    setModal(false);
    haptic.success();
  };

  return (
    <ScreenBackground>
      <Header title="Decks" subtitle={`${decks.length} decks · the rules of engagement`} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {decks.length === 0 ? (
          <EmptyState title="No decks yet" subtitle="Create your first deck to start building scenes.">
            <GradientButton label="Create a Deck" icon="add" onPress={() => setModal(true)} />
          </EmptyState>
        ) : (
          decks.map((d) => {
            const t = DECK_THEME[d.type];
            return (
              <Pressable
                key={d.id}
                testID={`deck-row-${d.id}`}
                onPress={() => {
                  haptic.light();
                  router.push(`/deck/${d.id}`);
                }}
                style={styles.row}
              >
                <View style={[styles.iconBox, { backgroundColor: `${t.accent}22`, borderColor: `${t.accent}55` }]}>
                  <Ionicons name={t.icon as any} size={22} color={t.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{d.name}</Text>
                  <Text style={styles.rowMeta}>
                    {d.type} · {d.cards.length} cards
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.muted} />
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {decks.length > 0 && (
        <Pressable
          testID="new-deck-fab"
          onPress={() => {
            haptic.medium();
            setModal(true);
          }}
          style={[styles.fab, { bottom: insets.bottom + 84 }]}
        >
          <Ionicons name="add" size={28} color={colors.onBrandPrimary} />
        </Pressable>
      )}

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalRoot}
        >
          <Pressable style={styles.backdrop} onPress={() => setModal(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>New Deck</Text>
            <TextInput
              testID="deck-name-input"
              value={name}
              onChangeText={setName}
              placeholder="Deck name"
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoFocus
            />
            <Text style={styles.fieldLabel}>Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.typeRow}
            >
              {TYPES.map((tp) => {
                const active = tp === type;
                const t = DECK_THEME[tp];
                return (
                  <Pressable
                    key={tp}
                    testID={`deck-type-${tp}`}
                    onPress={() => {
                      haptic.select();
                      setType(tp);
                    }}
                    style={[
                      styles.typeChip,
                      active && { borderColor: t.accent, backgroundColor: `${t.accent}22` },
                    ]}
                  >
                    <Ionicons name={t.icon as any} size={14} color={active ? t.accent : colors.muted} />
                    <Text style={[styles.typeChipText, active && { color: colors.onSurface }]}>{tp}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <GradientButton
              testID="create-deck-button"
              label="Create Deck"
              onPress={create}
              disabled={!name.trim()}
              style={{ marginTop: spacing.xl }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontFamily: fonts.bodySemi, fontSize: fontSize.lg, color: colors.onSurface },
  rowMeta: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.onSurfaceTertiary, marginTop: 2 },
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
  sheetTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize["2xl"], color: colors.onSurface, marginBottom: spacing.lg },
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
  typeRow: { gap: spacing.sm, paddingRight: spacing.lg },
  typeChip: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.muted },
});
