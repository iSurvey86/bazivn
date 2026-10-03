import { BaziCard, BaziShell } from "@/components/bazi/bazi-ui";
import { ReadingCodeBanner } from "@/components/reading/reading-code-banner";
import { ReadingIntakeForm } from "@/components/reading/reading-intake-form";
import { Link, redirect } from "@/i18n/navigation";
import { getReadingOrder } from "@/lib/reading/repository";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ReadingIntakePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const order = await getReadingOrder(id);
  if (!order) notFound();
  const snapshot = order.lockedSnapshot;
  if (!snapshot) {
    redirect({ href: `/reading/${id}/basic`, locale });
  }
  if (!snapshot) notFound();

  return (
    <BaziShell>
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href={`/reading/${order.id}/review`}
          className="text-sm font-bold text-muted transition hover:text-accent"
        >
          ← Quay lại kiểm tra
        </Link>
        <BaziCard className="mt-6 p-6" elevated>
          <ReadingCodeBanner order={order} subtitle="Form thu thập" />
          <h1 className="text-center text-xl font-bold text-foreground">
            Mẫu cung cấp thông tin lập mệnh thư
          </h1>
          <div className="mt-6">
            <ReadingIntakeForm
              orderId={order.id}
              snapshot={snapshot}
              initial={order.intake}
            />
          </div>
        </BaziCard>
      </main>
    </BaziShell>
  );
}
