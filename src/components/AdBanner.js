import React from "react";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { getBannerAdUnitId } from "../config/adConfig";
import { canShowAds, isExpoGo } from "../services/adService";

const adUnitId = getBannerAdUnitId() || TestIds.BANNER;

export default function AdBanner() {
  if (isExpoGo() || !canShowAds()) return null;
  return <BannerAd unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />;
}
