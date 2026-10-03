import type { Gender } from "@/lib/bazi-schema";
import type { LocalDateTime } from "@/lib/astrology-engine";

export type ReadingSchool = "traditional" | "manh_phai";
export type ReadingSource = "existing_chart" | "new_chart";
export type ReadingStatus =
  | "draft"
  | "locked_review"
  | "intake"
  | "awaiting_payment"
  | "paid"
  | "collecting"
  | "submitted";

export type ReadingMethod = "independent" | "verified" | "rectify_hour";

/** Lĩnh vực nghiệm chứng quá khứ (phương thức B). */
export type VerificationFieldId =
  | "career"
  | "marriage"
  | "education"
  | "children"
  | "finance"
  | "health"
  | "relocation"
  | "family";

export interface VerificationEvent {
  /** null nếu chỉ nhớ tháng/năm */
  day: number | null;
  month: number | null;
  year: number | null;
  content: string;
}

export interface VerificationFieldData {
  fieldId: VerificationFieldId;
  events: VerificationEvent[];
}

/** Chủ đề quan tâm — Phần 4. */
export type InterestTopicId =
  | "overview"
  | "education"
  | "career"
  | "cooperation"
  | "finance"
  | "marriage"
  | "children"
  | "health"
  | "family"
  | "dayun"
  | "fengshui"
  | "other";

export interface ReadingVerifiedPayload {
  selectedFields: VerificationFieldId[];
  fields: VerificationFieldData[];
  anchorMilestone: string;
  uncertainNotes: string;
  knownFuture: string;
  interestTopics: InterestTopicId[];
  mainQuestion: string;
  extraQuestions: string;
  dataCommitment: boolean;
}

/** Nguồn nhớ / xác nhận giờ — Phần 2C. */
export type RectifyTimeSource =
  | "documents"
  | "family"
  | "approx_range"
  | "previously_rectified"
  | "unknown";

export type RectifyEventGroup =
  | "education"
  | "marriage"
  | "career"
  | "children"
  | "finance"
  | "health"
  | "relocation"
  | "family"
  | "funeral"
  | "other";

export interface RectifyLandmark {
  day: number | null;
  month: number | null;
  year: number | null;
  group: RectifyEventGroup | null;
  detail: string;
}

/** Payload phương thức C — hiệu chỉnh giờ sinh. */
export interface ReadingRectifyPayload {
  timeRange: string;
  timeSource: RectifyTimeSource;
  landmarks: RectifyLandmark[];
  uncertainNotes: string;
  knownFuture: string;
  interestTopics: InterestTopicId[];
  mainQuestion: string;
  extraQuestions: string;
  dataCommitment: boolean;
}

export interface ReadingPostPay {
  method: ReadingMethod;
  verified: ReadingVerifiedPayload | null;
  rectify: ReadingRectifyPayload | null;
  submittedAt: string | null;
}

export type CertaintyLevel =
  | "very_sure"
  | "quite_sure"
  | "uncertain"
  | "unknown_hour";

export interface ReadingLockedSnapshot {
  fullName: string | null;
  birthPlace: string | null;
  gender: Gender;
  timezone: string;
  solar: LocalDateTime;
  dayBoundaryMode: string;
  pillarsSummary: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  dayMasterVi: string;
  /** Nhập ở bước kiểm tra / sửa — khóa khi sang form mục 2 */
  unknownHour: boolean;
  certainty: CertaintyLevel;
}

export interface ReadingIntake {
  aliasOrName: string;
  gender: Gender;
  solarDate: string; // YYYY-MM-DD
  birthPlace: string;
  birthTime: string; // HH:mm
  unknownHour: boolean;
  certainty: CertaintyLevel;
  method: ReadingMethod;
  notes: string;
}

export interface ReadingOrder {
  id: string;
  /** null đến khi thanh toán — lúc đó sinh và khóa vĩnh viễn */
  code: string | null;
  source: ReadingSource;
  school: ReadingSchool;
  status: ReadingStatus;
  chartId: string | null;
  lockedSnapshot: ReadingLockedSnapshot | null;
  intake: ReadingIntake | null;
  /** Form sau thanh toán (A thông báo / B nghiệm chứng / C hiệu chỉnh) */
  postPay: ReadingPostPay | null;
  createdAt: string;
  updatedAt: string;
}

export const SCHOOL_LABEL: Record<ReadingSchool, string> = {
  traditional: "Truyền thống",
  manh_phai: "Manh phái",
};

