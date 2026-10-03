/**
 * Hidden stems with structural roles (Bản / Trung / Dư).
 * No fixed force percentages (60/30/10) — those belong to month-command rule-sets.
 */

import { LunarUtil } from "lunar-typescript";

export type HiddenStemRole = "ban" | "trung" | "du";

export interface HiddenStemWithRole {
  gan: string;
  role: HiddenStemRole;
  index: number;
}

const ROLE_BY_INDEX: HiddenStemRole[] = ["ban", "trung", "du"];

export function getHiddenStemsWithRoles(zhi: string): HiddenStemWithRole[] {
  const raw = (LunarUtil.ZHI_HIDE_GAN[zhi] ?? []) as string[];
  return raw.map((gan, index) => ({
    gan,
    role: ROLE_BY_INDEX[index] ?? "du",
    index,
  }));
}

export function hiddenStemRoleLabel(role: HiddenStemRole): string {
  if (role === "ban") return "Bản khí";
  if (role === "trung") return "Trung khí";
  return "Dư khí";
}
