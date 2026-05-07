import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { InterstitialAd, AdEventType } from "react-native-google-mobile-ads";
import HomeScreen from "./HomeScreen";
import CalendarScreen from "./CalendarScreen";
import AddTaskScreen from "./AddTaskScreen";
import ProgressScreen from "./ProgressScreen";
import ExamPlannerScreen from "./ExamPlannerScreen";
import WeeklyReportScreen from "./WeeklyReportScreen";
import SettingsScreen from "./SettingsScreen";
import MenuScreen from "./MenuScreen";
import LeaderboardScreen from "./LeaderboardScreen";
import RecoveryPlannerScreen from "./RecoveryPlannerScreen";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";
import ErrorBoundary from "../components/ErrorBoundary";
import AdBanner from "../components/AdBanner";
import { canShowAds, isExpoGo } from "../services/adService";
import { getInterstitialAdUnitId } from "../config/adConfig";
import {
  markScreenInterstitialShown,
  shouldShowScreenInterstitialNow
} from "../services/adPacingService";

const interstitialUnitId = getInterstitialAdUnitId();

const tabs = [
  { key: "Home", label: "Home" },
  { key: "Calendar", label: "Calendar" },
  { key: "Add", label: "Add" },
  { key: "Progress", label: "Progress" },
  { key: "Menu", label: "Menu" }
];

export default function MainTabsScreen() {
  const { themeMode, highContrast, themePack } = useAppSettings();
  const [active, setActive] = useState("Home");
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(insets),
    [themeMode, highContrast, themePack, insets]
  );

  const tabNavigation = useMemo(
    () => ({
      navigate: (name) => {
        const map = {
          AddTask: "Add",
          Calendar: "Calendar",
          Progress: "Progress",
          ExamPlanner: "ExamPlanner",
          Report: "Report",
          Leaderboard: "Leaderboard",
          Recovery: "Recovery",
          Settings: "Settings",
          Menu: "Menu"
        };
        setActive(map[name] || "Home");
      },
      goBack: () => setActive("Home")
    }),
    []
  );

  const content = useMemo(() => {
    switch (active) {
      case "Calendar":
        return (
          <ErrorBoundary>
            <CalendarScreen navigation={tabNavigation} />
          </ErrorBoundary>
        );
      case "Add":
        return (
          <ErrorBoundary>
            <AddTaskScreen navigation={tabNavigation} />
          </ErrorBoundary>
        );
      case "Progress":
        return (
          <ErrorBoundary>
            <ProgressScreen navigation={tabNavigation} />
          </ErrorBoundary>
        );
      case "Menu":
        return (
          <ErrorBoundary>
            <MenuScreen navigation={tabNavigation} />
          </ErrorBoundary>
        );
      case "ExamPlanner":
        return (
          <ErrorBoundary>
            <ExamPlannerScreen navigation={tabNavigation} />
          </ErrorBoundary>
        );
      case "Report":
        return (
          <ErrorBoundary>
            <WeeklyReportScreen navigation={tabNavigation} />
          </ErrorBoundary>
        );
      case "Settings":
        return (
          <ErrorBoundary>
            <SettingsScreen navigation={tabNavigation} />
          </ErrorBoundary>
        );
      case "Leaderboard":
        return (
          <ErrorBoundary>
            <LeaderboardScreen navigation={tabNavigation} />
          </ErrorBoundary>
        );
      case "Recovery":
        return (
          <ErrorBoundary>
            <RecoveryPlannerScreen navigation={tabNavigation} />
          </ErrorBoundary>
        );
      case "Home":
      default:
        return (
          <ErrorBoundary>
            <HomeScreen navigation={tabNavigation} />
          </ErrorBoundary>
        );
    }
  }, [active, tabNavigation]);

  React.useEffect(() => {
    if (!canShowAds() || isExpoGo() || !shouldShowScreenInterstitialNow()) return undefined;
    const timer = setTimeout(() => {
      const interstitial = InterstitialAd.createForAdRequest(interstitialUnitId);
      const unsub = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        markScreenInterstitialShown();
        interstitial.show();
      });
      interstitial.load();
      setTimeout(() => unsub(), 5000);
    }, 12000);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <SafeAreaView style={styles.root} edges={[]}>
      <View style={styles.content}>{content}</View>
      <View style={styles.bannerWrap}>
        <AdBanner />
      </View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          const isPrimary = tab.key === "Add";
          return (
            <Pressable
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive, isPrimary && styles.tabItemPrimary]}
              onPress={() => setActive(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                  isPrimary && styles.tabTextPrimary
                ]}
              >
                {tab.label}
              </Text>
              {isActive && !isPrimary ? <View style={styles.activeDot} /> : null}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (insets) =>
  StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg
  },
  content: {
    flex: 1,
    paddingBottom: 2
  },
  bannerWrap: {
    backgroundColor: colors.bg
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.card,
    paddingBottom: 12 + (insets?.bottom || 0),
    paddingTop: 6,
    marginHorizontal: 14,
    marginBottom: 0,
    borderRadius: 18,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  tabItemPrimary: {
    backgroundColor: colors.primary,
    marginTop: -10,
    marginBottom: 6,
    borderRadius: 16
  },
  tabItemActive: {
    backgroundColor: colors.bgSoft
  },
  tabText: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12
  },
  tabTextPrimary: {
    color: "#FFFFFF",
    fontWeight: "800"
  },
  tabTextActive: {
    color: colors.primary
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
    marginTop: 4
  }
});
