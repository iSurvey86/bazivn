/**
 * Compute Shen Sha Catalog v2.0 additions + special day markers.
 * Does not modify Core calendar / pillars / relations.
 */

import { getChangSheng } from "@/lib/core/chang-sheng";
import { DAY_STEM_LU } from "@/lib/core/daymaster-qi";
import {
  BRANCH_CLASH,
  branchPlus,
  FOUR_WASTE_BY_SEASON,
  isYangStem,
  KUI_GANG_DAYS,
  TEN_EVIL_BASE_DAYS,
  TEN_EVIL_REFINED_YEAR_DAY,
  TIAN_DE,
  YIN_YANG_MISALIGNMENT_DAYS,
  YUE_DE,
} from "./tables-v2";
import {
  SHEN_SHA_CATALOG_VERSION,
  toInternalTone,
  type PillarSlot,
  type ShenShaItem,
  type SpecialDayMarkers,
  type TraditionalToneDisplay,
} from "./types";

export type PillarGanZhi = { gan: string; zhi: string };

export type NatalPillars = {
  year: PillarGanZhi;
  month: PillarGanZhi;
  day: PillarGanZhi;
  hour: PillarGanZhi;
};

const SLOTS: PillarSlot[] = ["year", "month", "day", "hour"];

function pushStar(
  list: ShenShaItem[],
  partial: Omit<ShenShaItem, "weightClass"> & { weightClass?: "auxiliary" },
) {
  if (list.some((s) => s.key === partial.key)) return;
  const display = partial.traditionalToneDisplay ?? "trung";
  list.push({
    ...partial,
    vietnameseName: partial.vietnameseName ?? partial.name,
    weightClass: "auxiliary",
    traditionalTone: partial.traditionalTone ?? toInternalTone(display),
    traditionalToneDisplay: display,
    type:
      partial.type ??
      (display === "hung" ? "hung" : display === "trung" ? "auxiliary" : "cat"),
  });
}

/** Branch where day stem is 长生 (Học Đường). */
export function xueTangBranch(dayStem: string): string | null {
  for (const z of "子丑寅卯辰巳午未申酉戌亥") {
    if (getChangSheng(dayStem, z) === "长生") return z;
  }
  return null;
}

/** Branch where day stem is 临官 (Từ Quán) — equals Lộc, but not emitted as lu. */
export function ciGuanBranch(dayStem: string): string | null {
  for (const z of "子丑寅卯辰巳午未申酉戌亥") {
    if (getChangSheng(dayStem, z) === "临官") return z;
  }
  return DAY_STEM_LU[dayStem] ?? null;
}

/** 金舆 = Lộc + 2 chi. */
export function jinYuBranch(dayStem: string): string | null {
  const lu = DAY_STEM_LU[dayStem];
  if (!lu) return null;
  return branchPlus(lu, 2) || null;
}

/**
 * 元辰 — 《三命通會》:
 * Dương nam / Âm nữ: xung niên chi rồi tiến 1.
 * Âm nam / Dương nữ: xung niên chi rồi lùi 1.
 */
export function yuanChenBranch(
  yearStem: string,
  yearBranch: string,
  gender: "male" | "female",
): string | null {
  const clash = BRANCH_CLASH[yearBranch];
  if (!clash) return null;
  const yang = isYangStem(yearStem);
  const forward =
    (yang && gender === "male") || (!yang && gender === "female");
  return branchPlus(clash, forward ? 1 : -1) || null;
}

function matchGlyph(
  target: string,
  pillars: NatalPillars,
): PillarSlot[] {
  const hits: PillarSlot[] = [];
  for (const slot of SLOTS) {
    const p = pillars[slot];
    if (p.gan === target || p.zhi === target) hits.push(slot);
  }
  return hits;
}

function matchBranch(target: string, pillars: NatalPillars): PillarSlot[] {
  const hits: PillarSlot[] = [];
  for (const slot of SLOTS) {
    if (pillars[slot].zhi === target) hits.push(slot);
  }
  return hits;
}

