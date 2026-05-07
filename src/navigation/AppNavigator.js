import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabsScreen from "../screens/MainTabsScreen";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { themeMode } = useAppSettings();
  const _isDark = themeMode === "dark";

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card, height: _isDark ? 96 : 92 },
          headerTitleStyle: { color: colors.text, fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg }
        }}
      >
        <Stack.Screen name="Main" component={MainTabsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
