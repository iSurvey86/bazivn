/**
 * Auxiliary Shen Sha (神煞) — phụ chứng only.
 * Lộc / Nhận live in dayMasterQiStates (core/daymaster-qi.ts), not here.
 * Catalog v2.0 additions: src/lib/shen-sha/
 */

import { STEM_VI } from "./bazi-terminology";
import {
  computeDayStemBranchStarsV2,
  computeNatalStarsV2,
  computeSpecialDayMarkers,
  SHEN_SHA_CATALOG_VERSION,
  type NatalPillars,
  type ShenShaItem,
  type ShenShaYuanJu,
  type SpecialDayMarkers,
} from "./shen-sha";

export type { ShenShaItem, ShenShaYuanJu, SpecialDayMarkers };
export type ShenShaWeightClass = "auxiliary";
export { SHEN_SHA_CATALOG_VERSION };

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

/** Hàm Trì ≡ Đào Hoa (cùng bảng) — không dùng bảng riêng. */

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

/**
 * 天勾 — tháng chi +3 (命前三辰 pattern).
 * Không phải 天狗 (lookup khác). Trước đây mistype "Thiên Cầu/Cẩu".
 */
const HEAVEN_GOU_MONTH: Record<string, string> = {
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

/** displayTone / traditionalTone: thuộc tính truyền thống — không phải trọng số logic. */
function add(
  list: ShenShaItem[],
  key: string,
  name: string,
  sourceId?: string,
  displayTone: "cat" | "hung" = "cat",
  aliases?: string[],
) {
  if (!list.some((item) => item.key === key)) {
    list.push({
      key,
      name,
      type: displayTone,
      traditionalTone: displayTone === "hung" ? "thien_hung" : "thien_cat",
      weightClass: "auxiliary",
      sourceId,
      aliases,
    });
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
    if (pillarZhi === zhi) {
      add(stars, "noble", "Thiên Ất Quý Nhân", "shensha.tianyi.v1", "cat");
    }
  }

  if (pillarZhi === DAY_STEM_WEN_CHANG[dayStem]) {
    add(stars, "wenchang", "Văn Xương", "shensha.wenchang.v1", "cat");
  }

  // Lộc / Dương Nhận: removed — see computeDayMasterQiStates

  if (pillarZhi === DAY_STEM_BLOOD[dayStem]) {
    add(stars, "blood", "Huyết Nhận", "shensha.xueren.v1", "hung");
  }

  for (const base of [dayBranch, yearBranch]) {
    // 桃花 = 咸池 — một entity duy nhất
    if (PEACH_BLOSSOM[base] === pillarZhi) {
      add(
        stars,
        "tao_hua_xian_chi",
        "Đào Hoa",
        "shensha.taohua_xianchi.yearOrDay.v1",
        "cat",
        ["Đào Hoa", "Hàm Trì", "桃花", "咸池"],
      );
    }
    if (TRAVELING_HORSE[base] === pillarZhi) {
      add(stars, "horse", "Dịch Mã", "shensha.yima.yearOrDay.v1", "cat");
    }
    if (CANOPY[base] === pillarZhi) {
      add(stars, "canopy", "Hoa Cái", "shensha.huagai.v1", "cat");
    }
    if (JIE_SHA[base] === pillarZhi) {
      add(stars, "jie", "Kiếp Sát", "shensha.jiesha.v1", "hung");
    }
    if (VOID_SPIRIT[base] === pillarZhi) {
      add(stars, "void", "Vong Thần", "shensha.wangshen.v1", "hung");
    }
    if (TAI_SATS[base] === pillarZhi) {
      add(stars, "tai", "Tai Sát", "shensha.taisha.v1", "hung");
    }
    if (GENERAL_STAR[base] === pillarZhi) {
      add(stars, "general", "Tướng Tinh", "shensha.jiangxing.v1", "cat");
    }
    if (LONELY_STAR[base] === pillarZhi) {
      add(stars, "lonely", "Cô Thần", "shensha.guchen.v1", "hung");
    }
    if (WIDOW_STAR[base] === pillarZhi) {
      add(stars, "widow", "Quả Tú", "shensha.guasu.v1", "hung");
    }
  }

  if (HEAVEN_GOU_MONTH[monthBranch] === pillarZhi) {
    add(
      stars,
      "tian_gou",
      "Thiên Câu",
      "shensha.tiangou.monthPlus3.v1",
      "hung",
      ["Thiên Cẩu", "Thiên Cầu", "天勾"],
    );
  }

  // Catalog v2.0 — day-stem branch stars (Học Đường / Từ Quán / Kim Dư)
  for (const s of computeDayStemBranchStarsV2(pillarZhi, dayStem)) {
    if (!stars.some((x) => x.key === s.key)) stars.push(s);
  }

  return stars;
}

export function computeChartShenSha(params: {
  dayStem: string;
  dayBranch: string;
  yearStem?: string;
  yearBranch: string;
  monthBranch: string;
  hourBranch: string;
  /** Full natal pillars (gan+zhi) — required for catalog v2 natal stars. */
  pillars?: NatalPillars;
  gender?: "male" | "female";
}): {
  year: ShenShaItem[];
  month: ShenShaItem[];
  day: ShenShaItem[];
  hour: ShenShaItem[];
  yuanJu: ShenShaYuanJu;
  summary: ShenShaItem[];
  specialDayMarkers: SpecialDayMarkers | null;
  shenShaCatalogVersion: string;
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

  const pillars: NatalPillars =
    params.pillars ??
    ({
      year: { gan: params.yearStem ?? "", zhi: params.yearBranch },
      month: { gan: "", zhi: params.monthBranch },
      day: { gan: params.dayStem, zhi: params.dayBranch },
      hour: { gan: "", zhi: params.hourBranch },
    } satisfies NatalPillars);

  if (params.gender && params.pillars) {
    const natal = computeNatalStarsV2({
      pillars: params.pillars,
      gender: params.gender,
    });
    const merge = (slot: "year" | "month" | "day" | "hour", list: ShenShaItem[]) => {
      for (const s of natal[slot]) {
        if (!list.some((x) => x.key === s.key)) list.push(s);
      }
    };
    merge("year", year);
    merge("month", month);
    merge("day", day);
    merge("hour", hour);
  }

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

  const yearPillar = `${pillars.year.gan}${pillars.year.zhi}`;
  const dayPillar = `${pillars.day.gan}${pillars.day.zhi}`;
  const specialDayMarkers =
    pillars.year.gan && pillars.day.gan
      ? computeSpecialDayMarkers({
          yearPillar,
          dayPillar,
          monthBranch: params.monthBranch,
        })
      : null;

  return {
    year,
    month,
    day,
    hour,
    yuanJu,
    summary: Array.from(summaryMap.values()),
    specialDayMarkers,
    shenShaCatalogVersion: SHEN_SHA_CATALOG_VERSION,
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