function matchStem(target: string, pillars: NatalPillars): PillarSlot[] {
  const hits: PillarSlot[] = [];
  for (const slot of SLOTS) {
    if (pillars[slot].gan === target) hits.push(slot);
  }
  return hits;
}

/**
 * Day-stem branch stars (Học Đường / Từ Quán / Kim Dư) —
 * safe to apply on natal or DaYun/LiuNian branch columns.
 */
export function computeDayStemBranchStarsV2(
  pillarZhi: string,
  dayStem: string,
): ShenShaItem[] {
  const stars: ShenShaItem[] = [];
  const xt = xueTangBranch(dayStem);
  if (xt && pillarZhi === xt) {
    pushStar(stars, {
      key: "xue_tang",
      name: "Học Đường",
      chineseName: "学堂",
      vietnameseName: "Học Đường",
      sourceId: "sanming.xuetang.dayStemChangSheng.v1",
      category: "văn_tinh",
      lookupBasis: "dayStem→changShengBranch",
      ruleVariant: "sanming.dayStemChangSheng",
      traditionalToneDisplay: "cát",
      priorityClass: "A_MINUS",
      evidence: `Nhật can ${dayStem} Trường Sinh tại ${xt}`,
    });
  }
  const cg = ciGuanBranch(dayStem);
  if (cg && pillarZhi === cg) {
    pushStar(stars, {
      key: "ci_guan",
      name: "Từ Quán",
      chineseName: "词馆",
      vietnameseName: "Từ Quán",
      sourceId: "sanming.ciguan.dayStemLinGuan.v1",
      category: "văn_tinh",
      lookupBasis: "dayStem→linGuanBranch",
      ruleVariant: "sanming.dayStemLinGuan",
      traditionalToneDisplay: "cát",
      priorityClass: "A_MINUS",
      evidence: `Nhật can ${dayStem} Lâm Quan tại ${cg}`,
    });
  }
  const jy = jinYuBranch(dayStem);
  if (jy && pillarZhi === jy) {
    pushStar(stars, {
      key: "jin_yu",
      name: "Kim Dư",
      chineseName: "金舆",
      vietnameseName: "Kim Dư",
      sourceId: "sanming.jinyu.luPlus2.v1",
      category: "xe_cư",
      lookupBasis: "dayStemLu+2",
      ruleVariant: "sanming.jinyu.luPlus2",
      traditionalToneDisplay: "cát",
      priorityClass: "B",
      evidence: `Lộc ${DAY_STEM_LU[dayStem]} + 2 → ${jy}`,
    });
  }
  return stars;
}

