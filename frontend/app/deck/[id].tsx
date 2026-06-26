import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "@/src/components/EmptyState";
import GradientButton from "@/src/components/GradientButton";
import Header from "@/src/components/Header";
import ScreenBackground from "@/src/components/ScreenBackground";
import { useGame } from "@/src/store/GameContext";
import { Card, Tier } from "@/src/types";
import {
  colors,
  DECK_THEME,
  fonts,
  fontSize,
  radius,
  spacing,
  TIER_COLOR,
  TIER_LABEL,
} from "@/src/theme/theme";
import { haptic } from "@/src/utils/haptics";

const TIERS: Tier[] = [1, 2, 3];

export default function DeckDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { decks, addCard, updateCard, deleteCard, deleteDeck } = useGame();

  const deck = decks.find((d) => d.id === id);
  const [filter, setFilter] = useState<Tier | 0>(0);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);
  const [text, setText] = useState("");
  const [tier, setTier] = useState<Tier>(1);
  const [tags, setTags] = useState("");
  const [partner, setPartner] = useState("");
  const [intensifier, setIntensifier] = useState("");
  const [menu, setMenu] = useState(false);

  const filtered = useMemo(() => {
    if (!deck) return [];
    return filter === 0 ? deck.cards : deck.cards.filter((c) => c.tier === filter);
  }, [deck, filter]);

  if (!deck) {
    return (
      <ScreenBackground>
        <Header title="Deck" back />
        <EmptyState title="Deck not found" />
      </ScreenBackground>
    );
  }
  const theme = DECK_THEME[deck.type];

  const openAdd = () => {
    setEditing(null);
    setText("");
    setTier(1);
    setTags("");
    setPartner("");
    setIntensifier("");
    setModal(true);
  };
  const openEdit = (c: Card) => {
    setEditing(c);
    setText(c.text);
    setTier(c.tier);
    setTags(c.tags.join(", "));
    setPartner(c.partnerInstruction ?? "");
    setIntensifier(c.intensifier ?? "");
    setModal(true);
  };
  const save = () => {
    if (!text.trim()) return;
    const tagArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const extra = {
      partnerInstruction: partner.trim() || undefined,
      intensifier: intensifier.trim() || undefined,
    };
    if (editing) {
      updateCard(deck.id, editing.id, { text: text.trim(), tier, tags: tagArr, ...extra });
    } else {
      addCard(deck.id, { text: text.trim(), tier, tags: tagArr, ...extra });
    }
    haptic.success();
    setModal(false);
  };

  return (
    <ScreenBackground>
      <Header
        title={deck.name}
        subtitle={`${deck.type} · ${deck.cards.length} cards`}
        back
        right={
          <Pressable testID="deck-menu-button" hitSlop={10} onPress={() => setMenu(true)}>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.onSurface} />
          </Pressable>
        }
      />

      {/* sticky filter row */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FilterChip label="All" active={filter === 0} onPress={() => setFilter(0)} accent={theme.accent} />
          {TIERS.map((t) => (
            <FilterChip
              key={t}
              label={TIER_LABEL[t]}
              active={filter === t}
              onPress={() => setFilter(t)}
              accent={TIER_COLOR[t]}
              testID={`filter-tier-${t}`}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            title={deck.cards.length === 0 ? "No cards yet" : "Nothing in this tier"}
            subtitle={deck.cards.length === 0 ? "Add prompts to bring this deck to life." : "Try another filter."}
          >
            {deck.cards.length === 0 && <GradientButton label="Add a Card" icon="add" onPress={openAdd} />}
          </EmptyState>
        ) : (
          filtered.map((c) => (
            <Pressable
              key={c.id}
              testID={`card-row-${c.id}`}
              onPress={() => {
                haptic.light();
                openEdit(c);
              }}
              style={styles.cardRow}
            >
              <View style={[styles.tierBar, { backgroundColor: TIER_COLOR[c.tier] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardText}>{c.text}</Text>
                <View style={styles.cardMeta}>
                  <Text style={[styles.tierTag, { color: TIER_COLOR[c.tier] }]}>{TIER_LABEL[c.tier]}</Text>
                  {c.tags.map((t) => (
                    <Text key={t} style={styles.tag}>
                      #{t}
                    </Text>
                  ))}
                </View>
              </View>
              <Pressable
                testID={`delete-card-${c.id}`}
                hitSlop={8}
                onPress={() => {
                  haptic.warning();
                  deleteCard(deck.id, c.id);
                }}
              >
                <Ionicons name="close-circle" size={22} color={colors.muted} />
              </Pressable>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Pressable testID="add-card-fab" onPress={openAdd} style={[styles.fab, { bottom: insets.bottom + spacing.xl }]}>
        <Ionicons name="add" size={28} color={colors.onBrandPrimary} />
      </Pressable>

      {/* Deck menu */}
      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setMenu(false)} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.handle} />
            <GradientButton
              testID="delete-deck-button"
              label="Delete Deck"
              variant="ghost"
              icon="trash-outline"
              onPress={() => {
                haptic.warning();
                deleteDeck(deck.id);
                setMenu(false);
                router.back();
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Add/Edit card */}
      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setModal(false)} />
          <View style={[styles.editSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.handle} />
            <KeyboardAwareScrollView bottomOffset={90} showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>{editing ? "Edit Card" : "New Card"}</Text>
              <TextInput
                testID="card-text-input"
                value={text}
                onChangeText={setText}
                placeholder="Describe the prompt…"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.multiline]}
                multiline
                autoFocus
              />
              <Text style={styles.fieldLabel}>Intensity tier</Text>
              <View style={styles.tierRow}>
                {TIERS.map((t) => (
                  <Pressable
                    key={t}
                    testID={`card-tier-${t}`}
                    onPress={() => {
                      haptic.select();
                      setTier(t);
                    }}
                    style={[
                      styles.tierBtn,
                      tier === t && { borderColor: TIER_COLOR[t], backgroundColor: `${TIER_COLOR[t]}22` },
                    ]}
                  >
                    <Text style={[styles.tierBtnText, tier === t && { color: colors.onSurface }]}>
                      {TIER_LABEL[t]}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Tags (comma separated)</Text>
              <TextInput
                testID="card-tags-input"
                value={tags}
                onChangeText={setTags}
                placeholder="slow, tease, control"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
              <Text style={styles.fieldLabel}>Partner instruction (optional)</Text>
              <TextInput
                testID="card-partner-input"
                value={partner}
                onChangeText={setPartner}
                placeholder="You may only move when told"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
              <Text style={styles.fieldLabel}>Intensifier (optional)</Text>
              <TextInput
                testID="card-intensifier-input"
                value={intensifier}
                onChangeText={setIntensifier}
                placeholder="Reset them every time they break position"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
              <View style={{ height: spacing.xxxl }} />
            </KeyboardAwareScrollView>
            <KeyboardStickyView>
              <GradientButton
                testID="save-card-button"
                label={editing ? "Save Changes" : "Add Card"}
                onPress={save}
                disabled={!text.trim()}
              />
            </KeyboardStickyView>
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  accent,
  testID,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accent: string;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        haptic.select();
        onPress();
      }}
      style={[styles.fChip, active && { borderColor: accent, backgroundColor: `${accent}22` }]}
    >
      <Text style={[styles.fChipText, active && { color: colors.onSurface }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterWrap: { height: 56, justifyContent: "center" },
  filterRow: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  fChip: {
    height: 36,
    flexShrink: 0,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  fChipText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.sm, color: colors.onSurfaceTertiary },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  tierBar: { width: 3, alignSelf: "stretch", borderRadius: 2 },
  cardText: { fontFamily: fonts.body, fontSize: fontSize.lg, color: colors.onSurface, lineHeight: 21 },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xs, alignItems: "center" },
  tierTag: { fontFamily: fonts.bodySemi, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" },
  tag: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.muted },
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
  editSheet: {
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: "80%",
  },
  handle: { alignSelf: "center", width: 44, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: spacing.lg },
  sheetTitle: { fontFamily: fonts.displaySemi, fontSize: fontSize["2xl"], color: colors.onSurface, marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
  },
  multiline: { minHeight: 96, textAlignVertical: "top", paddingTop: spacing.md },
  fieldLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.xs,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.onSurfaceTertiary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  tierRow: { flexDirection: "row", gap: spacing.sm },
  tierBtn: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  tierBtnText: { fontFamily: fonts.bodyMedium, fontSize: fontSize.base, color: colors.muted },
});
