import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";

export default function ScreenHeader({ title, onBack }) {
  const { themeMode } = useAppSettings();
  const styles = useMemo(() => createStyles(), [themeMode]);

  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backText}>{"< Back"}</Text>
        </Pressable>
      ) : (
        <View style={styles.sidePlaceholder} />
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.sidePlaceholder} />
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
      marginBottom: 10
    },
    backBtn: {
      paddingVertical: 6,
      paddingHorizontal: 6
    },
    backText: {
      color: colors.primary,
      fontWeight: "700"
    },
    title: {
      color: colors.text,
      fontWeight: "800",
      fontSize: 18
    },
    sidePlaceholder: {
      minWidth: 54
    }
  });