/** Natal-only v2 stars (Đức / Nguyên Thần / La Võng). */
export function computeNatalStarsV2(params: {
  pillars: NatalPillars;
  gender: "male" | "female";
}): Record<PillarSlot, ShenShaItem[]> & { summaryExtras: ShenShaItem[] } {
  const { pillars, gender } = params;
  const out: Record<PillarSlot, ShenShaItem[]> = {
    year: [],
    month: [],
    day: [],
    hour: [],
  };
  const summaryExtras: ShenShaItem[] = [];

  const monthZhi = pillars.month.zhi;
  const tianDeTarget = TIAN_DE[monthZhi];
  if (tianDeTarget) {
    const hits = matchGlyph(tianDeTarget, pillars);
    if (hits.length > 0) {
      const star: Omit<ShenShaItem, "weightClass"> = {
        key: "tian_de",
        name: "Thiên Đức",
        chineseName: "天德",
        vietnameseName: "Thiên Đức",
        sourceId: "sanming.tiande.month.v1",
        category: "đức_tinh",
        lookupBasis: "monthBranch→stemOrBranch",
        ruleVariant: "sanming.tiande.month",
        traditionalToneDisplay: "cát" as TraditionalToneDisplay,
        priorityClass: "A",
        matchedAt: hits,
        evidence: `Nguyệt chi ${monthZhi} → ${tianDeTarget}`,
      };
      for (const slot of hits) {
        pushStar(out[slot], { ...star, matchedAt: hits });
      }
    }
  }

  const yueDeTarget = YUE_DE[monthZhi];
  if (yueDeTarget) {
    const hits = matchStem(yueDeTarget, pillars);
    if (hits.length > 0) {
      const star = {
        key: "yue_de",
        name: "Nguyệt Đức",
        chineseName: "月德",
        vietnameseName: "Nguyệt Đức",
        sourceId: "sanming.yuede.month.v1",
        category: "đức_tinh",
        lookupBasis: "monthBranch→stem",
        ruleVariant: "sanming.yuede.month",
        traditionalToneDisplay: "cát" as TraditionalToneDisplay,
        priorityClass: "A" as const,
        matchedAt: hits,
        evidence: `Nguyệt chi ${monthZhi} → can ${yueDeTarget}`,
      };
      for (const slot of hits) {
        pushStar(out[slot], { ...star, matchedAt: hits });
      }
    }
  }

  const yc = yuanChenBranch(
    pillars.year.gan,
    pillars.year.zhi,
    gender,
  );
  if (yc) {
    const hits = matchBranch(yc, pillars);
    if (hits.length > 0) {
      const star = {
        key: "yuan_chen",
        name: "Nguyên Thần",
        chineseName: "元辰",
        vietnameseName: "Nguyên Thần",
        sourceId: "sanming.yuanchen.genderYear.v1",
        category: "sát_tinh",
        lookupBasis: "yearStemPolarity+gender+yearBranch",
        ruleVariant: "sanming.yuanchen.genderYear",
        traditionalToneDisplay: "hung" as TraditionalToneDisplay,
        priorityClass: "B" as const,
        matchedAt: hits,
        evidence: `Niên ${pillars.year.gan}${pillars.year.zhi} · ${gender} → ${yc}`,
      };
      for (const slot of hits) {
        pushStar(out[slot], { ...star, matchedAt: hits });
      }
    }
  }

  // Thiên La / Địa Võng — pair required
  const zhiSlots = new Map<string, PillarSlot[]>();
  for (const slot of SLOTS) {
    const z = pillars[slot].zhi;
    const list = zhiSlots.get(z) ?? [];
    list.push(slot);
    zhiSlots.set(z, list);
  }

  const hasXu = zhiSlots.has("戌");
  const hasHai = zhiSlots.has("亥");
  if (hasXu && hasHai) {
    const matchedAt = [
      ...(zhiSlots.get("戌") ?? []),
      ...(zhiSlots.get("亥") ?? []),
    ];
    const star = {
      key: "tian_luo",
      name: "Thiên La",
      chineseName: "天罗",
      vietnameseName: "Thiên La",
      sourceId: "sanming.tianluodiwang.pair.v1",
      category: "la_võng",
      lookupBasis: "natalPair戌亥",
      ruleVariant: "sanming.tianluodiwang.pair",
      traditionalToneDisplay: "hung" as TraditionalToneDisplay,
      priorityClass: "B_MINUS" as const,
      matchedAt,
      evidence: `Đủ cặp 戌+亥 tại ${matchedAt.join(",")}`,
    };
    for (const slot of matchedAt) {
      pushStar(out[slot], { ...star, matchedAt });
    }
    pushStar(summaryExtras, { ...star, matchedAt });
  }

  const hasChen = zhiSlots.has("辰");
  const hasSi = zhiSlots.has("巳");
  if (hasChen && hasSi) {
    const matchedAt = [
      ...(zhiSlots.get("辰") ?? []),
      ...(zhiSlots.get("巳") ?? []),
    ];
    const star = {
      key: "di_wang",
      name: "Địa Võng",
      chineseName: "地网",
      vietnameseName: "Địa Võng",
      sourceId: "sanming.tianluodiwang.pair.v1",
      category: "la_võng",
      lookupBasis: "natalPair辰巳",
      ruleVariant: "sanming.tianluodiwang.pair",
      traditionalToneDisplay: "hung" as TraditionalToneDisplay,
      priorityClass: "B_MINUS" as const,
      matchedAt,
      evidence: `Đủ cặp 辰+巳 tại ${matchedAt.join(",")}`,
    };
    for (const slot of matchedAt) {
      pushStar(out[slot], { ...star, matchedAt });
    }
    pushStar(summaryExtras, { ...star, matchedAt });
  }

  return { ...out, summaryExtras };
}

