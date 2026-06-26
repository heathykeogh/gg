import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts, fontSize, radius, spacing } from "@/src/theme/theme";
import { haptic } from "@/src/utils/haptics";

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  accent?: string;
  testID?: string;
  small?: boolean;
}

export default function Chip({ label, active, onPress, accent, testID, small }: Props) {
  const activeColor = accent ?? colors.brandPrimary;
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        if (onPress) {
          haptic.select();
          onPress();
        }
      }}
      style={[
        styles.chip,
        small && styles.small,
        active && { borderColor: activeColor, backgroundColor: `${activeColor}22` },
      ]}
    >
      <Text style={[styles.label, active && { color: colors.onSurface }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
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
  small: { height: 30, paddingHorizontal: spacing.md },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.onSurfaceTertiary,
  },
});
