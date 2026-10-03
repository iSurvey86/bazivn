/**
 * Shen Sha Catalog v2.0 — types.
 * Auxiliary markers only. Never drives usefulGod / patterns / body strength.
 */

export const SHEN_SHA_CATALOG_VERSION = "2.0.0";

export type ShenShaWeightClass = "auxiliary";

/** Display-only traditional tone — never a logic score. */
export type TraditionalToneDisplay = "cát" | "hung" | "trung";

/** Legacy internal tone used by existing UI. */
export type TraditionalToneInternal =
  | "thien_cat"
  | "thien_hung"
  | "trung_tinh";

export type PriorityClass = "A" | "A_MINUS" | "B" | "B_MINUS" | "LEGACY";

export type PillarSlot = "year" | "month" | "day" | "hour";

export interface ShenShaItem {
  key: string;
  name: string;
  chineseName?: string;
  vietnameseName?: string;
  /** @deprecated Display tone only — not logical weight. */
  type?: "cat" | "hung" | "auxiliary";
  /** Optional traditional folk label — not used as logic weight. */
  traditionalTone?: TraditionalToneInternal;
  /** Ticket display tone (cát/hung/trung) — display only. */
  traditionalToneDisplay?: TraditionalToneDisplay;
  weightClass: ShenShaWeightClass;
  sourceId?: string;
  aliases?: string[];
  category?: string;
  lookupBasis?: string;
  ruleVariant?: string;
  matchedAt?: PillarSlot[];
  evidence?: string;
  priorityClass?: PriorityClass;
}

export interface ShenShaYuanJu {
  nien: ShenShaItem[];
  nguyet: ShenShaItem[];
  nhat: ShenShaItem[];
  thoi: ShenShaItem[];
}

export interface ShenShaCatalogEntry {
  key: string;
  chineseName: string;
  vietnameseName: string;
  aliases: string[];
  category: string;
  lookupBasis: string;
  ruleVariant: string;
  sourceId: string;
  weightClass: ShenShaWeightClass;
  traditionalTone: TraditionalToneDisplay;
  priorityClass: PriorityClass;
  inDefaultCatalog: boolean;
  notes?: string;
}

export interface SpecialDayMarkerBase {
  key: string;
  weightClass: ShenShaWeightClass;
  sourceId: string;
  traditionalToneDisplay: TraditionalToneDisplay;
  evidence: string;
}

export interface KuiGangMarker extends SpecialDayMarkerBase {
  key: "kuiGang";
  present: boolean;
  dayPillar: string;
}

export interface YinYangMisalignmentMarker extends SpecialDayMarkerBase {
  key: "yinYangMisalignment";
  present: boolean;
  dayPillar: string;
}

export interface FourWasteMarker extends SpecialDayMarkerBase {
  key: "fourWaste";
  present: boolean;
  seasonMatched: boolean;
  dayPillarMatched: boolean;
  seasonGroup: "xuân" | "hạ" | "thu" | "đông" | null;
  monthBranch: string;
  dayPillar: string;
}

export interface TenEvilGreatDefeatMarker extends SpecialDayMarkerBase {
  key: "tenEvilGreatDefeat";
  baseListHit: boolean;
  refinedYearRuleHit: boolean;
  status: "absent" | "baseCandidate" | "refinedHit";
  dayPillar: string;
  yearPillar: string;
}

export interface SpecialDayMarkers {
  catalogVersion: typeof SHEN_SHA_CATALOG_VERSION;
  kuiGang: KuiGangMarker;
  yinYangMisalignment: YinYangMisalignmentMarker;
  fourWaste: FourWasteMarker;
  tenEvilGreatDefeat: TenEvilGreatDefeatMarker;
}

export function toInternalTone(
  display: TraditionalToneDisplay,
): TraditionalToneInternal {
  if (display === "cát") return "thien_cat";
  if (display === "hung") return "thien_hung";
  return "trung_tinh";
}

export function toDisplayTone(
  internal?: TraditionalToneInternal,
  type?: "cat" | "hung" | "auxiliary",
): TraditionalToneDisplay {
  if (internal === "thien_hung" || type === "hung") return "hung";
  if (internal === "trung_tinh" || type === "auxiliary") return "trung";
  return "cát";
}
