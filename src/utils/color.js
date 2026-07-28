export function hexToRgb(hex) {
  const raw = hex.replace("#", "").trim();
  const normalized =
    raw.length === 3
      ? raw.split("").map((c) => c + c).join("")
      : raw;

  const int = parseInt(normalized, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

export function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function mixHex(a, b, weight = 0.5) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);

  return rgbToHex({
    r: Math.round(ca.r * (1 - weight) + cb.r * weight),
    g: Math.round(ca.g * (1 - weight) + cb.g * weight),
    b: Math.round(ca.b * (1 - weight) + cb.b * weight),
  });
}

export function getReadableTextColor(hex) {
  const { r, g, b } = hexToRgb(hex);

  const srgb = (v) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };

  const luminance = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  return luminance > 0.5 ? "#111111" : "#ffffff";
}