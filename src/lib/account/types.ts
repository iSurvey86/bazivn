/** Điều hướng khu vực tài khoản cá nhân (theo mockup public/slidebar). */

export type AccountNavId =
  | "overview"
  | "pillars"
  | "dayun"
  | "journal"
  | "advice"
  | "contact"
  | "settings";

export const ACCOUNT_NAV: {
  id: AccountNavId;
  href: string;
  label: string;
  icon: string;
}[] = [
  { id: "overview", href: "/account/overview", label: "Tổng quan Mệnh cục", icon: "📊" },
  { id: "pillars", href: "/account/pillars", label: "Chi tiết Tứ Trụ", icon: "柱" },
  { id: "dayun", href: "/account/dayun", label: "Đại Vận & Lưu Niên", icon: "📈" },
  { id: "journal", href: "/account/journal", label: "Nhật ký Nghiệm chứng", icon: "⏳" },
  { id: "advice", href: "/account/advice", label: "Khuyến nghị & Giải đáp", icon: "🎯" },
  { id: "contact", href: "/account/contact", label: "Liên hệ Chuyên gia", icon: "💬" },
  { id: "settings", href: "/account/settings", label: "Cài đặt tài khoản", icon: "⚙️" },
];

export type ProgressStepStatus = "done" | "active" | "pending";

export interface AccountProgressStep {
  id: string;
  title: string;
  detail: string;
  status: ProgressStepStatus;
  completedAt?: string;
}

export interface AccountJournalEntry {
  id: string;
  dateLabel: string;
  group: string;
  content: string;
  matched?: boolean;
}

export interface AccountQaItem {
  question: string;
  answer: string;
}

export interface AccountProfile {
  displayName: string;
  code: string;
  statusLabel: string;
  statusTone: "processing" | "ready" | "idle";
  memberLevel: string;
  updatedAtLabel: string;
  progressPercent: number;
  progressSteps: AccountProgressStep[];
  pillars: {
    year: { gan: string; zhi: string; note: string };
    month: { gan: string; zhi: string; note: string };
    day: { gan: string; zhi: string; note: string };
    hour: { gan: string; zhi: string; note: string };
  };
  usefulGod: {
    yong: string;
    xi: string;
    ji: string;
    chou: string;
    note: string;
  };
  yearQuick: { work: string; wealth: string; advice: string };
  relations: string[];
  shenSha: string[];
  dayunSummary: string;
  dayunPeriods: {
    range: string;
    ganZhi: string;
    tone: string;
    current?: boolean;
  }[];
  currentDayunDetail: string[];
  liuNian: { year: string; note: string; highlight?: boolean }[];
  journal: AccountJournalEntry[];
  colors: string;
  directions: string;
  careers: string;
  qa: AccountQaItem[];
  chartId: string | null;
}
