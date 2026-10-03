/**
 * Xuất 4 khối code kiểm tra dứt điểm → public/bcao/
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "bcao");
const outPath = join(
  outDir,
  "BAZIVN-4-khoi-code-kiem-tra-dut-diem.docx",
);

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function extractLines(src, startLine, endLine) {
  const lines = src.split(/\r?\n/);
  return lines.slice(startLine - 1, endLine).join("\n");
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 160 },
    children: [
      new TextRun({ text, bold: true, size: 28, font: "Times New Roman" }),
    ],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
    children: [
      new TextRun({ text, bold: true, size: 24, font: "Times New Roman" }),
    ],
  });
}

function note(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        italics: true,
        size: 20,
        font: "Times New Roman",
        color: "444444",
      }),
    ],
  });
}

function p(text) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text, size: 22, font: "Times New Roman" }),
    ],
  });
}

/** Code block as monospace paragraphs (docx has no real pre; keep lines). */
function codeBlock(text) {
  const lines = text.replace(/\t/g, "  ").split(/\r?\n/);
  return lines.map(
    (line) =>
      new Paragraph({
        spacing: { after: 0, line: 240 },
        children: [
          new TextRun({
            text: line.length ? line : " ",
            size: 16,
            font: "Consolas",
          }),
        ],
      }),
  );
}

const jieqi = read("src/lib/core/jieqi-boundaries.ts");
const monthCommand = read("src/lib/core/month-command.ts");
const shenSha = read("src/lib/bazi-shen-sha.ts");
const engine = read("src/lib/astrology-engine.ts");

// astrology-engine excerpts (1-based line numbers from current file)
const timezoneBlock = [
  extractLines(engine, 251, 303), // isLateRatHour + utcToLocal + resolveLocal
  "",
  extractLines(engine, 828, 941), // calculateBaZi through buildYun call
].join("\n");

const shenShaAssignBlock = [
  "// --- Natal: computeChartShenSha + gán vào pillars ---",
  extractLines(engine, 880, 905),
  "",
  "// --- Đại vận / Lưu niên: shenShaForBranch(zhi, refs) trong buildYun ---",
  extractLines(engine, 573, 640),
  "",
  "// --- Wrapper export ---",
  extractLines(shenSha, 388, 398),
].join("\n");

const children = [
  h1("BaziVN — 4 khối code kiểm tra dứt điểm"),
  p(`Ngày xuất: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`),
  p(
    "Mục tiêu: đối chiếu prevJie/nextJie/daysFromJie · timezone → Solar/Lunar/EightChar/Yun · Thần sát natal vs ĐV/LN · Nhân nguyên tư lệnh.",
  ),
  note(
    "Case tham chiếu: 05/05/2026 23:46 Asia/Ho_Chi_Minh (GMT+7) — input.local đi thẳng vào Solar.fromYmdHms, không qua UTC convert.",
  ),

  h1("1. src/lib/core/jieqi-boundaries.ts (toàn file)"),
  note(
    "prevJie/nextJie lấy từ lunar-typescript (getPrevJie/getNextJie). minutesToPoint = point.subtractMinute(birth) — dấu âm nếu Jie đã qua. daysFromJie tính ở month-command sau khi đảo dấu.",
  ),
  ...codeBlock(jieqi),

  h1("2. astrology-engine.ts — timezone → Solar → Lunar → EightChar → Yun"),
  h2("2a. resolveLocalBirthDateTime / utcToLocalDateTime"),
  note(
    "Nếu API gửi local {year,month,day,hour,minute,second} thì dùng trực tiếp. birthTimeUtc mới qua Intl + timezone.",
  ),
  ...codeBlock(extractLines(engine, 251, 303)),

  h2("2b. calculateBaZi: từ local đến getYun (kèm Jie + monthCommand sign flip)"),
  note(
    "05/05/2026 23:46 GMT+7 → Solar.fromYmdHms(2026,5,5,23,46,0) → getLunar() → getEightChar() → setSect → getYun trong buildYun.",
  ),
  ...codeBlock(timezoneBlock),

  h1("3. Thần sát — bazi-shen-sha.ts + gán natal / ĐV / LN"),
  h2("3a. Toàn file src/lib/bazi-shen-sha.ts"),
  note(
    "Dịch Mã: TRAVELING_HORSE[dayBranch|yearBranch] === pillarZhi. Natal gọi starsForBranch(chi từng cột, refs cố định từ tứ trụ). ĐV/LN gọi shenShaForBranch(zhi của ĐV/LN, cùng refs natal) — KHÔNG đổi year/day branch theo năm lưu niên.",
  ),
  note(
    "Gợi ý kiểm tra Ngọ natal có Dịch Mã vs Ngọ LN không: so sánh pillarZhi và refs. Nếu natal gắn vì yearBranch/dayBranch map → Ngọ, thì LN Ngọ với CÙNG refs cũng phải ra Dịch Mã trừ khi UI không hiện shenSha LN hoặc stripStructuralStars loại. Xem TRAVELING_HORSE: không có base nào map → 午; Dịch Mã của nhóm Dần/Ngọ/Tuất là 申. Vậy Ngọ natal có Dịch Mã chỉ khi pillar đang xét là chi khác? — đọc kỹ TRAVELING_HORSE: 巳/酉/丑 → 亥; 亥/卯/未 → 巳; không có → 午. Nếu UI gắn Dịch Mã vào cột Ngọ, kiểm tra có phải nhầm cột (chi trụ) hay sao khác.",
  ),
  ...codeBlock(shenSha),

  h2("3b. Gán thần sát natal + ĐV/LN trong astrology-engine.ts"),
  ...codeBlock(shenShaAssignBlock),

  h1("4. src/lib/core/month-command.ts (toàn file)"),
  note(
    "REN_YUAN_SI_LING_V1: bảng ngày tư lệnh theo tháng chi. daysFromJie = max(0, minutesFromPrevJie/1440). Caller truyền -minutesToPrevJie vì minutesToPoint(prevJie)=prevJie−birth.",
  ),
  ...codeBlock(monthCommand),

  h1("Phụ lục — gọi monthCommand trong calculateBaZi"),
  ...codeBlock(extractLines(engine, 918, 924)),
];

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      children,
    },
  ],
});

mkdirSync(outDir, { recursive: true });
const buffer = await Packer.toBuffer(doc);
writeFileSync(outPath, buffer);
console.log("Wrote", outPath);
console.log("Bytes", buffer.length);
