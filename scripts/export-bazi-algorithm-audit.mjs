/**
 * Xuất rà soát thuật toán Bát tự đang dùng trong BaziVN → Word (.docx)
 * Output: public/bcao/
 */
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  WidthType,
  BorderStyle,
} from "docx";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(
  __dirname,
  "..",
  "public",
  "bcao",
  "BAZIVN-ra-soat-thuat-toan-bat-tu.docx",
);

const border = { style: BorderStyle.SINGLE, size: 4, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: opts.width ?? 2000, type: WidthType.DXA },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: String(text ?? ""),
            bold: opts.bold ?? false,
            size: 20,
            font: "Times New Roman",
          }),
        ],
      }),
    ],
  });
}

function headerRow(cols, widths) {
  return new TableRow({
    children: cols.map((c, i) =>
      cell(c, { bold: true, width: widths?.[i] ?? 2000 }),
    ),
  });
}

function dataRow(cols, widths) {
  return new TableRow({
    children: cols.map((c, i) => cell(c, { width: widths?.[i] ?? 2000 })),
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        size: opts.size ?? 22,
        font: "Times New Roman",
      }),
    ],
  });
}

function h(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({ text, bold: true, size: 28, font: "Times New Roman" }),
    ],
  });
}

const W5 = [1600, 1600, 1600, 1800, 2400];
const W4 = [1800, 2200, 2200, 2800];
const W3 = [2400, 2800, 3800];
const W2 = [3600, 5400];

const hideGan = [
  ["Tý 子", "Quý 癸", "—", "—", "1 can (bản khí)"],
  ["Sửu 丑", "Kỷ 己", "Quý 癸", "Tân 辛", "role: ban/trung/du"],
  ["Dần 寅", "Giáp 甲", "Bính 丙", "Mậu 戊", ""],
  ["Mão 卯", "Ất 乙", "—", "—", "1 can"],
  ["Thìn 辰", "Mậu 戊", "Ất 乙", "Quý 癸", ""],
  ["Tỵ 巳", "Bính 丙", "Canh 庚", "Mậu 戊", ""],
  ["Ngọ 午", "Đinh 丁", "Kỷ 己", "—", "2 can (không dư khí trong lib)"],
  ["Mùi 未", "Kỷ 己", "Đinh 丁", "Ất 乙", ""],
  ["Thân 申", "Canh 庚", "Nhâm 壬", "Mậu 戊", ""],
  ["Dậu 酉", "Tân 辛", "—", "—", "1 can"],
  ["Tuất 戌", "Mậu 戊", "Tân 辛", "Đinh 丁", ""],
  ["Hợi 亥", "Nhâm 壬", "Giáp 甲", "—", "2 can"],
];

const changShengOffset = [
  ["Giáp 甲", "1", "Dương (index 0)", "đi thuận chi; 长生 tại 亥"],
  ["Ất 乙", "6", "Âm (index 1)", "đi nghịch chi; 长生 tại 午"],
  ["Bính 丙", "10", "Dương", ""],
  ["Đinh 丁", "9", "Âm", ""],
  ["Mậu 戊", "10", "Dương", "cùng Bính"],
  ["Kỷ 己", "9", "Âm", "cùng Đinh"],
  ["Canh 庚", "7", "Dương", "庚+午 = 沐浴 (đã sửa index 0-based)"],
  ["Tân 辛", "0", "Âm", ""],
  ["Nhâm 壬", "4", "Dương", ""],
  ["Quý 癸", "3", "Âm", ""],
];

const lifeOrder = [
  "长生 Trường Sinh",
  "沐浴 Mộc Dục",
  "冠带 Quan Đới",
  "临官 Lâm Quan",
  "帝旺 Đế Vượng",
  "衰 Suy",
  "病 Bệnh",
  "死 Tử",
  "墓 Mộ",
  "绝 Tuyệt",
  "胎 Thai",
  "养 Dưỡng",
];

