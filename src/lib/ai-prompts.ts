import type { BaZiChartResult } from "@/lib/astrology-engine";

export type ReadingType = "career" | "personality" | "relationships";

export type LocaleCode = "vn" | "en" | "zh" | "ko";

export function buildSystemPrompt(
  locale: LocaleCode,
  readingType: ReadingType,
  coreTerms: Record<string, string>,
): string {
  const terms = Object.entries(coreTerms)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const taskMap: Record<ReadingType, string> = {
    personality: "Viết phân tích tính cách chi tiết, dùng ẩn dụ tự nhiên, giọng chuyên gia ấm áp.",
    career: "Phân tích sự nghiệp, điểm mạnh nghề nghiệp và giai đoạn thuận lợi.",
    relationships: "Phân tích tình cảm, cách giao tiếp và điều cần lưu ý trong quan hệ.",
  };

  return `Bạn là chuyên gia Bát Tự Việt Nam. Trả lời bằng tiếng Việt.
Ngôn ngữ: ${locale}
Nhiệm vụ: ${taskMap[readingType]}

Dữ liệu lõi:
${terms}

Quy tắc: Dùng đúng thuật ngữ Bát Tự, không bịa Can Chi, 500-800 từ.`;
}

export function buildUserPrompt(
  readingType: ReadingType,
  chart: BaZiChartResult,
): string {
  return `Lập luận giải loại "${readingType}" cho lá số:
- Giới tính: ${chart.genderLabel}
- Nhật chủ: ${chart.dayMasterVi}
- Tứ trụ: Năm ${chart.pillars.year.ganZhiVi}, Tháng ${chart.pillars.month.ganZhiVi}, Ngày ${chart.pillars.day.ganZhiVi}, Giờ ${chart.pillars.hour.ganZhiVi}
- Ngũ hành mạnh: ${chart.wuXingBalance.dominant}
- Đại vận: ${chart.yun.isForward ? "thuận" : "nghịch"}, khởi ${chart.yun.startSolarYear}`;
}
