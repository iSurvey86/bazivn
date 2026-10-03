import { BaziCard, BaziShell } from "@/components/bazi/bazi-ui";
import { ReadingCodeBanner } from "@/components/reading/reading-code-banner";
import { ReadingReviewClient } from "@/components/reading/reading-review-client";
import { getReadingOrder } from "@/lib/reading/repository";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ReadingReviewPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const order = await getReadingOrder(id);
  if (!order) notFound();

  return (
    <BaziShell>
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href={order.chartId ? `/chart/${order.chartId}` : "/"}
          className="text-sm font-bold text-muted transition hover:text-accent"
        >
          ← {order.chartId ? "Về lá số" : "Về trang chủ"}
        </Link>
        <BaziCard className="mt-6 p-6" elevated>
          <ReadingCodeBanner order={order} />
          <h1 className="text-center text-xl font-bold text-foreground">
            Kiểm tra thông tin đăng ký
          </h1>
          <div className="mt-6">
            <ReadingReviewClient order={order} />
          </div>
        </BaziCard>
      </main>
    </BaziShell>
  );
}
