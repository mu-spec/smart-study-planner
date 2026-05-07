import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

const isProd = !__DEV__;

const ids = {
  android: {
    appId:
      process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || "ca-app-pub-7540130362404221~7560134937",
    banner:
      process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID || "ca-app-pub-7540130362404221/7636156550",
    interstitial:
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID || "ca-app-pub-7540130362404221/5009993212"
  },
  ios: {
    appId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || "",
    banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS || "",
    interstitial: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS || ""
  }
};

function platformIds() {
  return Platform.OS === "ios" ? ids.ios : ids.android;
}

export function getBannerAdUnitId() {
  if (!isProd) return TestIds.BANNER;
  return platformIds().banner || TestIds.BANNER;
}

export function getInterstitialAdUnitId() {
  if (!isProd) return TestIds.INTERSTITIAL;
  return platformIds().interstitial || TestIds.INTERSTITIAL;
}

export function hasProductionAdIds() {
  if (!isProd) return true;
  const current = platformIds();
  return Boolean(current.appId && current.banner && current.interstitial);
}
