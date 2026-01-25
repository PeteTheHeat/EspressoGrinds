import type { Theme } from "@react-navigation/native";

export const colors = {
  background: "#0B0B0C",
  card: "#151517",
  cardElevated: "#1B1B1F",
  text: "#F3F3F4",
  textMuted: "#A7A7AD",
  border: "#2A2A2E",
  inputBorder: "#3A3A40",
  primary: "#C67C4E",
  primaryText: "#0B0B0C",
  danger: "#E06767",
  warning: "#E0B15F",
  input: "#121214",
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const appTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
  fonts: {
    regular: {
      fontFamily: "System",
      fontWeight: "400",
    },
    medium: {
      fontFamily: "System",
      fontWeight: "500",
    },
    bold: {
      fontFamily: "System",
      fontWeight: "700",
    },
    heavy: {
      fontFamily: "System",
      fontWeight: "800",
    },
  },
};