export function computeSpecialDayMarkers(params: {
  yearPillar: string;
  dayPillar: string;
  monthBranch: string;
}): SpecialDayMarkers {
  const { yearPillar, dayPillar, monthBranch } = params;

  const kuiPresent = KUI_GANG_DAYS.has(dayPillar);
  const yymPresent = YIN_YANG_MISALIGNMENT_DAYS.has(dayPillar);

  const seasonRule = FOUR_WASTE_BY_SEASON[monthBranch];
  const seasonMatched = !!seasonRule;
  const dayMatchesThisSeason = seasonRule?.days.includes(dayPillar) ?? false;
  const dayIsWasteSomewhere = Object.values(FOUR_WASTE_BY_SEASON).some((s) =>
    s.days.includes(dayPillar),
  );

  const baseListHit = TEN_EVIL_BASE_DAYS.has(dayPillar);
  const refinedExpected = TEN_EVIL_REFINED_YEAR_DAY[yearPillar];
  const refinedYearRuleHit =
    !!refinedExpected && refinedExpected === dayPillar;
  let tenStatus: "absent" | "baseCandidate" | "refinedHit" = "absent";
  if (refinedYearRuleHit) tenStatus = "refinedHit";
  else if (baseListHit) tenStatus = "baseCandidate";

  return {
    catalogVersion: SHEN_SHA_CATALOG_VERSION,
    kuiGang: {
      key: "kuiGang",
      present: kuiPresent,
      dayPillar,
      weightClass: "auxiliary",
      sourceId: "sanming.kuigang.dayPillar.v1",
      traditionalToneDisplay: "trung",
      evidence: kuiPresent
        ? `Nhật trụ ${dayPillar} thuộc bộ Khôi Cương`
        : `Nhật trụ ${dayPillar} không thuộc Khôi Cương`,
    },
    yinYangMisalignment: {
      key: "yinYangMisalignment",
      present: yymPresent,
      dayPillar,
      weightClass: "auxiliary",
      sourceId: "sanming.yinyangMisalignment.dayPillar.v1",
      traditionalToneDisplay: "trung",
      evidence: yymPresent
        ? `Nhật trụ ${dayPillar} thuộc Âm Dương Sai Thác`
        : `Nhật trụ ${dayPillar} không thuộc Âm Dương Sai Thác`,
    },
    fourWaste: {
      key: "fourWaste",
      present: seasonMatched && dayMatchesThisSeason,
      seasonMatched,
      dayPillarMatched: dayMatchesThisSeason,
      seasonGroup: seasonRule?.season ?? null,
      monthBranch,
      dayPillar,
      weightClass: "auxiliary",
      sourceId: "sanming.fourWaste.seasonDay.v1",
      traditionalToneDisplay: "hung",
      evidence:
        seasonMatched && dayMatchesThisSeason
          ? `Mùa ${seasonRule!.season} (tháng ${monthBranch}) + nhật ${dayPillar}`
          : `seasonMatched=${String(seasonMatched)} dayPillarMatched=${String(dayMatchesThisSeason)} (wasteDayAnywhere=${String(dayIsWasteSomewhere)})`,
    },
    tenEvilGreatDefeat: {
      key: "tenEvilGreatDefeat",
      baseListHit,
      refinedYearRuleHit,
      status: tenStatus,
      dayPillar,
      yearPillar,
      weightClass: "auxiliary",
      sourceId: "sanming.tenEvilGreatDefeat.v1",
      traditionalToneDisplay: "trung",
      evidence: `baseListHit=${String(baseListHit)}; refinedYearRuleHit=${String(refinedYearRuleHit)}; status=${tenStatus}`,
    },
  };
}
