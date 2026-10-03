/**
 * Deterministic Can–Chi relations for Fact Graph.
 * No cat/hung judgment — structural facts only.
 * Core never asserts 合 = 化 (transformStatus stays combineOnly / transformCandidate).
 */

export type RelationType =
  | "stemCombination"
  | "stemClash"
  | "fiveElementGenerate"
  | "fiveElementControl"
  | "branchSixHarmony"
  | "branchClash"
  | "branchHarm"
  | "branchPunishmentPair"
  | "branchThreePunishment"
  | "branchSelfPunishment"
  | "branchDestruction"
  | "branchThreeHarmony"
  | "branchHalfHarmony"
  /** 2/3 tam hợp thiếu trung thần (拱合) */
  | "branchArchHarmony"
  | "branchThreeMeeting";

/** @deprecated Use branchPunishmentPair | branchThreePunishment | branchSelfPunishment */
export type LegacyPunishmentType = "branchPunishment";

/**
 * Hợp vs hợp hóa — Core không tự khẳng định đã hóa.
 * - combineOnly: chỉ thấy quan hệ hợp cấu trúc
 * - transformCandidate: đủ điều kiện cục để trường phái có thể luận hóa (Core không chốt)
 * - transformed: dành Reasoning layer — Core không xuất
 */
export type HarmonyTransformStatus =
  | "combineOnly"
  | "transformCandidate"
  | "transformed";

export interface StemBranchRelation {
  type: RelationType;
  name: string;
  nameVi: string;
  members: string[];
  evidence: string;
  sourceId: string;
  /** Chỉ gắn cho quan hệ hợp; null/omit với xung hình hại… */
  transformStatus?: HarmonyTransformStatus | null;
  /** true khi cùng một can/chi tham gia ≥2合 (争合) */
  contested?: boolean;
  /** Các quan hệ hợp tranh chấp (name hoặc id) */
  contestedWith?: string[];
}

type PillarKey = "year" | "month" | "day" | "hour";

const STEM_COMBOS: [string, string, string][] = [
  ["甲", "己", "甲己合"],
  ["乙", "庚", "乙庚合"],
  ["丙", "辛", "丙辛合"],
  ["丁", "壬", "丁壬合"],
  ["戊", "癸", "戊癸合"],
];

const STEM_CLASH: [string, string, string][] = [
  ["甲", "庚", "甲庚冲"],
  ["乙", "辛", "乙辛冲"],
  ["丙", "壬", "丙壬冲"],
  ["丁", "癸", "丁癸冲"],
];

const BRANCH_SIX: [string, string, string][] = [
  ["子", "丑", "子丑合"],
  ["寅", "亥", "寅亥合"],
  ["卯", "戌", "卯戌合"],
  ["辰", "酉", "辰酉合"],
  ["巳", "申", "巳申合"],
  ["午", "未", "午未合"],
];

const BRANCH_CLASH: [string, string, string][] = [
  ["子", "午", "子午冲"],
  ["丑", "未", "丑未冲"],
  ["寅", "申", "寅申冲"],
  ["卯", "酉", "卯酉冲"],
  ["辰", "戌", "辰戌冲"],
  ["巳", "亥", "巳亥冲"],
];

const BRANCH_HARM: [string, string, string][] = [
  ["子", "未", "子未害"],
  ["丑", "午", "丑午害"],
  ["寅", "巳", "寅巳害"],
  ["卯", "辰", "卯辰害"],
  ["申", "亥", "申亥害"],
  ["酉", "戌", "酉戌害"],
];

/** Tam hình groups — full name only when all 3 present. */
const BRANCH_THREE_PUNISH: string[][] = [
  ["寅", "巳", "申"],
  ["丑", "戌", "未"],
];

/** Vô lễ hình (2 chi). */
const BRANCH_PAIR_PUNISH: [string, string][] = [["子", "卯"]];

const BRANCH_SELF_PUNISH = ["辰", "午", "酉", "亥"];

