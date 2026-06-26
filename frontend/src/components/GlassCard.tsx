import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius } from "@/src/theme/theme";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export default function GlassCard({ children, style, intensity = 26 }: Props) {
  if (Platform.OS === "web") {
    return <View style={[styles.fallback, style]}>{children}</View>;
  }
  return (
    <BlurView intensity={intensity} tint="dark" style={[styles.blur, style]}>
      <View style={styles.tint}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  tint: { backgroundColor: "rgba(22,22,26,0.55)" },
  fallback: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(22,22,26,0.92)",
  },
});
