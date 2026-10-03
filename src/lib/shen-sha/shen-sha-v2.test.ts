/**
 * Golden + regression tests for Shen Sha Catalog v2.0.
 * Does not alter Core calculator 0.3.2 lock.
 */

import { describe, expect, it } from "vitest";
import { calculateBaZi } from "@/lib/astrology-engine";
import {
  SHEN_SHA_CATALOG_V2,
  SPECIAL_DAY_CATALOG_V2,
  buildShenShaCatalogJson,
  ciGuanBranch,
  computeSpecialDayMarkers,
  jinYuBranch,
  TIAN_DE,
  YUE_DE,
  xueTangBranch,
  yuanChenBranch,
  SHEN_SHA_CATALOG_VERSION,
} from "@/lib/shen-sha";
import { DAY_STEM_LU } from "@/lib/core/daymaster-qi";
import { branchPlus } from "@/lib/shen-sha/tables-v2";

describe("Shen Sha Catalog v2.0 metadata", () => {
  it("exports version 2.0.0 and 24 groups (20 shen + 4 special)", () => {
    expect(SHEN_SHA_CATALOG_VERSION).toBe("2.0.0");
    const json = buildShenShaCatalogJson();
    expect(json.totalGroups).toBe(
      SHEN_SHA_CATALOG_V2.length + SPECIAL_DAY_CATALOG_V2.length,
    );
    expect(json.totalGroups).toBe(24);
  });

  it("every catalog entity is auxiliary with sourceId", () => {
    for (const e of [...SHEN_SHA_CATALOG_V2, ...SPECIAL_DAY_CATALOG_V2]) {
      expect(e.weightClass).toBe("auxiliary");
      expect(e.sourceId).toBeTruthy();
    }
  });
});

describe("Thiên Đức / Nguyệt Đức tables", () => {
  it("covers all 12 month branches", () => {
    expect(Object.keys(TIAN_DE)).toHaveLength(12);
    expect(Object.keys(YUE_DE)).toHaveLength(12);
  });

  it("golden Thiên Đức samples", () => {
    expect(TIAN_DE["寅"]).toBe("丁");
    expect(TIAN_DE["卯"]).toBe("申");
    expect(TIAN_DE["子"]).toBe("巳");
    expect(TIAN_DE["丑"]).toBe("庚");
  });

  it("golden Nguyệt Đức by san he groups", () => {
    expect(YUE_DE["寅"]).toBe("丙");
    expect(YUE_DE["午"]).toBe("丙");
    expect(YUE_DE["亥"]).toBe("甲");
    expect(YUE_DE["申"]).toBe("壬");
    expect(YUE_DE["酉"]).toBe("庚");
  });
});

describe("Học Đường / Từ Quán / Kim Dư — 10 day stems", () => {
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

  it("Học Đường = 长生 branch for each day stem", () => {
    const expected: Record<string, string> = {
      甲: "亥",
      乙: "午",
      丙: "寅",
      丁: "酉",
      戊: "寅",
      己: "酉",
      庚: "巳",
      辛: "子",
      壬: "申",
      癸: "卯",
    };
    for (const g of stems) {
      expect(xueTangBranch(g)).toBe(expected[g]);
    }
  });

  it("Từ Quán = 临官 = Lộc branch", () => {
    for (const g of stems) {
      expect(ciGuanBranch(g)).toBe(DAY_STEM_LU[g]);
    }
  });

  it("Kim Dư = Lộc + 2", () => {
    expect(jinYuBranch("甲")).toBe("辰");
    for (const g of stems) {
      const lu = DAY_STEM_LU[g]!;
      expect(jinYuBranch(g)).toBe(branchPlus(lu, 2));
    }
  });
});

describe("Nguyên Thần gender/year rules", () => {
  it("golden: 甲子 male → 未; 乙丑 male → 午", () => {
    expect(yuanChenBranch("甲", "子", "male")).toBe("未");
    expect(yuanChenBranch("乙", "丑", "male")).toBe("午");
  });

  it("covers 4 polarity×gender groups", () => {
    // Dương nam: clash+1
    expect(yuanChenBranch("甲", "子", "male")).toBe("未");
    // Âm nữ: clash+1
    expect(yuanChenBranch("乙", "子", "female")).toBe("未");
    // Âm nam: clash-1
    expect(yuanChenBranch("乙", "子", "male")).toBe("巳");
    // Dương nữ: clash-1
    expect(yuanChenBranch("甲", "子", "female")).toBe("巳");
  });
});

describe("Thiên La / Địa Võng pair detection", () => {
  it("hits only when full pair present + matchedAt", () => {
    const chart = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 12, hour: 17, minute: 45, second: 0 },
    });
    const hasLuo = chart.shenSha.some((s) => s.key === "tian_luo");
    const hasWang = chart.shenSha.some((s) => s.key === "di_wang");
    if (hasLuo) {
      const star = chart.shenSha.find((s) => s.key === "tian_luo")!;
      expect(star.matchedAt?.length).toBeGreaterThanOrEqual(2);
      expect(star.sourceId).toBe("sanming.tianluodiwang.pair.v1");
      expect(star.weightClass).toBe("auxiliary");
    }
    if (hasWang) {
      const star = chart.shenSha.find((s) => s.key === "di_wang")!;
      expect(star.matchedAt?.length).toBeGreaterThanOrEqual(2);
    }
    // Isolated 戌 without 亥 must not create tian_luo on synthetic
    const zhis = [
      chart.pillars.year.zhi,
      chart.pillars.month.zhi,
      chart.pillars.day.zhi,
      chart.pillars.hour.zhi,
    ];
    if (zhis.includes("戌") && !zhis.includes("亥")) {
      expect(hasLuo).toBe(false);
    }
    if (zhis.includes("辰") && !zhis.includes("巳")) {
      expect(hasWang).toBe(false);
    }
  });
});

