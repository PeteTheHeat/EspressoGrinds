import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  size?: "regular" | "compact";
};

export function Button({ label, onPress, variant = "primary", disabled, style, size = "regular" }: ButtonProps) {
  const variantStyle = variant === "primary" ? styles.primary : variant === "danger" ? styles.danger : styles.secondary;
  const labelStyle =
    variant === "primary" ? styles.primaryLabel : variant === "danger" ? styles.dangerLabel : styles.secondaryLabel;
  const sizeStyle = size === "compact" ? styles.compact : null;
  const sizeLabelStyle = size === "compact" ? styles.compactLabel : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyle,
        variantStyle,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View>
        <Text style={[styles.label, sizeLabelStyle, labelStyle]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  compact: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: "transparent",
    borderColor: colors.danger,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  compactLabel: {
    fontSize: 14,
  },
  primaryLabel: {
    color: colors.primaryText,
  },
  secondaryLabel: {
    color: colors.text,
  },
  dangerLabel: {
    color: colors.danger,
  },
});
