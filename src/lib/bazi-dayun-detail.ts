/**
 * Web-only helpers for Đại vận detail panel.
 * Facts only — no good/bad heuristics. Uses Core relations / qi / pillars.
 */

import type { BaZiChartResult, DaYunDetail } from "@/lib/astrology-engine";
import { pillarFromGanZhi } from "@/lib/bazi-pillar-from-ganzhi";
import { hiddenStemRoleLabel } from "@/lib/core/hidden-stems";
import {
  computeStemBranchRelations,
  type StemBranchRelation,
} from "@/lib/core/relations";
import { branchToVi, stemToVi } from "@/lib/bazi-terminology";

const MU_KHO = new Set(["辰", "戌", "丑", "未"]);
const PILLAR_VI: Record<string, string> = {
  year: "Niên",
  month: "Nguyệt",
  day: "Nhật",
  hour: "Thời",
};

function stemVi(gan: string): string {
  return STEM_VI_NAME(gan);
}

function STEM_VI_NAME(gan: string): string {
  const map: Record<string, string> = {
    甲: "Giáp",
    乙: "Ất",
    丙: "Bính",
    丁: "Đinh",
    戊: "Mậu",
    己: "Kỷ",
    庚: "Canh",
    辛: "Tân",
    壬: "Nhâm",
    癸: "Quý",
  };
  return map[gan] ?? stemToVi(gan).shortLabel ?? gan;
}

function branchVi(zhi: string): string {
  return branchToVi(zhi).label || zhi;
}

