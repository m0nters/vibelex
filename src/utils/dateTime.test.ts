import { formatTimestampDetail } from "./dateTime";

describe("formatTimestampDetail", () => {
  // Use a fixed, unambiguous UTC timestamp: 2024-01-15 10:30:45 UTC
  const FIXED_TIMESTAMP = new Date("2024-01-15T10:30:45Z").getTime();

  it("returns a non-empty string", () => {
    const result = formatTimestampDetail(FIXED_TIMESTAMP, "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("includes the year in the formatted output (en-US)", () => {
    const result = formatTimestampDetail(FIXED_TIMESTAMP, "en-US");
    expect(result).toContain("2024");
  });

  it("includes hour and minute digits in its output", () => {
    // Check that time-related digits appear. The exact format is locale-dependent,
    // but at least two colon-separated number groups should be present.
    const result = formatTimestampDetail(FIXED_TIMESTAMP, "en-US");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("produces different output for different locales", () => {
    const enUS = formatTimestampDetail(FIXED_TIMESTAMP, "en-US");
    const vi = formatTimestampDetail(FIXED_TIMESTAMP, "vi-VN");
    // Language-specific strings differ (e.g. weekday names)
    expect(enUS).not.toBe(vi);
  });

  it("handles a timestamp of 0 (Unix epoch) without throwing", () => {
    expect(() => formatTimestampDetail(0, "en-US")).not.toThrow();
  });
});