const shenShaCore = [
  [
    "Thiên Ất Quý Nhân",
    "Ngày can → chi trụ",
    "甲戊庚→丑未; 乙己→子申; 丙丁→亥酉; 壬癸→卯巳; 辛→寅午",
    "auxiliary (UI tone: cát)",
  ],
  [
    "Dịch Mã",
    "Năm chi HOẶC Ngày chi → chi trụ",
    "寅午戌→申; 申子辰→寅; 巳酉丑→亥; 亥卯未→巳",
    "auxiliary (UI tone: cát)",
  ],
  [
    "Đào Hoa",
    "Năm chi HOẶC Ngày chi → chi trụ",
    "寅午戌→卯; 申子辰→酉; 巳酉丑→午; 亥卯未→子",
    "auxiliary (UI tone: cát)",
  ],
  [
    "Dương Nhẫn / Nhận",
    "dayMasterQiStates (KHÔNG còn trong shen-sha)",
    "Default renMode=ziPingYangRenOnly: 甲→卯; 丙戊→午; 庚→酉; 壬→子. Âm can: không. Option yinRenExtended: 乙寅 丁巳 己巳 辛申 癸亥",
    "qi-state",
  ],
  [
    "Lộc Thần",
    "dayMasterQiStates (KHÔNG còn trong shen-sha)",
    "甲寅 乙卯 丙巳 丁午 戊巳 己午 庚申 辛酉 壬亥 癸子 — matchedAt năm/tháng/ngày/giờ",
    "qi-state",
  ],
  [
    "Không Vong (Tuần Không)",
    "LunarUtil.getXun / getXunKong",
    "Không trong bazi-shen-sha.ts. Facts: xunKong.dayXunKong (chính) + year/month/hour auxiliary. UI: cột Tuần·Không từng trụ",
    "—",
  ],
];