function STEM_OR_BRANCH(ch: string) {
  return /[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/.test(ch);
}

function glyphVi(ch: string): string {
  if (!STEM_OR_BRANCH(ch)) return ch;
  if (/[甲乙丙丁戊己庚辛壬癸]/.test(ch)) return STEM_VI_NAME(ch);
  return branchVi(ch);
}

/** Convert mixed CN relation labels → Vietnamese display. */
export function relationLabelVi(nameVi: string, name: string): string {
  let s = nameVi || name;
  const el: Record<string, string> = {
    木: "Mộc",
    火: "Hỏa",
    土: "Thổ",
    金: "Kim",
    水: "Thủy",
  };
  for (const [cn, vi] of Object.entries(el)) s = s.split(cn).join(vi);
  s = s.replace(/生/g, " sinh ").replace(/克/g, " khắc ");
  s = s.replace(/合/g, " hợp ").replace(/冲/g, " xung ");
  s = s.replace(/刑/g, " hình ").replace(/害/g, " hại ");
  s = s.replace(/破/g, " phá ").replace(/自/g, "tự ");
  s = s.replace(/半/g, "bán ").replace(/拱/g, "củng ");
  for (const ch of [...s]) {
    if (STEM_OR_BRANCH(ch)) {
      const vi = glyphVi(ch);
      if (vi !== ch) s = s.split(ch).join(` ${vi} `);
    }
  }
  return s.replace(/\s+/g, " ").trim();
}

export function ensureDaYunDetail(
  period: DaYunDetail,
  dayMaster: string,
): DaYunDetail {
  if (
    period.gan &&
    period.zhi &&
    period.tenGodGanVi &&
    period.tenGodChiMainVi &&
    period.hideGan?.length
  ) {
    return period;
  }
  const compact = pillarFromGanZhi(period.ganZhi, dayMaster);
  const ban = compact.hideGan.find((h) => h.role === "ban");
  return {
    ...period,
    gan: compact.gan,
    zhi: compact.zhi,
    tenGodGan: compact.tenGodGan,
    tenGodGanVi: compact.tenGodGanVi,
    tenGodChiMain: ban?.tenGod ?? "",
    tenGodChiMainVi: ban?.tenGodVi ?? "—",
    hideGan: compact.hideGan,
    diShiVi: period.diShiVi || compact.diShiVi,
    naYinVi: period.naYinVi || compact.naYinVi,
  };
}

/** Relations between Đại vận gan/zhi and each natal pillar. */
export function relationsDaYunToNatal(
  chart: BaZiChartResult,
  period: DaYunDetail,
): StemBranchRelation[] {
  const dy = ensureDaYunDetail(period, chart.dayMaster);
  const out: StemBranchRelation[] = [];
  for (const key of ["year", "month", "day", "hour"] as const) {
    const p = chart.pillars[key];
    // Only two glyphs in the set (ĐV + trụ) — tránh pollute bằng chi giả.
    const rels = computeStemBranchRelations({
      year: { gan: dy.gan, zhi: dy.zhi },
      month: { gan: p.gan, zhi: p.zhi },
      day: { gan: dy.gan, zhi: dy.zhi },
      hour: { gan: p.gan, zhi: p.zhi },
    });
    for (const r of rels) {
      out.push({
        ...r,
        evidence: `${r.evidence} · ĐV↔${PILLAR_VI[key] ?? key}`,
      });
    }
  }
  const seen = new Set<string>();
  return out.filter((r) => {
    const k = `${r.type}|${r.name}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export interface DaYunStructuralFacts {
  luRen: string[];
  daoVi: string[];
  muKho: string[];
}

export function structuralFactsDaYun(
  chart: BaZiChartResult,
  period: DaYunDetail,
): DaYunStructuralFacts {
  const dy = ensureDaYunDetail(period, chart.dayMaster);
  const qi = chart.dayMasterQiStates;
  const luRen: string[] = [];
  if (qi?.lu?.branch && dy.zhi === qi.lu.branch) {
    luRen.push(
      `Chi Đại vận ${branchVi(dy.zhi)} = Lộc của Nhật chủ ${stemVi(chart.dayMaster)}`,
    );
  }
  if (qi?.ren?.branch && dy.zhi === qi.ren.branch) {
    const kind =
      qi.ren.kind === "yinRen"
        ? "Âm Nhận"
        : qi.ren.kind === "yangRen"
          ? "Dương Nhận"
          : "Nhận";
    luRen.push(
      `Chi Đại vận ${branchVi(dy.zhi)} = ${kind} của Nhật chủ ${stemVi(chart.dayMaster)}`,
    );
  }

  const daoVi: string[] = [];
  for (const key of ["year", "month", "day", "hour"] as const) {
    const p = chart.pillars[key];
    if (dy.gan === p.gan) {
      daoVi.push(
        `Can Đại vận ${stemVi(dy.gan)} trùng ${PILLAR_VI[key]} can ${stemVi(p.gan)}`,
      );
    }
    if (dy.zhi === p.zhi) {
      daoVi.push(
        `Chi Đại vận ${branchVi(dy.zhi)} trùng ${PILLAR_VI[key]} chi ${branchVi(p.zhi)}`,
      );
    }
  }

  const muKho: string[] = [];
  if (MU_KHO.has(dy.zhi)) {
    muKho.push(
      `Chi Đại vận ${branchVi(dy.zhi)} thuộc nhóm Mộ Khố (Thìn/Tuất/Sửu/Mùi)`,
    );
  }
  const muKhoRelTypes = new Set([
    "branchClash",
    "branchPunishmentPair",
    "branchThreePunishment",
    "branchSixHarmony",
    "branchHarm",
    "branchDestruction",
  ]);
  for (const key of ["year", "month", "day", "hour"] as const) {
    const p = chart.pillars[key];
    if (!MU_KHO.has(p.zhi)) continue;
    // year/month = ĐV↔trụ; day/hour nhân bản cùng glyph → dedupe theo type|name.
    const raw = computeStemBranchRelations({
      year: { gan: dy.gan, zhi: dy.zhi },
      month: { gan: p.gan, zhi: p.zhi },
      day: { gan: dy.gan, zhi: dy.zhi },
      hour: { gan: p.gan, zhi: p.zhi },
    }).filter((r) => muKhoRelTypes.has(r.type));
    const seenRel = new Set<string>();
    const hides = p.hideGan
      .map((h) => `${stemVi(h.gan)} (${hiddenStemRoleLabel(h.role)})`)
      .join(", ");
    for (const r of raw) {
      const rk = `${r.type}|${r.name}`;
      if (seenRel.has(rk)) continue;
      seenRel.add(rk);
      muKho.push(
        `ĐV ${branchVi(dy.zhi)} ↔ ${PILLAR_VI[key]} ${branchVi(p.zhi)}: ${relationLabelVi(r.nameVi, r.name)}` +
          (hides ? ` · tàng ${hides}` : ""),
      );
    }
  }

  return { luRen, daoVi, muKho };
}

export function formatSolarRange(
  start: DaYunDetail["startSolarExact"],
  end: DaYunDetail["endSolarExact"],
): string {
  const fmt = (s: NonNullable<DaYunDetail["startSolarExact"]>) =>
    `${String(s.day).padStart(2, "0")}/${String(s.month).padStart(2, "0")}/${s.year}`;
  if (!start && !end) return "—";
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `từ ${fmt(start)}`;
  return `đến ${fmt(end!)}`;
}
