import {
  branchToVi,
  genderPolarityLabel,
  lifeStageToVi,
  naYinToVi,
  pillarToVi,
  solarTermToVi,
  stemToVi,
  tenGodToVi,
  xunKongToVi,
  xunToVi,
} from "@/lib/bazi-terminology";
import {
  computeChartShenSha,
  shenShaForBranch,
  stemDisplayVi,
  type ShenShaItem,
  type ShenShaYuanJu,
} from "@/lib/bazi-shen-sha";
import { pillarFromGanZhi } from "@/lib/bazi-pillar-from-ganzhi";
import {
  computeDirections,
  computeUsefulGod,
  type DirectionResult,
  type UsefulGodResult,
} from "@/lib/bazi-useful-god";
import type { Gender } from "@/lib/bazi-schema";
import { EightChar, Solar } from "lunar-typescript";

/** Sect 2: day pillar stays on the current calendar day during Late Rat Hour (23:00–23:59). */
const BAZI_SECT_LATE_RAT = 2;

const HEAVENLY_STEMS = [
  "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸",
] as const;

const EARTHLY_BRANCHES = [
  "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥",
] as const;

const ZI_HOUR_BRANCH_INDEX = 0;

const ELEMENT_KEYS = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"] as const;

export interface LocalDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface BirthDateTimeInput {
  timezone: string;
  gender: Gender;
  local?: LocalDateTime;
  birthTimeUtc?: Date | string;
}

export interface HiddenStemDetail {
  gan: string;
  ganVi: string;
  tenGod: string;
  tenGodVi: string;
}

export interface PillarDetail {
  ganZhi: string;
  ganZhiVi: string;
  gan: string;
  zhi: string;
  ganVi: string;
  zhiVi: string;
  animal: string;
  elementStem: string;
  elementBranch: string;
  naYin: string;
  naYinVi: string;
  wuXing: string;
  tenGodGan: string;
  tenGodGanVi: string;
  tenGodZhi: string[];
  tenGodZhiVi: string[];
  hideGan: HiddenStemDetail[];
  diShi: string;
  diShiVi: string;
  xun: string;
  xunVi: string;
  xunKong: string;
  xunKongVi: string;
  shenSha: ShenShaItem[];
}

export interface PalaceDetail {
  ganZhi: string;
  ganZhiVi: string;
  naYin: string;
  naYinVi: string;
}

export interface LiuNianDetail {
  year: number;
  age: number;
  ganZhi: string;
  ganZhiVi: string;
  naYinVi: string;
  diShiVi: string;
  hideGanVi: string;
  shenSha: ShenShaItem[];
}

export interface DaYunDetail {
  index: number;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  ganZhi: string;
  ganZhiVi: string;
  naYinVi: string;
  diShiVi: string;
  hideGanVi: string;
  shenSha: ShenShaItem[];
  liuNian: LiuNianDetail[];
}

export interface YunDetail {
  startSolarYear: number;
  startSolarDate: { year: number; month: number; day: number };
  startAge: { years: number; months: number; days: number };
  isForward: boolean;
  daYun: DaYunDetail[];
}

export interface WuXingBalance {
  Mộc: number;
  Hỏa: number;
  Thổ: number;
  Kim: number;
  Thủy: number;
  total: number;
  dominant: string;
}

export interface BaZiChartResult {
  pillars: {
    year: PillarDetail;
    month: PillarDetail;
    day: PillarDetail;
    hour: PillarDetail;
  };
  palaces: {
    taiYuan: PalaceDetail;
    mingGong: PalaceDetail;
    shenGong: PalaceDetail;
  };
  dayMaster: string;
  dayMasterVi: string;
  gender: Gender;
  genderLabel: string;
  solar: LocalDateTime;
  timezone: string;
  isLateRatHour: boolean;
  currentSolarTerm: string | null;
  currentSolarTermVi: string | null;
  monthCommandVi: string;
  nienKhongVi: string;
  nhatKhongVi: string;
  shenSha: ShenShaItem[];
  shenShaYuanJu: ShenShaYuanJu;
  usefulGod: UsefulGodResult;
  directions: DirectionResult;
  lunar: {
    year: number;
    month: number;
    day: number;
    yearInGanZhi: string;
    yearInGanZhiVi: string;
    monthInGanZhi: string;
    monthInGanZhiVi: string;
    dayInGanZhi: string;
    dayInGanZhiVi: string;
  };
  yun: YunDetail;
  wuXingBalance: WuXingBalance;
}

export function isLateRatHour(hour: number, minute: number): boolean {
  return hour === 23 && minute >= 0 && minute <= 59;
}

