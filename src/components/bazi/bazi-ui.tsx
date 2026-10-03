import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

export function BaziShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bazi-page-bg flex min-h-full flex-1 flex-col ${className}`}>
      <header className="flex h-16 shrink-0 items-center border-b border-border bg-gradient-to-r from-[#f3e0cb] to-[#f8ebe0] px-5 shadow-sm sm:px-8">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-sm font-black tracking-widest text-foreground">
            BAZIVN
          </span>
          <span className="mt-1 text-[10px] font-extrabold tracking-[0.25em] text-accent">
            TỨ TRỤ
          </span>
        </Link>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

export function BaziCard({
  children,
  className = "",
  elevated = false,
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <div className={`${elevated ? "bazi-card-elevated" : "bazi-card"} ${className}`}>
      {children}
    </div>
  );
}

export function BaziSectionTitle({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-bold text-foreground">{children}</h3>
      {subtitle ? (
        <p className="mt-0.5 text-sm font-medium text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function BaziBadge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: "neutral" | "accent" | "cat" | "hung" | "info";
}) {
  const styles = {
    neutral: "bg-surface-muted text-foreground border-border-strong",
    accent: "bg-accent-light text-accent border-border-strong font-semibold",
    cat: "bg-[#e8f0eb] text-[#2d5a40] border-[#a8c4b0] font-semibold",
    hung: "bg-[#f8ebe8] text-[#a83828] border-[#ddb8b0] font-semibold",
    info: "bg-[#e6eef5] text-[#1f4f7a] border-[#a8c0d8] font-semibold",
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs ${styles}`}
    >
      {children}
    </span>
  );
}

export function BaziMetaRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="shrink-0 font-semibold text-muted">{label}</span>
      <span className="text-right font-bold text-foreground">{children}</span>
    </div>
  );
}

export function BaziTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex gap-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`border-b-2 pb-3 text-sm font-bold transition ${
              active === tab.id
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:border-border-strong hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function BaziInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-border-strong bg-slate-50/80 px-4 py-3 text-sm font-medium text-foreground outline-none transition placeholder:font-normal placeholder:text-gray-400 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent ${className}`}
      {...props}
    />
  );
}

export function BaziSelect({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-border-strong bg-slate-50/80 px-4 py-3 text-sm font-medium text-foreground outline-none transition focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function BaziButton({
  children,
  className = "",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
}) {
  const styles =
    variant === "primary"
      ? "bg-accent text-white shadow-lg hover:bg-accent-hover uppercase tracking-wide"
      : "border border-border-strong bg-surface text-foreground hover:bg-surface-muted";

  return (
    <button
      className={`inline-flex w-full cursor-pointer items-center justify-center rounded-lg px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BaziField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