const BRANCH_DESTRUCTION: [string, string, string][] = [
  ["子", "酉", "子酉破"],
  ["寅", "亥", "寅亥破"],
  ["卯", "午", "卯午破"],
  ["辰", "丑", "辰丑破"],
  ["巳", "申", "巳申破"],
  ["未", "戌", "未戌破"],
];

/** members ordered head–middle–tail; middle = trung thần (bán hợp cần có). */
const THREE_HARMONY: {
  members: [string, string, string];
  name: string;
  nameVi: string;
}[] = [
  { members: ["申", "子", "辰"], name: "申子辰合水", nameVi: "Thân Tý Thìn hợp Thủy" },
  { members: ["寅", "午", "戌"], name: "寅午戌合火", nameVi: "Dần Ngọ Tuất hợp Hỏa" },
  { members: ["巳", "酉", "丑"], name: "巳酉丑合金", nameVi: "Tỵ Dậu Sửu hợp Kim" },
  { members: ["亥", "卯", "未"], name: "亥卯未合木", nameVi: "Hợi Mão Mùi hợp Mộc" },
];

const THREE_MEETING: { members: string[]; name: string; nameVi: string }[] = [
  { members: ["寅", "卯", "辰"], name: "寅卯辰会木", nameVi: "Dần Mão Thìn hội Mộc" },
  { members: ["巳", "午", "未"], name: "巳午未会火", nameVi: "Tỵ Ngọ Mùi hội Hỏa" },
  { members: ["申", "酉", "戌"], name: "申酉戌会金", nameVi: "Thân Dậu Tuất hội Kim" },
  { members: ["亥", "子", "丑"], name: "亥子丑会水", nameVi: "Hợi Tý Sửu hội Thủy" },
];

const STEM_EL: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

const GEN: Record<string, string> = {
  木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
};
const CTRL: Record<string, string> = {
  木: "土", 土: "水", 水: "火", 火: "金", 金: "木",
};

const PILLAR_KEYS: PillarKey[] = ["year", "month", "day", "hour"];

const SRC = {
  stemCombo: "relations.stemCombination.wuHe.v1",
  stemClash: "relations.stemClash.v1",
  fiveGen: "relations.fiveElement.generate.v1",
  fiveCtrl: "relations.fiveElement.control.v1",
  branchSix: "relations.branchSixHarmony.v1",
  branchClash: "relations.branchClash.v1",
  branchHarm: "relations.branchHarm.v1",
  branchDest: "relations.branchDestruction.v1",
  punishPair: "relations.branchPunishment.pair.v1",
  punishThree: "relations.branchPunishment.three.v1",
  punishSelf: "relations.branchPunishment.self.v1",
  punishWuLi: "relations.branchPunishment.wuli.v1",
  threeHarmony: "relations.branchThreeHarmony.v1",
  halfHarmony: "relations.branchHalfHarmony.v1",
  archHarmony: "relations.branchArchHarmony.v1",
  threeMeeting: "relations.branchThreeMeeting.v1",
} as const;

function orderedPairName(group: string[], a: string, b: string): string {
  const ia = group.indexOf(a);
  const ib = group.indexOf(b);
  return ia <= ib ? `${a}${b}刑` : `${b}${a}刑`;
}

/** Vietnamese short names for Core nameVi (spaces between glyphs). */
const GLYPH_VI: Record<string, string> = {
  甲: "Giáp", 乙: "Ất", 丙: "Bính", 丁: "Đinh", 戊: "Mậu",
  己: "Kỷ", 庚: "Canh", 辛: "Tân", 壬: "Nhâm", 癸: "Quý",
  子: "Tý", 丑: "Sửu", 寅: "Dần", 卯: "Mão", 辰: "Thìn", 巳: "Tỵ",
  午: "Ngọ", 未: "Mùi", 申: "Thân", 酉: "Dậu", 戌: "Tuất", 亥: "Hợi",
  木: "Mộc", 火: "Hỏa", 土: "Thổ", 金: "Kim", 水: "Thủy",
};

