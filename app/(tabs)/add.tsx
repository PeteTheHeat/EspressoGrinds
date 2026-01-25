import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { InputField } from "@/src/components/InputField";
import { Screen } from "@/src/components/Screen";
import { StepperInput } from "@/src/components/StepperInput";
import { getBeanTypes, addExtraction } from "@/src/storage/repositories";
import { colors, radius, spacing } from "@/src/theme";
import type { BeanType } from "@/src/types";
import { clamp, parseNumericInput, roundToStep } from "@/src/utils/number";

type FormErrors = Partial<Record<"beanTypeId" | "grindSetting" | "weightIn" | "weightOut" | "timeSec", string>>;

const LIMITS = {
  grind: { min: 0, max: 50, step: 0.25 },
  weight: { min: 0, max: 200, step: 0.1 },
  time: { min: 0, max: 120, step: 1 },
} as const;

const DEFAULTS = {
  grindSetting: "15",
  weightIn: "18",
  weightOut: "36",
  timeSec: "30",
};

export default function AddExtractionScreen() {
  const router = useRouter();

  const [beanTypes, setBeanTypes] = useState<BeanType[]>([]);
  const [loadingBeans, setLoadingBeans] = useState(true);
  const [beanError, setBeanError] = useState<string | null>(null);

  const [beanTypeId, setBeanTypeId] = useState<string>("");
  const [grindSetting, setGrindSetting] = useState(DEFAULTS.grindSetting);
  const [weightIn, setWeightIn] = useState(DEFAULTS.weightIn);
  const [weightOut, setWeightOut] = useState(DEFAULTS.weightOut);
  const [timeSec, setTimeSec] = useState(DEFAULTS.timeSec);
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [beanModalOpen, setBeanModalOpen] = useState(false);

  const loadBeanTypes = useCallback(async () => {
    setLoadingBeans(true);
    setBeanError(null);

    try {
      const beans = await getBeanTypes();
      setBeanTypes(beans);
      setBeanTypeId((current) => {
        if (beans.length === 0) {
          return "";
        }
        return beans.some((bean) => bean.id === current) ? current : beans[0].id;
      });
    } catch (error) {
      setBeanError(error instanceof Error ? error.message : "Failed to load bean types.");
    } finally {
      setLoadingBeans(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBeanTypes();
    }, [loadBeanTypes])
  );

  const selectedBeanName = useMemo(() => {
    return beanTypes.find((bean) => bean.id === beanTypeId)?.name ?? "Select bean type";
  }, [beanTypeId, beanTypes]);

  const hasBeans = beanTypes.length > 0;

  const handleSave = async () => {
    setSubmitError(null);
    setSuccessMessage(null);

    const nextErrors: FormErrors = {};

    const grindValue = parseNumericInput(grindSetting);
    const weightInValue = parseNumericInput(weightIn);
    const weightOutValue = parseNumericInput(weightOut);
    const timeValue = parseNumericInput(timeSec);

    if (!beanTypeId) {
      nextErrors.beanTypeId = "Choose a bean type.";
    }
    if (grindValue == null) {
      nextErrors.grindSetting = "Required.";
    }
    if (weightInValue == null) {
      nextErrors.weightIn = "Required.";
    }
    if (weightOutValue == null) {
      nextErrors.weightOut = "Required.";
    }
    if (timeValue == null) {
      nextErrors.timeSec = "Required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const normalized = {
      beanTypeId,
      grindSetting: roundToStep(clamp(grindValue!, LIMITS.grind.min, LIMITS.grind.max), LIMITS.grind.step),
      weightIn: roundToStep(clamp(weightInValue!, LIMITS.weight.min, LIMITS.weight.max), LIMITS.weight.step),
      weightOut: roundToStep(clamp(weightOutValue!, LIMITS.weight.min, LIMITS.weight.max), LIMITS.weight.step),
      timeSec: Math.round(clamp(timeValue!, LIMITS.time.min, LIMITS.time.max)),
      notes: notes.trim(),
    };

    setSaving(true);
    try {
      await addExtraction(normalized);

      setGrindSetting(DEFAULTS.grindSetting);
      setWeightIn(DEFAULTS.weightIn);
      setWeightOut(DEFAULTS.weightOut);
      setTimeSec(DEFAULTS.timeSec);
      setNotes("");
      setErrors({});
      setSuccessMessage("Extraction saved.");
      Keyboard.dismiss();
      router.replace("/(tabs)/extractions");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save extraction.");
    } finally {
      setSaving(false);
    }
  };

  const openSettings = () => router.push("/(tabs)/settings");

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Dial In</Text>
      </View>

      {loadingBeans ? (
        <Card>
          <View style={styles.centerRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.muted}>Loading bean types...</Text>
          </View>
        </Card>
      ) : beanError ? (
        <Card>
          <Text style={styles.errorText}>{beanError}</Text>
          <Button label="Retry" variant="secondary" onPress={loadBeanTypes} />
        </Card>
      ) : !hasBeans ? (
        <Card>
          <Text style={styles.emptyTitle}>Add a bean type first</Text>
          <Text style={styles.muted}>Go to Settings to create your first bean type.</Text>
          <Button label="Open Settings" variant="secondary" onPress={openSettings} />
        </Card>
      ) : (
        <Card>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Extraction Details</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Bean Type</Text>
              <Pressable
                onPress={() => setBeanModalOpen(true)}
                style={({ pressed }) => [styles.select, pressed && styles.selectPressed, errors.beanTypeId && styles.selectError]}
              >
                <Text style={beanTypeId ? styles.selectValue : styles.selectPlaceholder}>{selectedBeanName}</Text>
                <Text style={styles.selectChevron}>v</Text>
              </Pressable>
              {errors.beanTypeId ? <Text style={styles.errorText}>{errors.beanTypeId}</Text> : null}
            </View>

            <StepperInput
              label="Grind Setting"
              value={grindSetting}
              onChangeText={setGrindSetting}
              step={LIMITS.grind.step}
              min={LIMITS.grind.min}
              max={LIMITS.grind.max}
              error={errors.grindSetting}
            />

            <StepperInput
              label="Weight In (g)"
              value={weightIn}
              onChangeText={setWeightIn}
              step={LIMITS.weight.step}
              min={LIMITS.weight.min}
              max={LIMITS.weight.max}
              error={errors.weightIn}
            />

            <StepperInput
              label="Weight Out (g)"
              value={weightOut}
              onChangeText={setWeightOut}
              step={LIMITS.weight.step}
              min={LIMITS.weight.min}
              max={LIMITS.weight.max}
              error={errors.weightOut}
            />

            <StepperInput
              label="Time (sec)"
              value={timeSec}
              onChangeText={setTimeSec}
              step={LIMITS.time.step}
              min={LIMITS.time.min}
              max={LIMITS.time.max}
              error={errors.timeSec}
              keyboardType="number-pad"
            />

            <InputField
              label="Tasting Notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              inputProps={{ autoCapitalize: "sentences", returnKeyType: "done" }}
            />
          </View>

          {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          <Button label={saving ? "Saving..." : "Save Extraction"} onPress={handleSave} disabled={saving} />
        </Card>
      )}

      <Modal animationType="fade" transparent visible={beanModalOpen} onRequestClose={() => setBeanModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setBeanModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Select Bean Type</Text>
            <View style={styles.modalList}>
              {beanTypes.map((bean) => {
                const selected = bean.id === beanTypeId;
                return (
                  <Pressable
                    key={bean.id}
                    onPress={() => {
                      setBeanTypeId(bean.id);
                      setBeanModalOpen(false);
                    }}
                    style={({ pressed }) => [styles.modalItem, pressed && styles.modalItemPressed, selected && styles.modalItemSelected]}
                  >
                    <Text style={selected ? styles.modalItemTextSelected : styles.modalItemText}>{bean.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  formSection: {
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  select: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.input,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectPressed: {
    opacity: 0.9,
  },
  selectError: {
    borderColor: colors.danger,
  },
  selectValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  selectPlaceholder: {
    color: colors.textMuted,
    fontSize: 16,
  },
  selectChevron: {
    color: colors.textMuted,
    fontSize: 18,
    marginLeft: spacing.sm,
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
  successText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  modalList: {
    gap: spacing.xs,
  },
  modalItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  modalItemPressed: {
    opacity: 0.9,
  },
  modalItemSelected: {
    borderColor: colors.primary,
  },
  modalItemText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  modalItemTextSelected: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
});
