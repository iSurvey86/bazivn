/**
 * Nghiệm thu Core vòng cuối → 1 Word + JSON sidecar trong public/bcao/
 * Chạy: npx vitest run --config scripts/vitest.acceptance.config.ts
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import {
  calculateBaZi,
  extractCoreDebugSnapshot,
  type BaZiChartResult,
} from "@/lib/astrology-engine";
import {
  DEFAULT_CONVENTIONS,
  ENGINE_VERSION,
  RULE_SET_VERSION,
} from "@/lib/core/conventions";
import {
  computeBoundaryFlags,
  minutesToPoint,
} from "@/lib/core/jieqi-boundaries";
import { Solar } from "lunar-typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "bcao");

function git(cmd: string): string {
  try {
    return execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "(unavailable)";
  }
}

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

function h1(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 140 },
    children: [
      new TextRun({ text, bold: true, size: 28, font: "Times New Roman" }),
    ],
  });
}

function h2(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 100 },
    children: [
      new TextRun({ text, bold: true, size: 24, font: "Times New Roman" }),
    ],
  });
}

function p(text: string, opts: { bold?: boolean; color?: string } = {}) {
  return new Paragraph({
    spacing: { after: 90 },
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        size: 22,
        font: "Times New Roman",
        color: opts.color,
      }),
    ],
  });
}

function note(text: string) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({
        text,
        italics: true,
        size: 20,
        font: "Times New Roman",
        color: "444444",
      }),
    ],
  });
}

function codeBlock(text: string) {
  const lines = text.replace(/\t/g, "  ").split(/\r?\n/);
  return lines.map(
    (line) =>
      new Paragraph({
        spacing: { after: 0, line: 240 },
        children: [
          new TextRun({
            text: line.length ? line : " ",
            size: 15,
            font: "Consolas",
          }),
        ],
      }),
  );
}

function check(name: string, ok: boolean, detail = ""): ChecklistRow {
  return { name, status: ok ? "PASS" : "FAIL", detail };
}

type ChecklistRow = { name: string; status: "PASS" | "FAIL"; detail: string };

function buildAcceptanceCase(
  label: string,
  chart: BaZiChartResult,
  meta: { place: string; genderLabel: string },
) {
  const dbg = extractCoreDebugSnapshot(chart);
  const birthLib = chart.timeBasis.libraryTermClock;
  const birthSolar = Solar.fromYmdHms(
    birthLib.year,
    birthLib.month,
    birthLib.day,
    birthLib.hour,
    birthLib.minute,
    birthLib.second,
  );
  const minutesToPrev = minutesToPoint(birthSolar, chart.jieQi.prevJie);
  const minutesFromPrevJie =
    minutesToPrev === null ? null : -minutesToPrev;

  const hiddenStems = {
    year: chart.pillars.year.hideGan,
    month: chart.pillars.month.hideGan,
    day: chart.pillars.day.hideGan,
    hour: chart.pillars.hour.hideGan,
  };

  const daYun = chart.yun.daYun.map((d) => ({
    index: d.index,
    ganZhi: d.ganZhi,
    startYear: d.startYear,
    endYear: d.endYear,
    startAge: d.startAge,
    endAge: d.endAge,
    diShiVi: d.diShiVi,
    startSolarExact: d.startSolarExact,
    endSolarExact: d.endSolarExact,
    shenSha: d.shenSha,
  }));

  const liuNian = chart.yun.daYun.flatMap((d) =>
    d.liuNian.map((ln) => ({
      daYunGanZhi: d.ganZhi,
      year: ln.year,
      ganZhi: ln.ganZhi,
      age: ln.age,
      ageXu: ln.ageXu,
      diShiVi: ln.diShiVi,
      shenSha: ln.shenSha,
      yearBoundaryNote: ln.yearBoundaryNote,
    })),
  );

  return {
    label,
    place: meta.place,
    gender: meta.genderLabel,
    timezone: chart.timezone,
    engineVersion: chart.facts.meta.engineVersion,
    ruleSetVersion: chart.facts.meta.ruleSetVersion,
    conventions: chart.conventions,
    birthLocal: dbg.birthLocal,
    birthAbsolute: dbg.birthAbsolute,
    libraryTermClock: dbg.libraryTermClock,
    timeBasisMode: chart.timeBasis.mode,
    libraryTermTimezone: chart.timeBasis.libraryTermTimezone,
    pillars: {
      year: chart.pillars.year.ganZhi,
      month: chart.pillars.month.ganZhi,
      day: chart.pillars.day.ganZhi,
      hour: chart.pillars.hour.ganZhi,
      detail: {
        year: chart.pillars.year,
        month: chart.pillars.month,
        day: chart.pillars.day,
        hour: chart.pillars.hour,
      },
    },
    hiddenStems,
    dayMasterQiStates: chart.dayMasterQiStates,
    xunKong: {
      day: chart.pillars.day.xunKong,
      year: chart.pillars.year.xunKong,
      month: chart.pillars.month.xunKong,
      hour: chart.pillars.hour.xunKong,
      facts: chart.facts.xunKong,
    },
    prevJie: dbg.prevJie,
    nextJie: dbg.nextJie,
    minutesFromPrevJie,
    daysFromJie: dbg.daysFromJie,
    monthCommand: chart.monthCommand,
    relations: chart.relations,
    yunStartRaw: dbg.yunStartRaw,
    yunStartLocal: dbg.yunStartLocal,
    yunForward: chart.yun.isForward,
    startAge: chart.yun.startAge,
    startAgeXu: chart.yun.startAgeXu,
    daYun,
    liuNian,
    shenSha: {
      auxiliaryOnly: chart.shenSha,
      byPillar: chart.shenShaYuanJu,
      natalPillars: {
        year: chart.pillars.year.shenSha,
        month: chart.pillars.month.shenSha,
        day: chart.pillars.day.shenSha,
        hour: chart.pillars.hour.shenSha,
      },
    },
    usefulGod: chart.usefulGod,
    directions: chart.directions,
    wuXingBalance: chart.wuXingBalance,
    reasoning: chart.facts.reasoning,
    isLateRatHour: chart.isLateRatHour,
    dayBoundaryLabel: chart.conventionsLabel,
    rawDebug10: {
      birthLocal: dbg.birthLocal,
      birthAbsolute: dbg.birthAbsolute,
      libraryTermClock: dbg.libraryTermClock,
      prevJie: dbg.prevJie,
      nextJie: dbg.nextJie,
      minutesFromPrevJie: dbg.minutesFromPrevJie,
      daysFromJie: dbg.daysFromJie,
      monthCommand: dbg.monthCommand,
      yunStartRaw: dbg.yunStartRaw,
      yunStartLocal: dbg.yunStartLocal,
    },
  };
}

function runChecklist(): ChecklistRow[] {
  const rows: ChecklistRow[] = [];

  // trước/sau Lập Xuân
  try {
    const before = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 2024, month: 2, day: 4, hour: 16, minute: 27, second: 6 },
    });
    const after = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 2024, month: 2, day: 4, hour: 16, minute: 27, second: 7 },
    });
    const jan = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "female",
      local: { year: 2024, month: 1, day: 1, hour: 12, minute: 0, second: 0 },
    });
    rows.push(
      check(
        "trước/sau Lập Xuân",
        before.pillars.year.ganZhi === "癸卯" &&
          after.pillars.year.ganZhi === "甲辰" &&
          jan.pillars.year.ganZhi === "癸卯",
        `before=${before.pillars.year.ganZhi} after=${after.pillars.year.ganZhi} jan01=${jan.pillars.year.ganZhi}`,
      ),
    );
  } catch (e) {
    rows.push(check("trước/sau Lập Xuân", false, String(e)));
  }

  // trước/sau Jie (tháng — Lập Đông ~1986-11)
  try {
    const beforeJie = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 7, hour: 12, minute: 0, second: 0 },
    });
    const afterJie = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: { year: 1986, month: 11, day: 8, hour: 12, minute: 0, second: 0 },
    });
    const monthFlip =
      beforeJie.pillars.month.ganZhi !== afterJie.pillars.month.ganZhi ||
      (beforeJie.jieQi.nextJie?.name !== afterJie.jieQi.prevJie?.name &&
        afterJie.monthCommand.daysFromJie !== null &&
        afterJie.monthCommand.daysFromJie >= 0);
    rows.push(
      check(
        "trước/sau Jie",
        monthFlip &&
          afterJie.monthCommand.daysFromJie !== null &&
          afterJie.monthCommand.daysFromJie >= 0,
        `month ${beforeJie.pillars.month.ganZhi}→${afterJie.pillars.month.ganZhi}; daysFromJie after=${afterJie.monthCommand.daysFromJie}; prevJie=${afterJie.jieQi.prevJie?.name}`,
      ),
    );
  } catch (e) {
    rows.push(check("trước/sau Jie", false, String(e)));
  }

  // 22:59 / 23:00 / 23:59 / 00:00
  try {
    const mk = (h: number, m: number, day: number) =>
      calculateBaZi({
        timezone: "Asia/Ho_Chi_Minh",
        gender: "male",
        local: {
          year: 1986,
          month: 11,
          day,
          hour: h,
          minute: m,
          second: 0,
        },
        conventions: { dayBoundaryMode: "midnight_00" },
      });
    const t2259 = mk(22, 59, 3);
    const t2300 = mk(23, 0, 3);
    const t2359 = mk(23, 59, 3);
    const t0000 = mk(0, 0, 4);
    const zi = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: {
        year: 1986,
        month: 11,
        day: 3,
        hour: 23,
        minute: 0,
        second: 0,
      },
      conventions: { dayBoundaryMode: "zi_start_23" },
    });
    const okMid =
      t2259.pillars.day.ganZhi === t2300.pillars.day.ganZhi &&
      t2300.pillars.day.ganZhi === t2359.pillars.day.ganZhi &&
      t2259.pillars.day.ganZhi !== t0000.pillars.day.ganZhi;
    const okZi = t2259.pillars.day.ganZhi !== zi.pillars.day.ganZhi;
    rows.push(
      check(
        "22:59 / 23:00 / 23:59 / 00:00 (midnight_00 + zi_start_23)",
        okMid && okZi,
        `mid day=${t2259.pillars.day.ganZhi}/${t2300.pillars.day.ganZhi}/${t2359.pillars.day.ganZhi}→${t0000.pillars.day.ganZhi}; zi@23:00=${zi.pillars.day.ganZhi}`,
      ),
    );
  } catch (e) {
    rows.push(
      check("22:59 / 23:00 / 23:59 / 00:00 (midnight_00 + zi_start_23)", false, String(e)),
    );
  }

  // case nữ 05/05/2026 23:46
  try {
    const c = calculateBaZi({
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
    const dbg = extractCoreDebugSnapshot(c);
    const ok =
      c.timeBasis.mode === "vn_civil" &&
      c.isLateRatHour === true &&
      c.usefulGod === null &&
      c.directions === null &&
      !!dbg.birthLocal &&
      !!dbg.birthAbsolute &&
      !!dbg.libraryTermClock &&
      !!dbg.prevJie &&
      !!dbg.nextJie &&
      dbg.minutesFromPrevJie !== null &&
      dbg.daysFromJie !== null &&
      !!dbg.monthCommand?.commandingStem &&
      !!dbg.yunStartRaw &&
      !!dbg.yunStartLocal;
    rows.push(
      check(
        "case nữ 05/05/2026 23:46",
        ok,
        `pillars=${c.pillars.year.ganZhi}/${c.pillars.month.ganZhi}/${c.pillars.day.ganZhi}/${c.pillars.hour.ganZhi}; forward=${c.yun.isForward}; lateRat=${c.isLateRatHour}`,
      ),
    );
  } catch (e) {
    rows.push(check("case nữ 05/05/2026 23:46", false, String(e)));
  }

  // thuận/nghịch Đại vận
  try {
    const male = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: {
        year: 1986,
        month: 11,
        day: 12,
        hour: 17,
        minute: 45,
        second: 0,
      },
    });
    const female = calculateBaZi({
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
    rows.push(
      check(
        "thuận/nghịch Đại vận",
        male.yun.isForward === true && female.yun.isForward === false,
        `male1986 forward=${male.yun.isForward}; female2026 forward=${female.yun.isForward}`,
      ),
    );
  } catch (e) {
    rows.push(check("thuận/nghịch Đại vận", false, String(e)));
  }

  // monthCommand
  try {
    const c = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: {
        year: 1986,
        month: 11,
        day: 12,
        hour: 17,
        minute: 45,
        second: 0,
      },
    });
    rows.push(
      check(
        "monthCommand",
        c.monthCommand.mode === "ziPingZhenQuan_v1" &&
          c.monthCommand.sourceId === "monthCommand.ziPingZhenQuan.v1" &&
          c.monthCommand.branch === "亥" &&
          (c.monthCommand.daysFromJie ?? 0) > 1 &&
          !!c.monthCommand.commandingStem,
        `mode=${c.monthCommand.mode}; stem=${c.monthCommand.commandingStem}; daysFromJie=${c.monthCommand.daysFromJie}`,
      ),
    );
  } catch (e) {
    rows.push(check("monthCommand", false, String(e)));
  }

  // relations[]
  try {
    const c = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: {
        year: 1986,
        month: 11,
        day: 12,
        hour: 17,
        minute: 45,
        second: 0,
      },
    });
    const names = c.relations.map((r) => r.name);
    const need = ["乙庚合", "寅亥合", "寅申冲", "申亥害", "寅申刑"];
    const hasSource = c.relations.every((r) => !!r.sourceId);
    const noFalseThree = !names.includes("寅巳申刑");
    const stemCombo = c.relations.find((r) => r.name === "乙庚合");
    rows.push(
      check(
        "relations[] sourceId + hợp hóa + tam hình 2/3",
        need.every((n) => names.includes(n)) &&
          hasSource &&
          noFalseThree &&
          stemCombo?.transformStatus === "combineOnly",
        `names ok; sourceId=${hasSource}; no 寅巳申刑; transformStatus=${stemCombo?.transformStatus}`,
      ),
    );
  } catch (e) {
    rows.push(
      check("relations[] sourceId + hợp hóa + tam hình 2/3", false, String(e)),
    );
  }

  // nearZiBoundary tight
  try {
    const mid = computeBoundaryFlags({
      hour: 22,
      minute: 30,
      minutesToPrevJie: 10_000,
      minutesToNextJie: 10_000,
      minutesToLiChun: 10_000,
    });
    const tight = computeBoundaryFlags({
      hour: 23,
      minute: 5,
      minutesToPrevJie: 10_000,
      minutesToNextJie: 10_000,
      minutesToLiChun: 10_000,
    });
    rows.push(
      check(
        "nearZiBoundary tight (±10′); wide = nearZiWindowWide",
        mid.nearZiBoundary === false &&
          mid.nearZiWindowWide === true &&
          tight.nearZiBoundary === true,
        `22:30 nearZi=${mid.nearZiBoundary} wide=${mid.nearZiWindowWide}; 23:05 nearZi=${tight.nearZiBoundary}`,
      ),
    );
  } catch (e) {
    rows.push(
      check("nearZiBoundary tight (±10′); wide = nearZiWindowWide", false, String(e)),
    );
  }

  // DoD-B′ hybrid + same instant
  try {
    const civil = {
      year: 2026,
      month: 5,
      day: 5,
      hour: 23,
      minute: 46,
      second: 0,
    };
    const ic = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "female",
      local: civil,
      conventions: { timeBasisMode: "instant_consistent" },
    });
    const dbg = extractCoreDebugSnapshot(ic);
    const sh = calculateBaZi({
      timezone: "Asia/Shanghai",
      gender: "female",
      local: { year: 2026, month: 5, day: 6, hour: 0, minute: 46, second: 0 },
      conventions: { timeBasisMode: "instant_consistent" },
    });
    const ny = calculateBaZi({
      timezone: "America/New_York",
      gender: "female",
      local: { year: 2026, month: 5, day: 5, hour: 12, minute: 46, second: 0 },
      conventions: { timeBasisMode: "instant_consistent" },
    });
    const okHybrid =
      dbg.libraryTermClock === "2026-05-06 00:46:00" &&
      dbg.minutesFromPrevJie === 298 &&
      ic.pillars.day.ganZhi === "己卯";
    const okSame =
      ic.timeBasis.birthAbsoluteIso === sh.timeBasis.birthAbsoluteIso &&
      sh.timeBasis.birthAbsoluteIso === ny.timeBasis.birthAbsoluteIso &&
      ic.pillars.year.ganZhi === sh.pillars.year.ganZhi &&
      ic.pillars.month.ganZhi === sh.pillars.month.ganZhi;
    rows.push(
      check(
        "DoD-B′ hybrid Case B + same-UTC multi-TZ",
        okHybrid && okSame,
        `lib=${dbg.libraryTermClock}; min=${dbg.minutesFromPrevJie}; day=${ic.pillars.day.ganZhi}; absMatch=${okSame}`,
      ),
    );
  } catch (e) {
    rows.push(
      check("DoD-B′ hybrid Case B + same-UTC multi-TZ", false, String(e)),
    );
  }

  // Dịch Mã — cùng rule TRAVELING_HORSE; không có base → 午
  try {
    const c = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: {
        year: 1986,
        month: 11,
        day: 12,
        hour: 17,
        minute: 45,
        second: 0,
      },
    });
    const natalHorse = Object.values(c.pillars).some((p) =>
      p.shenSha.some((s) => s.key === "horse" && s.name === "Dịch Mã"),
    );
    const dyNgo = c.yun.daYun.find((d) => d.ganZhi.endsWith("午"));
    const lnNgo = c.yun.daYun
      .flatMap((d) => d.liuNian)
      .find((ln) => ln.ganZhi.endsWith("午"));
    const dyHorse = dyNgo?.shenSha?.some((s) => s.key === "horse") ?? false;
    const lnHorse = lnNgo?.shenSha?.some((s) => s.key === "horse") ?? false;
    // TRAVELING_HORSE không map → 午 → Ngọ ĐV/LN không được gắn Dịch Mã giả
    const okNoFalseNgo = !dyHorse && !lnHorse;
    rows.push(
      check(
        "Dịch Mã",
        okNoFalseNgo,
        `natalHasHorse=${natalHorse}; ĐV-Ngọ horse=${dyHorse}; LN-Ngọ horse=${lnHorse}; rule=shensha.yima.yearOrDay.v1 (no map→午)`,
      ),
    );
  } catch (e) {
    rows.push(check("Dịch Mã", false, String(e)));
  }

  // Đào Hoa/Hàm Trì dedup
  try {
    const c = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: {
        year: 1986,
        month: 11,
        day: 12,
        hour: 17,
        minute: 45,
        second: 0,
      },
    });
    let ok = true;
    let detail = "";
    for (const key of ["year", "month", "day", "hour"] as const) {
      const stars = c.pillars[key].shenSha;
      const peach = stars.filter((s) => s.key === "tao_hua_xian_chi");
      if (peach.length > 1) ok = false;
      if (stars.some((s) => s.key === "peach" || s.key === "hamchi")) ok = false;
      if (peach[0] && peach[0].name !== "Đào Hoa (Hàm Trì)") ok = false;
    }
    const hourPeach = c.pillars.hour.shenSha.filter(
      (s) => s.key === "tao_hua_xian_chi",
    );
    detail = `hour peach count=${hourPeach.length}${hourPeach[0] ? ` name=${hourPeach[0].name}` : ""}`;
    rows.push(check("Đào Hoa/Hàm Trì dedup", ok, detail));
  } catch (e) {
    rows.push(check("Đào Hoa/Hàm Trì dedup", false, String(e)));
  }

  // natal / ĐV / LN cùng rule Thần Sát
  try {
    const c = calculateBaZi({
      timezone: "Asia/Ho_Chi_Minh",
      gender: "male",
      local: {
        year: 1986,
        month: 11,
        day: 12,
        hour: 17,
        minute: 45,
        second: 0,
      },
    });
    const hasSource = (arr: { sourceId?: string }[] | undefined) =>
      (arr ?? []).every((s) => typeof s.sourceId === "string" && s.sourceId.length > 0);
    const natalOk = (["year", "month", "day", "hour"] as const).every((k) =>
      hasSource(c.pillars[k].shenSha),
    );
    const dyOk = c.yun.daYun.every((d) => hasSource(d.shenSha));
    const lnSample = c.yun.daYun[0]?.liuNian?.slice(0, 3) ?? [];
    const lnOk = lnSample.every((ln) => hasSource(ln.shenSha));
    // structural lu/ren not in shen sha rows
    const noStructural = (["year", "month", "day", "hour"] as const).every((k) =>
      c.pillars[k].shenSha.every(
        (s) => !/lu|yangren|yinren/.test(s.key) && !/Lộc Thần|Dương Nhẫn/.test(s.name),
      ),
    );
    rows.push(
      check(
        "natal / Đại vận / Lưu niên dùng cùng rule Thần Sát",
        natalOk && dyOk && lnOk && noStructural,
        `sourceId present natal/ĐV/LN; structural lu/ren excluded=${noStructural}`,
      ),
    );
  } catch (e) {
    rows.push(
      check(
        "natal / Đại vận / Lưu niên dùng cùng rule Thần Sát",
        false,
        String(e),
      ),
    );
  }

  // usefulGod / directions null
  try {
    const c = calculateBaZi({
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
    rows.push(
      check(
        "usefulGod=null & directions=null (Core)",
        c.usefulGod === null &&
          c.directions === null &&
          c.facts.reasoning.usefulGod === null &&
          c.facts.reasoning.directionsGoodBad === null,
        `usefulGod=${String(c.usefulGod)}; directions=${String(c.directions)}`,
      ),
    );
  } catch (e) {
    rows.push(check("usefulGod=null & directions=null (Core)", false, String(e)));
  }

  return rows;
}

describe("export Core acceptance pack", () => {
  it("writes Word + JSON with 4 acceptance groups", async () => {
    const commitFull = git("git rev-parse HEAD");
    const commitShort = git("git rev-parse --short HEAD");
    const dirty = git("git status --porcelain") !== "";
    const branch = git("git rev-parse --abbrev-ref HEAD");

    const caseA = buildAcceptanceCase(
      "Case A — 12/11/1986 17:45 Phú Thọ Nam",
      calculateBaZi({
        timezone: "Asia/Ho_Chi_Minh",
        gender: "male",
        local: {
          year: 1986,
          month: 11,
          day: 12,
          hour: 17,
          minute: 45,
          second: 0,
        },
      }),
      { place: "Phú Thọ", genderLabel: "Nam" },
    );

    const caseB = buildAcceptanceCase(
      "Case B — 05/05/2026 23:46 Hà Nội Nữ (vn_civil default)",
      calculateBaZi({
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
      }),
      { place: "Hà Nội", genderLabel: "Nữ" },
    );

    const caseBInstant = buildAcceptanceCase(
      "Case B′ — 05/05/2026 23:46 Hà Nội Nữ (instant_consistent hybrid)",
      calculateBaZi({
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
        conventions: { timeBasisMode: "instant_consistent" },
      }),
      { place: "Hà Nội", genderLabel: "Nữ" },
    );

    const checklist = runChecklist();
    const vitestLog = (() => {
      try {
        return execSync("npx vitest run --config vitest.config.ts", {
          cwd: root,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (e) {
        const err = e as { stdout?: string; stderr?: string; message?: string };
        return `${err.stdout ?? ""}\n${err.stderr ?? ""}\n${err.message ?? ""}`;
      }
    })();

    const versionScope = {
      gitCommit: commitFull,
      gitCommitShort: commitShort,
      gitBranch: branch,
      workingTreeDirty: dirty,
      buildId: `acceptance-${commitShort}${dirty ? "-dirty" : ""}-sprint2`,
      packageVersion: JSON.parse(read("package.json")).version as string,
      engineVersion: ENGINE_VERSION,
      ruleSetVersion: RULE_SET_VERSION,
      scope:
        "DoD-A: vn_civil = compatibility mode (default HCM), NOT astronomical vô khuyết. DoD-B′: instant_consistent hybrid — Year/Month/Jie/Yun on Asia/Shanghai libraryTermClock; Day/Hour on birth localCivil + Dạ Tý.",
      dayBoundaryModeDefault: DEFAULT_CONVENTIONS.dayBoundaryMode,
      renModeDefault: DEFAULT_CONVENTIONS.renMode,
      monthCommandModeDefault: DEFAULT_CONVENTIONS.monthCommandSchool,
      yunSect: DEFAULT_CONVENTIONS.yunSect,
      timeBasisModeDefault: "auto: HCM→vn_civil; else→instant_consistent",
      trueSolarTimeEnabled: DEFAULT_CONVENTIONS.trueSolarTimeEnabled,
      codeFiles: [
        "src/lib/astrology-engine.ts",
        "src/lib/core/jieqi-boundaries.ts",
        "src/lib/core/month-command.ts",
        "src/lib/core/relations.ts (checklist name: stem-branch-relations.ts)",
        "src/lib/core/daymaster-qi.ts",
        "src/lib/core/conventions.ts",
        "src/lib/bazi-shen-sha.ts",
      ],
      noteStemBranchFile:
        "Repo không có stem-branch-relations.ts — file quan hệ can chi là src/lib/core/relations.ts.",
    };

    const pack = {
      exportedAt: new Date().toISOString(),
      versionScope,
      checklist,
      caseA,
      caseB,
      caseBInstant,
      caseBRaw10: caseB.rawDebug10,
      caseBInstantRaw10: caseBInstant.rawDebug10,
      vitestSummary: vitestLog
        .split(/\r?\n/)
        .filter((l) => /✓|×|PASS|FAIL|Tests |Test Files/.test(l))
        .join("\n"),
    };

    mkdirSync(outDir, { recursive: true });
    const jsonPath = join(outDir, "BAZIVN-core-acceptance-pack.json");
    writeFileSync(jsonPath, JSON.stringify(pack, null, 2), "utf8");

    const coreFiles: Array<{ title: string; rel: string }> = [
      {
        title: "src/lib/astrology-engine.ts",
        rel: "src/lib/astrology-engine.ts",
      },
      {
        title: "src/lib/core/jieqi-boundaries.ts",
        rel: "src/lib/core/jieqi-boundaries.ts",
      },
      {
        title: "src/lib/core/month-command.ts",
        rel: "src/lib/core/month-command.ts",
      },
      {
        title:
          "src/lib/core/relations.ts (= stem-branch-relations trong checklist)",
        rel: "src/lib/core/relations.ts",
      },
      {
        title: "src/lib/core/daymaster-qi.ts",
        rel: "src/lib/core/daymaster-qi.ts",
      },
      {
        title: "src/lib/core/conventions.ts",
        rel: "src/lib/core/conventions.ts",
      },
      { title: "src/lib/bazi-shen-sha.ts", rel: "src/lib/bazi-shen-sha.ts" },
    ];

    const children = [
      h1("BaziVN — Pack nghiệm thu Core (vòng cuối)"),
      p(
        `Xuất: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`,
      ),
      p(
        "Gồm 4 nhóm: (1) code core hiện hành · (2) raw JSON 2 case chuẩn · (3) test log · (4) version/scope. Chấm PASS / FAIL / CẦN SỬA.",
      ),

      h1("4. Version & scope"),
      p(`git commit: ${versionScope.gitCommit}`),
      p(`git short / build id: ${versionScope.buildId}`),
      p(
        `branch: ${versionScope.gitBranch} · workingTreeDirty=${String(dirty)}`,
      ),
      p(`packageVersion: ${versionScope.packageVersion}`),
      p(`engineVersion: ${versionScope.engineVersion}`),
      p(`ruleSetVersion: ${versionScope.ruleSetVersion}`),
      p(`scope: ${versionScope.scope}`),
      p(`dayBoundaryMode default: ${versionScope.dayBoundaryModeDefault}`),
      p(`renMode default: ${versionScope.renModeDefault}`),
      p(`monthCommandMode default: ${versionScope.monthCommandModeDefault}`),
      p(`yunSect: ${String(versionScope.yunSect)}`),
      p(`timeBasisMode default: ${versionScope.timeBasisModeDefault}`),
      note(versionScope.noteStemBranchFile),

      h1("3. Test log / regression checklist"),
      p(`Vitest: ${pack.vitestSummary || "(xem sidecar JSON)"}`),
      ...checklist.map((r) =>
        p(`[${r.status}] ${r.name}${r.detail ? ` — ${r.detail}` : ""}`, {
          bold: r.status === "FAIL",
          color: r.status === "FAIL" ? "B00020" : "1B5E20",
        }),
      ),

      h1("2. Raw JSON / Fact Graph — 2 case chuẩn"),
      h2("Case A — 12/11/1986 17:45 – Phú Thọ – Nam – Asia/Ho_Chi_Minh"),
      ...codeBlock(JSON.stringify(caseA, null, 2)),
      h2("Case B — 05/05/2026 23:46 – Hà Nội – Nữ – vn_civil (default)"),
      ...codeBlock(JSON.stringify(caseB, null, 2)),
      h2("Case B — raw 10 field (vn_civil)"),
      ...codeBlock(JSON.stringify(caseB.rawDebug10, null, 2)),
      h2("Case B′ — cùng birth civil, instant_consistent hybrid"),
      note(
        "Year/Month/Jie/Yun trên libraryTermClock Asia/Shanghai; Day/Hour giữ local civil + Dạ Tý.",
      ),
      ...codeBlock(JSON.stringify(caseBInstant, null, 2)),
      h2("Case B′ — raw 10 field (instant_consistent)"),
      ...codeBlock(JSON.stringify(caseBInstant.rawDebug10, null, 2)),

      h1("1. Code core hiện hành (7 file)"),
      note(
        "File quan hệ can chi trong repo: relations.ts (checklist gọi stem-branch-relations.ts).",
      ),
    ];

    for (const f of coreFiles) {
      children.push(h2(f.title));
      children.push(...codeBlock(read(f.rel)));
    }

    children.push(h1("Phụ lục — vitest stdout (rút gọn)"));
    children.push(...codeBlock(pack.vitestSummary || vitestLog.slice(0, 4000)));

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 720, right: 720 },
            },
          },
          children,
        },
      ],
    });

    const outPath = join(outDir, "BAZIVN-core-acceptance-pack.docx");
    const buffer = await Packer.toBuffer(doc);
    writeFileSync(outPath, buffer);

    const failCount = checklist.filter((r) => r.status === "FAIL").length;
    // eslint-disable-next-line no-console
    console.log("Wrote", outPath);
    // eslint-disable-next-line no-console
    console.log("Wrote", jsonPath);
    // eslint-disable-next-line no-console
    console.log("Bytes docx", buffer.length);
    for (const r of checklist) {
      // eslint-disable-next-line no-console
      console.log(`  [${r.status}] ${r.name}`);
    }

    expect(failCount, JSON.stringify(checklist, null, 2)).toBe(0);
    expect(caseA.usefulGod).toBeNull();
    expect(caseB.usefulGod).toBeNull();
    expect(caseB.rawDebug10.birthLocal).toBe("2026-05-05 23:46:00");
  }, 120_000);
});
