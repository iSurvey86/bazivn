import { describe, expect, it } from "vitest";
import { Solar } from "lunar-typescript";
import {
  calculateBaZi,
  extractCoreDebugSnapshot,
} from "@/lib/astrology-engine";
import { getChangSheng, changShengMatrix } from "@/lib/core/chang-sheng";
import { getHiddenStemsWithRoles } from "@/lib/core/hidden-stems";
import { DAY_STEM_LU, YANG_REN, resolveRenBranch } from "@/lib/core/daymaster-qi";
import { civilToUtc, resolveTimeBasis } from "@/lib/core/time-basis";
import { computeBoundaryFlags } from "@/lib/core/jieqi-boundaries";
import { computeStemBranchRelations } from "@/lib/core/relations";

describe("dayBoundaryMode", () => {
  const base = {
    timezone: "Asia/Ho_Chi_Minh",
    gender: "male" as const,
    year: 1986,
    month: 11,
    day: 3,
  };

  function chart(hour: number, minute: number, mode: "midnight_00" | "zi_start_23") {
    return calculateBaZi({
      timezone: base.timezone,
      gender: base.gender,
      local: {
        year: base.year,
        month: base.month,
        day: hour === 0 ? 4 : base.day,
        hour,
        minute,
        second: 0,
      },
      conventions: { dayBoundaryMode: mode },
    });
  }

  it("midnight_00: 22:59 and 23:00 keep same day pillar; 00:00 advances", () => {
    const a = chart(22, 59, "midnight_00");
    const b = chart(23, 0, "midnight_00");
    const c = chart(0, 0, "midnight_00");
    expect(a.pillars.day.ganZhi).toBe(b.pillars.day.ganZhi);
    expect(a.pillars.day.ganZhi).not.toBe(c.pillars.day.ganZhi);
    expect(a.facts.reasoning.usefulGod).toBeNull();
    expect(a.usefulGod).toBeNull();
    expect(a.directions).toBeNull();
  });

  it("zi_start_23: day pillar changes at 23:00", () => {
    const before = chart(22, 59, "zi_start_23");
    const at = chart(23, 0, "zi_start_23");
    expect(before.pillars.day.ganZhi).not.toBe(at.pillars.day.ganZhi);
  });
});

describe("LiChun year boundary", () => {
  it("year pillar flips at立春 second, not 01/01", () => {
    // Hybrid: Year uses Asia/Shanghai library clock — HCM civil = SH − 1h
    const before = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 2024, month: 2, day: 4, hour: 15, minute: 27, second: 6 },
    });
    const after = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 2024, month: 2, day: 4, hour: 15, minute: 27, second: 7 },
    });
    expect(before.lunar.yearInGanZhi).toBe("癸卯");
    expect(after.lunar.yearInGanZhi).toBe("甲辰");
    expect(before.pillars.year.ganZhi).toBe("癸卯");
    expect(after.pillars.year.ganZhi).toBe("甲辰");
  });

  it("01/01 before LiChun stays previous Bazi year", () => {
    const jan = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "female",
      local: { year: 2024, month: 1, day: 1, hour: 12, minute: 0, second: 0 },
    });
    expect(jan.lunar.yearInGanZhi).toBe("癸卯");
  });
});

describe("ChangSheng single source", () => {
  it("covers 10×12 matrix", () => {
    const m = changShengMatrix();
    expect(Object.keys(m)).toHaveLength(10);
    for (const gan of Object.keys(m)) {
      expect(Object.keys(m[gan]!)).toHaveLength(12);
    }
  });

  it("庚 + 午 = 沐浴 (not 长生)", () => {
    expect(getChangSheng("庚", "午")).toBe("沐浴");
  });

  it("chart diShi uses day master for all pillars", () => {
    const chart = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 12, hour: 17, minute: 45, second: 0 },
    });
    expect(chart.dayMaster).toBe("庚");
    expect(chart.pillars.day.zhi).toBe("申");
    expect(chart.pillars.day.diShi).toBe(getChangSheng("庚", "申"));
    expect(chart.pillars.hour.diShi).toBe(getChangSheng("庚", chart.pillars.hour.zhi));
  });
});

