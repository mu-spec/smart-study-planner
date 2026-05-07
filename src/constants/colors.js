const light = {
  bg: "#F4F6FB",
  bgSoft: "#EEF2FF",
  card: "#FFFFFF",
  text: "#121826",
  muted: "#5B6474",
  primary: "#0F62FE",
  accent: "#00A389",
  success: "#16A34A",
  warning: "#D9480F",
  danger: "#DC2626",
  border: "#E2E8F0"
};

const dark = {
  bg: "#0B1220",
  bgSoft: "#111B2E",
  card: "#131D31",
  text: "#E7ECF6",
  muted: "#A9B4C8",
  primary: "#5B8CFF",
  accent: "#11B89B",
  success: "#22C55E",
  warning: "#F97316",
  danger: "#EF4444",
  border: "#22304A"
};

const colors = { ...light };

function withThemePack(base, pack) {
  if (pack === "Ocean") {
    return { ...base, primary: "#0284C7", accent: "#0D9488" };
  }
  if (pack === "Forest") {
    return { ...base, primary: "#15803D", accent: "#0E9F6E" };
  }
  return base;
}

function withContrast(base, enabled) {
  if (!enabled) return base;
  return {
    ...base,
    bg: "#000000",
    card: "#0F0F0F",
    text: "#FFFFFF",
    muted: "#E5E7EB",
    border: "#FFFFFF"
  };
}

export function applyTheme(mode, pack = "Classic", highContrast = false) {
  const base = mode === "dark" ? dark : light;
  const themed = withThemePack(base, pack);
  const finalPalette = withContrast(themed, highContrast);
  Object.keys(colors).forEach((key) => delete colors[key]);
  Object.assign(colors, finalPalette);
}

export default colors;
