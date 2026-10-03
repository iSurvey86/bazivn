/**
 * Objective Five-Element directions (reference only).
 * Not "good/bad" — those require full useful-god reasoning.
 */

export const ELEMENT_DIRECTIONS: Record<string, string[]> = {
  Mộc: ["Đông", "Đông Nam"],
  Hỏa: ["Nam"],
  Thổ: ["Đông Bắc", "Tây Nam"],
  Kim: ["Tây", "Tây Bắc"],
  Thủy: ["Bắc"],
};

export interface ElementDirectionMap {
  byElement: Record<string, string[]>;
  warning: string;
}

export function elementDirectionReference(): ElementDirectionMap {
  return {
    byElement: { ...ELEMENT_DIRECTIONS },
    warning:
      "Phương vị Ngũ hành tham khảo — không phải hướng tốt/xấu. Không suy từ heuristic Dụng thần.",
  };
}
