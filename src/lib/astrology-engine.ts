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
import type { DirectionResult, UsefulGodResult } from "@/lib/bazi-useful-god";
import type { Gender } from "@/lib/bazi-schema";
import { EightChar, LunarUtil, Solar } from "lunar-typescript";
import {
  ENGINE_VERSION,
  RULE_SET_VERSION,
  dayBoundaryLabel,
  dayBoundaryToSect,
  resolveConventions,
  type BaziConventions,
} from "@/lib/core/conventions";
import { getChangSheng } from "@/lib/core/chang-sheng";
import {
  getHiddenStemsWithRoles,
  type HiddenStemRole,
} from "@/lib/core/hidden-stems";
import { computeDayMasterQiStates, type DayMasterQiStates } from "@/lib/core/daymaster-qi";
import {
  collectJieQi,
  computeBoundaryFlags,
  minutesToPoint,
  type BoundaryFlags,
  type JieQiPoint,
} from "@/lib/core/jieqi-boundaries";
import { elementDirectionReference } from "@/lib/core/element-directions";
import { computeMonthCommand } from "@/lib/core/month-command";
import { computeStemBranchRelations } from "@/lib/core/relations";
import type { BaziFacts, FactSolarDateTime } from "@/lib/core/bazi-facts";
import type { MonthCommandResult } from "@/lib/core/month-command";
import type { StemBranchRelation } from "@/lib/core/relations";
import {
  formatCivil,
  libraryCivilToBirthCivil,
  resolveTimeBasis,
  type TimeBasis,
} from "@/lib/core/time-basis";

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
  conventions?: Partial<BaziConventions>;
}

export interface HiddenStemDetail {
  gan: string;
  ganVi: string;
  tenGod: string;
  tenGodVi: string;
  role: HiddenStemRole;
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
  /** Tuổi mụ (hư tuổi) từ thư viện. */
  age: number;
  ageXu: number;
  ganZhi: string;
  ganZhiVi: string;
  naYinVi: string;
  diShiVi: string;
  hideGanVi: string;
  shenSha: ShenShaItem[];
  /** Khí lưu niên Bát tự đổi tại Lập Xuân — ganZhi đã theo năm tiết khí. */
  yearBoundaryNote: string;
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
  startSolarExact: FactSolarDateTime | null;
  endSolarExact: FactSolarDateTime | null;
}

export interface YunDetail {
  startSolarYear: number;
  startSolarDate: { year: number; month: number; day: number };
  /** Yun start in birth timezone (UI / yunStartLocal). */
  startSolarExact: FactSolarDateTime;
  /** Raw library-clock Yun start before TZ projection (yunStartRaw). */
  startSolarExactLibrary: FactSolarDateTime;
  /** Tuổi thực khi khởi vận (quy đổi sect). */
  startAge: { years: number; months: number; days: number; hours: number };
  /** Tuổi mụ của đại vận đầu (thường = startAge.years + 1 hoặc getStartAge của ĐV đầu). */
  startAgeXu: number | null;
  isForward: boolean;
  yunSect: 1 | 2;
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
  /** Visualization-only disclaimer. */
  warning: string;
}