describe("hidden stems + lu/ren not in shen sha", () => {
  it("roles for 寅", () => {
    const h = getHiddenStemsWithRoles("寅");
    expect(h.map((x) => x.gan)).toEqual(["甲", "丙", "戊"]);
    expect(h.map((x) => x.role)).toEqual(["ban", "trung", "du"]);
  });

  it("lu/ren tables + shen sha excludes them", () => {
    expect(DAY_STEM_LU["庚"]).toBe("申");
    expect(YANG_REN["庚"]).toBe("酉");
    expect(resolveRenBranch("乙", "ziPingYangRenOnly").kind).toBe("none");
    expect(resolveRenBranch("乙", "yinRenExtended").kind).toBe("yinRen");

    const chart = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 12, hour: 17, minute: 45, second: 0 },
    });
    const keys = chart.shenSha.map((s) => s.key);
    expect(keys).not.toContain("lu");
    expect(keys).not.toContain("yangren");
    expect(chart.dayMasterQiStates.lu.branch).toBe("申");
    expect(chart.yun.startSolarExact.ymdHms).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(chart.facts.meta.engineVersion).toBeTruthy();
  });
});

describe("regression 12/11/1986 17:45", () => {
  it("matches expected pillars under midnight_00", () => {
    const chart = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 12, hour: 17, minute: 45, second: 0 },
    });
    expect(chart.pillars.year.ganZhi).toBe("丙寅");
    expect(chart.pillars.month.ganZhi).toBe("己亥");
    expect(chart.pillars.day.ganZhi).toBe("庚申");
    expect(chart.pillars.hour.ganZhi).toBe("乙酉");
    expect(chart.yun.isForward).toBe(true);
  });

  it("ĐV/LN Ngọ = Mộc Dục for 庚 day master; no Lộc/Nhận in shen-sha row", () => {
    const chart = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 12, hour: 17, minute: 45, second: 0 },
    });
    const dyNgo = chart.yun.daYun.find((d) => d.ganZhi.endsWith("午"));
    expect(dyNgo?.diShiVi).toBe("Mộc Dục");
    const ln2026 = chart.yun.daYun
      .flatMap((d) => d.liuNian)
      .find((ln) => ln.year === 2026);
    expect(ln2026?.ganZhi).toBe("丙午");
    expect(ln2026?.diShiVi).toBe("Mộc Dục");

    for (const key of ["year", "month", "day", "hour"] as const) {
      for (const s of chart.pillars[key].shenSha) {
        expect(s.key).not.toMatch(/lu|yangren|yinren/);
        expect(s.name).not.toMatch(/Lộc Thần|Dương Nhẫn|Dương Nhận/);
      }
    }
  });
});

describe("normalizeBaZiChart repairs stale diShi / structural stars", () => {
  it("recomputes 庚+午 from Trường Sinh → Mộc Dục and strips Lộc Thần", async () => {
    const { normalizeBaZiChart } = await import("@/lib/astrology-engine");
    const fresh = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 12, hour: 17, minute: 45, second: 0 },
    });
    const stale = structuredClone(fresh);
    const target = stale.yun.daYun.find((d) => d.ganZhi.endsWith("午"));
    if (target) target.diShiVi = "Trường Sinh";
    stale.pillars.day.shenSha = [
      ...(stale.pillars.day.shenSha ?? []),
      {
        key: "lu",
        name: "Lộc Thần",
        type: "cat",
        weightClass: "auxiliary",
      },
      {
        key: "yangren",
        name: "Dương Nhẫn",
        type: "hung",
        weightClass: "auxiliary",
      },
    ];
    const fixed = normalizeBaZiChart(stale);
    const fixedDy = fixed.yun.daYun.find((d) => d.ganZhi.endsWith("午"));
    expect(fixedDy?.diShiVi).toBe("Mộc Dục");
    expect(fixed.pillars.day.shenSha.some((s) => s.key === "lu")).toBe(false);
    expect(fixed.pillars.day.shenSha.some((s) => s.name.includes("Nhẫn"))).toBe(
      false,
    );
  });

  it("rehydrates Yun start 23:45 when startSolarExact missing (date-only chart)", async () => {
    const { normalizeBaZiChart } = await import("@/lib/astrology-engine");
    const fresh = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 12, hour: 17, minute: 45, second: 0 },
    });
    const stale = structuredClone(fresh);
    // Simulate old saved chart: date only, no exact time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (stale.yun as any).startSolarExact;
    stale.yun.startSolarDate = { year: 1995, month: 3, day: 10 };
    stale.yun.startAge = { years: 8, months: 3, days: 26, hours: 6 };

    const fixed = normalizeBaZiChart(stale);
    expect(fixed.yun.startSolarExact.year).toBe(1995);
    expect(fixed.yun.startSolarExact.month).toBe(3);
    expect(fixed.yun.startSolarExact.day).toBe(10);
    expect(fixed.yun.startSolarExact.hour).toBe(23);
    expect(fixed.yun.startSolarExact.minute).toBe(45);
  });
});