export function utcToLocalDateTime(
  utc: Date | string,
  timezone: string,
): LocalDateTime {
  const date = typeof utc === "string" ? new Date(utc) : utc;

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid birthTimeUtc value.");
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const lookup = (type: Intl.DateTimeFormatPartTypes) => {
    const value = parts.find((part) => part.type === type)?.value;
    if (value === undefined) {
      throw new Error(`Unable to resolve ${type} for timezone ${timezone}.`);
    }
    return Number(value);
  };

  return {
    year: lookup("year"),
    month: lookup("month"),
    day: lookup("day"),
    hour: lookup("hour") % 24,
    minute: lookup("minute"),
    second: lookup("second"),
  };
}

export function resolveLocalBirthDateTime(
  input: BirthDateTimeInput,
): LocalDateTime {
  if (input.local) return input.local;
  if (input.birthTimeUtc) {
    return utcToLocalDateTime(input.birthTimeUtc, input.timezone);
  }
  throw new Error("Provide either local birth time or birthTimeUtc.");
}

function genderToLibraryValue(gender: Gender): number {
  return gender === "male" ? 1 : 0;
}

function buildHiddenStems(
  hideGan: string[],
  tenGodZhi: string[],
): HiddenStemDetail[] {
  return hideGan.map((gan, index) => ({
    gan,
    ganVi: stemDisplayVi(gan),
    tenGod: tenGodZhi[index] ?? "",
    tenGodVi: tenGodToVi(tenGodZhi[index] ?? ""),
  }));
}

type PillarKey = "year" | "month" | "day" | "hour";

function buildPillarDetail(
  eightChar: EightChar,
  pillar: PillarKey,
  hourOverride?: { gan: string; zhi: string; ganZhi: string },
): PillarDetail {
  const accessors = {
    year: {
      ganZhi: () => eightChar.getYear(),
      gan: () => eightChar.getYearGan(),
      zhi: () => eightChar.getYearZhi(),
      naYin: () => eightChar.getYearNaYin(),
      wuXing: () => eightChar.getYearWuXing(),
      hideGan: () => eightChar.getYearHideGan(),
      tenGodGan: () => eightChar.getYearShiShenGan(),
      tenGodZhi: () => eightChar.getYearShiShenZhi(),
      diShi: () => eightChar.getYearDiShi(),
      xun: () => eightChar.getYearXun(),
      xunKong: () => eightChar.getYearXunKong(),
    },
    month: {
      ganZhi: () => eightChar.getMonth(),
      gan: () => eightChar.getMonthGan(),
      zhi: () => eightChar.getMonthZhi(),
      naYin: () => eightChar.getMonthNaYin(),
      wuXing: () => eightChar.getMonthWuXing(),
      hideGan: () => eightChar.getMonthHideGan(),
      tenGodGan: () => eightChar.getMonthShiShenGan(),
      tenGodZhi: () => eightChar.getMonthShiShenZhi(),
      diShi: () => eightChar.getMonthDiShi(),
      xun: () => eightChar.getMonthXun(),
      xunKong: () => eightChar.getMonthXunKong(),
    },
    day: {
      ganZhi: () => eightChar.getDay(),
      gan: () => eightChar.getDayGan(),
      zhi: () => eightChar.getDayZhi(),
      naYin: () => eightChar.getDayNaYin(),
      wuXing: () => eightChar.getDayWuXing(),
      hideGan: () => eightChar.getDayHideGan(),
      tenGodGan: () => eightChar.getDayShiShenGan(),
      tenGodZhi: () => eightChar.getDayShiShenZhi(),
      diShi: () => eightChar.getDayDiShi(),
      xun: () => eightChar.getDayXun(),
      xunKong: () => eightChar.getDayXunKong(),
    },
    hour: {
      ganZhi: () => eightChar.getTime(),
      gan: () => eightChar.getTimeGan(),
      zhi: () => eightChar.getTimeZhi(),
      naYin: () => eightChar.getTimeNaYin(),
      wuXing: () => eightChar.getTimeWuXing(),
      hideGan: () => eightChar.getTimeHideGan(),
      tenGodGan: () => eightChar.getTimeShiShenGan(),
      tenGodZhi: () => eightChar.getTimeShiShenZhi(),
      diShi: () => eightChar.getTimeDiShi(),
      xun: () => eightChar.getTimeXun(),
      xunKong: () => eightChar.getTimeXunKong(),
    },
  } as const;

  const a = accessors[pillar];
  const gan = hourOverride?.gan ?? a.gan();
  const zhi = hourOverride?.zhi ?? a.zhi();
  const ganZhi = hourOverride?.ganZhi ?? a.ganZhi();
  const stem = stemToVi(gan);
  const branch = branchToVi(zhi);
  const tenGodZhi = a.tenGodZhi();
  const hideGan = a.hideGan();
  const diShi = a.diShi();
  const tenGodGan = pillar === "day" ? "Nhật Chủ" : a.tenGodGan();

  const naYin = a.naYin();
  const xun = a.xun();
  const xunKong = a.xunKong();

  return {
    ganZhi,
    ganZhiVi: pillarToVi(ganZhi),
    gan,
    zhi,
    ganVi: stem.shortLabel ?? stem.label,
    zhiVi: branch.label,
    animal: branch.animal,
    elementStem: stem.element,
    elementBranch: branch.element,
    naYin,
    naYinVi: naYinToVi(naYin),
    wuXing: a.wuXing(),
    tenGodGan,
    tenGodGanVi: pillar === "day" ? "Nhật Chủ" : tenGodToVi(a.tenGodGan()),
    tenGodZhi,
    tenGodZhiVi: tenGodZhi.map(tenGodToVi),
    hideGan: buildHiddenStems(hideGan, tenGodZhi),
    diShi,
    diShiVi: lifeStageToVi(diShi),
    xun,
    xunVi: xunToVi(xun),
    xunKong,
    xunKongVi: xunKongToVi(xunKong),
    shenSha: [],
  };
}

