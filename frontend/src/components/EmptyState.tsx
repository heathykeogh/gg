import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, fontSize, spacing } from "@/src/theme/theme";

const FOG =
  "https://images.unsplash.com/photo-1773851643467-6bd1ee0a0682?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMG15c3RlcnklMjBmb2clMjBlbGVnYW50fGVufDB8fHx8MTc4MjUwNDg5NXww&ixlib=rb-4.1.0&q=85";

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function EmptyState({ title, subtitle, children }: Props) {
  return (
    <View style={styles.wrap} testID="empty-state">
      <View style={styles.imgWrap}>
        <Image source={{ uri: FOG }} style={styles.img} contentFit="cover" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children ? <View style={styles.cta}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
  imgWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    marginBottom: spacing.xl,
    opacity: 0.7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  img: { width: "100%", height: "100%" },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: fontSize["2xl"],
    color: colors.onSurface,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.onSurfaceTertiary,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  cta: { marginTop: spacing.xl, alignSelf: "stretch" },
});
