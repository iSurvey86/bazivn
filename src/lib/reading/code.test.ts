import { describe, expect, it } from "vitest";
import {
  formatReadingCodeDisplay,
  generateReadingCodeOnce,
  isValidReadingCode,
  normalizeReadingCode,
} from "@/lib/reading/code";

describe("reading code rules", () => {
  it("accepts valid 8-char unique mixed codes (safe alphabet)", () => {
    expect(isValidReadingCode("A2B3C4D5")).toBe(true);
    expect(isValidReadingCode("ABCDEFGH")).toBe(false); // no digit
    expect(isValidReadingCode("23456789")).toBe(false); // no letter
    expect(isValidReadingCode("A2B3C4D4")).toBe(false); // repeat
    expect(isValidReadingCode("A2B3C4D")).toBe(false); // length
    expect(isValidReadingCode("a2b3c4d5")).toBe(false); // lowercase
    // Ambiguous chars rejected
    expect(isValidReadingCode("A1B2C3D4")).toBe(false); // has 1
    expect(isValidReadingCode("A0B2C3D4")).toBe(false); // has 0
    expect(isValidReadingCode("AIB2C3D4")).toBe(false); // has I
    expect(isValidReadingCode("AOB2C3D4")).toBe(false); // has O
  });

  it("only uppercases; rejects dashes/spaces/ambiguous after normalize", () => {
    expect(normalizeReadingCode("a2b3c4d5")).toBe("A2B3C4D5");
    expect(isValidReadingCode(normalizeReadingCode("a2b3c4d5"))).toBe(true);
    expect(isValidReadingCode(normalizeReadingCode("k7p2-h9mx"))).toBe(false);
    expect(isValidReadingCode(normalizeReadingCode(" k7p2h9mx"))).toBe(false);
    expect(isValidReadingCode(normalizeReadingCode("a1b2c3d4"))).toBe(false);
    expect(formatReadingCodeDisplay("a2b3c4d5")).toBe("A2B3C4D5");
  });

  it("generates codes matching all rules", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const code = generateReadingCodeOnce();
      expect(isValidReadingCode(code)).toBe(true);
      expect(code).toHaveLength(8);
      expect(new Set(code).size).toBe(8);
      expect(/[A-Z]/.test(code)).toBe(true);
      expect(/[2-9]/.test(code)).toBe(true);
      expect(/[01IO]/.test(code)).toBe(false);
      seen.add(code);
    }
    expect(seen.size).toBe(200);
  });
});
