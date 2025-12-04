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
 * Generate N visually distinct colors with good contrast, this is a very
 * expensive operation due to distance checks, but the good news is that we only
 * run this once since we have caching mechanism. :D
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

  // Use all base hues first
  baseHues.forEach((hue) => {
    colors.push(hslToHex(hue, saturation, lightness));
  });

  // Minimum distance that human eyes can distinguish (at least 15 degrees)
  // But if there are too many colors, we need to reduce this distance
  const minDistance = Math.max(15, 360 / count);

  // Generate remaining colors with sufficient hue distance
  const maxAttempts = 1000;

  // worst case: `maxAttempts` * `n` colors, but usually much less due to early breaks
  while (colors.length < count) {
    let foundValidHue = false;
    let attempts = 0;

    while (!foundValidHue && attempts < maxAttempts) {
      attempts++;
      const candidateHue = Math.random() * 360;

      // Check if this hue is sufficiently distant from all existing hues
      const isDistinct = baseHues.every((existingHue) => {
        const distance = Math.min(
          Math.abs(candidateHue - existingHue),
          360 - Math.abs(candidateHue - existingHue),
        );
        return distance >= minDistance;
      });

      if (isDistinct) {
        colors.push(hslToHex(candidateHue, saturation, lightness));
        baseHues.push(candidateHue);
        foundValidHue = true;
      }
    }

    // If we couldn't find a valid hue after max attempts, just add any color
    // This prevents infinite loops when there are too many colors
    if (!foundValidHue) {
      const fallbackHue = Math.random() * 360;
      colors.push(hslToHex(fallbackHue, saturation, lightness));
      baseHues.push(fallbackHue);
    }
  }

  return colors;
}

// Generating colors is expensive, it's O(n^2) in worst case due to distance
// checks so cache to store generated colors for each count.
// Since this is a utility module, the cache will persist as long as the app
// is running.
const colorCache = new Map<number, string[]>();

/**
 * Get a color for a specific index
 */
export function getColorForIndex(index: number, totalCount: number): string {
  // Check if we have cached colors for this count
  if (!colorCache.has(totalCount)) {
    // Generate all colors at once and cache them
    colorCache.set(totalCount, generateDistinctColors(totalCount));
  }

  const allColors = colorCache.get(totalCount)!;
  return allColors[index];
}

/**
 * Clear the color cache (useful when you want to regenerate colors)
 */
export function clearColorCache(): void {
  colorCache.clear();
}
