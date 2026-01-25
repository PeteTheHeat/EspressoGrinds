import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";
import { clamp, formatStep, parseNumericInput, roundToStep } from "@/src/utils/number";
import { InputField } from "@/src/components/InputField";

type StepperInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  step: number;
  min: number;
  max: number;
  placeholder?: string;
  error?: string | null;
  hint?: string;
  keyboardType?: "decimal-pad" | "number-pad";
};

export function StepperInput({
  label,
  value,
  onChangeText,
  step,
  min,
  max,
  placeholder,
  error,
  hint,
  keyboardType = "decimal-pad",
}: StepperInputProps) {
  const handleStep = (direction: -1 | 1) => {
    const current = parseNumericInput(value) ?? 0;
    const next = roundToStep(clamp(current + direction * step, min, max), step);
    onChangeText(formatStep(next, step));
  };

  return (
    <InputField
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      error={error}
      hint={hint}
      rightAccessory={
        <View style={styles.stepper}>
          <StepperButton label="-" onPress={() => handleStep(-1)} />
          <StepperButton label="+" onPress={() => handleStep(1)} />
        </View>
      }
    />
  );
}

type StepperButtonProps = {
  label: string;
  onPress: () => void;
};

function StepperButton({ label, onPress }: StepperButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  button: {
    height: 36,
    minWidth: 40,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
});
