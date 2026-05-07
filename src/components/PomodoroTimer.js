import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";

function asClock(totalSeconds) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function PomodoroTimer({ onSessionComplete }) {
  const { themeMode } = useAppSettings();
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const styles = useMemo(() => createStyles(), [themeMode]);

  useEffect(() => {
    if (!running) return undefined;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRunning(false);
          onSessionComplete?.(sessionMinutes);
          return sessionMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, onSessionComplete, sessionMinutes]);

  const progress = useMemo(() => {
    const total = sessionMinutes * 60;
    return total ? Math.round(((total - secondsLeft) / total) * 100) : 0;
  }, [secondsLeft, sessionMinutes]);

  const reset = () => {
    setRunning(false);
    setSecondsLeft(sessionMinutes * 60);
  };

  const setMode = (minutes) => {
    setSessionMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setRunning(false);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Focus Timer</Text>
      <Text style={styles.clock}>{asClock(secondsLeft)}</Text>
      <Text style={styles.progress}>{progress}% complete</Text>

      <View style={styles.modeRow}>
        {[25, 50, 15].map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            style={[styles.mode, sessionMinutes === m && styles.modeActive]}
          >
            <Text style={[styles.modeText, sessionMinutes === m && styles.modeTextActive]}>
              {m}m
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.primary} onPress={() => setRunning((s) => !s)}>
          <Text style={styles.primaryText}>{running ? "Pause" : "Start"}</Text>
        </Pressable>
        <Pressable style={styles.ghost} onPress={reset}>
          <Text style={styles.ghostText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14
  },
  title: {
    color: colors.text,
    fontWeight: "800",
    marginBottom: 6
  },
  clock: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900"
  },
  progress: {
    color: colors.muted,
    marginBottom: 10
  },
  modeRow: {
    flexDirection: "row",
    marginBottom: 10
  },
  mode: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: colors.bgSoft
  },
  modeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  modeText: {
    color: colors.text,
    fontWeight: "700"
  },
  modeTextActive: {
    color: "#FFFFFF"
  },
  actionRow: {
    flexDirection: "row"
  },
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    flex: 1,
    marginRight: 8
  },
  primaryText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "800"
  },
  ghost: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    flex: 1
  },
  ghostText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "700"
  }
});