export function computeLateRatHourPillar(local: LocalDateTime): string {
  const nextCalendarDay = Solar.fromYmdHms(
    local.year,
    local.month,
    local.day,
    local.hour,
    local.minute,
    local.second,
  ).next(1);

  const nextDayLunar = Solar.fromYmdHms(
    nextCalendarDay.getYear(),
    nextCalendarDay.getMonth(),
    nextCalendarDay.getDay(),
    12,
    0,
    0,
  ).getLunar();

  const nextDayStemIndex = nextDayLunar.getDayGanIndexExact2();
  const hourStemIndex =
    ((nextDayStemIndex % 5) * 2 + ZI_HOUR_BRANCH_INDEX) % 10;

  return `${HEAVENLY_STEMS[hourStemIndex]}${EARTHLY_BRANCHES[ZI_HOUR_BRANCH_INDEX]}`;
}

function buildHourPillar(
  eightChar: EightChar,
  local: LocalDateTime,
  lateRat: boolean,
): PillarDetail {
  if (!lateRat) return buildPillarDetail(eightChar, "hour");

  const ganZhi = computeLateRatHourPillar(local);
  return buildPillarDetail(eightChar, "hour", {
    ganZhi,
    gan: ganZhi[0] ?? "",
    zhi: ganZhi[1] ?? "",
  });
}

function buildPalace(ganZhi: string, naYin: string): PalaceDetail {
  return {
    ganZhi,
    ganZhiVi: pillarToVi(ganZhi),
    naYin,
    naYinVi: naYinToVi(naYin),
  };
}

function hideGanSummary(
  hideGan: { ganVi: string; tenGodVi: string }[],
): string {
  if (hideGan.length === 0) return "—";
  return hideGan.map((h) => `${h.ganVi.split(" ")[0]} · ${h.tenGodVi}`).join(", ");
}

function buildYun(
  eightChar: EightChar,
  gender: Gender,
  refs: {
    dayStem: string;
    dayBranch: string;
    yearBranch: string;
    monthBranch: string;
  },
): YunDetail {
  const yun = eightChar.getYun(genderToLibraryValue(gender), BAZI_SECT_LATE_RAT);
  const daYunList = yun.getDaYun(10);
  const startSolar = yun.getStartSolar();

  const daYun: DaYunDetail[] = daYunList
    .filter((item) => item.getGanZhi())
    .map((item, index) => {
      const ganZhi = item.getGanZhi();
      const compact = pillarFromGanZhi(ganZhi, refs.dayStem);
      const liuNian = item.getLiuNian(10).map((ln) => {
        const lnGz = ln.getGanZhi();
        const lnCompact = pillarFromGanZhi(lnGz, refs.dayStem);
        return {
          year: ln.getYear(),
          age: ln.getAge(),
          ganZhi: lnGz,
          ganZhiVi: pillarToVi(lnGz),
          naYinVi: lnCompact.naYinVi,
          diShiVi: lnCompact.diShiVi,
          hideGanVi: hideGanSummary(lnCompact.hideGan),
          shenSha: shenShaForBranch(lnCompact.zhi, refs),
        };
      });

      return {
        index,
        startYear: item.getStartYear(),
        endYear: item.getEndYear(),
        startAge: item.getStartAge(),
        endAge: item.getEndAge(),
        ganZhi,
        ganZhiVi: pillarToVi(ganZhi),
        naYinVi: compact.naYinVi,
        diShiVi: compact.diShiVi,
        hideGanVi: hideGanSummary(compact.hideGan),
        shenSha: shenShaForBranch(compact.zhi, refs),
        liuNian,
      };
    });

  return {
    startSolarYear: startSolar.getYear(),
    startSolarDate: {
      year: startSolar.getYear(),
      month: startSolar.getMonth(),
      day: startSolar.getDay(),
    },
    startAge: {
      years: yun.getStartYear(),
      months: yun.getStartMonth(),
      days: yun.getStartDay(),
    },
    isForward: yun.isForward(),
    daYun,
  };
}

