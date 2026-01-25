import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { Screen } from "@/src/components/Screen";
import { TableRow } from "@/src/components/TableRow";
import { getBeanTypes, getExtractions } from "@/src/storage/repositories";
import { colors, spacing } from "@/src/theme";
import type { BeanType, Extraction } from "@/src/types";
import { formatStepTrimmed } from "@/src/utils/number";

type ExtractionRow = Extraction & { beanName: string };

export default function ExtractionsScreen() {
  const router = useRouter();

  const [beanTypes, setBeanTypes] = useState<BeanType[]>([]);
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [beans, shots] = await Promise.all([getBeanTypes(), getExtractions()]);
      setBeanTypes(beans);
      setExtractions(shots);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load extractions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const beanNameById = useMemo(() => {
    return beanTypes.reduce<Record<string, string>>((acc, bean) => {
      acc[bean.id] = bean.name;
      return acc;
    }, {});
  }, [beanTypes]);

  const rows = useMemo<ExtractionRow[]>(() => {
    return extractions.map((extraction) => ({
      ...extraction,
      beanName: beanNameById[extraction.beanTypeId] ?? "Unknown bean",
    }));
  }, [beanNameById, extractions]);

  const openDetails = (id: string) => router.push(`/extraction/${id}`);
  const goToAdd = () => router.push("/(tabs)/add");

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Extractions</Text>
        <Text style={styles.subtitle}>Newest first. Tap a row for details.</Text>
      </View>

      {loading ? (
        <Card>
          <View style={styles.centerRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.muted}>Loading extractions...</Text>
          </View>
        </Card>
      ) : error ? (
        <Card>
          <Text style={styles.errorText}>{error}</Text>
          <Button label="Retry" variant="secondary" onPress={loadData} />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No extractions yet</Text>
          <Text style={styles.muted}>Log your first shot to start dialing in.</Text>
          <Button label="Add Extraction" onPress={goToAdd} />
        </Card>
      ) : (
        <Card padded={false} style={styles.tableCard}>
          <TableRow
            header
            cells={[
              { key: "bean", text: "Bean", flex: 1.1 },
              { key: "grind", text: "Grind", flex: 0.7, align: "right", monospace: true },
              { key: "in", text: "In", flex: 0.6, align: "right", monospace: true },
              { key: "out", text: "Out", flex: 0.7, align: "right", monospace: true },
              { key: "time", text: "Time", flex: 0.7, align: "right", monospace: true },
              { key: "notes", text: "Notes", flex: 2.2 },
            ]}
          />

          <FlatList
            data={rows}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TableRow
                onPress={() => openDetails(item.id)}
                cells={[
                  { key: "bean", text: item.beanName, flex: 1.1 },
                  {
                    key: "grind",
                    text: formatStepTrimmed(item.grindSetting, 0.25),
                    flex: 0.7,
                    align: "right",
                    monospace: true,
                  },
                  {
                    key: "in",
                    text: formatStepTrimmed(item.weightIn, 0.1),
                    flex: 0.6,
                    align: "right",
                    monospace: true,
                  },
                  {
                    key: "out",
                    text: formatStepTrimmed(item.weightOut, 0.1),
                    flex: 0.7,
                    align: "right",
                    monospace: true,
                  },
                  {
                    key: "time",
                    text: `${item.timeSec}s`,
                    flex: 0.7,
                    align: "right",
                    monospace: true,
                  },
                  {
                    key: "notes",
                    text: item.notes.trim() ? item.notes.trim() : "-",
                    flex: 2.2,
                    lines: 3,
                  },
                ]}
              />
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </Card>
      )}
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
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
  },
  tableCard: {
    flex: 1,
    overflow: "hidden",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.sm,
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
});
