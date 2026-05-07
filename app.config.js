const TEST_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const TEST_IOS_APP_ID = "ca-app-pub-3940256099942544~1458002511";

module.exports = () => {
  const isProductionBuild =
    process.env.EAS_BUILD_PROFILE === "production" || process.env.NODE_ENV === "production";

  const androidAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || TEST_ANDROID_APP_ID;
  const iosAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || TEST_IOS_APP_ID;

  // Prevent shipping a production build with AdMob test app IDs.
  if (isProductionBuild && androidAppId === TEST_ANDROID_APP_ID) {
    throw new Error(
      "Missing EXPO_PUBLIC_ADMOB_APP_ID_ANDROID for production build. Set a real AdMob app ID before building."
    );
  }

  return {
    expo: {
      name: "AI Smart Study Planner",
      slug: "ai-smart-study-planner",
      version: "1.0.0",
      orientation: "portrait",
      userInterfaceStyle: "light",
      icon: "./assets/icon.png",
      splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#F4F6FB"
      },
      assetBundlePatterns: ["**/*"],
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#14213D"
        },
        splash: {
          image: "./assets/splash-icon.png",
          resizeMode: "contain",
          backgroundColor: "#F4F6FB"
        },
        package: "com.yourcompany.aismartstudyplanner"
      },
      "react-native-google-mobile-ads": {
        android_app_id: androidAppId,
        ios_app_id: iosAppId
      },
      plugins: [
        "expo-asset",
        "expo-web-browser",
        [
          "react-native-google-mobile-ads",
          {
            androidAppId,
            iosAppId
          }
        ],
        "expo-notifications"
      ],
      extra: {
        eas: {
          projectId: "e6c33a8c-560d-4004-bb4e-069906193ff1"
        }
      }
    }
  };
};