describe("Special day markers", () => {
  it("Khôi Cương: 4 days + negative", () => {
    for (const d of ["庚辰", "壬辰", "戊戌", "庚戌"]) {
      const m = computeSpecialDayMarkers({
        yearPillar: "甲子",
        dayPillar: d,
        monthBranch: "寅",
      });
      expect(m.kuiGang.present).toBe(true);
      expect(m.kuiGang.weightClass).toBe("auxiliary");
    }
    const neg = computeSpecialDayMarkers({
      yearPillar: "甲子",
      dayPillar: "甲子",
      monthBranch: "寅",
    });
    expect(neg.kuiGang.present).toBe(false);
  });

  it("Âm Dương Sai Thác: 12 days + negative", () => {
    const days = [
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
    ];
    for (const d of days) {
      expect(
        computeSpecialDayMarkers({
          yearPillar: "甲子",
          dayPillar: d,
          monthBranch: "子",
        }).yinYangMisalignment.present,
      ).toBe(true);
    }
    expect(
      computeSpecialDayMarkers({
        yearPillar: "甲子",
        dayPillar: "甲子",
        monthBranch: "子",
      }).yinYangMisalignment.present,
    ).toBe(false);
  });

  it("Tứ Phế: season XOR day = fail; both = pass", () => {
    // Xuân + 庚申 → pass
    const pass = computeSpecialDayMarkers({
      yearPillar: "甲子",
      dayPillar: "庚申",
      monthBranch: "寅",
    });
    expect(pass.fourWaste.present).toBe(true);
    expect(pass.fourWaste.seasonMatched).toBe(true);
    expect(pass.fourWaste.dayPillarMatched).toBe(true);

    // Xuân but wrong day
    const wrongDay = computeSpecialDayMarkers({
      yearPillar: "甲子",
      dayPillar: "甲子",
      monthBranch: "寅",
    });
    expect(wrongDay.fourWaste.present).toBe(false);
    expect(wrongDay.fourWaste.seasonMatched).toBe(true);
    expect(wrongDay.fourWaste.dayPillarMatched).toBe(false);

    // 庚申 but mùa hạ
    const wrongSeason = computeSpecialDayMarkers({
      yearPillar: "甲子",
      dayPillar: "庚申",
      monthBranch: "午",
    });
    expect(wrongSeason.fourWaste.present).toBe(false);
    expect(wrongSeason.fourWaste.dayPillarMatched).toBe(false);
  });

  it("Thập Ác: distinguishes baseListHit vs refinedYearRuleHit", () => {
    const baseOnly = computeSpecialDayMarkers({
      yearPillar: "甲子",
      dayPillar: "甲辰",
      monthBranch: "寅",
    });
    expect(baseOnly.tenEvilGreatDefeat.baseListHit).toBe(true);
    expect(baseOnly.tenEvilGreatDefeat.refinedYearRuleHit).toBe(false);
    expect(baseOnly.tenEvilGreatDefeat.status).toBe("baseCandidate");

    const refined = computeSpecialDayMarkers({
      yearPillar: "庚戌",
      dayPillar: "甲辰",
      monthBranch: "寅",
    });
    expect(refined.tenEvilGreatDefeat.baseListHit).toBe(true);
    expect(refined.tenEvilGreatDefeat.refinedYearRuleHit).toBe(true);
    expect(refined.tenEvilGreatDefeat.status).toBe("refinedHit");
  });
});

describe("Core 0.3.2 lock + chart wiring", () => {
  it("Case A: catalog version, no lu/ren in shenSha, usefulGod null", () => {
    const chart = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 12, hour: 17, minute: 45, second: 0 },
    });
    expect(chart.meta.engineVersion).toBe("0.3.2-core");
    expect(chart.shenShaCatalogVersion).toBe("2.0.0");
    expect(chart.usefulGod).toBeNull();
    expect(chart.directions).toBeNull();
    expect(chart.shenSha.some((s) => s.key === "lu")).toBe(false);
    expect(
      chart.shenSha.some((s) =>
        ["lu", "yangren", "yinren", "ren"].includes(s.key),
      ),
    ).toBe(false);
    expect(
      chart.shenSha.some((s) =>
        /^(Lộc|Dương Nhận|Âm Nhận)/.test(s.name),
      ),
    ).toBe(false);
    expect(chart.specialDayMarkers).toBeTruthy();
    expect(chart.specialDayMarkers!.kuiGang.sourceId).toBeTruthy();

    const peach = chart.shenSha.filter((s) => s.key === "tao_hua_xian_chi");
    expect(peach.length).toBeLessThanOrEqual(1);

    for (const s of chart.shenSha) {
      expect(s.weightClass).toBe("auxiliary");
      expect(s.sourceId).toBeTruthy();
    }
  });

  it("Case B midnight_00 vs zi_start_23 both expose specialDayMarkers", () => {
    const local = {
      year: 2026,
      month: 5,
      day: 5,
      hour: 23,
      minute: 46,
      second: 0,
    };
    const mid = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "female",
      local,
      conventions: { dayBoundaryMode: "midnight_00" },
    });
    const zi = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "female",
      local,
      conventions: { dayBoundaryMode: "zi_start_23" },
    });
    expect(mid.shenShaCatalogVersion).toBe("2.0.0");
    expect(zi.shenShaCatalogVersion).toBe("2.0.0");
    expect(mid.specialDayMarkers).toBeTruthy();
    expect(zi.specialDayMarkers).toBeTruthy();
    expect(mid.pillars.day.ganZhi).not.toBe(zi.pillars.day.ganZhi);
  });
});
