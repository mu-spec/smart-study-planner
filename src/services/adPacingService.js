const INTERSTITIAL_ACTION_INTERVAL = 3;
const INTERSTITIAL_COOLDOWN_MS = 2 * 60 * 1000;
const SCREEN_VIEW_DELAY_MS = 35 * 1000;

let generationCount = 0;
let lastInterstitialAt = 0;
let lastScreenInterstitialAt = 0;

export function registerScheduleGeneration() {
  generationCount += 1;
}

export function shouldShowInterstitialNow() {
  if (generationCount < INTERSTITIAL_ACTION_INTERVAL) return false;
  const now = Date.now();
  if (now - lastInterstitialAt < INTERSTITIAL_COOLDOWN_MS) return false;
  return true;
}

export function markInterstitialShown() {
  generationCount = 0;
  lastInterstitialAt = Date.now();
  lastScreenInterstitialAt = Date.now();
}

export function shouldShowScreenInterstitialNow() {
  const now = Date.now();
  return now - lastScreenInterstitialAt >= SCREEN_VIEW_DELAY_MS;
}

export function markScreenInterstitialShown() {
  lastScreenInterstitialAt = Date.now();
}

export function getAdPacingState() {
  return {
    generationCount,
    lastInterstitialAt,
    lastScreenInterstitialAt
  };
}
