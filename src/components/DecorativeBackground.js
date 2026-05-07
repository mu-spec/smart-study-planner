import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";

export default function DecorativeBackground() {
  const { themeMode } = useAppSettings();
  const styles = useMemo(() => createStyles(), [themeMode]);
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobMid]} />
      <View style={[styles.blob, styles.blobBottom]} />
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.2
  },
  blobTop: {
    width: 240,
    height: 240,
    backgroundColor: colors.primary,
    top: -110,
    right: -80
  },
  blobMid: {
    width: 180,
    height: 180,
    backgroundColor: colors.accent,
    top: 220,
    left: -70
  },
  blobBottom: {
    width: 220,
    height: 220,
    backgroundColor: colors.primary,
    bottom: -120,
    right: -90
  }
});
