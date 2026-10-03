/**
 * Day-master qi states: Twelve Stages, Lu (禄), Ren (刃).
 * Structural facts — not Shen Sha lucky/unlucky stars.
 */

import type { RenMode } from "./conventions";
import { getChangSheng } from "./chang-sheng";

/** Classic Yang Ren (羊刃) — yang stems only. */
export const YANG_REN: Record<string, string> = {
  甲: "卯",
  丙: "午",
  戊: "午",
  庚: "酉",
  壬: "子",
};

/**
 * Extended Yin Ren mapping (school-dependent).
 * Source note: common textbook extension; version via renMode.
 */
export const YIN_REN_EXTENDED: Record<string, string> = {
  乙: "寅",
  丁: "巳",
  己: "巳",
  辛: "申",
  癸: "亥",
};

/** Lu Shen (禄神) = 临官 branch for day stem. */
export const DAY_STEM_LU: Record<string, string> = {
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

export interface QiHit {
  branch: string;
  matchedAt: Array<"year" | "month" | "day" | "hour">;
  present: boolean;
}

export interface DayMasterQiStates {
  twelveStages: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  lu: QiHit;
  ren: QiHit & {
    mode: RenMode;
    kind: "yangRen" | "yinRen" | "none";
    sourceId: string;
  };
}

function matchPillars(
  target: string | undefined,
  pillars: { year: string; month: string; day: string; hour: string },
): Array<"year" | "month" | "day" | "hour"> {
  if (!target) return [];
  const hits: Array<"year" | "month" | "day" | "hour"> = [];
  for (const key of ["year", "month", "day", "hour"] as const) {
    if (pillars[key] === target) hits.push(key);
  }
  return hits;
}

export function resolveRenBranch(
  dayStem: string,
  renMode: RenMode,
): { branch: string | undefined; kind: "yangRen" | "yinRen" | "none"; sourceId: string } {
  const yang = YANG_REN[dayStem];
  if (yang) {
    return {
      branch: yang,
      kind: "yangRen",
      sourceId: "ziPing.yangRen.v1",
    };
  }
  if (renMode === "yinRenExtended") {
    const yin = YIN_REN_EXTENDED[dayStem];
    if (yin) {
      return {
        branch: yin,
        kind: "yinRen",
        sourceId: "extended.yinRen.v1",
      };
    }
  }
  return { branch: undefined, kind: "none", sourceId: "ziPing.yangRenOnly.v1" };
}

export function computeDayMasterQiStates(params: {
  dayStem: string;
  pillars: { year: string; month: string; day: string; hour: string };
  renMode: RenMode;
}): DayMasterQiStates {
  const { dayStem, pillars, renMode } = params;
  const luBranch = DAY_STEM_LU[dayStem];
  const luHits = matchPillars(luBranch, pillars);
  const ren = resolveRenBranch(dayStem, renMode);
  const renHits = matchPillars(ren.branch, pillars);

  return {
    twelveStages: {
      year: getChangSheng(dayStem, pillars.year),
      month: getChangSheng(dayStem, pillars.month),
      day: getChangSheng(dayStem, pillars.day),
      hour: getChangSheng(dayStem, pillars.hour),
    },
    lu: {
      branch: luBranch ?? "",
      matchedAt: luHits,
      present: luHits.length > 0,
    },
    ren: {
      branch: ren.branch ?? "",
      matchedAt: renHits,
      present: renHits.length > 0,
      mode: renMode,
      kind: ren.kind,
      sourceId: ren.sourceId,
    },
  };
}
