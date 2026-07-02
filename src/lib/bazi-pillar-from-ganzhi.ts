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

export interface HiddenStemCompact {
  gan: string;
  ganVi: string;
  tenGod: string;
  tenGodVi: string;
}

const ZHI_INDEX: Record<string, number> = Object.fromEntries(
  (LunarUtil.ZHI as string[]).map((z, i) => [z, i]),
);

const GAN_INDEX: Record<string, number> = Object.fromEntries(
  (LunarUtil.GAN as string[]).map((g, i) => [g, i]),
);

export interface CompactPillarDetail {
  gan: string;
  zhi: string;
  ganZhi: string;
  ganZhiVi: string;
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

function diShiForBranch(dayGan: string, zhi: string): string {
  const offset = LunarUtil.CHANG_SHENG_OFFSET[dayGan];
  const zhiIndex = ZHI_INDEX[zhi];
  const ganIndex = GAN_INDEX[dayGan];
  if (offset === undefined || zhiIndex === undefined || ganIndex === undefined) {
    return "";
  }
  let index = offset + (ganIndex % 2 === 0 ? zhiIndex : -zhiIndex);
  if (index >= 12) index -= 12;
  if (index < 0) index += 12;
  return (LunarUtil.CHANG_SHENG as string[])[index] ?? "";
}

function tenGodForStem(dayGan: string, targetGan: string): string {
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
  const hideGanRaw = (LunarUtil.ZHI_HIDE_GAN[zhi] ?? []) as string[];
  const tenGodZhi = hideGanRaw.map((g) => tenGodForStem(dayGan, g));
  const hideGan: HiddenStemCompact[] = hideGanRaw.map((g, i) => ({
    gan: g,
    ganVi: stemDisplayVi(g),
    tenGod: tenGodZhi[i] ?? "",
    tenGodVi: tenGodToVi(tenGodZhi[i] ?? ""),
  }));
  const naYin = LunarUtil.NAYIN[ganZhi] ?? "";
  const diShi = diShiForBranch(dayGan, zhi);
  const xun = LunarUtil.getXun(ganZhi);
  const xunKong = LunarUtil.getXunKong(xun);

  return {
    gan,
    zhi,
    ganZhi,
    ganZhiVi: pillarToVi(ganZhi),
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