/** "甲己合" → "Giáp Kỷ hợp"; "子未害" → "Tý Mùi hại" */
function relationNameToVi(name: string): string {
  let s = name;
  s = s.replace(/自刑/g, " __SELF_PUNISH__ ");
  s = s.replace(/半合/g, " __HALF__ ");
  s = s.replace(/拱合/g, " __ARCH__ ");
  s = s.replace(/合/g, " __HE__ ");
  s = s.replace(/冲/g, " __CHONG__ ");
  s = s.replace(/刑/g, " __XING__ ");
  s = s.replace(/害/g, " __HAI__ ");
  s = s.replace(/破/g, " __PO__ ");
  s = s.replace(/生/g, " __SHENG__ ");
  s = s.replace(/克/g, " __KE__ ");
  s = s.replace(/会/g, " __HUI__ ");
  s = [...s]
    .map((ch) => (GLYPH_VI[ch] ? ` ${GLYPH_VI[ch]} ` : ch))
    .join("");
  s = s
    .replace(/__SELF_PUNISH__/g, "tự hình")
    .replace(/__HALF__/g, "bán hợp")
    .replace(/__ARCH__/g, "củng hợp")
    .replace(/__HE__/g, "hợp")
    .replace(/__CHONG__/g, "xung")
    .replace(/__XING__/g, "hình")
    .replace(/__HAI__/g, "hại")
    .replace(/__PO__/g, "phá")
    .replace(/__SHENG__/g, "sinh")
    .replace(/__KE__/g, "khắc")
    .replace(/__HUI__/g, "hội");
  return s.replace(/\s+/g, " ").trim();
}

