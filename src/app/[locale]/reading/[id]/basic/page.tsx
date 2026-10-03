import { BaziCard, BaziShell } from "@/components/bazi/bazi-ui";
import { ReadingBasicForm } from "@/components/reading/reading-basic-form";
import { ReadingCodeBanner } from "@/components/reading/reading-code-banner";
import { getReadingOrder } from "@/lib/reading/repository";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ReadingBasicPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const order = await getReadingOrder(id);
  if (!order) notFound();

  return (
    <BaziShell>
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="text-sm font-bold text-muted transition hover:text-accent"
        >
          ← Về trang chủ
        </Link>
        <BaziCard className="mt-6 p-6" elevated>
          <ReadingCodeBanner order={order} subtitle="Nhập thông tin cơ bản" />
          <h1 className="text-xl font-bold text-foreground">
            Nhập thông tin cơ bản
          </h1>
          <div className="mt-6">
            <ReadingBasicForm orderId={order.id} mode="create" />
          </div>
        </BaziCard>
      </main>
    </BaziShell>
  );
}
