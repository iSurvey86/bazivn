/**
 * Lookup tables — Shen Sha Catalog v2.0 (San Ming / Zi Ping traditional).
 */

/** 天德 — month branch → target stem OR branch. */
export const TIAN_DE: Record<string, string> = {
  寅: "丁",
  卯: "申",
  辰: "壬",
  巳: "辛",
  午: "亥",
  未: "甲",
  申: "癸",
  酉: "寅",
  戌: "丙",
  亥: "乙",
  子: "巳",
  丑: "庚",
};

/** 月德 — month branch → stem. */
export const YUE_DE: Record<string, string> = {
  寅: "丙",
  午: "丙",
  戌: "丙",
  亥: "甲",
  卯: "甲",
  未: "甲",
  申: "壬",
  子: "壬",
  辰: "壬",
  巳: "庚",
  酉: "庚",
  丑: "庚",
};

export const BRANCH_ORDER = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;

export const BRANCH_CLASH: Record<string, string> = {
  子: "午",
  午: "子",
  丑: "未",
  未: "丑",
  寅: "申",
  申: "寅",
  卯: "酉",
  酉: "卯",
  辰: "戌",
  戌: "辰",
  巳: "亥",
  亥: "巳",
};

export const YANG_STEMS = new Set(["甲", "丙", "戊", "庚", "壬"]);

export const KUI_GANG_DAYS = new Set(["庚辰", "壬辰", "戊戌", "庚戌"]);

export const YIN_YANG_MISALIGNMENT_DAYS = new Set([
  "丙子",
  "丁丑",
  "戊寅",
  "辛卯",
  "壬辰",
  "癸巳",
  "丙午",
  "丁未",
  "戊申",
  "辛酉",
  "壬戌",
  "癸亥",
]);

/** Season group by month branch → waste day pillars. */
export const FOUR_WASTE_BY_SEASON: Record<
  string,
  { season: "xuân" | "hạ" | "thu" | "đông"; days: string[] }
> = {
  寅: { season: "xuân", days: ["庚申", "辛酉"] },
  卯: { season: "xuân", days: ["庚申", "辛酉"] },
  辰: { season: "xuân", days: ["庚申", "辛酉"] },
  巳: { season: "hạ", days: ["壬子", "癸亥"] },
  午: { season: "hạ", days: ["壬子", "癸亥"] },
  未: { season: "hạ", days: ["壬子", "癸亥"] },
  申: { season: "thu", days: ["甲寅", "乙卯"] },
  酉: { season: "thu", days: ["甲寅", "乙卯"] },
  戌: { season: "thu", days: ["甲寅", "乙卯"] },
  亥: { season: "đông", days: ["丙午", "丁未"] },
  子: { season: "đông", days: ["丙午", "丁未"] },
  丑: { season: "đông", days: ["丙午", "丁未"] },
};

export const TEN_EVIL_BASE_DAYS = new Set([
  "甲辰",
  "乙巳",
  "丙申",
  "丁亥",
  "戊戌",
  "己丑",
  "庚辰",
  "辛巳",
  "壬申",
  "癸亥",
]);

/** Refined year-day pairs (年干支 → 日干支). */
export const TEN_EVIL_REFINED_YEAR_DAY: Record<string, string> = {
  庚戌: "甲辰",
  辛亥: "乙巳",
  壬寅: "丙申",
  癸巳: "丁亥",
  甲辰: "戊戌",
  乙未: "己丑",
  甲戌: "庚辰",
  乙亥: "辛巳",
  丙寅: "壬申",
  丁巳: "癸亥",
};

export function branchIndex(zhi: string): number {
  return BRANCH_ORDER.indexOf(zhi as (typeof BRANCH_ORDER)[number]);
}

export function branchPlus(zhi: string, delta: number): string {
  const i = branchIndex(zhi);
  if (i < 0) return "";
  return BRANCH_ORDER[(i + delta + 12) % 12]!;
}

export function isYangStem(gan: string): boolean {
  return YANG_STEMS.has(gan);
}
