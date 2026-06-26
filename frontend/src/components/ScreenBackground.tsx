import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { StyleSheet, View, ViewStyle } from "react-native";

import { colors } from "@/src/theme/theme";

const HERO =
  "https://images.unsplash.com/photo-1598084331228-71bd91b70e59?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHNoYWRvdyUyMHNpbGhvdWV0dGUlMjBjaW5lbWF0aWN8ZW58MHx8fHwxNzgyNTA0ODk1fDA&ixlib=rb-4.1.0&q=85";

interface Props {
  children: React.ReactNode;
  hero?: boolean;
  style?: ViewStyle;
}

export default function ScreenBackground({ children, hero, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      {hero && (
        <View style={styles.heroWrap} pointerEvents="none">
          <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={["rgba(12,12,14,0.35)", "rgba(12,12,14,0.85)", colors.surface]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
      <LinearGradient
        colors={[colors.surface, "#100A0C", colors.surface]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {hero && (
        <View style={styles.heroWrap} pointerEvents="none">
          <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={["rgba(12,12,14,0.30)", "rgba(12,12,14,0.88)", colors.surface]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  heroWrap: { position: "absolute", top: 0, left: 0, right: 0, height: "52%" },
  content: { flex: 1 },
});