describe("JieQi library sanity", () => {
  it("Solar subtract works for boundary distance", () => {
    const s = Solar.fromYmdHms(2024, 2, 4, 16, 27, 7);
    expect(s.getLunar().getYearInGanZhiExact()).toBe("甲辰");
  });
});

describe("Yun startSolarExact (sect 2)", () => {
  it("1986-11-12 17:45 male hybrid → local 1995-03-10 23:45 (lib +1h)", () => {
    const chart = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 12, hour: 17, minute: 45, second: 0 },
    });
    const exact = chart.yun.startSolarExact;
    expect(chart.timeBasis.mode).toBe("instant_consistent");
    expect(exact.year).toBe(1995);
    expect(exact.month).toBe(3);
    expect(exact.day).toBe(10);
    expect(exact.hour).toBe(23);
    expect(exact.minute).toBe(45);
    expect(exact.ymdHms).toBe("1995-03-10 23:45:00");
    expect(chart.yun.startSolarExactLibrary?.ymdHms).toBe(
      "1995-03-11 00:45:00",
    );
    expect(chart.yun.startAge.years).toBe(8);
    expect(chart.yun.startAge.months).toBe(3);
    expect(chart.yun.startAgeXu).toBe(10);
  });
});

describe("Shen sha merge + Thiên Câu", () => {
  it("Đào Hoa/Hàm Trì is one entity; no separate peach/hamchi", () => {
    const chart = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 12, hour: 17, minute: 45, second: 0 },
    });
    const hourStars = chart.pillars.hour.shenSha;
    const peach = hourStars.filter((s) => s.key === "tao_hua_xian_chi");
    expect(peach.length).toBeLessThanOrEqual(1);
    expect(hourStars.some((s) => s.key === "peach" || s.key === "hamchi")).toBe(
      false,
    );
    if (peach[0]) {
      expect(peach[0].name).toBe("Đào Hoa");
    }
    for (const key of ["year", "month", "day", "hour"] as const) {
      for (const s of chart.pillars[key].shenSha) {
        expect(s.name).not.toMatch(/^Thiên Cầu$|^Thiên Cẩu$/);
        if (s.key === "tian_gou") expect(s.name).toBe("Thiên Câu");
      }
    }
  });
});