export function computeStemBranchRelations(pillars: {
  year: { gan: string; zhi: string };
  month: { gan: string; zhi: string };
  day: { gan: string; zhi: string };
  hour: { gan: string; zhi: string };
}): StemBranchRelation[] {
  const out: StemBranchRelation[] = [];
  const seen = new Set<string>();

  const push = (rel: StemBranchRelation) => {
    const id = `${rel.type}:${rel.name}:${rel.members.slice().sort().join(",")}`;
    if (seen.has(id)) return;
    seen.add(id);
    out.push(rel);
  };

  // Stem pairs
  for (let i = 0; i < PILLAR_KEYS.length; i++) {
    for (let j = i + 1; j < PILLAR_KEYS.length; j++) {
      const a = PILLAR_KEYS[i]!;
      const b = PILLAR_KEYS[j]!;
      const ga = pillars[a].gan;
      const gb = pillars[b].gan;
      const ma = `${a}.gan.${ga}`;
      const mb = `${b}.gan.${gb}`;

      for (const [x, y, name] of STEM_COMBOS) {
        if ((ga === x && gb === y) || (ga === y && gb === x)) {
          push({
            type: "stemCombination",
            name,
            nameVi: relationNameToVi(name),
            members: [ma, mb],
            evidence: `thiên can ${ga}${gb}`,
            sourceId: SRC.stemCombo,
            transformStatus: "combineOnly",
          });
        }
      }
      for (const [x, y, name] of STEM_CLASH) {
        if ((ga === x && gb === y) || (ga === y && gb === x)) {
          push({
            type: "stemClash",
            name,
            nameVi: relationNameToVi(name),
            members: [ma, mb],
            evidence: `thiên can ${ga}${gb}`,
            sourceId: SRC.stemClash,
          });
        }
      }

      const ea = STEM_EL[ga];
      const eb = STEM_EL[gb];
      if (ea && eb) {
        if (GEN[ea] === eb) {
          push({
            type: "fiveElementGenerate",
            name: `${ea}生${eb}`,
            nameVi: relationNameToVi(`${ea}生${eb}`),
            members: [ma, mb],
            evidence: "ngũ hành thiên can",
            sourceId: SRC.fiveGen,
          });
        } else if (GEN[eb] === ea) {
          push({
            type: "fiveElementGenerate",
            name: `${eb}生${ea}`,
            nameVi: relationNameToVi(`${eb}生${ea}`),
            members: [mb, ma],
            evidence: "ngũ hành thiên can",
            sourceId: SRC.fiveGen,
          });
        }
        if (CTRL[ea] === eb) {
          push({
            type: "fiveElementControl",
            name: `${ea}克${eb}`,
            nameVi: relationNameToVi(`${ea}克${eb}`),
            members: [ma, mb],
            evidence: "ngũ hành thiên can",
            sourceId: SRC.fiveCtrl,
          });
        } else if (CTRL[eb] === ea) {
          push({
            type: "fiveElementControl",
            name: `${eb}克${ea}`,
            nameVi: relationNameToVi(`${eb}克${ea}`),
            members: [mb, ma],
            evidence: "ngũ hành thiên can",
            sourceId: SRC.fiveCtrl,
          });
        }
      }
    }
  }

  // Branch pairs (hợp/xung/hại/phá — không gắn tên tam hình đủ bộ ở đây)
  for (let i = 0; i < PILLAR_KEYS.length; i++) {
    for (let j = i + 1; j < PILLAR_KEYS.length; j++) {
      const a = PILLAR_KEYS[i]!;
      const b = PILLAR_KEYS[j]!;
      const za = pillars[a].zhi;
      const zb = pillars[b].zhi;
      const ma = `${a}.zhi.${za}`;
      const mb = `${b}.zhi.${zb}`;

      const checkPair = (
        table: [string, string, string][],
        type: RelationType,
        sourceId: string,
        transformStatus?: HarmonyTransformStatus | null,
      ) => {
        for (const [x, y, name] of table) {
          if ((za === x && zb === y) || (za === y && zb === x)) {
            push({
              type,
              name,
              nameVi: relationNameToVi(name),
              members: [ma, mb],
              evidence: `địa chi ${za}${zb}`,
              sourceId,
              ...(transformStatus ? { transformStatus } : {}),
            });
          }
        }
      };

      checkPair(BRANCH_SIX, "branchSixHarmony", SRC.branchSix, "combineOnly");
      checkPair(BRANCH_CLASH, "branchClash", SRC.branchClash);
      checkPair(BRANCH_HARM, "branchHarm", SRC.branchHarm);
      checkPair(BRANCH_DESTRUCTION, "branchDestruction", SRC.branchDest);

      // Vô lễ hình (2 chi)
      for (const [x, y] of BRANCH_PAIR_PUNISH) {
        if ((za === x && zb === y) || (za === y && zb === x)) {
          const name = `${x}${y}刑`;
          push({
            type: "branchPunishmentPair",
            name,
            nameVi: relationNameToVi(name),
            members: [ma, mb],
            evidence: "vô lễ hình",
            sourceId: SRC.punishWuLi,
          });
        }
      }

      if (za === zb && BRANCH_SELF_PUNISH.includes(za)) {
        const name = `${za}自刑`;
        push({
          type: "branchSelfPunishment",
          name,
          nameVi: relationNameToVi(name),
          members: [ma, mb],
          evidence: "tự hình",
          sourceId: SRC.punishSelf,
        });
      }
    }
  }

  // Tam hình: pair (2/3) vs full (3/3) trên toàn cục — không gắn tên đủ bộ khi thiếu chi
  const zhiSet = new Set(PILLAR_KEYS.map((k) => pillars[k].zhi));
  const zhiMembers = (zs: string[]) =>
    PILLAR_KEYS.filter((k) => zs.includes(pillars[k].zhi)).map(
      (k) => `${k}.zhi.${pillars[k].zhi}`,
    );

  for (const group of BRANCH_THREE_PUNISH) {
    const hit = group.filter((z) => zhiSet.has(z));
    if (hit.length === 3) {
      const name = `${group.join("")}刑`;
      push({
        type: "branchThreePunishment",
        name,
        nameVi: relationNameToVi(name),
        members: zhiMembers(group),
        evidence: "đủ tam hình (3/3)",
        sourceId: SRC.punishThree,
      });
    } else if (hit.length === 2) {
      const [za, zb] = hit as [string, string];
      const pairName = orderedPairName(group, za, zb);
      push({
        type: "branchPunishmentPair",
        name: pairName,
        nameVi: relationNameToVi(pairName),
        members: zhiMembers(hit),
        evidence: `tam hình thiếu chi (2/3 của ${group.join("")}) — không gắn tên đủ bộ`,
        sourceId: SRC.punishPair,
      });
    }
  }

  for (const group of THREE_HARMONY) {
    const hit = group.members.filter((z) => zhiSet.has(z));
    const middle = group.members[1];
    if (hit.length === 3) {
      push({
        type: "branchThreeHarmony",
        name: group.name,
        nameVi: group.nameVi,
        members: zhiMembers([...group.members]),
        evidence: "đủ tam hợp — Core không khẳng định đã hóa",
        sourceId: SRC.threeHarmony,
        transformStatus: "transformCandidate",
      });
    } else if (hit.length === 2) {
      const hasMiddle = hit.includes(middle);
      const pairName = `${hit[0]}${hit[1]}`;
      if (hasMiddle) {
        const name = `${pairName}半合`;
        push({
          type: "branchHalfHarmony",
          name,
          nameVi: relationNameToVi(name),
          members: zhiMembers(hit),
          evidence: `bán hợp (có trung thần ${middle}) của ${group.name}`,
          sourceId: SRC.halfHarmony,
          transformStatus: "combineOnly",
        });
      } else {
        const name = `${pairName}拱合`;
        push({
          type: "branchArchHarmony",
          name,
          nameVi: relationNameToVi(name),
          members: zhiMembers(hit),
          evidence: `củng hợp / 拱合 (thiếu trung thần ${middle}) của ${group.name}`,
          sourceId: SRC.archHarmony,
          transformStatus: "combineOnly",
        });
      }
    }
  }

  for (const group of THREE_MEETING) {
    const hit = group.members.filter((z) => zhiSet.has(z));
    if (hit.length === 3) {
      push({
        type: "branchThreeMeeting",
        name: group.name,
        nameVi: group.nameVi,
        members: zhiMembers(group.members),
        evidence: "đủ tam hội",
        sourceId: SRC.threeMeeting,
      });
    }
  }

  // Tranh hợp (争合): cùng can/chi tham gia ≥2 quan hệ hợp
  annotateContention(out);

  return out;
}

