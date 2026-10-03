/**
 * @deprecated Core Calculator MUST NOT call these functions.
 * Kept only for historical reference / offline experiments.
 * Useful-god belongs to Structural Reasoning Engine (not implemented yet).
 */

import type { BaZiChartResult } from "./astrology-engine";
import { branchElement, stemElement } from "./bazi-terminology";
import { representativeStemForElement } from "./bazi-pillar-from-ganzhi";

const GENERATES: Record<string, string> = {
  Mộc: "Hỏa",
  Hỏa: "Thổ",
  Thổ: "Kim",
  Kim: "Thủy",
  Thủy: "Mộc",
};

const CONTROLS: Record<string, string> = {
  Mộc: "Thổ",
  Thổ: "Thủy",
  Thủy: "Hỏa",
  Hỏa: "Kim",
  Kim: "Mộc",
};

export interface UsefulGodResult {
  element: string;
  label: string;
  polarity: "cân bằng" | "hỗ trợ" | "tả tức";
  reason: string;
}

export interface DirectionResult {
  good: string[];
  bad: string[];
}

function elementScore(chart: BaZiChartResult, element: string): number {
  const w = chart.wuXingBalance;
  return w[element as keyof typeof w] as number;
}

function supportingElements(dayElement: string): string[] {
  const resource = Object.entries(GENERATES).find(([, v]) => v === dayElement)?.[0];
  return [dayElement, resource ?? ""].filter(Boolean);
}

function drainingElements(dayElement: string): string[] {
  const output = GENERATES[dayElement];
  const wealth = GENERATES[output] ?? "";
  const officer = CONTROLS[dayElement] ?? "";
  return [output, wealth, officer].filter(Boolean);
}

/** @deprecated Do not use in Core or UI conclusions. */
export function computeUsefulGod(chart: BaZiChartResult): UsefulGodResult {
  const dayElement = stemElement(chart.dayMaster);
  const monthElement = branchElement(chart.pillars.month.zhi);
  const dayScore = elementScore(chart, dayElement);
  const monthBoost = monthElement === dayElement ? 1.5 : 0;
  const supportScore = supportingElements(dayElement).reduce(
    (sum, el) => sum + elementScore(chart, el),
    0,
  );
  const drainScore = drainingElements(dayElement).reduce(
    (sum, el) => sum + elementScore(chart, el),
    0,
  );

  const strength = dayScore + monthBoost + supportScore * 0.35 - drainScore * 0.25;
  const avg = chart.wuXingBalance.total / 5;
  const isStrong = strength >= avg;

  let element: string;
  let polarity: UsefulGodResult["polarity"];
  let reason: string;

  if (isStrong) {
    const candidates = drainingElements(dayElement);
    element =
      candidates.sort(
        (a, b) => elementScore(chart, b) - elementScore(chart, a),
      )[0] ?? dayElement;
    polarity = "tả tức";
    reason = "[DEPRECATED heuristic] Nhật chủ vượng — tả tiết.";
  } else {
    const candidates = supportingElements(dayElement);
    element =
      candidates.sort(
        (a, b) => elementScore(chart, a) - elementScore(chart, b),
      )[0] ?? dayElement;
    polarity = "hỗ trợ";
    reason = "[DEPRECATED heuristic] Nhật chủ nhược — sinh phù.";
  }

  const stem = representativeStemForElement(element);
  return {
    element,
    label: `${stem} ${element}`,
    polarity,
    reason,
  };
}

/** @deprecated Do not use in Core or UI conclusions. */
export function computeDirections(_usefulElement: string): DirectionResult {
  return { good: [], bad: [] };
}
