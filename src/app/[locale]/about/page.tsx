import { pageMeta } from "@/lib/seo";
import { Boxes, ShieldCheck, Zap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import TriStripe from "@/components/TriStripe";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMeta(locale, "/about", { ns: "about", desc: "intro" });
}
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const values = [
    { icon: ShieldCheck, title: t("v1Title"), text: t("v1Text") },
    { icon: Boxes, title: t("v2Title"), text: t("v2Text") },
    { icon: Zap, title: t("v3Title"), text: t("v3Text") },
  ];

  return (
    <>
      <section className="bg-accent-700 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          <h1 className="font-display text-5xl font-extrabold uppercase sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-300">
            {t("intro")}
          </p>
        </div>
        <TriStripe className="h-2" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-sm border border-zinc-200 border-t-4 border-t-brand-600 bg-white p-7"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-brand-600 text-white">
                <Icon size={24} />
              </div>
              <h2 className="font-display text-2xl font-extrabold uppercase text-zinc-900">
                {title}
              </h2>
              <p className="mt-2 text-zinc-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <div className="rounded-sm bg-brand-600 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">{t("ctaText")}</p>
          <Link
            href="/catalogue"
            className="mt-7 inline-block rounded-sm bg-white px-8 py-3.5 font-display text-xl font-bold uppercase tracking-wide text-brand-700 transition-colors hover:bg-zinc-900 hover:text-white"
          >
            {t("ctaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}