describe("monthCommand + relations Fact Graph", () => {
  it("exports commanding stem and stem/branch relations", () => {
    const chart = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 12, hour: 17, minute: 45, second: 0 },
    });
    expect(chart.monthCommand.mode).toBe("ziPingZhenQuan_v1");
    expect(chart.monthCommand.sourceId).toBe("monthCommand.ziPingZhenQuan.v1");
    expect(chart.monthCommand.sourceTitle).toBeTruthy();
    expect(chart.monthCommand.tableVersion).toBe("1.1.0");
    expect(chart.monthCommand.branch).toBe("亥");
    expect(chart.monthCommand.daysFromJie).not.toBeNull();
    // 12/11 after Lập Đông (~7–8/11) → vài ngày, không được kẹt 0 vì dấu phút sai
    expect(chart.monthCommand.daysFromJie!).toBeGreaterThan(1);
    expect(chart.monthCommand.commandingStem).toBeTruthy();
    expect(chart.facts.monthCommand.commandingStem).toBe(
      chart.monthCommand.commandingStem,
    );

    const names = chart.relations.map((r) => r.name);
    expect(names).toContain("乙庚合");
    expect(names).toContain("寅亥合");
    expect(names).toContain("寅申冲");
    expect(names).toContain("申亥害");
    expect(chart.facts.relations.length).toBe(chart.relations.length);
    // Case A: 寅+申 only → pair name, NOT full 寅巳申刑
    expect(names).toContain("寅申刑");
    expect(names).not.toContain("寅巳申刑");
    for (const r of chart.relations) {
      expect(r.sourceId).toBeTruthy();
    }
    const stemCombo = chart.relations.find((r) => r.name === "乙庚合");
    expect(stemCombo?.transformStatus).toBe("combineOnly");
  });

  it("splits bán hợp (có trung thần) vs củng hợp / 拱合 (thiếu trung thần)", () => {
    const half = computeStemBranchRelations({
      year: { gan: "甲", zhi: "申" },
      month: { gan: "乙", zhi: "子" },
      day: { gan: "丙", zhi: "丑" },
      hour: { gan: "丁", zhi: "卯" },
    });
    const halfHit = half.find((r) => r.type === "branchHalfHarmony");
    expect(halfHit?.name).toBe("申子半合");
    expect(half.some((r) => r.type === "branchArchHarmony")).toBe(false);

    const arch = computeStemBranchRelations({
      year: { gan: "甲", zhi: "申" },
      month: { gan: "乙", zhi: "辰" },
      day: { gan: "丙", zhi: "丑" },
      hour: { gan: "丁", zhi: "卯" },
    });
    const archHit = arch.find((r) => r.type === "branchArchHarmony");
    expect(archHit?.name).toBe("申辰拱合");
    expect(archHit?.sourceId).toBe("relations.branchArchHarmony.v1");
    expect(arch.some((r) => r.type === "branchHalfHarmony")).toBe(false);
  });

  it("labels full three-punishment only when all 3 branches present", () => {
    const pairOnly = computeStemBranchRelations({
      year: { gan: "甲", zhi: "寅" },
      month: { gan: "乙", zhi: "子" },
      day: { gan: "丙", zhi: "申" },
      hour: { gan: "丁", zhi: "丑" },
    });
    expect(pairOnly.some((r) => r.name === "寅申刑")).toBe(true);
    expect(pairOnly.some((r) => r.name === "寅巳申刑")).toBe(false);
    expect(
      pairOnly.find((r) => r.name === "寅申刑")?.type,
    ).toBe("branchPunishmentPair");

    const full = computeStemBranchRelations({
      year: { gan: "甲", zhi: "寅" },
      month: { gan: "乙", zhi: "巳" },
      day: { gan: "丙", zhi: "申" },
      hour: { gan: "丁", zhi: "丑" },
    });
    expect(full.some((r) => r.name === "寅巳申刑")).toBe(true);
    expect(full.find((r) => r.name === "寅巳申刑")?.type).toBe(
      "branchThreePunishment",
    );
  });

  it("marks tranh hợp when one stem joins two combinations", () => {
    // day 乙 + year 庚; hour 乙 + month 庚 → two 乙庚合 sharing 乙/庚 → contested
    const rels = computeStemBranchRelations({
      year: { gan: "庚", zhi: "子" },
      month: { gan: "庚", zhi: "丑" },
      day: { gan: "乙", zhi: "寅" },
      hour: { gan: "乙", zhi: "卯" },
    });
    const combos = rels.filter((r) => r.type === "stemCombination");
    expect(combos.length).toBeGreaterThanOrEqual(2);
    expect(combos.every((r) => r.contested === true)).toBe(true);
    expect(combos[0]?.contestedWith?.length).toBeGreaterThanOrEqual(1);
    // same-name 乙庚合 vẫn phân biệt bằng comboKey (members)
    expect(new Set(combos.map((r) => r.name)).size).toBe(1);
  });
});

