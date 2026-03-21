import {
  clearColorCache,
  generateDistinctColors,
  getColorForIndex,
} from "./colorGenerator";

// Helper: check if a string is a valid CSS hex color (#rrggbb)
const isHexColor = (s: string) => /^#[0-9a-f]{6}$/.test(s);

// ─── generateDistinctColors ───────────────────────────────────────────────────

describe("generateDistinctColors", () => {
  it("returns an empty array for count = 0", () => {
    expect(generateDistinctColors(0)).toEqual([]);
  });

  it("returns an empty array for negative count", () => {
    expect(generateDistinctColors(-5)).toEqual([]);
  });

  it("returns exactly 1 valid hex color for count = 1", () => {
    const colors = generateDistinctColors(1);
    expect(colors).toHaveLength(1);
    expect(isHexColor(colors[0])).toBe(true);
  });

  it("returns exactly 5 valid hex colors for count = 5", () => {
    const colors = generateDistinctColors(5);
    expect(colors).toHaveLength(5);
    colors.forEach((c) => expect(isHexColor(c)).toBe(true));
  });

  it("returns exactly 10 valid hex colors (all from base hues)", () => {
    const colors = generateDistinctColors(10);
    expect(colors).toHaveLength(10);
    colors.forEach((c) => expect(isHexColor(c)).toBe(true));
  });

  it("returns exactly 15 valid hex colors (exceeds base hues, generates extra)", () => {
    const colors = generateDistinctColors(15);
    expect(colors).toHaveLength(15);
    colors.forEach((c) => expect(isHexColor(c)).toBe(true));
  });

  it("is deterministic for count ≤ 10 (uses fixed base hues)", () => {
    const a = generateDistinctColors(5);
    const b = generateDistinctColors(5);
    expect(a).toEqual(b);
  });
});

// ─── getColorForIndex ─────────────────────────────────────────────────────────

describe("getColorForIndex", () => {
  beforeEach(() => {
    clearColorCache();
  });

  it("returns a valid hex color", () => {
    const color = getColorForIndex(0, 5);
    expect(isHexColor(color)).toBe(true);
  });

  it("returns the same color for the same index and totalCount (cached)", () => {
    const first = getColorForIndex(2, 5);
    const second = getColorForIndex(2, 5);
    expect(first).toBe(second);
  });

  it("returns different colors for different indices within the same total", () => {
    const c0 = getColorForIndex(0, 5);
    const c1 = getColorForIndex(1, 5);
    expect(c0).not.toBe(c1);
  });
});

// ─── clearColorCache ─────────────────────────────────────────────────────────

describe("clearColorCache", () => {
  it("does not throw when called on an empty cache", () => {
    clearColorCache();
    expect(() => clearColorCache()).not.toThrow();
  });

  it("cache is usable again after clearing", () => {
    getColorForIndex(0, 3); // populate cache
    clearColorCache();
    // should not throw and should return a valid color
    const color = getColorForIndex(0, 3);
    expect(isHexColor(color)).toBe(true);
  });
});