/** Giải thích sơ bộ khi chọn trường phái (modal đăng ký). */
export const SCHOOL_BLURB: Record<ReadingSchool, string> = {
  traditional:
    "Phù hợp nếu bạn muốn hiểu tổng thể tính cách, năng lực, công danh, tài vận, hôn nhân, sức khỏe, các chu kỳ thăng trầm và mệnh cục cần gì để vận hành thuận hơn.",
  manh_phai:
    "Phù hợp nếu bạn muốn biết mức độ thành tựu, tài phú, địa vị, hôn nhân, các biến động lớn và việc gì dễ xảy ra, kết quả ra sao, khi nào ứng.",
};

export const SOURCE_LABEL: Record<ReadingSource, string> = {
  existing_chart: "Lá số đang xem",
  new_chart: "Lá số mới",
};

export const METHOD_LABEL: Record<ReadingMethod, string> = {
  independent: "Luận độc lập (chỉ dùng dữ liệu cơ bản)",
  verified: "Luận có nghiệm chứng (cung cấp mốc quá khứ)",
  rectify_hour: "Hiệu chỉnh, tìm giờ sinh",
};

export const RECTIFY_TIME_SOURCE_LABEL: Record<RectifyTimeSource, string> = {
  documents: "Giấy tờ / Hồ sơ y tế",
  family: "Cha mẹ / Người thân nhớ rõ",
  approx_range: "Chỉ nhớ khoảng giờ (ước chừng)",
  previously_rectified: "Đã từng được hiệu chỉnh trước",
  unknown: "Hoàn toàn không rõ",
};

export const RECTIFY_EVENT_GROUP_LABEL: Record<RectifyEventGroup, string> = {
  education: "Học vấn / Thi cử",
  marriage: "Hôn nhân",
  career: "Công việc / Bổ nhiệm",
  children: "Con cái",
  finance: "Tài chính / Tài sản",
  health: "Sức khỏe / Tai nạn",
  relocation: "Chuyển nơi ở / Xuất ngoại",
  family: "Gia đình / Lục thân",
  funeral: "Tang chế",
  other: "Khác",
};

export const RECTIFY_TIME_SOURCE_IDS = Object.keys(
  RECTIFY_TIME_SOURCE_LABEL,
) as RectifyTimeSource[];

export const RECTIFY_EVENT_GROUP_IDS = Object.keys(
  RECTIFY_EVENT_GROUP_LABEL,
) as RectifyEventGroup[];

export const VERIFICATION_FIELD_LABEL: Record<VerificationFieldId, string> = {
  career: "Công việc – Bổ nhiệm – Thay đổi",
  marriage: "Hôn nhân – Tình cảm",
  education: "Học vấn – Thi cử",
  children: "Con cái",
  finance: "Tài chính – Mua bán tài sản",
  health: "Sức khỏe – Tai nạn",
  relocation: "Chuyển nơi ở – Xuất ngoại",
  family: "Gia đình – Lục thân",
};

export const VERIFICATION_FIELD_NOTE: Partial<
  Record<VerificationFieldId, string>
> = {
  career: "Nên ghi rõ tháng/năm. Ví dụ: 06/2018 – Lên chức trưởng phòng.",
  marriage:
    "Nếu chênh lệch ngày đăng ký kết hôn và ngày tổ chức đám cưới, vui lòng ghi chú rõ.",
};

export const INTEREST_TOPIC_LABEL: Record<InterestTopicId, string> = {
  overview: "Tổng quan mệnh cục",
  education: "Học vấn – Thi cử",
  career: "Nghề nghiệp – Quan lộc – Địa vị",
  cooperation: "Hợp tác – Cạnh tranh",
  finance: "Tài chính – Điền sản",
  marriage: "Hôn nhân – Tình cảm",
  children: "Con cái",
  health: "Sức khỏe – Quản trị rủi ro",
  family: "Gia đình – Lục thân",
  dayun: "Đại vận – Lưu niên – Ứng kỳ",
  fengshui: "Phong thủy Bát tự",
  other: "Khác",
};

export const VERIFICATION_FIELD_IDS = Object.keys(
  VERIFICATION_FIELD_LABEL,
) as VerificationFieldId[];

export const INTEREST_TOPIC_IDS = Object.keys(
  INTEREST_TOPIC_LABEL,
) as InterestTopicId[];

export const CERTAINTY_LABEL: Record<CertaintyLevel, string> = {
  very_sure: "Rất chắc chắn",
  quite_sure: "Khá chắc chắn",
  uncertain: "Chưa chắc",
  unknown_hour: "Không rõ giờ sinh",
};