describe("timeBasis DoD-A / DoD-B adapter", () => {
  it("defaults to instant_consistent for HCM (product hybrid)", () => {
    const basis = resolveTimeBasis({
      localCivil: {
        year: 2026,
        month: 5,
        day: 5,
        hour: 23,
        minute: 46,
        second: 0,
      },
      birthTimezone: "Asia/Ho_Chi_Minh",
    });
    expect(basis.mode).toBe("instant_consistent");
    expect(basis.libraryTermTimezone).toBe("Asia/Shanghai");
    expect(basis.libraryTermClock).toEqual({
      year: 2026,
      month: 5,
      day: 6,
      hour: 0,
      minute: 46,
      second: 0,
    });
    expect(basis.birthAbsoluteIso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("vn_civil Legacy keeps library clock = birth civil", () => {
    const basis = resolveTimeBasis({
      localCivil: {
        year: 2026,
        month: 5,
        day: 5,
        hour: 23,
        minute: 46,
        second: 0,
      },
      birthTimezone: "Asia/Ho_Chi_Minh",
      mode: "vn_civil",
    });
    expect(basis.mode).toBe("vn_civil");
    expect(basis.libraryTermClock).toEqual(basis.localCivil);
  });

  it("non-HCM also uses instant_consistent projection via Asia/Shanghai", () => {
    const basis = resolveTimeBasis({
      localCivil: {
        year: 2026,
        month: 5,
        day: 5,
        hour: 23,
        minute: 46,
        second: 0,
      },
      birthTimezone: "America/New_York",
    });
    expect(basis.mode).toBe("instant_consistent");
    expect(basis.libraryTermTimezone).toBe("Asia/Shanghai");
    // Same absolute instant when round-tripping
    const utc = civilToUtc(basis.localCivil, "America/New_York");
    expect(basis.birthAbsoluteIso).toBe(utc.toISOString());
  });

  it("timezoneSensitive is boundary-distance based, not ≠ HCM", () => {
    const far = computeBoundaryFlags({
      hour: 12,
      minute: 0,
      minutesToPrevJie: 10_000,
      minutesToNextJie: 10_000,
      minutesToLiChun: 10_000,
      timezone: "Europe/London",
    });
    expect(far.timezoneSensitive).toBe(false);

    const nearJie = computeBoundaryFlags({
      hour: 12,
      minute: 0,
      minutesToPrevJie: 30,
      minutesToNextJie: 10_000,
      minutesToLiChun: 10_000,
      timezone: "Asia/Ho_Chi_Minh",
    });
    expect(nearJie.timezoneSensitive).toBe(true);
  });

  it("nearZiBoundary is tight ±10′; wide window is separate flag", () => {
    const midRat = computeBoundaryFlags({
      hour: 22,
      minute: 30,
      minutesToPrevJie: 10_000,
      minutesToNextJie: 10_000,
      minutesToLiChun: 10_000,
    });
    expect(midRat.nearZiWindowWide).toBe(true);
    expect(midRat.nearZiBoundary).toBe(false);
    expect(midRat.timezoneSensitive).toBe(false);

    const at2305 = computeBoundaryFlags({
      hour: 23,
      minute: 5,
      minutesToPrevJie: 10_000,
      minutesToNextJie: 10_000,
      minutesToLiChun: 10_000,
    });
    expect(at2305.nearZiBoundary).toBe(true);
    expect(at2305.timezoneSensitive).toBe(true);
  });
});

describe("DoD-B′ hybrid + same-instant multi-timezone", () => {
  it("Case B instant_consistent: keeps civil day/hour, shifts Jie/Yun/term clock", () => {
    const civil = {
      year: 2026,
      month: 5,
      day: 5,
      hour: 23,
      minute: 46,
      second: 0,
    };
    const vn = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "female",
      local: civil,
      conventions: { timeBasisMode: "vn_civil" },
    });
    const ic = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "female",
      local: civil,
      conventions: { timeBasisMode: "instant_consistent" },
    });
    const dbgVn = extractCoreDebugSnapshot(vn);
    const dbgIc = extractCoreDebugSnapshot(ic);

    expect(dbgIc.libraryTermClock).toBe("2026-05-06 00:46:00");
    expect(dbgIc.minutesFromPrevJie).toBe(298);
    // Day/Hour stay on Hanoi civil (late rat) — NOT Shanghai midnight flip
    expect(ic.pillars.day.ganZhi).toBe(vn.pillars.day.ganZhi);
    expect(ic.pillars.hour.ganZhi).toBe(vn.pillars.hour.ganZhi);
    expect(ic.pillars.day.ganZhi).toBe("己卯");
    // Yun local projects back to birth TZ
    expect(dbgIc.yunStartLocal.hour).not.toBe(dbgIc.yunStartRaw.hour);
    expect(dbgVn.minutesFromPrevJie).toBe(238);
  });

  it("same UTC instant from UTC+7 / UTC+8 / Western TZ → same Year/Month/Jie/Yun term facts", () => {
    // Absolute: 2026-05-05T16:46:00.000Z
    const inputs = [
      {
        timezone: "Asia/Ho_Chi_Minh",
        local: { year: 2026, month: 5, day: 5, hour: 23, minute: 46, second: 0 },
      },
      {
        timezone: "Asia/Shanghai",
        local: { year: 2026, month: 5, day: 6, hour: 0, minute: 46, second: 0 },
      },
      {
        timezone: "America/New_York",
        local: { year: 2026, month: 5, day: 5, hour: 12, minute: 46, second: 0 },
      },
    ] as const;

    const charts = inputs.map((inp) =>
      calculateBaZi({
        timezone: inp.timezone,
        gender: "female",
        local: inp.local,
        conventions: { timeBasisMode: "instant_consistent" },
      }),
    );

    const abs = new Set(charts.map((c) => c.timeBasis.birthAbsoluteIso));
    expect(abs.size).toBe(1);

    const libs = new Set(
      charts.map((c) => extractCoreDebugSnapshot(c).libraryTermClock),
    );
    expect(libs.size).toBe(1);
    expect([...libs][0]).toBe("2026-05-06 00:46:00");

    const yearMonth = charts.map(
      (c) => `${c.pillars.year.ganZhi}/${c.pillars.month.ganZhi}`,
    );
    expect(new Set(yearMonth).size).toBe(1);

    const mins = charts.map(
      (c) => extractCoreDebugSnapshot(c).minutesFromPrevJie,
    );
    expect(new Set(mins).size).toBe(1);

    const yunRaw = charts.map(
      (c) => extractCoreDebugSnapshot(c).yunStartRaw.ymdHms,
    );
    expect(new Set(yunRaw).size).toBe(1);

    // Day pillars may differ by local civil (HCM late-rat vs Shanghai after midnight)
    expect(charts[0]!.pillars.day.ganZhi).toBe("己卯");
    expect(charts[1]!.pillars.day.ganZhi).toBe("庚辰");
  });
});

