/**
 * Classic BaZi pillar Shen Sha (神煞) rules — Vietnamese labels.
 */

import { STEM_VI } from "./bazi-terminology";

export interface ShenShaItem {
  key: string;
  name: string;
  type: "cat" | "hung";
}

export interface ShenShaYuanJu {
  nien: ShenShaItem[];
  nguyet: ShenShaItem[];
  nhat: ShenShaItem[];
  thoi: ShenShaItem[];
}

const DAY_STEM_NOBLE: Record<string, string[]> = {
  甲: ["丑", "未"],
  戊: ["丑", "未"],
  庚: ["丑", "未"],
  乙: ["子", "申"],
  己: ["子", "申"],
  丙: ["亥", "酉"],
  丁: ["亥", "酉"],
  壬: ["卯", "巳"],
  癸: ["卯", "巳"],
  辛: ["寅", "午"],
};

const DAY_STEM_WEN_CHANG: Record<string, string> = {
  甲: "巳",
  乙: "午",
  丙: "申",
  戊: "申",
  丁: "酉",
  庚: "亥",
  辛: "子",
  壬: "寅",
  癸: "卯",
  己: "酉",
};

const DAY_STEM_LU: Record<string, string> = {
  甲: "寅",
  乙: "卯",
  丙: "巳",
  丁: "午",
  戊: "巳",
  己: "午",
  庚: "申",
  辛: "酉",
  壬: "亥",
  癸: "子",
};

const DAY_STEM_YANG_REN: Record<string, string> = {
  甲: "卯",
  丙: "午",
  戊: "午",
  庚: "酉",
  壬: "子",
};

const DAY_STEM_BLOOD: Record<string, string> = {
  甲: "卯",
  乙: "辰",
  丙: "午",
  丁: "未",
  戊: "午",
  己: "未",
  庚: "酉",
  辛: "戌",
  壬: "子",
  癸: "丑",
};

const PEACH_BLOSSOM: Record<string, string> = {
  寅: "卯",
  午: "卯",
  戌: "卯",
  申: "酉",
  子: "酉",
  辰: "酉",
  巳: "午",
  酉: "午",
  丑: "午",
  亥: "子",
  卯: "子",
  未: "子",
};

const TRAVELING_HORSE: Record<string, string> = {
  寅: "申",
  午: "申",
  戌: "申",
  申: "寅",
  子: "寅",
  辰: "寅",
  巳: "亥",
  酉: "亥",
  丑: "亥",
  亥: "巳",
  卯: "巳",
  未: "巳",
};

const CANOPY: Record<string, string> = {
  寅: "戌",
  午: "戌",
  戌: "戌",
  申: "辰",
  子: "辰",
  辰: "辰",
  巳: "丑",
  酉: "丑",
  丑: "丑",
  亥: "未",
  卯: "未",
  未: "未",
};

const JIE_SHA: Record<string, string> = {
  寅: "亥",
  午: "亥",
  戌: "亥",
  申: "巳",
  子: "巳",
  辰: "巳",
  巳: "寅",
  酉: "寅",
  丑: "寅",
  亥: "申",
  卯: "申",
  未: "申",
};

const VOID_SPIRIT: Record<string, string> = {
  寅: "巳",
  午: "巳",
  戌: "巳",
  申: "亥",
  子: "亥",
  辰: "亥",
  巳: "申",
  酉: "申",
  丑: "申",
  亥: "寅",
  卯: "寅",
  未: "寅",
};

const TAI_SATS: Record<string, string> = {
  寅: "丑",
  午: "丑",
  戌: "丑",
  申: "未",
  子: "未",
  辰: "未",
  巳: "戌",
  酉: "戌",
  丑: "戌",
  亥: "辰",
  卯: "辰",
  未: "辰",
};

const HAM_CHI: Record<string, string> = {
  亥: "子",
  卯: "子",
  未: "子",
  寅: "卯",
  午: "卯",
  戌: "卯",
  巳: "午",
  酉: "午",
  丑: "午",
  申: "酉",
  子: "酉",
  辰: "酉",
};

const GENERAL_STAR: Record<string, string> = {
  寅: "午",
  午: "午",
  戌: "午",
  申: "子",
  子: "子",
  辰: "子",
  巳: "酉",
  酉: "酉",
  丑: "酉",
  亥: "卯",
  卯: "卯",
  未: "卯",
};

const LONELY_STAR: Record<string, string> = {
  寅: "巳",
  卯: "巳",
  辰: "巳",
  巳: "申",
  午: "申",
  未: "申",
  申: "亥",
  酉: "亥",
  戌: "亥",
  亥: "寅",
  子: "寅",
  丑: "寅",
};

const WIDOW_STAR: Record<string, string> = {
  寅: "丑",
  卯: "丑",
  辰: "丑",
  巳: "辰",
  午: "辰",
  未: "辰",
  申: "未",
  酉: "未",
  戌: "未",
  亥: "戌",
  子: "戌",
  丑: "戌",
};