function comboKey(r: StemBranchRelation): string {
  return `${r.name}|${r.members.slice().sort().join(",")}`;
}

function annotateContention(rels: StemBranchRelation[]) {
  const comboTypes = new Set<RelationType>([
    "stemCombination",
    "branchSixHarmony",
  ]);
  const combos = rels.filter((r) => comboTypes.has(r.type));
  /** Map stem/branch glyph → combo keys that involve it */
  const glyphToCombos = new Map<string, string[]>();
  for (const r of combos) {
    const key = comboKey(r);
    for (const m of r.members) {
      const glyph = m.split(".").pop() ?? m;
      const list = glyphToCombos.get(glyph) ?? [];
      if (!list.includes(key)) list.push(key);
      glyphToCombos.set(glyph, list);
    }
  }

  for (const r of combos) {
    const self = comboKey(r);
    const rivals = new Set<string>();
    for (const m of r.members) {
      const glyph = m.split(".").pop() ?? m;
      for (const other of glyphToCombos.get(glyph) ?? []) {
        if (other !== self) rivals.add(other.split("|")[0] ?? other);
      }
    }
    if (rivals.size > 0) {
      r.contested = true;
      r.contestedWith = Array.from(rivals).sort();
      if (!r.transformStatus) r.transformStatus = "combineOnly";
    }
  }
}
