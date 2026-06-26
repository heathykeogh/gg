import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, fonts, fontSize, radius, spacing } from "@/src/theme/theme";
import { haptic } from "@/src/utils/haptics";
import { sound } from "@/src/audio/sound";

type Variant = "primary" | "secondary" | "ghost";

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  glow?: boolean;
  testID?: string;
  style?: ViewStyle;
}

export default function GradientButton({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
  glow = true,
  testID,
  style,
}: Props) {
  const handle = () => {
    if (disabled || loading) return;
    haptic.light();
    sound.play("tap");
    onPress();
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.onBrandPrimary : colors.onSurface} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={variant === "primary" ? colors.onBrandPrimary : colors.brandSecondary}
              style={{ marginRight: spacing.sm }}
            />
          )}
          <Text style={[styles.label, variant !== "primary" && styles.labelAlt]}>{label}</Text>
        </>
      )}
    </>
  );

  if (variant === "primary") {
    return (
      <Pressable
        testID={testID}
        onPress={handle}
        disabled={disabled || loading}
        style={[
          glow && styles.glow,
          { opacity: disabled ? 0.4 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={[colors.brandPrimary, colors.brand]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={handle}
      disabled={disabled || loading}
      style={[
        styles.base,
        variant === "secondary" ? styles.secondary : styles.ghost,
        { opacity: disabled ? 0.4 : 1 },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  secondary: {
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
  glow: {
    shadowColor: colors.brandPrimary,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    borderRadius: radius.md,
    elevation: 8,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.lg,
    color: colors.onBrandPrimary,
    letterSpacing: 0.3,
  },
  labelAlt: { color: colors.onSurface },
});
