import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { InputField } from "@/src/components/InputField";
import { Screen } from "@/src/components/Screen";
import { addBeanType, deleteBeanType, getBeanTypes } from "@/src/storage/repositories";
import { colors, spacing } from "@/src/theme";
import type { BeanType } from "@/src/types";

export default function SettingsScreen() {
  const [beanTypes, setBeanTypes] = useState<BeanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [beanName, setBeanName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  const loadBeanTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const beans = await getBeanTypes();
      setBeanTypes(beans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bean types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBeanTypes();
    }, [loadBeanTypes])
  );

  const handleAdd = async () => {
    setMessage(null);
    setMessageType(null);

    if (!beanName.trim()) {
      setMessage("Bean name is required.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    try {
      await addBeanType(beanName);
      setBeanName("");
      setMessage("Bean type added.");
      setMessageType("success");
      loadBeanTypes();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to add bean type.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (bean: BeanType) => {
    Alert.alert("Delete bean type?", `Remove ${bean.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDelete(bean),
      },
    ]);
  };

  const handleDelete = async (bean: BeanType) => {
    setMessage(null);
    setMessageType(null);

    try {
      const result = await deleteBeanType(bean.id);
      if (!result.ok) {
        setMessage(`Cannot delete. ${result.count} extraction(s) use this bean.`);
        setMessageType("error");
        return;
      }

      setMessage("Bean type deleted.");
      setMessageType("success");
      loadBeanTypes();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to delete bean type.");
      setMessageType("error");
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your bean types.</Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Bean Types</Text>
        <InputField
          label="New Bean Type"
          value={beanName}
          onChangeText={setBeanName}
          placeholder="e.g. Ethiopia Guji"
          inputProps={{ autoCapitalize: "words", returnKeyType: "done" }}
        />
        <Button label={saving ? "Adding..." : "Add Bean Type"} onPress={handleAdd} disabled={saving} />

        {message ? (
          <Text style={messageType === "error" ? styles.errorText : styles.successText}>{message}</Text>
        ) : null}

        {loading ? (
          <Text style={styles.muted}>Loading bean types...</Text>
        ) : error ? (
          <View style={styles.listBlock}>
            <Text style={styles.errorText}>{error}</Text>
            <Button label="Retry" variant="secondary" onPress={loadBeanTypes} />
          </View>
        ) : beanTypes.length === 0 ? (
          <Text style={styles.muted}>No bean types yet.</Text>
        ) : (
          <View style={styles.listBlock}>
            {beanTypes.map((bean) => (
              <View key={bean.id} style={styles.beanRow}>
                <View style={styles.beanInfo}>
                  <Text style={styles.beanName}>{bean.name}</Text>
                  <Text style={styles.beanMeta}>{new Date(bean.createdAt).toLocaleDateString()}</Text>
                </View>
                <Button label="Delete" variant="danger" size="compact" onPress={() => confirmDelete(bean)} />
              </View>
            ))}
          </View>
        )}
      </Card>
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
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  listBlock: {
    gap: spacing.sm,
  },
  beanRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  beanInfo: {
    flex: 1,
    gap: 2,
  },
  beanName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  beanMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
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
});
