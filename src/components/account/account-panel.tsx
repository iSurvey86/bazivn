import { READING_UI } from "@/components/reading/reading-ui-theme";
import type { ReactNode } from "react";

export function AccountPanel({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section
      className="rounded-xl p-4 sm:p-5"
      style={{
        backgroundColor: "rgb(255 253 249 / 94%)",
        border: `1px solid ${READING_UI.border}`,
        boxShadow: "0 8px 28px rgb(63 42 29 / 6%)",
      }}
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-base font-black tracking-tight text-foreground sm:text-lg">
          {title}
        </h1>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AccountSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-border pt-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-accent">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
