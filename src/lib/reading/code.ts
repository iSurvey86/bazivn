import { randomInt } from "crypto";
import { readdir, readFile } from "fs/promises";
import path from "path";
import {
  isValidReadingCode,
  normalizeReadingCode,
  READING_CODE_ALPHABET,
  READING_CODE_DIGITS,
  READING_CODE_LETTERS,
} from "./code-format";

export {
  formatReadingCodeDisplay,
  isValidReadingCode,
  normalizeReadingCode,
} from "./code-format";

const STORE_DIR = path.join(process.cwd(), ".data", "reading-orders");

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Sinh một mã 8 ký tự:
 * - alphabet an toàn (không 0/O/1/I)
 * - không trùng ký tự trong mã
 * - bắt buộc có ≥1 chữ và ≥1 số
 */
export function generateReadingCodeOnce(): string {
  const letter = READING_CODE_LETTERS[randomInt(READING_CODE_LETTERS.length)]!;
  const digit = READING_CODE_DIGITS[randomInt(READING_CODE_DIGITS.length)]!;

  const used = new Set<string>([letter, digit]);
  const pool = [...READING_CODE_ALPHABET].filter((ch) => !used.has(ch));
  shuffleInPlace(pool);

  const chars = [letter, digit, ...pool.slice(0, 6)];
  if (chars.length !== 8) {
    throw new Error("Không đủ ký tự để sinh mã 8 chỗ không lặp.");
  }
  shuffleInPlace(chars);
  const code = chars.join("");
  if (!isValidReadingCode(code)) {
    throw new Error("Mã sinh ra không đạt quy tắc.");
  }
  return code;
}

async function listExistingCodes(): Promise<Set<string>> {
  const codes = new Set<string>();
  try {
    const files = await readdir(STORE_DIR);
    await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          try {
            const raw = await readFile(path.join(STORE_DIR, f), "utf-8");
            const parsed = JSON.parse(raw) as { code?: string };
            if (parsed.code) codes.add(normalizeReadingCode(parsed.code));
          } catch {
            /* skip */
          }
        }),
    );
  } catch {
    /* dir chưa có */
  }
  return codes;
}

/**
 * Sinh mã duy nhất toàn hệ thống (kiểm trùng store local).
 * Production: thêm UNIQUE index trên cột `code`.
 */
export async function generateUniqueReadingCode(
  maxAttempts = 64,
): Promise<string> {
  const existing = await listExistingCodes();
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateReadingCodeOnce();
    if (!existing.has(code)) return code;
  }
  throw new Error("Không sinh được Mã mệnh thư duy nhất sau nhiều lần thử.");
}
