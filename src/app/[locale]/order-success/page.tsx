import { pageMeta } from "@/lib/seo";
import { CheckCircle2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/money";
import { site, whatsappUrl } from "@/lib/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMeta(locale, "/order-success", {
    ns: "success",
    desc: "text",
    noindex: true,
  });
}

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ n?: string; t?: string }>;
}) {
  const { locale } = await params;
  const { n, t: totalParam } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("success");

  const number = /^\d{1,12}$/.test(n ?? "") ? n : null;
  const total = Number(totalParam);

  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <CheckCircle2 size={64} className="mx-auto text-emerald-600" />
      <h1 className="mt-5 font-display text-4xl font-extrabold uppercase text-zinc-900">
        {t("title")}
      </h1>
      {number && (
        <p className="mt-3 text-lg font-bold text-brand-600">
          {t("number", { n: number })}
        </p>
      )}
      <p className="mt-4 text-zinc-600">{t("text")}</p>
      {Number.isFinite(total) && total > 0 && (
        <p className="mt-6 inline-block rounded-sm bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-700">
          {t("total")} :{" "}
          <span className="font-display text-2xl font-extrabold text-brand-600">
            {formatPrice(total, locale)}
          </span>
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {site.whatsapp && number && (
          <a
            href={whatsappUrl(t("waMessage", { n: number }))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-6 py-3.5 font-bold text-white transition-colors hover:bg-[#1fb957]"
          >
            <WhatsAppIcon size={18} />
            {t("whatsapp")}
          </a>
        )}
        <Link
          href="/catalogue"
          className="rounded-sm border-2 border-zinc-900 px-6 py-3 font-bold text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
        >
          {t("continue")}
        </Link>
      </div>
    </section>
  );
}