describe("golden case 05/05/2026 23:46 female HCM", () => {
  it("exports 10-field raw debug snapshot", () => {
    const chart = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "female",
      local: {
        year: 2026,
        month: 5,
        day: 5,
        hour: 23,
        minute: 46,
        second: 0,
      },
    });

    expect(chart.timeBasis.mode).toBe("instant_consistent");
    expect(chart.isLateRatHour).toBe(true);
    expect(chart.monthCommand.sourceId).toBe("monthCommand.ziPingZhenQuan.v1");
    expect(chart.monthCommand.tableVersion).toBe("1.1.0");
    expect(chart.yun.startSolarExactLibrary).toBeTruthy();
    expect(chart.yun.startSolarExact).toBeTruthy();

    const dbg = extractCoreDebugSnapshot(chart);
    expect(dbg.birthLocal).toBe("2026-05-05 23:46:00");
    expect(dbg.birthAbsolute).toBeTruthy();
    expect(dbg.libraryTermClock).toBe("2026-05-06 00:46:00");
    expect(dbg.minutesFromPrevJie).toBe(298);
    expect(dbg.prevJie).toBeTruthy();
    expect(dbg.nextJie).toBeTruthy();
    expect(dbg.daysFromJie).not.toBeNull();
    expect(dbg.monthCommand.commandingStem).toBeTruthy();
    expect(dbg.yunStartRaw.ymdHms || dbg.yunStartRaw).toBeTruthy();
    expect(dbg.yunStartLocal.ymdHms || dbg.yunStartLocal).toBeTruthy();

    // hybrid: Yun library (Shanghai) projected back → local display may differ by hour
    expect(dbg.yunStartLocal.hour).not.toBe(dbg.yunStartRaw.hour);
    expect(chart.pillars.day.ganZhi).toBe("己卯");
  });
});
