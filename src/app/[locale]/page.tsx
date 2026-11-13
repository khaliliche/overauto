import { pageMeta } from "@/lib/seo";
import Image from "next/image";
import {
  ArrowRight,
  Banknote,
  BadgeCheck,
  Headset,
  Truck,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ProductCard from "@/components/ProductCard";
import { getCategories, getCategoryCounts, getProducts } from "@/lib/products";
import CategoryCollections from "@/components/CategoryCollections";
import TriStripe from "@/components/TriStripe";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { site, whatsappUrl } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMeta(locale, "");
}

// Hero photos: replace the files in /public/hero (same names) to change them.
const HERO_PHOTOS = [
  { src: "/hero/hero-1.webp", alt: "Over Auto" },
  { src: "/hero/hero-3.webp", alt: "Over Auto" },
  { src: "/hero/hero-6.webp", alt: "Over Auto" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const [all, categories, counts] = await Promise.all([
    getProducts(24),
    getCategories(),
    getCategoryCounts(),
  ]);
  const featured = all.filter((p) => p.is_featured);
  const best = (featured.length >= 4 ? featured : all).slice(0, 8);
  const latest = all.slice(0, 4);

  const trust = [
    { icon: Banknote, title: t("trust1Title"), text: t("trust1Text") },
    { icon: Truck, title: t("trust2Title"), text: t("trust2Text") },
    { icon: BadgeCheck, title: t("trust3Title"), text: t("trust3Text") },
    { icon: Headset, title: t("trust4Title"), text: t("trust4Text") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-accent-700 text-white">
        <div className="pointer-events-none absolute -end-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-sm bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              {t("badge")}
            </p>
            <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-7xl">
              {t("title")}
              <span className="mt-3 block text-brand-500">{t("titleAccent")}</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-zinc-300">{t("subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 rounded-sm bg-brand-600 px-8 py-4 font-display text-xl font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-500"
              >
                {t("ctaCatalogue")}
                <ArrowRight size={20} className="rtl:rotate-180" />
              </Link>
              {site.whatsapp && (
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm border-2 border-white/30 px-6 py-3.5 font-display text-xl font-bold uppercase tracking-wide text-white transition-colors hover:border-white hover:bg-white hover:text-zinc-900"
                >
                  <WhatsAppIcon size={20} />
                  {t("ctaWhatsapp")}
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {HERO_PHOTOS.map((p, i) => (
              <div
                key={p.src}
                className={`relative aspect-[3/5] overflow-hidden rounded-sm bg-zinc-800 ${
                  i === 1 ? "mt-8" : ""
                }`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 18vw, 30vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <TriStripe className="h-2" />
      </section>

      {/* Trust bar */}
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-8 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-brand-600 text-white">
                <Icon size={22} />
              </span>
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wide text-zinc-900">
                  {title}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-zinc-500 sm:text-sm">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CategoryCollections categories={categories} counts={counts} />

      {/* Best sellers */}
      {best.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-extrabold uppercase text-zinc-900 sm:text-4xl">
              {t("bestTitle")}
              <span className="mt-2 block h-1 w-16 bg-brand-600" />
            </h2>
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:underline"
            >
              {t("viewAll")}
              <ArrowRight size={16} className="rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {best.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Promo banner */}
      <section className="bg-brand-600 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 text-center md:flex-row md:text-start">
          <div>
            <h2 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">
              {t("promoTitle")}
            </h2>
            <p className="mt-2 max-w-xl text-white/90">{t("promoText")}</p>
          </div>
          <Link
            href="/catalogue"
            className="shrink-0 rounded-sm bg-white px-8 py-4 font-display text-xl font-bold uppercase tracking-wide text-brand-700 transition-colors hover:bg-zinc-900 hover:text-white"
          >
            {t("promoCta")}
          </Link>
        </div>
      </section>

      {/* New arrivals */}
      {latest.length > 0 && all.length > 4 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="mb-8 font-display text-3xl font-extrabold uppercase text-zinc-900 sm:text-4xl">
            {t("newTitle")}
            <span className="mt-2 block h-1 w-16 bg-brand-600" />
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
