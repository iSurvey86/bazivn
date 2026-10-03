/**
 * Single source of truth for 十二长生 (Twelve Life Stages).
 * Always keyed by day-master stem + target branch (never by DaYun/LiuNian stem).
 *
 * NOTE: LunarUtil.GAN / ZHI are 1-indexed with a leading "".
 * Polarity and offsets must use 0-based stem/branch indices (甲=0…癸=9, 子=0…亥=11).
 */

import { LunarUtil } from "lunar-typescript";

const STEMS = (LunarUtil.GAN as string[]).filter(Boolean);
const BRANCHES = (LunarUtil.ZHI as string[]).filter(Boolean);

const ZHI_INDEX: Record<string, number> = Object.fromEntries(
  BRANCHES.map((z, i) => [z, i]),
);

const GAN_INDEX: Record<string, number> = Object.fromEntries(
  STEMS.map((g, i) => [g, i]),
);

export function getChangSheng(dayGan: string, zhi: string): string {
  const offset = LunarUtil.CHANG_SHENG_OFFSET[dayGan];
  const zhiIndex = ZHI_INDEX[zhi];
  const ganIndex = GAN_INDEX[dayGan];
  if (offset === undefined || zhiIndex === undefined || ganIndex === undefined) {
    return "";
  }
  // Yang stems (even 0-based index) walk forward; yin stems walk backward.
  let index = offset + (ganIndex % 2 === 0 ? zhiIndex : -zhiIndex);
  if (index >= 12) index -= 12;
  if (index < 0) index += 12;
  return (LunarUtil.CHANG_SHENG as string[])[index] ?? "";
}

/** Full matrix for tests / audit: 10 stems × 12 branches. */
export function changShengMatrix(): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const gan of STEMS) {
    out[gan] = {};
    for (const zhi of BRANCHES) {
      out[gan][zhi] = getChangSheng(gan, zhi);
    }
  }
  return out;
}
