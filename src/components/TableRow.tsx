import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/src/theme";

type TableCell = {
  key: string;
  text: string;
  flex?: number;
  align?: "left" | "right" | "center";
  muted?: boolean;
  monospace?: boolean;
};

type TableRowProps = {
  cells: TableCell[];
  header?: boolean;
  onPress?: () => void;
};

export function TableRow({ cells, header = false, onPress }: TableRowProps) {
  if (!onPress) {
    return (
      <View style={[styles.row, header && styles.headerRow]}>
        {cells.map((cell) => (
          <View key={cell.key} style={[styles.cell, { flex: cell.flex ?? 1 }]}>
            <Text
              numberOfLines={1}
              style={[
                styles.text,
                header && styles.headerText,
                cell.muted && styles.mutedText,
                cell.monospace && styles.monospace,
                cell.align === "right" && styles.alignRight,
                cell.align === "center" && styles.alignCenter,
              ]}
            >
              {cell.text}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, header && styles.headerRow, pressed && styles.pressed]}
    >
      {cells.map((cell) => (
        <View key={cell.key} style={[styles.cell, { flex: cell.flex ?? 1 }]}>
          <Text
            numberOfLines={1}
            style={[
              styles.text,
              header && styles.headerText,
              cell.muted && styles.mutedText,
              cell.monospace && styles.monospace,
              cell.align === "right" && styles.alignRight,
              cell.align === "center" && styles.alignCenter,
            ]}
          >
            {cell.text}
          </Text>
        </View>
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  headerRow: {
    backgroundColor: colors.cardElevated,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  cell: {
    minWidth: 0,
  },
  text: {
    color: colors.text,
    fontSize: 13,
  },
  headerText: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  mutedText: {
    color: colors.textMuted,
  },
  monospace: {
    fontVariant: ["tabular-nums"],
  },
  alignRight: {
    textAlign: "right",
  },
  alignCenter: {
    textAlign: "center",
  },
});
