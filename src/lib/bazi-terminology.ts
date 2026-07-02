/** Vietnamese display layer for BaZi terms (phase 1: vn only). */

export const STEM_VI: Record<string, { name: string; element: string; polarity: "+" | "-" }> = {
  甲: { name: "Giáp", element: "Mộc", polarity: "+" },
  乙: { name: "Ất", element: "Mộc", polarity: "-" },
  丙: { name: "Bính", element: "Hỏa", polarity: "+" },
  丁: { name: "Đinh", element: "Hỏa", polarity: "-" },
  戊: { name: "Mậu", element: "Thổ", polarity: "+" },
  己: { name: "Kỷ", element: "Thổ", polarity: "-" },
  庚: { name: "Canh", element: "Kim", polarity: "+" },
  辛: { name: "Tân", element: "Kim", polarity: "-" },
  壬: { name: "Nhâm", element: "Thủy", polarity: "+" },
  癸: { name: "Quý", element: "Thủy", polarity: "-" },
};

export const BRANCH_VI: Record<string, { name: string; animal: string; element: string }> = {
  子: { name: "Tý", animal: "Chuột", element: "Thủy" },
  丑: { name: "Sửu", animal: "Trâu", element: "Thổ" },
  寅: { name: "Dần", animal: "Hổ", element: "Mộc" },
  卯: { name: "Mão", animal: "Mèo", element: "Mộc" },
  辰: { name: "Thìn", animal: "Rồng", element: "Thổ" },
  巳: { name: "Tỵ", animal: "Rắn", element: "Hỏa" },
  午: { name: "Ngọ", animal: "Ngựa", element: "Hỏa" },
  未: { name: "Mùi", animal: "Dê", element: "Thổ" },
  申: { name: "Thân", animal: "Khỉ", element: "Kim" },
  酉: { name: "Dậu", animal: "Gà", element: "Kim" },
  戌: { name: "Tuất", animal: "Chó", element: "Thổ" },
  亥: { name: "Hợi", animal: "Heo", element: "Thủy" },
};

export const TEN_GOD_VI: Record<string, string> = {
  比肩: "Tỷ Kiên",
  劫财: "Kiếp Tài",
  食神: "Thực Thần",
  伤官: "Thương Quan",
  偏财: "Thiên Tài",
  正财: "Chính Tài",
  七杀: "Thất Sát",
  正官: "Chính Quan",
  偏印: "Thiên Ấn",
  正印: "Chính Ấn",
};

export const LIFE_STAGE_VI: Record<string, string> = {
  长生: "Trường Sinh",
  沐浴: "Mộc Dục",
  冠带: "Quan Đới",
  临官: "Lâm Quan",
  帝旺: "Đế Vượng",
  衰: "Suy",
  病: "Bệnh",
  死: "Tử",
  墓: "Mộ",
  绝: "Tuyệt",
  胎: "Thai",
  养: "Dưỡng",
};

/** 60 Nạp Âm — Chinese to Vietnamese */
export const NA_YIN_VI: Record<string, string> = {
  海中金: "Hải Trung Kim",
  炉中火: "Lô Trung Hỏa",
  大林木: "Đại Lâm Mộc",
  路旁土: "Lộ Bàng Thổ",
  剑锋金: "Kiếm Phong Kim",
  山头火: "Sơn Đầu Hỏa",
  涧下水: "Giản Hạ Thủy",
  城头土: "Thành Đầu Thổ",
  白蜡金: "Bạch Lạp Kim",
  杨柳木: "Dương Liễu Mộc",
  泉中水: "Tuyền Trung Thủy",
  屋上土: "Ốc Thượng Thổ",
  霹雳火: "Phích Lịch Hỏa",
  松柏木: "Tùng Bách Mộc",
  长流水: "Trường Lưu Thủy",
  沙中金: "Sa Trung Kim",
  山下火: "Sơn Hạ Hỏa",
  平地木: "Bình Địa Mộc",
  壁上土: "Bích Thượng Thổ",
  金箔金: "Kim Bạc Kim",
  覆灯火: "Phúc Đăng Hỏa",
  天河水: "Thiên Hà Thủy",
  大驿土: "Đại Dịch Thổ",
  钗钏金: "Xuyến Thoa Kim",
  桑柘木: "Tang Trạch Mộc",
  大溪水: "Đại Khê Thủy",
  沙中土: "Sa Trung Thổ",
  天上火: "Thiên Thượng Hỏa",
  石榴木: "Thạch Lựu Mộc",
  大海水: "Đại Hải Thủy",
};

/** 24 Tiết khí */
export const SOLAR_TERM_VI: Record<string, string> = {
  立春: "Lập Xuân",
  雨水: "Vũ Thủy",
  惊蛰: "Kinh Trập",
  春分: "Xuân Phân",
  清明: "Thanh Minh",
  谷雨: "Cốc Vũ",
  立夏: "Lập Hạ",
  小满: "Tiểu Mãn",
  芒种: "Mang Chủng",
  夏至: "Hạ Chí",
  小暑: "Tiểu Thử",
  大暑: "Đại Thử",
  立秋: "Lập Thu",
  处暑: "Xử Thử",
  白露: "Bạch Lộ",
  秋分: "Thu Phân",
  寒露: "Hàn Lộ",
  霜降: "Sương Giáng",
  立冬: "Lập Đông",
  小雪: "Tiểu Tuyết",
  大雪: "Đại Tuyết",
  冬至: "Đông Chí",
  小寒: "Tiểu Hàn",
  大寒: "Đại Hàn",
};

