/** Shared visual tokens for BaZi UI — parchment + ink + bronze. */

export const ELEMENT_THEME = {
  Mộc: {
    color: "#2d5a40",
    bg: "#e8f0eb",
    border: "#a8c4b0",
  },
  Hỏa: {
    color: "#a83828",
    bg: "#f8ebe8",
    border: "#ddb8b0",
  },
  Thổ: {
    color: "#735810",
    bg: "#f2ead8",
    border: "#d4c090",
  },
  Kim: {
    color: "#434a56",
    bg: "#eceef1",
    border: "#b8bec8",
  },
  Thủy: {
    color: "#1f4f7a",
    bg: "#e6eef5",
    border: "#a8c0d8",
  },
} as const;

export type ElementKey = keyof typeof ELEMENT_THEME;

export function elementTheme(element: string) {
  return ELEMENT_THEME[element as ElementKey] ?? ELEMENT_THEME.Thổ;
}

export const PILLAR_ORDER = ["year", "month", "day", "hour"] as const;
export type PillarKey = (typeof PILLAR_ORDER)[number];

export const PILLAR_LABELS: Record<PillarKey, string> = {
  year: "Năm",
  month: "Tháng",
  day: "Ngày",
  hour: "Giờ",
};

export const PILLAR_LABELS_FULL: Record<PillarKey, string> = {
  year: "Trụ Năm",
  month: "Trụ Tháng",
  day: "Trụ Ngày",
  hour: "Trụ Giờ",
};