const shenShaOther = [
  ["Văn Xương", "Ngày can", "甲巳 乙午 丙戊申 丁己酉 庚亥 辛子 壬寅 癸卯", "cát"],
  ["Huyết Nhẫn", "Ngày can", "甲卯 乙辰 丙午 丁未 戊午 己未 庚酉 辛戌 壬子 癸丑", "hung"],
  ["Hoa Cái", "Năm/Ngày chi", "寅午戌→戌; 申子辰→辰; 巳酉丑→丑; 亥卯未→未", "cát"],
  ["Kiếp Sát", "Năm/Ngày chi", "寅午戌→亥; 申子辰→巳; 巳酉丑→寅; 亥卯未→申", "hung"],
  ["Vong Thần", "Năm/Ngày chi", "寅午戌→巳; 申子辰→亥; 巳酉丑→申; 亥卯未→寅", "hung"],
  ["Tai Sát", "Năm/Ngày chi", "寅午戌→丑; 申子辰→未; 巳酉丑→戌; 亥卯未→辰", "hung"],
  ["Hàm Trì", "Năm/Ngày chi", "亥卯未→子; 寅午戌→卯; 巳酉丑→午; 申子辰→酉", "cát"],
  ["Tướng Tinh", "Năm/Ngày chi", "寅午戌→午; 申子辰→子; 巳酉丑→酉; 亥卯未→卯", "cát"],
  ["Cô Thần", "Năm/Ngày chi", "寅卯辰→巳; 巳午未→申; 申酉戌→亥; 亥子丑→寅", "hung"],
  ["Quả Tú", "Năm/Ngày chi", "寅卯辰→丑; 巳午未→辰; 申酉戌→未; 亥子丑→戌", "hung"],
  ["Thiên Cầu", "Tháng chi", "寅巳 卯午 辰未 巳申 午酉 未戌 申亥 酉子 戌丑 亥寅 子卯 丑辰", "hung"],
];

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        h("BaziVN — Rà soát thuật toán lập lá số Bát tự (Tử Bình)"),
        p(
          "Ngày xuất: 2026-10-03 (bản tái xuất sau P0 Core refactor). EngineVersion: 0.2.0-core / ruleSetVersion: bazi-core-2026-10-03.",
        ),
        p(
          "Nguồn: src/lib/astrology-engine.ts, src/lib/core/*, bazi-shen-sha.ts, bazi-pillar-from-ganzhi.ts + lunar-typescript (6tail).",
        ),
        p(
          "DỮ LIỆU THÔ HỆ THỐNG ĐANG DÙNG — không phải toàn bộ lý thuyết cổ điển.",
        ),

        h("0. Tech stack / conventions"),
        new Table({
          width: { size: 9000, type: WidthType.DXA },
          rows: [
            headerRow(["Hạng mục", "Giá trị hiện tại"], W2),
            dataRow(["Thư viện", "lunar-typescript (npm, 6tail)"], W2),
            dataRow(
              ["Entry", "Solar.fromYmdHms → getLunar() → getEightChar()"],
              W2,
            ),
            dataRow(
              [
                "dayBoundaryMode (default)",
                "midnight_00 → setSect(2): 23:00–23:59 KHÔNG đổi Nhật trụ",
              ],
              W2,
            ),
            dataRow(
              [
                "dayBoundaryMode (option)",
                "zi_start_23 → setSect(1): đổi Nhật trụ từ 23:00",
              ],
              W2,
            ),
            dataRow(["yunSect (default)", "2 — quy đổi phút chính xác"], W2),
            dataRow(
              ["renMode (default)", "ziPingYangRenOnly (chỉ dương can có Nhận)"],
              W2,
            ),
            dataRow(["Gender lib", "male=1, female=0"], W2),
            dataRow(
              [
                "DB thuật toán",
                "KHÔNG dùng SQL cho tàng can/tiết khí/đại vận. LunarUtil + hardcode + conventions",
              ],
              W2,
            ),
            dataRow(
              [
                "Fact Graph",
                "chart.facts (BaziFacts) — Core không xuất usefulGod/directions heuristic",
              ],
              W2,
            ),
          ],
        }),

        h("1. Quy tắc Tiết Khí (tháng Bát tự)"),
        p(
          "Thư viện: lunar-typescript. Điểm giao 24 tiết khí nội bộ lib (app không tự viết ephemeris).",
        ),
        p(
          "Tháng trụ: getMonthInGanZhiExact() / eightChar.getMonth*() — giao theo TIẾT (Jie 节), không theo khí (Qi 气).",
        ),
        p(
          "Năm trụ khí: getYearInGanZhiExact() — đổi tại Lập Xuân (立春), không tại 01/01.",
        ),
        p(
          "Đại vận khoảng cách: getPrevJie() / getNextJie() (chỉ Jie). Facts xuất prevJie / currentJieQi / nextJie + boundary flags.",
        ),
        new Table({
          width: { size: 9000, type: WidthType.DXA },
          rows: [
            headerRow(["Hạng mục", "Chi tiết"], W2),
            dataRow(
              [
                "Tính điểm giao",
                "Solar tiết khí trong lunar-typescript (phút/giây)",
              ],
              W2,
            ),
            dataRow(["Đổi tháng trụ", "Sau đúng phút giao Jie"], W2),
            dataRow(["Đổi năm trụ khí", "Sau đúng phút Lập Xuân"], W2),
            dataRow(["App tự code?", "Không — ủy quyền lib + wrapper conventions"], W2),
          ],
        }),

        h("2. Bảng Tàng Can (LunarUtil.ZHI_HIDE_GAN)"),
        p(
          "Nguồn: LunarUtil.ZHI_HIDE_GAN. App gắn role: ban=Bản khí, trung=Trung khí, du=Dư khí (src/lib/core/hidden-stems.ts). KHÔNG hard-code % 60/30/10. monthCommand rule-set: pending.",
        ),
        new Table({
          width: { size: 9000, type: WidthType.DXA },
          rows: [
            headerRow(
              ["Địa chi", "Bản khí (1)", "Trung khí (2)", "Dư khí (3)", "Ghi chú"],
              W5,
            ),
            ...hideGan.map((r) => dataRow(r, W5)),
          ],
        }),

        h("3. Thuật toán Đại Vận"),
        p("Gọi: eightChar.getYun(genderCode, yunSect=2)."),
        p("3.1 Chiều Thuận / Nghịch"),
        new Table({
          width: { size: 9000, type: WidthType.DXA },
          rows: [
            headerRow(["Điều kiện", "Kết quả"], W2),
            dataRow(["Năm can DƯƠNG (甲丙戊庚壬) + Nam", "Thuận"], W2),
            dataRow(["Năm can DƯƠNG + Nữ", "Nghịch"], W2),
            dataRow(["Năm can ÂM (乙丁己辛癸) + Nam", "Nghịch"], W2),
            dataRow(["Năm can ÂM + Nữ", "Thuận"], W2),
            dataRow(
              [
                "Công thức",
                "yang=yearGanIndex%2==0; forward=(yang&&man)||(!yang&&!man)",
              ],
              W2,
            ),
            dataRow(["Gốc năm can", "getYearGanIndexExact()"], W2),
          ],
        }),
        p("3.2 Tuổi khởi vận — yunSect=2"),
        p("Thuận: start=sinh, end=next Jie. Nghịch: start=prev Jie, end=sinh."),
        p("minutes = end.subtractMinute(start)"),
        p("year = floor(minutes / 4320)   // 4320 phút = 3 ngày = 1 năm vận"),
        p("month = floor(rem / 360)       // 360 phút = 1 tháng vận"),
        p("day = floor(rem / 12)          // 12 phút = 1 ngày vận"),
        p("hour = rem * 2"),
        p(
          "startSolarExact = yun.getStartSolar() — xuất ngày+giờ tuyệt đối (không chỉ năm).",
        ),
        p(
          "Mỗi ĐV: startSolarExact / endSolarExact ≈ start + index*10 năm / (index+1)*10 năm.",
        ),
        p("3.3 Can chi Đại vận"),
        p(
          "Gốc tháng Exact. Offset ±i trên vòng 60. getDaYun(10); bỏ kỳ không có ganZhi. Lưu niên: DaYun.getLiuNian — ganZhi theo khí năm (Lập Xuân), ghi chú yearBoundaryNote.",
        ),

        h("4. Thần Sát / Lộc·Nhận / Không Vong"),
        p(
          "Thần sát phụ: src/lib/bazi-shen-sha.ts — weightClass=auxiliary. UI vẫn tô cát/hung theo type hiển thị truyền thống.",
        ),
        p(
          "Lộc / Nhận: src/lib/core/daymaster-qi.ts → dayMasterQiStates (cùng Trường Sinh).",
        ),
        p("4.1 Core theo yêu cầu rà soát"),
        new Table({
          width: { size: 9000, type: WidthType.DXA },
          rows: [
            headerRow(["Hạng mục", "Tham chiếu", "Điều kiện", "Phân lớp"], W4),
            ...shenShaCore.map((r) => dataRow(r, W4)),
          ],
        }),
        p("4.2 Thần sát phụ khác đang code"),
        new Table({
          width: { size: 9000, type: WidthType.DXA },
          rows: [
            headerRow(["Thần sát", "Tham chiếu", "Bảng", "UI tone"], W4),
            ...shenShaOther.map((r) => dataRow(r, W4)),
          ],
        }),
        p(
          "Đào Hoa/Dịch Mã/…: khớp NĂM chi hoặc NGÀY chi (for base of [dayBranch, yearBranch]).",
        ),

        h("5. Vòng Trường Sinh (12 giai)"),
        p(
          "QUY TẮC: theo ÂM/DƯƠNG THIÊN CAN Nhật chủ (không gộp ngũ hành). Hàm duy nhất: src/lib/core/chang-sheng.ts getChangSheng(dayGan, zhi).",
        ),
        p("QUAN TRỌNG: index can/chi dùng 0-based (甲=0…癸=9, 子=0…亥=11)."),
        p(
          "KHÔNG dùng LunarUtil.GAN.indexOf trực tiếp (mảng có '' đầu → lệch chẵn/lẻ).",
        ),
        p("offset = CHANG_SHENG_OFFSET[dayGan]"),
        p("index = offset + (ganIndex%2==0 ? +zhiIndex : -zhiIndex) → normalize 0..11"),
        p("→ CHANG_SHENG[index]. Dương thuận; Âm nghịch. Mậu=Bính, Kỷ=Đinh."),
        p("Ví dụ khóa: 庚+午 = 沐浴 (không phải 长生)."),
        new Table({
          width: { size: 9000, type: WidthType.DXA },
          rows: [
            headerRow(["Can Nhật", "Offset", "Âm/Dương", "Ghi chú"], W4),
            ...changShengOffset.map((r) => dataRow(r, W4)),
          ],
        }),
        p("Thứ tự CHANG_SHENG:"),
        ...lifeOrder.map((t) => p(`- ${t}`)),

        h("6. Phụ — KHÔNG còn trong Core result"),
        p(
          "bazi-useful-god.ts: DEPRECATED. calculateBaZi đặt usefulGod=null, directions=null. UI: 'Chưa luận Dụng thần chuyên sâu'.",
        ),
        p(
          "wuXingBalance: chỉ visualization + warning — không dùng để chọn Dụng thần.",
        ),

        h("7. File nguồn chính"),
        new Table({
          width: { size: 9000, type: WidthType.DXA },
          rows: [
            headerRow(["File", "Vai trò"], W2),
            dataRow(
              ["src/lib/astrology-engine.ts", "Orchestration + Fact Graph"],
              W2,
            ),
            dataRow(["src/lib/core/conventions.ts", "dayBoundary / renMode / yunSect"], W2),
            dataRow(["src/lib/core/chang-sheng.ts", "Trường Sinh nguồn duy nhất"], W2),
            dataRow(["src/lib/core/hidden-stems.ts", "Tàng can + role"], W2),
            dataRow(["src/lib/core/daymaster-qi.ts", "Lộc / Nhận / twelveStages"], W2),
            dataRow(["src/lib/core/jieqi-boundaries.ts", "JieQi + boundary flags"], W2),
            dataRow(["src/lib/core/bazi-facts.ts", "Schema Fact Graph"], W2),
            dataRow(["src/lib/bazi-shen-sha.ts", "Thần sát phụ"], W2),
            dataRow(
              ["src/lib/bazi-pillar-from-ganzhi.ts", "ĐV/LN: tàng can, địa thế, nạp âm"],
              W2,
            ),
            dataRow(
              ["src/lib/bazi-useful-god.ts", "DEPRECATED — không gọi từ Core"],
              W2,
            ),
            dataRow(
              ["node_modules/lunar-typescript", "Tiết khí, trụ, Yun, ZHI_HIDE_GAN"],
              W2,
            ),
          ],
        }),
      ],
    },
  ],
});

mkdirSync(dirname(outPath), { recursive: true });
const buffer = await Packer.toBuffer(doc);
writeFileSync(outPath, buffer);
console.log("Wrote", outPath);
