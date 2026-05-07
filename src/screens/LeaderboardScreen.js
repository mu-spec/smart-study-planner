import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTasks } from "../context/TaskContext";
import { getLocalLeaderboard } from "../services/leaderboardService";
import DecorativeBackground from "../components/DecorativeBackground";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";

export default function LeaderboardScreen({ navigation }) {
  const { themeMode } = useAppSettings();
  const { tasks } = useTasks();
  const styles = useMemo(() => createStyles(), [themeMode]);
  const leaders = getLocalLeaderboard(tasks);

  return (
    <View style={styles.container}>
      <DecorativeBackground />
      <ScrollView contentContainerStyle={styles.wrap}>
        <ScreenHeader title="Leaderboard" onBack={navigation?.goBack} />
        {leaders.map((item) => (
          <View key={`${item.name}-${item.rank}`} style={styles.card}>
            <Text style={styles.name}>#{item.rank} {item.name}</Text>
            <Text style={styles.meta}>Points: {item.points} | Streak: {item.streak}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
    wrap: { paddingBottom: 24 },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 12,
      marginBottom: 10
    },
    name: { color: colors.text, fontWeight: "800", marginBottom: 3 },
    meta: { color: colors.muted }
  });
