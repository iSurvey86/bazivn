/**
 * Derive pillar attributes from a 干支 + day master (for Đại vận / Lưu niên).
 */

import { LunarUtil } from "lunar-typescript";
import {
  lifeStageToVi,
  naYinToVi,
  pillarToVi,
  tenGodToVi,
} from "./bazi-terminology";
import { stemDisplayVi } from "./bazi-shen-sha";
import { getChangSheng } from "./core/chang-sheng";
import {
  getHiddenStemsWithRoles,
  type HiddenStemRole,
} from "./core/hidden-stems";

export interface HiddenStemCompact {
  gan: string;
  ganVi: string;
  tenGod: string;
  tenGodVi: string;
  role: HiddenStemRole;
}

export interface CompactPillarDetail {
  gan: string;
  zhi: string;
  ganZhi: string;
  ganZhiVi: string;
  /** Thập thần Thiên Can so Nhật chủ */
  tenGodGan: string;
  tenGodGanVi: string;
  naYin: string;
  naYinVi: string;
  diShi: string;
  diShiVi: string;
  hideGan: HiddenStemCompact[];
  xun: string;
  xunVi: string;
  xunKong: string;
  xunKongVi: string;
}

export function tenGodForStem(dayGan: string, targetGan: string): string {
  const key = `${dayGan}${targetGan}`;
  return LunarUtil.SHI_SHEN[key] ?? "";
}

function xunKongVi(xunKong: string): string {
  if (!xunKong) return "—";
  return [...xunKong]
    .map((c) => {
      const z = LunarUtil.ZHI as string[];
      const idx = z.indexOf(c);
      if (idx < 0) return c;
      const names = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
      return names[idx] ?? c;
    })
    .join(" ");
}

export function pillarFromGanZhi(
  ganZhi: string,
  dayGan: string,
): CompactPillarDetail {
  const gan = ganZhi[0] ?? "";
  const zhi = ganZhi[1] ?? "";
  const hideWithRoles = getHiddenStemsWithRoles(zhi);
  const tenGodZhi = hideWithRoles.map((h) => tenGodForStem(dayGan, h.gan));
  const hideGan: HiddenStemCompact[] = hideWithRoles.map((h, i) => ({
    gan: h.gan,
    ganVi: stemDisplayVi(h.gan),
    tenGod: tenGodZhi[i] ?? "",
    tenGodVi: tenGodToVi(tenGodZhi[i] ?? ""),
    role: h.role,
  }));
  const tenGodGan = tenGodForStem(dayGan, gan);
  const naYin = LunarUtil.NAYIN[ganZhi] ?? "";
  const diShi = getChangSheng(dayGan, zhi);
  const xun = LunarUtil.getXun(ganZhi);
  const xunKong = LunarUtil.getXunKong(xun);

  return {
    gan,
    zhi,
    ganZhi,
    ganZhiVi: pillarToVi(ganZhi),
    tenGodGan,
    tenGodGanVi: tenGodToVi(tenGodGan),
    naYin,
    naYinVi: naYinToVi(naYin),
    diShi,
    diShiVi: lifeStageToVi(diShi),
    hideGan,
    xun,
    xunVi: pillarToVi(xun),
    xunKong,
    xunKongVi: xunKongVi(xunKong),
  };
}

export function representativeStemForElement(element: string): string {
  const map: Record<string, string> = {
    Mộc: "Giáp",
    Hỏa: "Bính",
    Thổ: "Mậu",
    Kim: "Canh",
    Thủy: "Nhâm",
  };
  return map[element] ?? element;
}
