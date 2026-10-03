import { BaziCard, BaziShell } from "@/components/bazi/bazi-ui";
import { ReadingCollectClient } from "@/components/reading/reading-collect-client";
import { getReadingOrder } from "@/lib/reading/repository";
import { Link, redirect } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ReadingCollectPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const order = await getReadingOrder(id);
  if (!order) notFound();

  if (!order.code) {
    redirect({ href: `/reading/${id}/checkout`, locale });
  }

  return (
    <BaziShell>
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href={`/reading/${order.id}/checkout`}
          className="text-sm font-bold text-muted transition hover:text-accent"
        >
          ← Thanh toán
        </Link>
        <BaziCard className="mt-6 p-6" elevated>
          <ReadingCollectClient order={order} />
        </BaziCard>
      </main>
    </BaziShell>
  );
}