const HEAVEN_HOOK_MONTH: Record<string, string> = {
  寅: "巳",
  卯: "午",
  辰: "未",
  巳: "申",
  午: "酉",
  未: "戌",
  申: "亥",
  酉: "子",
  戌: "丑",
  亥: "寅",
  子: "卯",
  丑: "辰",
};

function add(
  list: ShenShaItem[],
  key: string,
  name: string,
  type: ShenShaItem["type"] = "cat",
) {
  if (!list.some((item) => item.key === key)) {
    list.push({ key, name, type });
  }
}

function starsForBranch(
  pillarZhi: string,
  refs: {
    dayStem: string;
    dayBranch: string;
    yearBranch: string;
    monthBranch: string;
  },
): ShenShaItem[] {
  const stars: ShenShaItem[] = [];
  const { dayStem, dayBranch, yearBranch, monthBranch } = refs;

  for (const zhi of DAY_STEM_NOBLE[dayStem] ?? []) {
    if (pillarZhi === zhi) add(stars, "noble", "Thiên Ất Quý Nhân");
  }

  if (pillarZhi === DAY_STEM_WEN_CHANG[dayStem]) {
    add(stars, "wenchang", "Văn Xương");
  }

  if (pillarZhi === DAY_STEM_LU[dayStem]) {
    add(stars, "lu", "Lộc Thần");
  }

  if (pillarZhi === DAY_STEM_YANG_REN[dayStem]) {
    add(stars, "yangren", "Dương Nhẫn", "hung");
  }

  if (pillarZhi === DAY_STEM_BLOOD[dayStem]) {
    add(stars, "blood", "Huyết Nhẫn", "hung");
  }

  for (const base of [dayBranch, yearBranch]) {
    if (PEACH_BLOSSOM[base] === pillarZhi) add(stars, "peach", "Đào Hoa");
    if (TRAVELING_HORSE[base] === pillarZhi) add(stars, "horse", "Dịch Mã");
    if (CANOPY[base] === pillarZhi) add(stars, "canopy", "Hoa Cái");
    if (JIE_SHA[base] === pillarZhi) add(stars, "jie", "Kiếp Sát", "hung");
    if (VOID_SPIRIT[base] === pillarZhi) add(stars, "void", "Vong Thần", "hung");
    if (TAI_SATS[base] === pillarZhi) add(stars, "tai", "Tai Sát", "hung");
    if (HAM_CHI[base] === pillarZhi) add(stars, "hamchi", "Hàm Trì");
    if (GENERAL_STAR[base] === pillarZhi) add(stars, "general", "Tướng Tinh");
    if (LONELY_STAR[base] === pillarZhi) add(stars, "lonely", "Cô Thần", "hung");
    if (WIDOW_STAR[base] === pillarZhi) add(stars, "widow", "Quả Tú", "hung");
  }

  if (HEAVEN_HOOK_MONTH[monthBranch] === pillarZhi) {
    add(stars, "hook", "Thiên Cầu", "hung");
  }

  return stars;
}

export function computeChartShenSha(params: {
  dayStem: string;
  dayBranch: string;
  yearBranch: string;
  monthBranch: string;
  hourBranch: string;
}): {
  year: ShenShaItem[];
  month: ShenShaItem[];
  day: ShenShaItem[];
  hour: ShenShaItem[];
  yuanJu: ShenShaYuanJu;
  summary: ShenShaItem[];
} {
  const refs = {
    dayStem: params.dayStem,
    dayBranch: params.dayBranch,
    yearBranch: params.yearBranch,
    monthBranch: params.monthBranch,
  };

  const year = starsForBranch(params.yearBranch, refs);
  const month = starsForBranch(params.monthBranch, refs);
  const day = starsForBranch(params.dayBranch, refs);
  const hour = starsForBranch(params.hourBranch, refs);

  const yuanJu: ShenShaYuanJu = {
    nien: year,
    nguyet: month,
    nhat: day,
    thoi: hour,
  };

  const summaryMap = new Map<string, ShenShaItem>();
  for (const group of [year, month, day, hour]) {
    for (const star of group) {
      summaryMap.set(star.key, star);
    }
  }

  return {
    year,
    month,
    day,
    hour,
    yuanJu,
    summary: Array.from(summaryMap.values()),
  };
}

export function formatShenShaList(stars: ShenShaItem[]): string {
  if (stars.length === 0) return "—";
  return stars.map((s) => s.name).join(", ");
}

export function stemDisplayVi(gan: string): string {
  const s = STEM_VI[gan];
  if (!s) return gan;
  const polarity = s.polarity === "+" ? "Dương" : "Âm";
  return `${s.name} (${polarity} ${s.element})`;
}

export function shenShaForBranch(
  pillarZhi: string,
  refs: {
    dayStem: string;
    dayBranch: string;
    yearBranch: string;
    monthBranch: string;
  },
): ShenShaItem[] {
  return starsForBranch(pillarZhi, refs);
}
