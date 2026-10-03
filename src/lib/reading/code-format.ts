/**
 * Alphabet an toàn đọc (điện thoại / tay viết):
 * loại 0,O,1,I để tránh nhầm.
 * File này thuần string — an toàn cho Client Component.
 */
export const READING_CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // 24 — không I, O
export const READING_CODE_DIGITS = "23456789"; // 8 — không 0, 1
export const READING_CODE_ALPHABET =
  READING_CODE_LETTERS + READING_CODE_DIGITS;

const ALLOWED_RE = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/;

/** Chỉ chuyển chữ thường → hoa. Không bỏ/sửa ký tự khác. */
export function normalizeReadingCode(raw: string): string {
  return raw.toUpperCase();
}

/** Hiển thị mã liền 8 ký tự (hoa). */
export function formatReadingCodeDisplay(code: string): string {
  return normalizeReadingCode(code);
}

/**
 * Mã hợp lệ: đúng 8, alphabet an toàn (không 0/O/1/I),
 * không khoảng trắng/dấu `-`, không lặp, có cả chữ và số.
 * Chữ thường: gọi `normalizeReadingCode` trước rồi mới validate.
 */
export function isValidReadingCode(code: string): boolean {
  if (!ALLOWED_RE.test(code)) return false;
  if (new Set(code).size !== 8) return false;
  const hasLetter = /[A-Z]/.test(code);
  const hasDigit = /[2-9]/.test(code);
  return hasLetter && hasDigit;
}
