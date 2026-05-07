import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";

export default function ProgressChart({ completed, pending }) {
  const { themeMode } = useAppSettings();
  const styles = useMemo(() => createStyles(), [themeMode]);
  const total = completed + pending;
  const completedPercent = total ? Math.round((completed / total) * 100) : 0;
  const pendingPercent = total ? 100 - completedPercent : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Progress</Text>
      <View style={styles.bar}>
        <View style={[styles.completed, { flex: completed || 0 }]} />
        <View style={[styles.pending, { flex: pending || 0 }]} />
      </View>
      <View style={styles.legendRow}>
        <Text style={styles.legend}>Completed: {completed} ({completedPercent}%)</Text>
        <Text style={styles.legend}>Pending: {pending} ({pendingPercent}%)</Text>
      </View>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12
  },
  bar: {
    height: 18,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
    flexDirection: "row"
  },
  completed: {
    backgroundColor: colors.success
  },
  pending: {
    backgroundColor: colors.warning
  },
  legendRow: {
    marginTop: 10
  },
  legend: {
    color: colors.muted,
    marginBottom: 4
  }
});
