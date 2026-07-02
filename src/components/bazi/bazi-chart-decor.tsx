/** Hoa văn mây nhẹ — trang trí đầu lá số */
export function BaziCloudDecor() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.22]"
      aria-hidden
    >
      <svg
        className="absolute -left-4 -top-2 h-24 w-48 text-[#8b9e94]"
        viewBox="0 0 200 80"
        fill="currentColor"
      >
        <ellipse cx="50" cy="45" rx="38" ry="18" />
        <ellipse cx="85" cy="38" rx="32" ry="22" />
        <ellipse cx="120" cy="48" rx="28" ry="16" />
      </svg>
      <svg
        className="absolute -right-2 top-0 h-20 w-40 text-[#a89b8a]"
        viewBox="0 0 160 70"
        fill="currentColor"
      >
        <ellipse cx="100" cy="40" rx="42" ry="20" />
        <ellipse cx="135" cy="32" rx="28" ry="18" />
        <ellipse cx="60" cy="46" rx="24" ry="14" />
      </svg>
      <svg
        className="absolute left-1/3 top-6 h-14 w-32 text-[#9aab9f]"
        viewBox="0 0 120 50"
        fill="currentColor"
      >
        <ellipse cx="60" cy="28" rx="45" ry="14" />
        <ellipse cx="90" cy="22" rx="22" ry="12" />
      </svg>
    </div>
  );
}
