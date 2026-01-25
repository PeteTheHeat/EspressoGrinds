import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { Screen } from "@/src/components/Screen";
import { deleteExtraction, getBeanTypes, getExtractionById } from "@/src/storage/repositories";
import { colors, spacing } from "@/src/theme";
import type { BeanType, Extraction } from "@/src/types";
import { formatStep } from "@/src/utils/number";

export default function ExtractionDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const extractionId = typeof params.id === "string" ? params.id : "";

  const [beanTypes, setBeanTypes] = useState<BeanType[]>([]);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!extractionId) {
      setError("Missing extraction id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [beans, shot] = await Promise.all([getBeanTypes(), getExtractionById(extractionId)]);
      setBeanTypes(beans);
      setExtraction(shot);

      if (!shot) {
        setError("Extraction not found.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load extraction.");
    } finally {
      setLoading(false);
    }
  }, [extractionId]);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails])
  );

  const beanName = useMemo(() => {
    if (!extraction) return "";
    return beanTypes.find((bean) => bean.id === extraction.beanTypeId)?.name ?? "Unknown bean";
  }, [beanTypes, extraction]);

  const ratio = useMemo(() => {
    if (!extraction || extraction.weightIn <= 0) {
      return null;
    }
    return extraction.weightOut / extraction.weightIn;
  }, [extraction]);

  const handleDelete = () => {
    if (!extraction) return;

    Alert.alert("Delete extraction?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteExtraction(extraction.id);
            router.replace("/(tabs)/extractions");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to delete extraction.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      {loading ? (
        <Card>
          <View style={styles.centerRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.muted}>Loading extraction...</Text>
          </View>
        </Card>
      ) : error && !extraction ? (
        <Card>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Back to Extractions" variant="secondary" onPress={() => router.replace("/(tabs)/extractions")} />
        </Card>
      ) : extraction ? (
        <View style={styles.content}>
          <Card>
            <Text style={styles.beanName}>{beanName}</Text>
            <Text style={styles.meta}>{formatDateTime(extraction.createdAt)}</Text>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Metrics</Text>
            <View style={styles.metricsGrid}>
              <Metric label="Grind" value={formatStep(extraction.grindSetting, 0.25)} />
              <Metric label="Weight In" value={`${formatStep(extraction.weightIn, 0.1)} g`} />
              <Metric label="Weight Out" value={`${formatStep(extraction.weightOut, 0.1)} g`} />
              <Metric label="Time" value={`${extraction.timeSec}s`} />
              <Metric label="Ratio" value={ratio ? `${ratio.toFixed(2)}x` : "-"} />
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={extraction.notes ? styles.notes : styles.muted}>
              {extraction.notes || "No tasting notes recorded."}
            </Text>
          </Card>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button label={deleting ? "Deleting..." : "Delete Extraction"} variant="danger" onPress={handleDelete} disabled={deleting} />
        </View>
      ) : null}
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  beanName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metricItem: {
    flexBasis: "48%",
    backgroundColor: colors.cardElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  metricValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  notes: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
});
