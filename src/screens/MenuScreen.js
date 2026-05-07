import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";
import ScreenHeader from "../components/ScreenHeader";
import DecorativeBackground from "../components/DecorativeBackground";

const tiles = [
  { key: "AddTask", label: "Add Task" },
  { key: "Calendar", label: "Calendar" },
  { key: "Progress", label: "Progress" },
  { key: "ExamPlanner", label: "Exam Planner" },
  { key: "Report", label: "Weekly Report" },
  { key: "Leaderboard", label: "Leaderboard" },
  { key: "Recovery", label: "Recovery Plan" },
  { key: "Settings", label: "Settings" }
];

export default function MenuScreen({ navigation }) {
  const { themeMode } = useAppSettings();
  const styles = useMemo(() => createStyles(), [themeMode]);
  return (
    <View style={styles.container}>
      <DecorativeBackground />
      <ScreenHeader title="Menu" onBack={navigation?.goBack} />
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.key}
            style={styles.card}
            onPress={() => navigation?.navigate?.(tile.key)}
          >
            <Text style={styles.cardText}>{tile.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  card: {
    width: "48%",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  cardText: {
    color: colors.text,
    fontWeight: "700",
    textAlign: "center"
  }
});