export interface BaZiChartResult {
  meta: {
    engineVersion: string;
    ruleSetVersion: string;
    generatedAt: string;
  };
  conventions: BaziConventions;
  conventionsLabel: string;
  boundaries: BoundaryFlags;
  dayMasterQiStates: DayMasterQiStates;
  monthCommand: MonthCommandResult;
  relations: StemBranchRelation[];
  /** Birth civil vs library term clock (DoD-A / DoD-B). */
  timeBasis: TimeBasis;
  jieQi: {
    prevJie: JieQiPoint | null;
    currentJieQi: JieQiPoint | null;
    nextJie: JieQiPoint | null;
  };
  facts: BaziFacts;
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
  /**
   * @deprecated Removed from Core. Always null — use reasoning engine later.
   */
  usefulGod: UsefulGodResult | null;
  /**
   * @deprecated Removed from Core. Always null.
   */
  directions: DirectionResult | null;
  reasoningStatus: {
    usefulGod: "not_run";
    note: string;
  };
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

function solarToFact(s: Solar): FactSolarDateTime {
  return {
    year: s.getYear(),
    month: s.getMonth(),
    day: s.getDay(),
    hour: s.getHour(),
    minute: s.getMinute(),
    second: s.getSecond(),
    ymdHms: s.toYmdHms(),
  };
}

function buildHiddenStems(
  hideGan: string[],
  tenGodZhi: string[],
  zhi: string,
): HiddenStemDetail[] {
  const roles = getHiddenStemsWithRoles(zhi);
  return hideGan.map((gan, index) => ({
    gan,
    ganVi: stemDisplayVi(gan),
    tenGod: tenGodZhi[index] ?? "",
    tenGodVi: tenGodToVi(tenGodZhi[index] ?? ""),
    role: roles[index]?.role ?? "du",
  }));
}

type PillarKey = "year" | "month" | "day" | "hour";

function buildPillarDetail(
  eightChar: EightChar,
  pillar: PillarKey,
  dayStem: string,
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
  const tenGodZhi = hourOverride
    ? getHiddenStemsWithRoles(zhi).map((h) => {
        const key = `${dayStem}${h.gan}`;
        return LunarUtil.SHI_SHEN[key] ?? "";
      })
    : a.tenGodZhi();
  const hideGan = hourOverride
    ? getHiddenStemsWithRoles(zhi).map((h) => h.gan)
    : a.hideGan();
  const diShi = getChangSheng(dayStem, zhi);
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
    hideGan: buildHiddenStems(hideGan, tenGodZhi, zhi),
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
  lateRatMidnight00: boolean,
  dayStem: string,
): PillarDetail {
  if (!lateRatMidnight00) return buildPillarDetail(eightChar, "hour", dayStem);

  const ganZhi = computeLateRatHourPillar(local);
  return buildPillarDetail(eightChar, "hour", dayStem, {
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

const STRUCTURAL_SHEN_KEYS = new Set(["lu", "yangren", "yinren", "ren"]);
const STRUCTURAL_SHEN_NAME_RE =
  /Lộc\s*Thần|Dương\s*Nh[ẫậ]n|Âm\s*Nh[ẫậ]n|羊刃|禄神/;

function normalizeShenShaItem(s: ShenShaItem): ShenShaItem {
  let key = s.key;
  let name = s.name.replace(/Nhẫn/g, "Nhận");
  let aliases = s.aliases;

  // Merge legacy Đào Hoa / Hàm Trì → one entity
  if (
    key === "peach" ||
    key === "hamchi" ||
    name === "Đào Hoa" ||
    name === "Hàm Trì"
  ) {
    key = "tao_hua_xian_chi";
    name = "Đào Hoa (Hàm Trì)";
    aliases = ["Đào Hoa", "Hàm Trì", "桃花", "咸池"];
  }

  // Unify Thiên Cẩu / Thiên Cầu → Thiên Câu (天勾)
  if (
    key === "hook" ||
    name === "Thiên Cẩu" ||
    name === "Thiên Cầu" ||
    name === "Thiên Câu"
  ) {
    key = "tian_gou";
    name = "Thiên Câu";
    aliases = ["Thiên Cẩu", "Thiên Cầu", "天勾"];
  }

  return {
    ...s,
    key,
    name,
    aliases,
    type: s.type === "hung" ? "hung" : "cat",
    traditionalTone:
      s.traditionalTone ??
      (s.type === "hung" ? "thien_hung" : "thien_cat"),
    weightClass: "auxiliary",
  };
}

function stripStructuralStars(stars: ShenShaItem[]): ShenShaItem[] {
  const mapped = stars
    .filter(
      (s) =>
        !STRUCTURAL_SHEN_KEYS.has(s.key) && !STRUCTURAL_SHEN_NAME_RE.test(s.name),
    )
    .map(normalizeShenShaItem);

  // Dedupe by key after merge
  const byKey = new Map<string, ShenShaItem>();
  for (const s of mapped) {
    if (!byKey.has(s.key)) byKey.set(s.key, s);
  }
  return Array.from(byKey.values());
}

function recomputeDiShiVi(dayStem: string, zhi: string): {
  diShi: string;
  diShiVi: string;
} {
  const diShi = getChangSheng(dayStem, zhi);
  return { diShi, diShiVi: lifeStageToVi(diShi) };
}

function buildYun(
  eightChar: EightChar,
  gender: Gender,
  yunSect: 1 | 2,
  refs: {
    dayStem: string;
    dayBranch: string;
    yearBranch: string;
    monthBranch: string;
  },
  timeBasis: TimeBasis,
): YunDetail {
  const yun = eightChar.getYun(genderToLibraryValue(gender), yunSect);
  const daYunList = yun.getDaYun(10);
  const startSolar = yun.getStartSolar();
  const startExactLibrary = solarToFact(startSolar);
  const startLocalCivil = libraryCivilToBirthCivil(
    {
      year: startExactLibrary.year,
      month: startExactLibrary.month,
      day: startExactLibrary.day,
      hour: startExactLibrary.hour,
      minute: startExactLibrary.minute,
      second: startExactLibrary.second,
    },
    timeBasis.libraryTermTimezone,
    timeBasis.birthTimezone,
  );
  const startExact: FactSolarDateTime = {
    ...startLocalCivil,
    ymdHms: formatCivil(startLocalCivil),
  };

  const withGanZhi = daYunList.filter((item) => item.getGanZhi());

  const daYun: DaYunDetail[] = withGanZhi.map((item, index) => {
    const ganZhi = item.getGanZhi();
    const compact = pillarFromGanZhi(ganZhi, refs.dayStem);
    const periodStart = startSolar.nextYear(index * 10);
    const periodEndExclusive = startSolar.nextYear((index + 1) * 10);
    const liuNian = item.getLiuNian(10).map((ln) => {
      const lnGz = ln.getGanZhi();
      const lnCompact = pillarFromGanZhi(lnGz, refs.dayStem);
      const ageXu = ln.getAge();
      return {
        year: ln.getYear(),
        age: ageXu,
        ageXu,
        ganZhi: lnGz,
        ganZhiVi: pillarToVi(lnGz),
        naYinVi: lnCompact.naYinVi,
        diShiVi: lnCompact.diShiVi,
        hideGanVi: hideGanSummary(lnCompact.hideGan),
        shenSha: stripStructuralStars(shenShaForBranch(lnCompact.zhi, refs)),
        yearBoundaryNote:
          "ganZhi theo khí năm Bát tự (Lập Xuân), không theo 01/01 dương lịch",
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
      shenSha: stripStructuralStars(shenShaForBranch(compact.zhi, refs)),
      liuNian,
      startSolarExact: solarToFact(periodStart),
      endSolarExact: solarToFact(periodEndExclusive),
    };
  });

  const firstXu = daYun[0]?.startAge ?? null;

  return {
    startSolarYear: startExact.year,
    startSolarDate: {
      year: startExact.year,
      month: startExact.month,
      day: startExact.day,
    },
    startSolarExact: startExact,
    startSolarExactLibrary: startExactLibrary,
    startAge: {
      years: yun.getStartYear(),
      months: yun.getStartMonth(),
      days: yun.getStartDay(),
      hours: yun.getStartHour(),
    },
    startAgeXu: firstXu,
    isForward: yun.isForward(),
    yunSect,
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

  return {
    ...counts,
    total,
    dominant,
    warning:
      "Phân bố ngũ hành thô theo thuật toán phần mềm — chỉ trực quan; không dùng để xác định thân vượng/nhược hoặc Dụng thần.",
  };
}

function findLiChunPoint(
  jie: ReturnType<typeof collectJieQi>,
): JieQiPoint | null {
  for (const p of [jie.nextJie, jie.prevJie, jie.currentJieQi, jie.nextQi, jie.prevQi]) {
    if (p?.name === "立春") return p;
  }
  return null;
}

function toFactPillar(p: PillarDetail) {
  return {
    ganZhi: p.ganZhi,
    gan: p.gan,
    zhi: p.zhi,
    tenGodGan: p.tenGodGan,
    hideGan: p.hideGan.map((h) => ({
      gan: h.gan,
      role: h.role,
      tenGod: h.tenGod,
    })),
    diShi: p.diShi,
    xun: p.xun,
    xunKong: p.xunKong,
  };
}

function buildFacts(params: {
  local: LocalDateTime;
  timezone: string;
  conventions: BaziConventions;
  boundaries: BoundaryFlags;
  pillars: BaZiChartResult["pillars"];
  jieQi: BaZiChartResult["jieQi"];
  dayMasterQiStates: DayMasterQiStates;
  monthCommand: MonthCommandResult;
  relations: StemBranchRelation[];
  yun: YunDetail;
  shenSha: ShenShaItem[];
  shenShaYuanJu: ShenShaYuanJu;
  wuXing: WuXingBalance;
  timeBasis: TimeBasis;
}): BaziFacts {
  const { pillars, local } = params;
  const pad = (n: number) => String(n).padStart(2, "0");
  const localDateTime = `${local.year}-${pad(local.month)}-${pad(local.day)}T${pad(local.hour)}:${pad(local.minute)}:${pad(local.second)}`;

  const dayKong = [...pillars.day.xunKong];
  const yearKong = [...pillars.year.xunKong];

  return {
    meta: {
      engineVersion: ENGINE_VERSION,
      ruleSetVersion: RULE_SET_VERSION,
      generatedAt: new Date().toISOString(),
      lunarTypescriptNote:
        "lunar-typescript Solar is TZ-naive; BaziVN: vn_civil=compatibility; instant_consistent=DoD-B′ hybrid (Year/Month/Jie/Yun on Asia/Shanghai libraryTermClock; Day/Hour on birth localCivil + Dạ Tý).",
    },
    birth: {
      localDateTime,
      timezone: params.timezone,
      trueSolarTimeEnabled: params.conventions.trueSolarTimeEnabled,
      trueSolarDateTime: null,
      timeBasis: params.timeBasis,
    },
    conventions: params.conventions,
    boundaries: params.boundaries,
    pillars: {
      year: toFactPillar(pillars.year),
      month: toFactPillar(pillars.month),
      day: toFactPillar(pillars.day),
      hour: toFactPillar(pillars.hour),
    },
    jieQi: {
      prevJie: params.jieQi.prevJie,
      currentJieQi: params.jieQi.currentJieQi,
      nextJie: params.jieQi.nextJie,
    },
    monthCommand: params.monthCommand,
    dayMasterQiStates: params.dayMasterQiStates,
    relations: params.relations,
    xunKong: {
      dayXunKong: dayKong,
      yearXunKong: yearKong,
      auxiliary: [
        { pillar: "month", xunKong: pillars.month.xunKong },
        { pillar: "hour", xunKong: pillars.hour.xunKong },
      ],
    },
    yun: {
      forward: params.yun.isForward,
      startSolar: params.yun.startSolarExact,
      startSolarLibrary: params.yun.startSolarExactLibrary,
      startAge: params.yun.startAge,
      startAgeXu: params.yun.startAgeXu,
      yunSect: params.yun.yunSect,
      daYun: params.yun.daYun.map((d) => ({
        index: d.index,
        ganZhi: d.ganZhi,
        startYear: d.startYear,
        endYear: d.endYear,
        startAge: d.startAge,
        endAge: d.endAge,
        startSolar: d.startSolarExact,
        endSolar: d.endSolarExact,
        liuNian: d.liuNian.map((ln) => ({
          calendarYear: ln.year,
          ageXu: ln.ageXu ?? ln.age,
          ganZhi: ln.ganZhi,
          note: ln.yearBoundaryNote,
        })),
      })),
    },
    shenSha: {
      auxiliaryOnly: params.shenSha,
      byPillar: {
        year: params.shenShaYuanJu.nien,
        month: params.shenShaYuanJu.nguyet,
        day: params.shenShaYuanJu.nhat,
        hour: params.shenShaYuanJu.thoi,
      },
    },
    visualization: {
      fiveElementPercent: {
        Mộc: params.wuXing.Mộc,
        Hỏa: params.wuXing.Hỏa,
        Thổ: params.wuXing.Thổ,
        Kim: params.wuXing.Kim,
        Thủy: params.wuXing.Thủy,
      },
      warning: params.wuXing.warning,
      elementDirections: elementDirectionReference(),
    },
    reasoning: {
      usefulGod: null,
      directionsGoodBad: null,
      status: "not_run",
      note: "Chưa luận Dụng thần chuyên sâu — Core không xuất heuristic.",
    },
  };
}

export function calculateBaZi(input: BirthDateTimeInput): BaZiChartResult {
  const local = resolveLocalBirthDateTime(input);
  const conventions = resolveConventions(input.conventions);
  const daySect = dayBoundaryToSect(conventions.dayBoundaryMode);
  const lateRatMidnight00 =
    conventions.dayBoundaryMode === "midnight_00" &&
    isLateRatHour(local.hour, local.minute);

  const timeBasis = resolveTimeBasis({
    localCivil: local,
    birthTimezone: input.timezone,
    mode: conventions.timeBasisMode,
  });
  const lib = timeBasis.libraryTermClock;

  /**
   * Hybrid clocks (DoD-B′):
   * - termSolar/termEightChar: Year, Month, Jie, LiChun, Yun, monthCommand
   * - civilSolar/civilEightChar: Day, Hour (+ Dạ Tý convention on local civil)
   * DoD-A vn_civil: both clocks identical → behavior unchanged.
   */
  const termSolar = Solar.fromYmdHms(
    lib.year,
    lib.month,
    lib.day,
    lib.hour,
    lib.minute,
    lib.second,
  );
  const civilSolar = Solar.fromYmdHms(
    local.year,
    local.month,
    local.day,
    local.hour,
    local.minute,
    local.second,
  );
  const termLunar = termSolar.getLunar();
  const civilLunar = civilSolar.getLunar();
  const termEightChar = termLunar.getEightChar();
  const civilEightChar = civilLunar.getEightChar();
  termEightChar.setSect(daySect);
  civilEightChar.setSect(daySect);

  const jieBundle = collectJieQi(termLunar);
  const minutesToPrevJie = minutesToPoint(termSolar, jieBundle.prevJie);
  const minutesToNextJie = minutesToPoint(termSolar, jieBundle.nextJie);
  const liChun = findLiChunPoint(jieBundle);
  const minutesToLiChun = minutesToPoint(termSolar, liChun);

  const boundaries = computeBoundaryFlags({
    hour: local.hour,
    minute: local.minute,
    minutesToPrevJie,
    minutesToNextJie,
    minutesToLiChun,
  });

  const dayStem = civilEightChar.getDayGan();
  const yearGan = termEightChar.getYearGan();

  const pillars = {
    year: buildPillarDetail(termEightChar, "year", dayStem),
    month: buildPillarDetail(termEightChar, "month", dayStem),
    day: buildPillarDetail(civilEightChar, "day", dayStem),
    hour: buildHourPillar(civilEightChar, local, lateRatMidnight00, dayStem),
  };

  // Ensure day-master-relative diShi for all pillars (shared function).
  for (const key of ["year", "month", "day", "hour"] as const) {
    const diShi = getChangSheng(dayStem, pillars[key].zhi);
    pillars[key].diShi = diShi;
    pillars[key].diShiVi = lifeStageToVi(diShi);
  }

  const shenShaRaw = computeChartShenSha({
    dayStem: pillars.day.gan,
    dayBranch: pillars.day.zhi,
    yearBranch: pillars.year.zhi,
    monthBranch: pillars.month.zhi,
    hourBranch: pillars.hour.zhi,
  });

  const shenShaResult = {
    year: stripStructuralStars(shenShaRaw.year),
    month: stripStructuralStars(shenShaRaw.month),
    day: stripStructuralStars(shenShaRaw.day),
    hour: stripStructuralStars(shenShaRaw.hour),
    yuanJu: {
      nien: stripStructuralStars(shenShaRaw.yuanJu.nien),
      nguyet: stripStructuralStars(shenShaRaw.yuanJu.nguyet),
      nhat: stripStructuralStars(shenShaRaw.yuanJu.nhat),
      thoi: stripStructuralStars(shenShaRaw.yuanJu.thoi),
    },
    summary: stripStructuralStars(shenShaRaw.summary),
  };

  pillars.year.shenSha = shenShaResult.year;
  pillars.month.shenSha = shenShaResult.month;
  pillars.day.shenSha = shenShaResult.day;
  pillars.hour.shenSha = shenShaResult.hour;

  const dayMasterQiStates = computeDayMasterQiStates({
    dayStem: pillars.day.gan,
    pillars: {
      year: pillars.year.zhi,
      month: pillars.month.zhi,
      day: pillars.day.zhi,
      hour: pillars.hour.zhi,
    },
    renMode: conventions.renMode,
  });

  // minutesToPoint(prevJie) = prevJie − birth (âm nếu Jie đã qua).
  // Nhân nguyên cần số phút đã trôi kể từ Jie → đảo dấu.
  const monthCommand = computeMonthCommand({
    monthBranch: pillars.month.zhi,
    minutesFromPrevJie:
      minutesToPrevJie === null ? null : -minutesToPrevJie,
    mode: conventions.monthCommandSchool,
  });

  const relations = computeStemBranchRelations({
    year: { gan: pillars.year.gan, zhi: pillars.year.zhi },
    month: { gan: pillars.month.gan, zhi: pillars.month.zhi },
    day: { gan: pillars.day.gan, zhi: pillars.day.zhi },
    hour: { gan: pillars.hour.gan, zhi: pillars.hour.zhi },
  });

  const termName = jieBundle.currentJieQi?.name ?? null;
  const monthCommandVi = branchToVi(pillars.month.zhi).label;

  // Yun follows term clock (Jie distance); shen-sha refs use civil day master.
  const yun = buildYun(
    termEightChar,
    input.gender,
    conventions.yunSect,
    {
      dayStem: pillars.day.gan,
      dayBranch: pillars.day.zhi,
      yearBranch: pillars.year.zhi,
      monthBranch: pillars.month.zhi,
    },
    timeBasis,
  );

  const wuXingBalance = countWuXing(pillars);

  const jieQi = {
    prevJie: jieBundle.prevJie,
    currentJieQi: jieBundle.currentJieQi,
    nextJie: jieBundle.nextJie,
  };

  const facts = buildFacts({
    local,
    timezone: input.timezone,
    conventions,
    boundaries,
    pillars,
    jieQi,
    dayMasterQiStates,
    monthCommand,
    relations,
    yun,
    shenSha: shenShaResult.summary,
    shenShaYuanJu: shenShaResult.yuanJu,
    wuXing: wuXingBalance,
    timeBasis,
  });

  return {
    meta: {
      engineVersion: ENGINE_VERSION,
      ruleSetVersion: RULE_SET_VERSION,
      generatedAt: facts.meta.generatedAt,
    },
    conventions,
    conventionsLabel: dayBoundaryLabel(conventions.dayBoundaryMode),
    boundaries,
    dayMasterQiStates,
    monthCommand,
    relations,
    timeBasis,
    jieQi,
    facts,
    pillars,
    palaces: {
      // Palaces: month from term + day from civil are not one EightChar;
      // use civil for day-linked palaces (product continuity). Ming/Thân still library-derived.
      taiYuan: buildPalace(
        civilEightChar.getTaiYuan(),
        civilEightChar.getTaiYuanNaYin(),
      ),
      mingGong: buildPalace(
        termEightChar.getMingGong(),
        termEightChar.getMingGongNaYin(),
      ),
      shenGong: buildPalace(
        termEightChar.getShenGong(),
        termEightChar.getShenGongNaYin(),
      ),
    },
    dayMaster: dayStem,
    dayMasterVi: stemToVi(dayStem).label,
    gender: input.gender,
    genderLabel: genderPolarityLabel(input.gender, yearGan),
    solar: local,
    timezone: input.timezone,
    isLateRatHour: lateRatMidnight00,
    currentSolarTerm: termName,
    currentSolarTermVi: solarTermToVi(termName),
    monthCommandVi,
    nienKhongVi: pillars.year.xunKongVi,
    nhatKhongVi: pillars.day.xunKongVi,
    shenSha: shenShaResult.summary,
    shenShaYuanJu: shenShaResult.yuanJu,
    usefulGod: null,
    directions: null,
    reasoningStatus: {
      usefulGod: "not_run",
      note: "Chưa luận Dụng thần chuyên sâu",
    },
    lunar: {
      year: termLunar.getYear(),
      month: termLunar.getMonth(),
      day: civilLunar.getDay(),
      yearInGanZhi: termLunar.getYearInGanZhiExact(),
      yearInGanZhiVi: pillarToVi(termLunar.getYearInGanZhiExact()),
      monthInGanZhi: termLunar.getMonthInGanZhiExact(),
      monthInGanZhiVi: pillarToVi(termLunar.getMonthInGanZhiExact()),
      dayInGanZhi: civilLunar.getDayInGanZhiExact2(),
      dayInGanZhiVi: pillarToVi(civilLunar.getDayInGanZhiExact2()),
    },
    yun,
    wuXingBalance,
  };
}

/**
 * Recompute absolute Yun start from birth solar — used when saved charts
 * only have startSolarDate (no hour) and hydrate must not invent 00:00.
 */
function recomputeYunStartFromBirth(
  chart: BaZiChartResult,
  yunSect: 1 | 2,
  daySect: 1 | 2,
): {
  startSolarExact: FactSolarDateTime;
  startSolarExactLibrary: FactSolarDateTime;
  startAge: YunDetail["startAge"];
  startAgeXu: number | null;
} | null {
  const s = chart.solar;
  if (!s?.year || !s?.month || !s?.day) return null;
  try {
    const basis = resolveTimeBasis({
      localCivil: {
        year: s.year,
        month: s.month,
        day: s.day,
        hour: s.hour ?? 0,
        minute: s.minute ?? 0,
        second: s.second ?? 0,
      },
      birthTimezone: chart.timezone,
    });
    const lib = basis.libraryTermClock;
    const solar = Solar.fromYmdHms(
      lib.year,
      lib.month,
      lib.day,
      lib.hour,
      lib.minute,
      lib.second,
    );
    const eightChar = solar.getLunar().getEightChar();
    eightChar.setSect(daySect);
    const yun = eightChar.getYun(genderToLibraryValue(chart.gender), yunSect);
    const startSolar = yun.getStartSolar();
    const libraryExact = solarToFact(startSolar);
    const localCivil = libraryCivilToBirthCivil(
      {
        year: libraryExact.year,
        month: libraryExact.month,
        day: libraryExact.day,
        hour: libraryExact.hour,
        minute: libraryExact.minute,
        second: libraryExact.second,
      },
      basis.libraryTermTimezone,
      basis.birthTimezone,
    );
    const firstXu =
      yun
        .getDaYun(1)
        .find((d) => d.getGanZhi())
        ?.getStartAge() ?? null;
    return {
      startSolarExact: { ...localCivil, ymdHms: formatCivil(localCivil) },
      startSolarExactLibrary: libraryExact,
      startAge: {
        years: yun.getStartYear(),
        months: yun.getStartMonth(),
        days: yun.getStartDay(),
        hours: yun.getStartHour(),
      },
      startAgeXu: firstXu,
    };
  } catch {
    return null;
  }
}

function needsYunStartRecompute(
  exact: FactSolarDateTime | null | undefined,
): boolean {
  if (!exact) return true;
  // Date-only hydrate used to force 00:00:00 — treat as missing time.
  if (exact.hour === 0 && exact.minute === 0 && (exact.second ?? 0) === 0) {
    if (exact.ymdHms && !/00:00:00$/.test(exact.ymdHms)) return false;
    return true;
  }
  return false;
}

/** Backfill fields missing from charts saved before schema updates. */
export function normalizeBaZiChart(chart: BaZiChartResult): BaZiChartResult {
  const conventions = resolveConventions(chart.conventions);
  const pillars = { ...chart.pillars };

  const dayStem = pillars.day.gan;

  for (const key of ["year", "month", "day", "hour"] as const) {
    const p = pillars[key];
    const roles = getHiddenStemsWithRoles(p.zhi);
    const stage = recomputeDiShiVi(dayStem, p.zhi);
    pillars[key] = {
      ...p,
      ganVi: p.ganVi || stemToVi(p.gan).shortLabel || stemToVi(p.gan).label,
      diShi: stage.diShi,
      diShiVi: stage.diShiVi,
      naYinVi: p.naYinVi || naYinToVi(p.naYin),
      xunVi: p.xunVi || xunToVi(p.xun),
      xunKongVi: p.xunKongVi || xunKongToVi(p.xunKong),
      shenSha: stripStructuralStars(p.shenSha ?? []),
      hideGan: (p.hideGan ?? []).map((h, i) => ({
        ...h,
        ganVi: h.ganVi || stemDisplayVi(h.gan),
        tenGodVi: h.tenGodVi || tenGodToVi(h.tenGod),
        role: h.role ?? roles[i]?.role ?? "du",
      })),
    };
  }

  const needsShenSha =
    !chart.shenSha ||
    (pillars.year.shenSha.length === 0 &&
      pillars.month.shenSha.length === 0 &&
      pillars.day.shenSha.length === 0 &&
      pillars.hour.shenSha.length === 0);

  let shenSha = stripStructuralStars(chart.shenSha ?? []);
  let shenShaYuanJu = chart.shenShaYuanJu ?? {
    nien: pillars.year.shenSha,
    nguyet: pillars.month.shenSha,
    nhat: pillars.day.shenSha,
    thoi: pillars.hour.shenSha,
  };

  if (needsShenSha) {
    const shenShaResult = computeChartShenSha({
      dayStem: pillars.day.gan,
      dayBranch: pillars.day.zhi,
      yearBranch: pillars.year.zhi,
      monthBranch: pillars.month.zhi,
      hourBranch: pillars.hour.zhi,
    });
    pillars.year = {
      ...pillars.year,
      shenSha: stripStructuralStars(shenShaResult.year),
    };
    pillars.month = {
      ...pillars.month,
      shenSha: stripStructuralStars(shenShaResult.month),
    };
    pillars.day = {
      ...pillars.day,
      shenSha: stripStructuralStars(shenShaResult.day),
    };
    pillars.hour = {
      ...pillars.hour,
      shenSha: stripStructuralStars(shenShaResult.hour),
    };
    shenSha = stripStructuralStars(shenShaResult.summary);
    shenShaYuanJu = {
      nien: stripStructuralStars(shenShaResult.yuanJu.nien),
      nguyet: stripStructuralStars(shenShaResult.yuanJu.nguyet),
      nhat: stripStructuralStars(shenShaResult.yuanJu.nhat),
      thoi: stripStructuralStars(shenShaResult.yuanJu.thoi),
    };
  } else {
    shenShaYuanJu = {
      nien: stripStructuralStars(shenShaYuanJu.nien),
      nguyet: stripStructuralStars(shenShaYuanJu.nguyet),
      nhat: stripStructuralStars(shenShaYuanJu.nhat),
      thoi: stripStructuralStars(shenShaYuanJu.thoi),
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

  const dayMasterQiStates =
    chart.dayMasterQiStates ??
    computeDayMasterQiStates({
      dayStem: pillars.day.gan,
      pillars: {
        year: pillars.year.zhi,
        month: pillars.month.zhi,
        day: pillars.day.zhi,
        hour: pillars.hour.zhi,
      },
      renMode: conventions.renMode,
    });

  const yunSect = chart.yun.yunSect ?? conventions.yunSect;
  const daySect = dayBoundaryToSect(conventions.dayBoundaryMode);
  const recomputedYunStart = needsYunStartRecompute(chart.yun.startSolarExact)
    ? recomputeYunStartFromBirth(chart, yunSect, daySect)
    : null;

  const timeBasis =
    chart.timeBasis ??
    resolveTimeBasis({
      localCivil: chart.solar,
      birthTimezone: chart.timezone,
      mode: conventions.timeBasisMode,
    });

  const fallbackExact = chart.yun.startSolarDate
    ? {
        year: chart.yun.startSolarDate.year,
        month: chart.yun.startSolarDate.month,
        day: chart.yun.startSolarDate.day,
        hour: chart.yun.startAge?.hours ?? 0,
        minute: 0,
        second: 0,
      }
    : {
        year: chart.yun.startSolarYear,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
      };

  const yun: YunDetail = {
    ...chart.yun,
    startSolarExact:
      recomputedYunStart?.startSolarExact ??
      chart.yun.startSolarExact ??
      fallbackExact,
    startSolarExactLibrary:
      recomputedYunStart?.startSolarExactLibrary ??
      chart.yun.startSolarExactLibrary ??
      chart.yun.startSolarExact ??
      fallbackExact,
    startAge: recomputedYunStart?.startAge ?? {
      years: chart.yun.startAge.years,
      months: chart.yun.startAge.months,
      days: chart.yun.startAge.days,
      hours: chart.yun.startAge.hours ?? 0,
    },
    startAgeXu:
      recomputedYunStart?.startAgeXu ??
      chart.yun.startAgeXu ??
      chart.yun.daYun?.[0]?.startAge ??
      null,
    yunSect,
    daYun: (chart.yun.daYun ?? []).map((d) => {
      const zhi = d.ganZhi?.[1] ?? "";
      const stage = zhi ? recomputeDiShiVi(dayStem, zhi) : { diShi: "", diShiVi: d.diShiVi };
      return {
        ...d,
        diShiVi: stage.diShiVi || d.diShiVi,
        startSolarExact: d.startSolarExact ?? null,
        endSolarExact: d.endSolarExact ?? null,
        liuNian: (d.liuNian ?? []).map((ln) => {
          const lnZhi = ln.ganZhi?.[1] ?? "";
          const lnStage = lnZhi
            ? recomputeDiShiVi(dayStem, lnZhi)
            : { diShi: "", diShiVi: ln.diShiVi };
          return {
            ...ln,
            diShiVi: lnStage.diShiVi || ln.diShiVi,
            yearBoundaryNote:
              ln.yearBoundaryNote ??
              "ganZhi theo khí năm Bát tự (Lập Xuân), không theo 01/01 dương lịch",
            shenSha: stripStructuralStars(ln.shenSha ?? []),
          };
        }),
        shenSha: stripStructuralStars(d.shenSha ?? []),
      };
    }),
  };

  const wuXingBalance: WuXingBalance = {
    ...chart.wuXingBalance,
    warning:
      chart.wuXingBalance.warning ??
      "Phân bố ngũ hành thô theo thuật toán phần mềm — chỉ trực quan; không dùng để xác định thân vượng/nhược hoặc Dụng thần.",
  };

  const base: BaZiChartResult = {
    ...chart,
    meta: chart.meta ?? {
      engineVersion: ENGINE_VERSION,
      ruleSetVersion: RULE_SET_VERSION,
      generatedAt: new Date().toISOString(),
    },
    conventions,
    conventionsLabel:
      chart.conventionsLabel ?? dayBoundaryLabel(conventions.dayBoundaryMode),
    boundaries: chart.boundaries ?? {
      nearZiBoundary: false,
      nearZiWindowWide: false,
      nearHourBoundary: false,
      nearJieBoundary: false,
      nearLiChunBoundary: false,
      timezoneSensitive: false,
    },
    dayMasterQiStates,
    monthCommand:
      chart.monthCommand ??
      computeMonthCommand({
        monthBranch: chart.pillars.month.zhi,
        minutesFromPrevJie: null,
        mode: conventions.monthCommandSchool,
      }),
    relations:
      chart.relations ??
      computeStemBranchRelations({
        year: { gan: chart.pillars.year.gan, zhi: chart.pillars.year.zhi },
        month: { gan: chart.pillars.month.gan, zhi: chart.pillars.month.zhi },
        day: { gan: chart.pillars.day.gan, zhi: chart.pillars.day.zhi },
        hour: { gan: chart.pillars.hour.gan, zhi: chart.pillars.hour.zhi },
      }),
    timeBasis,
    jieQi: chart.jieQi ?? {
      prevJie: null,
      currentJieQi: null,
      nextJie: null,
    },
    pillars,
    palaces,
    monthCommandVi:
      chart.monthCommandVi ?? branchToVi(chart.pillars.month.zhi).label,
    nienKhongVi: chart.nienKhongVi ?? chart.pillars.year.xunKongVi,
    nhatKhongVi: chart.nhatKhongVi ?? chart.pillars.day.xunKongVi,
    currentSolarTermVi:
      chart.currentSolarTermVi ?? solarTermToVi(chart.currentSolarTerm),
    shenSha,
    shenShaYuanJu,
    usefulGod: null,
    directions: null,
    reasoningStatus: {
      usefulGod: "not_run",
      note: "Chưa luận Dụng thần chuyên sâu",
    },
    yun,
    wuXingBalance,
    facts: chart.facts as BaziFacts,
  };

  if (!base.facts) {
    base.facts = buildFacts({
      local: chart.solar,
      timezone: chart.timezone,
      conventions,
      boundaries: base.boundaries,
      pillars,
      jieQi: base.jieQi,
      dayMasterQiStates,
      monthCommand: base.monthCommand,
      relations: base.relations,
      yun,
      shenSha,
      shenShaYuanJu,
      wuXing: wuXingBalance,
      timeBasis,
    });
  }

  return base;
}

/** Raw debug snapshot for golden regression (not UI). */
export function extractCoreDebugSnapshot(chart: BaZiChartResult) {
  const prev = chart.jieQi.prevJie;
  const next = chart.jieQi.nextJie;
  const birthLib = chart.timeBasis.libraryTermClock;
  const birthSolar = Solar.fromYmdHms(
    birthLib.year,
    birthLib.month,
    birthLib.day,
    birthLib.hour,
    birthLib.minute,
    birthLib.second,
  );
  const minutesToPrev = minutesToPoint(birthSolar, prev);
  return {
    birthLocal: formatCivil(chart.timeBasis.localCivil),
    birthAbsolute: chart.timeBasis.birthAbsoluteIso,
    libraryTermClock: formatCivil(chart.timeBasis.libraryTermClock),
    timeBasisMode: chart.timeBasis.mode,
    libraryTermTimezone: chart.timeBasis.libraryTermTimezone,
    prevJie: prev,
    nextJie: next,
    minutesFromPrevJie: minutesToPrev === null ? null : -minutesToPrev,
    daysFromJie: chart.monthCommand.daysFromJie,
    monthCommand: chart.monthCommand,
    yunStartRaw: chart.yun.startSolarExactLibrary,
    yunStartLocal: chart.yun.startSolarExact,
  };
}