export const ELEMENT_COLORS: Record<string, string> = {
  Mộc: "#2d5a40",
  Hỏa: "#a83828",
  Thổ: "#735810",
  Kim: "#434a56",
  Thủy: "#1f4f7a",
};

export function stemToVi(gan: string) {
  const s = STEM_VI[gan];
  if (!s) return { label: gan, element: "", polarity: "" as const };
  const polarityLabel = s.polarity === "+" ? "Dương" : "Âm";
  return {
    label: `${s.name} (${polarityLabel} ${s.element})`,
    shortLabel: s.name,
    element: s.element,
    polarity: s.polarity,
  };
}

export function branchToVi(zhi: string) {
  const b = BRANCH_VI[zhi];
  if (!b) return { label: zhi, animal: "", element: "" };
  return { label: b.name, animal: b.animal, element: b.element };
}

/** Classic chart label: "Canh +Kim" */
export function stemClassicLabel(gan: string) {
  const s = STEM_VI[gan];
  if (!s) return gan;
  return `${s.name} ${s.polarity}${s.element}`;
}

/** Classic chart label: "Tý +Thủy" */
export function branchClassicLabel(zhi: string) {
  const b = BRANCH_VI[zhi];
  if (!b) return zhi;
  const yangBranches = ["子", "寅", "辰", "午", "申", "戌"];
  const polarity = yangBranches.includes(zhi) ? "+" : "-";
  return `${b.name} ${polarity}${b.element}`;
}

export function stemElement(gan: string) {
  return STEM_VI[gan]?.element ?? "";
}

export function branchElement(zhi: string) {
  return BRANCH_VI[zhi]?.element ?? "";
}

export function pillarToVi(ganZhi: string) {
  const gan = ganZhi[0] ?? "";
  const zhi = ganZhi[1] ?? "";
  const s = stemToVi(gan);
  const b = branchToVi(zhi);
  return `${s.shortLabel ?? s.label.split(" ")[0]} ${b.label}`;
}

export function naYinToVi(naYin: string) {
  return NA_YIN_VI[naYin] ?? naYin;
}

export function solarTermToVi(term: string | null) {
  if (!term) return null;
  return SOLAR_TERM_VI[term] ?? term;
}

export function ganZhiPairToVi(pair: string): string {
  if (pair.length < 2) return pair;
  const parts = pair.split(/[\s·]+/);
  return parts
    .map((part) => {
      if (part.length === 2) return pillarToVi(part);
      return part
        .match(/.{1,2}/g)
        ?.map((gz) => (gz.length === 2 ? branchToVi(gz[1] ?? gz).label : gz))
        .join(" ") ?? part;
    })
    .join(" · ");
}

export function xunToVi(xun: string) {
  return pillarToVi(xun);
}

export function xunKongToVi(xunKong: string) {
  if (!xunKong) return "—";
  return [...xunKong]
    .map((char) => branchToVi(char).label)
    .filter(Boolean)
    .join(" ");
}

export function tenGodToVi(name: string) {
  return TEN_GOD_VI[name] ?? name;
}

/** Viết tắt thập thần (phó tinh) */
export const TEN_GOD_ABBR_VI: Record<string, string> = {
  "Tỷ Kiên": "TK",
  "Kiếp Tài": "KT",
  "Thực Thần": "TH",
  "Thương Quan": "TQ",
  "Thiên Tài": "TT",
  "Chính Tài": "CT",
  "Thất Sát": "TS",
  "Chính Quan": "CQ",
  "Thiên Ấn": "TA",
  "Chính Ấn": "CA",
};

export function tenGodAbbrVi(name: string): string {
  return TEN_GOD_ABBR_VI[name] ?? name.slice(0, 2).toUpperCase();
}

export function formatTimezoneLabel(timezone: string): string {
  try {
    const offsetHours = getTimezoneOffsetHours(timezone);
    const sign = offsetHours >= 0 ? "+" : "-";
    const abs = Math.abs(offsetHours);
    const h = Math.floor(abs);
    const m = Math.round((abs - h) * 60);
    return m > 0
      ? `GMT${sign}${h}:${String(m).padStart(2, "0")}`
      : `GMT${sign}${h}`;
  } catch {
    return timezone;
  }
}

function getTimezoneOffsetHours(timezone: string): number {
  const now = new Date();
  const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  const tz = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  return (tz.getTime() - utc.getTime()) / 3_600_000;
}

export function lifeStageToVi(name: string) {
  return LIFE_STAGE_VI[name] ?? name;
}

export function isYangStem(gan: string) {
  return STEM_VI[gan]?.polarity === "+";
}

export function genderPolarityLabel(gender: "male" | "female", yearGan: string) {
  const yang = isYangStem(yearGan);
  if (gender === "male") return yang ? "Dương Nam" : "Âm Nam";
  return yang ? "Dương Nữ" : "Âm Nữ";
}