function countWuXing(pillars: BaZiChartResult["pillars"]): WuXingBalance {
  const counts: Record<(typeof ELEMENT_KEYS)[number], number> = {
    Mộc: 0,
    Hỏa: 0,
    Thổ: 0,
    Kim: 0,
    Thủy: 0,
  };

  const add = (element: string, weight = 1) => {
    if (element in counts) counts[element as keyof typeof counts] += weight;
  };

  for (const key of ["year", "month", "day", "hour"] as const) {
    const p = pillars[key];
    add(p.elementStem, 1);
    add(p.elementBranch, 1);
    for (const h of p.hideGan) {
      const el = stemToVi(h.gan).element;
      add(el, 0.5);
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Thổ";

  return { ...counts, total, dominant };
}

export function calculateBaZi(input: BirthDateTimeInput): BaZiChartResult {
  const local = resolveLocalBirthDateTime(input);
  const lateRat = isLateRatHour(local.hour, local.minute);

  const solar = Solar.fromYmdHms(
    local.year,
    local.month,
    local.day,
    local.hour,
    local.minute,
    local.second,
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  eightChar.setSect(BAZI_SECT_LATE_RAT);

  const currentJieQi = lunar.getCurrentJieQi();
  const yearGan = eightChar.getYearGan();

  const pillars = {
    year: buildPillarDetail(eightChar, "year"),
    month: buildPillarDetail(eightChar, "month"),
    day: buildPillarDetail(eightChar, "day"),
    hour: buildHourPillar(eightChar, local, lateRat),
  };

  const shenShaResult = computeChartShenSha({
    dayStem: pillars.day.gan,
    dayBranch: pillars.day.zhi,
    yearBranch: pillars.year.zhi,
    monthBranch: pillars.month.zhi,
    hourBranch: pillars.hour.zhi,
  });

  pillars.year.shenSha = shenShaResult.year;
  pillars.month.shenSha = shenShaResult.month;
  pillars.day.shenSha = shenShaResult.day;
  pillars.hour.shenSha = shenShaResult.hour;

  const termName = currentJieQi ? currentJieQi.getName() : null;
  const monthCommandVi = branchToVi(pillars.month.zhi).label;

  const chart: BaZiChartResult = {
    pillars,
    palaces: {
      taiYuan: buildPalace(eightChar.getTaiYuan(), eightChar.getTaiYuanNaYin()),
      mingGong: buildPalace(eightChar.getMingGong(), eightChar.getMingGongNaYin()),
      shenGong: buildPalace(eightChar.getShenGong(), eightChar.getShenGongNaYin()),
    },
    dayMaster: eightChar.getDayGan(),
    dayMasterVi: stemToVi(eightChar.getDayGan()).label,
    gender: input.gender,
    genderLabel: genderPolarityLabel(input.gender, yearGan),
    solar: local,
    timezone: input.timezone,
    isLateRatHour: lateRat,
    currentSolarTerm: termName,
    currentSolarTermVi: solarTermToVi(termName),
    monthCommandVi,
    nienKhongVi: pillars.year.xunKongVi,
    nhatKhongVi: pillars.day.xunKongVi,
    shenSha: shenShaResult.summary,
    shenShaYuanJu: shenShaResult.yuanJu,
    usefulGod: { element: "", label: "", polarity: "cân bằng", reason: "" },
    directions: { good: [], bad: [] },
    lunar: {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      yearInGanZhi: lunar.getYearInGanZhiExact(),
      yearInGanZhiVi: pillarToVi(lunar.getYearInGanZhiExact()),
      monthInGanZhi: lunar.getMonthInGanZhiExact(),
      monthInGanZhiVi: pillarToVi(lunar.getMonthInGanZhiExact()),
      dayInGanZhi: lunar.getDayInGanZhiExact2(),
      dayInGanZhiVi: pillarToVi(lunar.getDayInGanZhiExact2()),
    },
    yun: buildYun(eightChar, input.gender, {
      dayStem: pillars.day.gan,
      dayBranch: pillars.day.zhi,
      yearBranch: pillars.year.zhi,
      monthBranch: pillars.month.zhi,
    }),
    wuXingBalance: { Mộc: 0, Hỏa: 0, Thổ: 0, Kim: 0, Thủy: 0, total: 0, dominant: "Thổ" },
  };

  chart.wuXingBalance = countWuXing(chart.pillars);
  chart.usefulGod = computeUsefulGod(chart);
  chart.directions = computeDirections(chart.usefulGod.element);
  return chart;
}

/** Backfill fields missing from charts saved before schema updates. */
export function normalizeBaZiChart(chart: BaZiChartResult): BaZiChartResult {
  const pillars = { ...chart.pillars };

  for (const key of ["year", "month", "day", "hour"] as const) {
    const p = pillars[key];
    pillars[key] = {
      ...p,
      ganVi: p.ganVi || stemToVi(p.gan).shortLabel || stemToVi(p.gan).label,
      diShiVi: p.diShiVi || lifeStageToVi(p.diShi),
      naYinVi: p.naYinVi || naYinToVi(p.naYin),
      xunVi: p.xunVi || xunToVi(p.xun),
      xunKongVi: p.xunKongVi || xunKongToVi(p.xunKong),
      shenSha: p.shenSha ?? [],
      hideGan: (p.hideGan ?? []).map((h) => ({
        ...h,
        ganVi: h.ganVi || stemDisplayVi(h.gan),
        tenGodVi: h.tenGodVi || tenGodToVi(h.tenGod),
      })),
    };
  }

  const needsShenSha =
    !chart.shenSha ||
    pillars.year.shenSha.length === 0 &&
      pillars.month.shenSha.length === 0 &&
      pillars.day.shenSha.length === 0 &&
      pillars.hour.shenSha.length === 0;

  if (needsShenSha) {
    const shenShaResult = computeChartShenSha({
      dayStem: pillars.day.gan,
      dayBranch: pillars.day.zhi,
      yearBranch: pillars.year.zhi,
      monthBranch: pillars.month.zhi,
      hourBranch: pillars.hour.zhi,
    });
    pillars.year = { ...pillars.year, shenSha: shenShaResult.year };
    pillars.month = { ...pillars.month, shenSha: shenShaResult.month };
    pillars.day = { ...pillars.day, shenSha: shenShaResult.day };
    pillars.hour = { ...pillars.hour, shenSha: shenShaResult.hour };
    chart = {
      ...chart,
      pillars,
      shenSha: shenShaResult.summary,
      shenShaYuanJu: shenShaResult.yuanJu,
    };
  } else {
    chart = {
      ...chart,
      pillars,
      shenSha: chart.shenSha ?? [],
      shenShaYuanJu: chart.shenShaYuanJu ?? {
        nien: pillars.year.shenSha,
        nguyet: pillars.month.shenSha,
        nhat: pillars.day.shenSha,
        thoi: pillars.hour.shenSha,
      },
    };
  }

  const palaces = {
    taiYuan: {
      ...chart.palaces.taiYuan,
      naYinVi:
        chart.palaces.taiYuan.naYinVi ||
        naYinToVi(chart.palaces.taiYuan.naYin),
    },
    mingGong: {
      ...chart.palaces.mingGong,
      naYinVi:
        chart.palaces.mingGong.naYinVi ||
        naYinToVi(chart.palaces.mingGong.naYin),
    },
    shenGong: {
      ...chart.palaces.shenGong,
      naYinVi:
        chart.palaces.shenGong.naYinVi ||
        naYinToVi(chart.palaces.shenGong.naYin),
    },
  };

  return {
    ...chart,
    palaces,
    monthCommandVi:
      chart.monthCommandVi ?? branchToVi(chart.pillars.month.zhi).label,
    nienKhongVi: chart.nienKhongVi ?? chart.pillars.year.xunKongVi,
    nhatKhongVi: chart.nhatKhongVi ?? chart.pillars.day.xunKongVi,
    currentSolarTermVi:
      chart.currentSolarTermVi ?? solarTermToVi(chart.currentSolarTerm),
    usefulGod: chart.usefulGod?.element
      ? chart.usefulGod
      : computeUsefulGod({ ...chart, palaces, wuXingBalance: chart.wuXingBalance }),
    directions:
      chart.directions?.good?.length
        ? chart.directions
        : computeDirections(
            (chart.usefulGod?.element ||
              computeUsefulGod({ ...chart, palaces, wuXingBalance: chart.wuXingBalance })
                .element),
          ),
  };
}
