import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { TaskProvider } from "./src/context/TaskContext";
import { AppSettingsProvider } from "./src/context/AppSettingsContext";
import { requestNotificationPermissions } from "./src/services/notificationService";
import { initializeAdsWithConsent } from "./src/services/adService";
import { logEvent } from "./src/services/eventLogService";

export default function App() {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    logEvent("app_open");
    // Defer non-critical startup work to reduce perceived launch time.
    const timer = setTimeout(() => {
      initializeAdsWithConsent();
      requestNotificationPermissions();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (showLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingTitle}>Loading, please wait.</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <TaskProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </TaskProvider>
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F6FB"
  },
  loadingTitle: {
    color: "#14213D",
    fontSize: 18,
    fontWeight: "700"
  }
});
