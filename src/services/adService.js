import Constants from "expo-constants";
import { AdsConsent, mobileAds } from "react-native-google-mobile-ads";
import { hasProductionAdIds } from "../config/adConfig";

let adsInitialized = false;

export function isExpoGo() {
  const ownership = Constants?.appOwnership;
  const execEnv = Constants?.executionEnvironment;
  return ownership === "expo" || execEnv === "storeClient";
}

export function canShowAds() {
  return adsInitialized && !isExpoGo();
}

export function getAdsInitState() {
  return adsInitialized;
}

export async function initializeAdsWithConsent() {
  if (adsInitialized) return true;
  if (isExpoGo()) return false;

  try {
    // Request/update consent status and show consent form when needed.
    const consentInfo = await AdsConsent.gatherConsent();
    const canRequestAds = consentInfo?.canRequestAds ?? true;

    if (!canRequestAds) return false;
    if (!hasProductionAdIds() && !__DEV__) return false;

    await mobileAds().initialize();
    adsInitialized = true;
    return true;
  } catch (error) {
    // If consent API fails, keep app running without ads.
    return false;
  }
}
