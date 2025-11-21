/**
 * Generates distinct colors with good contrast for data visualization
 * Uses HSL color space for better perceptual distribution
 */

/**
 * Convert HSL to Hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Calculate relative luminance for contrast checking
 * Based on WCAG guidelines
 */
function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = ((rgb >> 16) & 0xff) / 255;
  const g = ((rgb >> 8) & 0xff) / 255;
  const b = (rgb & 0xff) / 255;

  const [rs, gs, bs] = [r, g, b].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color has sufficient contrast with existing colors
 */
function hasSufficientContrast(
  newColor: string,
  existingColors: string[],
  minContrast: number = 2.0,
): boolean {
  return existingColors.every(
    (color) => getContrastRatio(newColor, color) >= minContrast,
  );
}

/**
 * Generate N visually distinct colors with good contrast
 * @param count Number of colors to generate
 * @param saturation Saturation level (0-100), default 70
 * @param lightness Lightness level (0-100), default 55
 * @returns Array of hex color strings
 */
export function generateDistinctColors(
  count: number,
  saturation: number = 70,
  lightness: number = 55,
): string[] {
  if (count <= 0) return [];

  const colors: string[] = [];
  const goldenRatioConjugate = 0.618033988749895;

  // Base hues that provide good starting points
  const baseHues = [
    230, // blue
    270, // purple
    330, // pink
    30, // orange
    160, // green-cyan
    0, // red
    180, // cyan
    50, // yellow-orange
    200, // light blue
    300, // magenta
  ];

  // First, use the base hues if we need fewer colors
  if (count <= baseHues.length) {
    return baseHues
      .slice(0, count)
      .map((hue) => hslToHex(hue, saturation, lightness));
  }

  // For more colors, use golden ratio distribution with contrast checking
  let hue = Math.random() * 360;
  let attempts = 0;
  const maxAttempts = count * 50;

  while (colors.length < count && attempts < maxAttempts) {
    attempts++;

    // Generate candidate color
    hue = (hue + goldenRatioConjugate * 360) % 360;

    // Vary saturation and lightness slightly for more variety
    const variedSaturation = saturation + (Math.random() - 0.5) * 20;
    const variedLightness = lightness + (Math.random() - 0.5) * 15;

    const candidateColor = hslToHex(
      hue,
      Math.max(50, Math.min(90, variedSaturation)),
      Math.max(40, Math.min(70, variedLightness)),
    );

    // Check contrast with existing colors
    if (colors.length === 0 || hasSufficientContrast(candidateColor, colors)) {
      colors.push(candidateColor);
    }
  }

  // If we couldn't generate enough colors with good contrast,
  // fill remaining with variations
  while (colors.length < count) {
    hue = (hue + 360 / count) % 360;
    const fallbackColor = hslToHex(hue, saturation, lightness);
    colors.push(fallbackColor);
  }

  return colors;
}

/**
 * Get a color for a specific index, generating more if needed
 * This provides a stable color for each index across renders
 */
export function getColorForIndex(index: number, totalCount: number): string {
  // Generate all colors at once for consistency
  const allColors = generateDistinctColors(totalCount);
  return allColors[index];
}
