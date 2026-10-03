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
import { computeStemBranchRelations } from "@/lib/core/relations";
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

  const dayBoundaryMode = chart.conventions.dayBoundaryMode;
  const dayPillar = chart.pillars.day.ganZhi;
  const hourPillar = chart.pillars.hour.ganZhi;

  return {
    label,
    place: meta.place,
    gender: meta.genderLabel,
    timezone: chart.timezone,
    engineVersion: chart.facts.meta.engineVersion,
    ruleSetVersion: chart.facts.meta.ruleSetVersion,
    conventions: chart.conventions,
    dayBoundaryMode,
    birthLocal: dbg.birthLocal,
    birthAbsolute: dbg.birthAbsolute,
    /** Clock dùng cho Jie / Yun / Year / Month (DoD-B′ = libraryTermClock). */
    clockForJieYun: dbg.libraryTermClock,
    libraryTermClock: dbg.libraryTermClock,
    timeBasisMode: chart.timeBasis.mode,
    libraryTermTimezone: chart.timeBasis.libraryTermTimezone,
    dayPillar,
    hourPillar,
    dayPillarVi: chart.pillars.day.ganZhiVi,
    hourPillarVi: chart.pillars.hour.ganZhiVi,
    pillars: {
      year: chart.pillars.year.ganZhi,
      month: chart.pillars.month.ganZhi,
      day: dayPillar,
      hour: hourPillar,
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
    relationsMeta: {
      allHaveSourceId: chart.relations.every((r) => !!r.sourceId),
      withTransformStatus: chart.relations
        .filter((r) => r.transformStatus)
        .map((r) => ({
          name: r.name,
          transformStatus: r.transformStatus,
        })),
      contested: chart.relations
        .filter((r) => r.contested)
        .map((r) => ({
          name: r.name,
          contestedWith: r.contestedWith,
        })),
      punishments: chart.relations
        .filter((r) =>
          [
            "branchPunishmentPair",
            "branchThreePunishment",
            "branchSelfPunishment",
          ].includes(r.type),
        )
        .map((r) => ({ type: r.type, name: r.name, members: r.members })),
    },
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
    boundaries: chart.boundaries,
    /** Flat audit block (Case B′ yêu cầu nghiệm thu). */
    auditFlat: {
      birthLocal: dbg.birthLocal,
      birthAbsolute: dbg.birthAbsolute,
      clockForJieYun: dbg.libraryTermClock,
      libraryTermClock: dbg.libraryTermClock,
      prevJie: dbg.prevJie,
      nextJie: dbg.nextJie,
      minutesFromPrevJie,
      daysFromJie: dbg.daysFromJie,
      monthCommand: chart.monthCommand,
      dayBoundaryMode,
      dayPillar,
      hourPillar,
      relations: chart.relations,
      yunStartRaw: dbg.yunStartRaw,
      yunStartLocal: dbg.yunStartLocal,
      usefulGod: chart.usefulGod,
      directions: chart.directions,
    },
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

const LOCK_FIXES = [
  "1. Default timeBasis = instant_consistent (DoD-B′ hybrid) cho mọi TZ kể cả VN; vn_civil = Legacy override explicit.",
  "2. monthCommand ziPingZhenQuan_v1 tableVersion 1.1.0: 申=戊10/壬3/庚17 · 亥=戊7/甲5/壬18 (《子平真诠》).",
  "3. relations: tách branchHalfHarmony (bán hợp, có trung thần) vs branchArchHarmony (拱合, thiếu trung thần).",
  "4. tranh hợp: contested/contestedWith + comboKey phân biệt cùng tên; golden case trong pack highlights.",
  "5. Hybrid TZ: Year/Month/Jie/Yun trên libraryTermClock Asia/Shanghai; Day/Hour localCivil + Dạ Tý.",
  "6. Release: engine 0.3.2-core · rule-set bazi-core-2026-10-03-lock-rc · acceptance pack workingTreeDirty=false.",
];

function runChecklist(): ChecklistRow[] {
  const rows: ChecklistRow[] = [];

  // trước/sau Lập Xuân
  try {
    // Hybrid: HCM civil = library Shanghai − 1h around 立春
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
      c.timeBasis.mode === "instant_consistent" &&
      c.isLateRatHour === true &&
      c.usefulGod === null &&
      c.directions === null &&
      dbg.libraryTermClock === "2026-05-06 00:46:00" &&
      dbg.minutesFromPrevJie === 298 &&
      c.pillars.day.ganZhi === "己卯" &&
      c.monthCommand.tableVersion === "1.1.0" &&
      !!dbg.birthLocal &&
      !!dbg.birthAbsolute &&
      !!dbg.prevJie &&
      !!dbg.nextJie &&
      dbg.daysFromJie !== null &&
      !!dbg.monthCommand?.commandingStem &&
      !!dbg.yunStartRaw &&
      !!dbg.yunStartLocal;
    rows.push(
      check(
        "case nữ 05/05/2026 23:46 (default hybrid)",
        ok,
        `mode=${c.timeBasis.mode}; lib=${dbg.libraryTermClock}; day=${c.pillars.day.ganZhi}; table=${c.monthCommand.tableVersion}`,
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

  // DoD-B′ hybrid default + same instant
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
    });
    const dbg = extractCoreDebugSnapshot(ic);
    const sh = calculateBaZi({
      timezone: "Asia/Shanghai",
      gender: "female",
      local: { year: 2026, month: 5, day: 6, hour: 0, minute: 46, second: 0 },
    });
    const ny = calculateBaZi({
      timezone: "America/New_York",
      gender: "female",
      local: { year: 2026, month: 5, day: 5, hour: 12, minute: 46, second: 0 },
    });
    const okHybrid =
      ic.timeBasis.mode === "instant_consistent" &&
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
        "DoD-B′ hybrid default + same-UTC multi-TZ",
        okHybrid && okSame,
        `mode=${ic.timeBasis.mode}; lib=${dbg.libraryTermClock}; min=${dbg.minutesFromPrevJie}; day=${ic.pillars.day.ganZhi}; absMatch=${okSame}`,
      ),
    );
  } catch (e) {
    rows.push(
      check("DoD-B′ hybrid default + same-UTC multi-TZ", false, String(e)),
    );
  }

  // half vs arch + tranh hợp golden
  try {
    const half = computeStemBranchRelations({
      year: { gan: "甲", zhi: "申" },
      month: { gan: "乙", zhi: "子" },
      day: { gan: "丙", zhi: "丑" },
      hour: { gan: "丁", zhi: "卯" },
    });
    const arch = computeStemBranchRelations({
      year: { gan: "甲", zhi: "申" },
      month: { gan: "乙", zhi: "辰" },
      day: { gan: "丙", zhi: "丑" },
      hour: { gan: "丁", zhi: "卯" },
    });
    const tranh = computeStemBranchRelations({
      year: { gan: "庚", zhi: "子" },
      month: { gan: "庚", zhi: "丑" },
      day: { gan: "乙", zhi: "寅" },
      hour: { gan: "乙", zhi: "卯" },
    }).filter((r) => r.type === "stemCombination");
    rows.push(
      check(
        "bán hợp vs củng hợp + tranh hợp golden",
        half.some((r) => r.type === "branchHalfHarmony" && r.name === "申子半合") &&
          arch.some((r) => r.type === "branchArchHarmony" && r.name === "申辰拱合") &&
          tranh.length >= 2 &&
          tranh.every((r) => r.contested === true),
        `half=${half.find((r) => r.type === "branchHalfHarmony")?.name}; arch=${arch.find((r) => r.type === "branchArchHarmony")?.name}; tranh=${tranh.length}`,
      ),
    );
  } catch (e) {
    rows.push(
      check("bán hợp vs củng hợp + tranh hợp golden", false, String(e)),
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
      if (peach[0] && peach[0].name !== "Đào Hoa") ok = false;
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

    const caseBLegacy = buildAcceptanceCase(
      "Case B Legacy — 05/05/2026 23:46 Hà Nội Nữ (vn_civil explicit)",
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
        conventions: { timeBasisMode: "vn_civil" },
      }),
      { place: "Hà Nội", genderLabel: "Nữ" },
    );

    const caseBInstant = buildAcceptanceCase(
      "Case B′ — 05/05/2026 23:46 Hà Nội Nữ (instant_consistent default hybrid)",
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

    const goldenTranhHop = computeStemBranchRelations({
      year: { gan: "庚", zhi: "子" },
      month: { gan: "庚", zhi: "丑" },
      day: { gan: "乙", zhi: "寅" },
      hour: { gan: "乙", zhi: "卯" },
    })
      .filter((r) => r.type === "stemCombination" && r.contested)
      .map((r) => ({
        name: r.name,
        members: r.members,
        contested: r.contested,
        contestedWith: r.contestedWith,
        transformStatus: r.transformStatus,
        sourceId: r.sourceId,
      }));

    const halfVsArch = {
      half: computeStemBranchRelations({
        year: { gan: "甲", zhi: "申" },
        month: { gan: "乙", zhi: "子" },
        day: { gan: "丙", zhi: "丑" },
        hour: { gan: "丁", zhi: "卯" },
      })
        .filter((r) => r.type === "branchHalfHarmony" || r.type === "branchArchHarmony")
        .map((r) => ({ type: r.type, name: r.name, sourceId: r.sourceId })),
      arch: computeStemBranchRelations({
        year: { gan: "甲", zhi: "申" },
        month: { gan: "乙", zhi: "辰" },
        day: { gan: "丙", zhi: "丑" },
        hour: { gan: "丁", zhi: "卯" },
      })
        .filter((r) => r.type === "branchHalfHarmony" || r.type === "branchArchHarmony")
        .map((r) => ({ type: r.type, name: r.name, sourceId: r.sourceId })),
    };

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
      buildId: `acceptance-${commitShort}${dirty ? "-dirty" : ""}-lock-rc`,
      packageVersion: JSON.parse(read("package.json")).version as string,
      engineVersion: ENGINE_VERSION,
      ruleSetVersion: RULE_SET_VERSION,
      scope:
        "Lock-rc: default instant_consistent (DoD-B′ hybrid) mọi TZ kể cả VN — Year/Month/Jie/Yun trên Asia/Shanghai libraryTermClock; Day/Hour localCivil + Dạ Tý. vn_civil = Legacy override explicit (DoD-A compatibility, NOT vô khuyết).",
      dayBoundaryModeDefault: DEFAULT_CONVENTIONS.dayBoundaryMode,
      renModeDefault: DEFAULT_CONVENTIONS.renMode,
      monthCommandModeDefault: DEFAULT_CONVENTIONS.monthCommandSchool,
      monthCommandTableVersion: caseA.monthCommand.tableVersion,
      yunSect: DEFAULT_CONVENTIONS.yunSect,
      timeBasisModeDefault: "instant_consistent",
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

    const passCount = checklist.filter((r) => r.status === "PASS").length;
    const failCountPre = checklist.filter((r) => r.status === "FAIL").length;
    const vitestSummary = vitestLog
      .split(/\r?\n/)
      .filter((l) => /✓|×|PASS|FAIL|Tests |Test Files/.test(l))
      .join("\n");

    const pack = {
      exportedAt: new Date().toISOString(),
      purpose: "Acceptance pack Core BaziVN — lock-rc (4 hạng mục khóa)",
      lockFixes: LOCK_FIXES,
      versionScope,
      checklist,
      checklistSummary: {
        pass: passCount,
        fail: failCountPre,
        total: checklist.length,
      },
      vitestSummary,
      highlights: {
        tamHinhCaseA: caseA.relationsMeta.punishments,
        relationsSourceId: caseA.relationsMeta.allHaveSourceId,
        transformStatusSamples: caseA.relationsMeta.withTransformStatus.slice(
          0,
          8,
        ),
        contestedSamples: caseA.relationsMeta.contested,
        goldenTranhHop,
        halfVsArch,
        monthCommandTableVersion: caseA.monthCommand.tableVersion,
        nearZiBoundary: {
          note: "tight ±10′; wide = nearZiWindowWide",
          sampleCaseBBoundaries: caseBInstant.boundaries,
        },
        sameUtcMultiTz: checklist.find((c) =>
          c.name.includes("same-UTC"),
        ),
        caseBPrimeAuditFlat: caseBInstant.auditFlat,
      },
      caseA,
      caseB: caseBLegacy,
      caseBInstant,
      caseAAuditFlat: caseA.auditFlat,
      caseBInstantAuditFlat: caseBInstant.auditFlat,
      caseBRaw10: caseBLegacy.rawDebug10,
      caseBInstantRaw10: caseBInstant.rawDebug10,
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
      h1("BaziVN — Acceptance Pack Core (lock-rc)"),
      p(
        `Xuất: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`,
      ),
      p(
        "Nghiệm thu khóa Core: artifact/version → raw facts → regression → logic chuyên môn. Chỉ Core — không gồm WIP UI.",
      ),

      h1("0. Hạng mục lock-rc"),
      ...LOCK_FIXES.map((line) => p(line)),

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
      p(`monthCommand tableVersion: ${versionScope.monthCommandTableVersion}`),
      p(`yunSect: ${String(versionScope.yunSect)}`),
      p(`timeBasisMode default: ${versionScope.timeBasisModeDefault}`),
      note(versionScope.noteStemBranchFile),

      h1("3. Test log / regression checklist"),
      p(
        `Checklist: ${passCount}/${checklist.length} PASS · FAIL=${failCountPre}`,
      ),
      p(`Vitest: ${vitestSummary || "(xem sidecar JSON)"}`),
      ...checklist.map((r) =>
        p(`[${r.status}] ${r.name}${r.detail ? ` — ${r.detail}` : ""}`, {
          bold: r.status === "FAIL",
          color: r.status === "FAIL" ? "B00020" : "1B5E20",
        }),
      ),
      h2("Highlights logic"),
      ...codeBlock(JSON.stringify(pack.highlights, null, 2)),

      h1("2. Raw JSON / Fact Graph — Case A + Case B′"),
      h2("Case A — 12/11/1986 17:45 – Phú Thọ – Nam – Asia/Ho_Chi_Minh"),
      ...codeBlock(JSON.stringify(caseA.auditFlat, null, 2)),
      h2("Case A — full Fact Graph"),
      ...codeBlock(JSON.stringify(caseA, null, 2)),
      h2("Case B′ — 05/05/2026 23:46 – Hà Nội – Nữ – instant_consistent default"),
      note(
        "Product default hybrid: clockForJieYun = libraryTermClock Asia/Shanghai; dayPillar/hourPillar từ local civil + Dạ Tý.",
      ),
      ...codeBlock(JSON.stringify(caseBInstant.auditFlat, null, 2)),
      h2("Case B′ — full Fact Graph"),
      ...codeBlock(JSON.stringify(caseBInstant, null, 2)),
      h2("Case B Legacy (vn_civil explicit) — tham chiếu DoD-A"),
      ...codeBlock(JSON.stringify(caseBLegacy.auditFlat, null, 2)),

      h1("1. Code core trọng yếu (Hybrid TZ / relations / boundary)"),
      note(
        "Toàn file: astrology-engine (hybrid dual Solar), time-basis, jieqi-boundaries, relations, month-command, conventions, daymaster-qi, bazi-shen-sha.",
      ),
    ];

    const focusFiles = [
      {
        title: "src/lib/astrology-engine.ts (hybrid term/civil)",
        rel: "src/lib/astrology-engine.ts",
      },
      { title: "src/lib/core/time-basis.ts", rel: "src/lib/core/time-basis.ts" },
      {
        title: "src/lib/core/jieqi-boundaries.ts",
        rel: "src/lib/core/jieqi-boundaries.ts",
      },
      {
        title: "src/lib/core/relations.ts",
        rel: "src/lib/core/relations.ts",
      },
      {
        title: "src/lib/core/month-command.ts",
        rel: "src/lib/core/month-command.ts",
      },
      {
        title: "src/lib/core/conventions.ts",
        rel: "src/lib/core/conventions.ts",
      },
    ];
    for (const f of focusFiles) {
      children.push(h2(f.title));
      children.push(...codeBlock(read(f.rel)));
    }

    children.push(h1("1b. Phụ lục code còn lại"));
    const restFiles = coreFiles.filter(
      (f) => !focusFiles.some((x) => x.rel === f.rel),
    );

    for (const f of restFiles) {
      children.push(h2(f.title));
      children.push(...codeBlock(read(f.rel)));
    }

    children.push(h1("Phụ lục — vitest stdout (rút gọn)"));
    children.push(...codeBlock(vitestSummary || vitestLog.slice(0, 4000)));

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
    // eslint-disable-next-line no-console
    console.log("workingTreeDirty=", dirty, "buildId=", versionScope.buildId);
    for (const r of checklist) {
      // eslint-disable-next-line no-console
      console.log(`  [${r.status}] ${r.name}`);
    }

    expect(failCount, JSON.stringify(checklist, null, 2)).toBe(0);
    expect(dirty, "Acceptance pack must be exported on clean tree").toBe(false);
    expect(caseA.usefulGod).toBeNull();
    expect(caseBInstant.usefulGod).toBeNull();
    expect(caseBInstant.directions).toBeNull();
    expect(caseBInstant.timeBasisMode).toBe("instant_consistent");
    expect(caseBLegacy.timeBasisMode).toBe("vn_civil");
    expect(caseBInstant.auditFlat.dayPillar).toBe("己卯");
    expect(caseBInstant.auditFlat.clockForJieYun).toBe("2026-05-06 00:46:00");
    expect(caseA.monthCommand.tableVersion).toBe("1.1.0");
    expect(goldenTranhHop.length).toBeGreaterThanOrEqual(2);
    expect(halfVsArch.half.some((x) => x.type === "branchHalfHarmony")).toBe(
      true,
    );
    expect(halfVsArch.arch.some((x) => x.type === "branchArchHarmony")).toBe(
      true,
    );
    expect(caseA.relationsMeta.punishments.some((x) => x.name === "寅申刑")).toBe(
      true,
    );
    expect(
      caseA.relationsMeta.punishments.some((x) => x.name === "寅巳申刑"),
    ).toBe(false);
  }, 120_000);
});
