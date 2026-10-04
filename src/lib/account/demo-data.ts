import type { AccountProfile } from "./types";

/** Hồ sơ demo 1 user — theo mockup public/slidebar (sẽ thay bằng Auth sau). */
export const DEMO_ACCOUNT_PROFILE: AccountProfile = {
  displayName: "Đỗ Minh Phương",
  code: "H72MJPXU",
  statusLabel: "Đang xử lý",
  statusTone: "processing",
  memberLevel: "Premium",
  updatedAtLabel: "04/10/2026 08:19",
  progressPercent: 65,
  progressSteps: [
    {
      id: "collect",
      title: "Thu thập thông tin",
      detail: "Đã nhận Form và mã định danh.",
      status: "done",
      completedAt: "03/10",
    },
    {
      id: "rectify",
      title: "Tiền xử lý & Hiệu chỉnh giờ sinh",
      detail: "Đã khớp 8/10 mốc sự kiện quá khứ. Khóa giờ sinh: 02:21 SA.",
      status: "done",
      completedAt: "04/10",
    },
    {
      id: "reading",
      title: "Luận giải Mệnh cục & Đại vận",
      detail:
        "Chuyên gia đang phân tích cấu trúc Tứ trụ và tính toán ứng kỳ. Ước tính 2 ngày.",
      status: "active",
    },
    {
      id: "qa",
      title: "Giải đáp câu hỏi & Khuyến nghị",
      detail: "Chờ xử lý",
      status: "pending",
    },
    {
      id: "delivery",
      title: "Đóng gói Mệnh thư & Bàn giao",
      detail: "Chờ xử lý",
      status: "pending",
    },
  ],
  pillars: {
    year: { gan: "Bính", zhi: "Dần", note: "Mộc/Hỏa" },
    month: { gan: "Canh", zhi: "Thân", note: "Kim/Thủy" },
    day: { gan: "Mậu", zhi: "Tuất", note: "Thổ/Thổ" },
    hour: { gan: "Nhâm", zhi: "Tý", note: "Thủy/Thủy" },
  },
  usefulGod: {
    yong: "Mộc",
    xi: "Hỏa",
    ji: "Thủy, Kim",
    chou: "Thổ",
    note: "Điểm khuyết: Mộc suy nhược — cần bổ sung qua phong thủy / lựa chọn môi trường.",
  },
  yearQuick: {
    work: "Có sự dịch chuyển, dễ thay đổi vị trí.",
    wealth: "Chi tiêu nhiều, hao tài vào nửa cuối năm.",
    advice: "Giữ thế phòng thủ, không nên đầu tư lớn.",
  },
  relations: [
    "Dần – Thân tương xung: biến động sớm khi xa quê lập nghiệp.",
    "Thân – Tý bán hợp Thủy: hỗ trợ công danh, có quý nhân.",
  ],
  shenSha: [
    "Thiên Ất Quý Nhân (Thân): gặp nguy hóa an, thi cử thuận.",
    "Dịch Mã (Dần): đi lại nhiều, công việc đa nơi.",
  ],
  dayunSummary:
    "Vận trình đi từ Thủy sang Mộc; càng về trung vận càng bộc lộ năng lực, tài chính vượng phát.",
  dayunPeriods: [
    { range: "2010–2019", ganZhi: "Kỷ Mùi", tone: "Bình hòa" },
    { range: "2020–2029", ganZhi: "Mậu Ngọ", tone: "Cát lợi", current: true },
    { range: "2030–2039", ganZhi: "Đinh Tỵ", tone: "Đại cát" },
    { range: "2040–2049", ganZhi: "Bính Thìn", tone: "Cát lợi" },
    { range: "2050–2059", ganZhi: "Ất Mão", tone: "Suy vi" },
  ],
  currentDayunDetail: [
    "Đặc điểm: Lửa vượng sinh Thổ — đà bứt phá nghề nghiệp.",
    "Lưu ý: Ngọ – Tý xung cung giờ — chú ý mâu thuẫn nội bộ.",
  ],
  liuNian: [
    {
      year: "2025 (Ất Tỵ)",
      note: "Cơ hội thăng tiến mở ra nhưng áp lực công việc lớn.",
    },
    {
      year: "2026 (Bính Ngọ)",
      note: "Năm nay. Cẩn trọng hụt dòng tiền tháng 5–6.",
      highlight: true,
    },
    {
      year: "2027 (Đinh Mùi)",
      note: "Hợp tác sinh tài, khả năng chốt tài sản lớn.",
    },
  ],
  journal: [
    {
      id: "j1",
      dateLabel: "05/05/2026",
      group: "Đời sống",
      content:
        "Ăn bún cá, gặp sự cố nhỏ về tiêu hóa (khớp dự báo tháng Tỵ).",
      matched: true,
    },
    {
      id: "j2",
      dateLabel: "04/2026",
      group: "Thể thao / Sức khỏe",
      content: "Hoàn thành thử thách vRace 26km. Sức khỏe dẻo dai.",
      matched: true,
    },
    {
      id: "j3",
      dateLabel: "01/2026",
      group: "Hôn nhân",
      content: "(Mốc khai báo ban đầu) Tổ chức lễ cưới tại Hà Nội.",
      matched: false,
    },
  ],
  colors: "Xanh lá, Đỏ, Cam, Hồng",
  directions: "Phương Nam, Phương Đông",
  careers: "Nông nghiệp, Giáo dục, Năng lượng, F&B",
  qa: [
    {
      question: "Năm 2027 có nên chuyển hướng kinh doanh riêng không?",
      answer:
        "Lưu niên Đinh Mùi 2027 hợp hóa với Thái tuế, Dụng thần sinh tài. Thích hợp tách riêng; tháng khởi sự tốt: tháng 2 và 6 âm.",
    },
    {
      question: "Sức khỏe cần lưu ý bệnh gì?",
      answer:
        "Bát tự khuyết Mộc, Thủy vượng — chú ý gan mật và hệ bài tiết; tránh thức khuya kéo dài.",
    },
  ],
  chartId: null,
};
