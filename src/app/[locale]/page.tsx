import { pageMeta } from "@/lib/seo";
import Image from "next/image";
import {
  ArrowRight,
  Boxes,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ProductCard from "@/components/ProductCard";
import { getCategories, getCategoryCounts, getProducts } from "@/lib/products";
import CategoryCollections from "@/components/CategoryCollections";
import { site, whatsappUrl } from "@/lib/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";

function HeroPhoto({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[4/5] w-32 overflow-hidden rounded-2xl shadow-lg shadow-brand-900/10 2xl:w-40 ${className}`}
    >
      <Image src={src} alt={alt} fill sizes="160px" className="object-cover" />
    </div>
  );
}

const HERO_TILES = [
  { src: "/hero/hero-1.webp", alt: "Sile Chemicals Carpet" },
  { src: "/hero/hero-3.webp", alt: "Ricci Car Care wet and dry extractor" },
  { src: "/hero/hero-6.webp", alt: "Foam cleaning gun" },
  { src: "/hero/hero-2.webp", alt: "Ricci Ecoreflex" },
  { src: "/hero/hero-4.webp", alt: "Ricci Car Care foam tank" },
  { src: "/hero/hero-7.webp", alt: "Pressure washer brass valve" },
];

function InfoCard({
  icon,
  label,
  children,
  tile = "bg-brand-100 text-brand-700",
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tile?: string;
}) {
  return (
    <div className="flex w-full flex-col items-center rounded-3xl border border-brand-100 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100 sm:w-72 lg:w-64">
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${tile}`}>
        {icon}
      </div>
      <h3 className="font-bold text-brand-900">{label}</h3>
      <div className="mt-3 flex w-full flex-1 flex-col items-center gap-4 text-slate-600">{children}</div>
    </div>
  );
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMeta(locale, "");
}
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const a = await getTranslations("about");
  const c = await getTranslations("contact");

  const values = [
    { icon: ShieldCheck, title: a("v1Title"), text: a("v1Text") },
    { icon: Boxes, title: a("v2Title"), text: a("v2Text") },
    { icon: Zap, title: a("v3Title"), text: a("v3Text") },
  ];

  const [all, categories, counts] = await Promise.all([
    getProducts(12),
    getCategories(),
    getCategoryCounts(),
  ]);
  const featured = all.filter((p) => p.is_featured);
  const shown = (featured.length > 0 ? featured : all).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 to-white">
        <div className="pointer-events-none absolute -end-16 -top-24 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -start-20 top-40 h-64 w-64 rounded-full bg-accent-200/50 blur-3xl" />
        {/* Phone / tablet: curated product showcase. Top: small overlapping fan above the logo. Bottom: swipeable rail. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 flex h-24 items-start justify-center pt-2 [mask-image:linear-gradient(to_bottom,black_0%,black_82%,transparent_100%)] sm:h-32 sm:pt-4 xl:hidden"
        >
          <div className="flex items-start -space-x-3 sm:-space-x-4">
            {HERO_TILES.slice(0, 3).map((p, i) => (
              <div
                key={p.src}
                style={{ "--i": i } as React.CSSProperties}
                className={`hero-rise relative aspect-[4/5] overflow-hidden rounded-xl bg-white shadow-md shadow-brand-900/20 ring-2 ring-white ${
                  i === 1
                    ? "z-10 w-14 sm:w-[4.25rem]"
                    : `w-12 translate-y-1.5 sm:w-16 ${i === 0 ? "-rotate-6" : "rotate-6"}`
                }`}
              >
                <Image
                  src={p.src}
                  alt=""
                  fill
                  priority
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 xl:hidden">
          <div className="flex snap-x snap-mandatory items-end gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-6 pt-6 [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent_0,black_20px,black_calc(100%_-_20px),transparent_100%)] sm:gap-4 sm:px-8 [&::-webkit-scrollbar]:hidden [&>*:first-child]:ms-auto [&>*:last-child]:me-auto">
            {HERO_TILES.slice(3).map((p, i) => (
              <div
                key={p.src}
                style={{ "--i": i + 3 } as React.CSSProperties}
                className={`hero-rise relative aspect-[4/5] w-36 shrink-0 snap-center overflow-hidden rounded-2xl bg-white ring-1 ring-brand-100 sm:w-40 ${
                  i % 2 === 1
                    ? "-translate-y-3 shadow-xl shadow-brand-900/25"
                    : "shadow-md shadow-brand-900/15"
                }`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 640px) 160px, 144px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        {/* Product photos on the sides (shown from 1280px up) */}
        <div className="pointer-events-none absolute start-[3%] top-1/2 hidden -translate-y-1/2 flex-col items-start gap-4 xl:flex 2xl:start-[6%]">
          <HeroPhoto src="/hero/hero-1.webp" alt="Sile Chemicals Carpet" className="-rotate-3" />
          <HeroPhoto src="/hero/hero-2.webp" alt="Ricci Ecoreflex" className="ms-10 rotate-2" />
          <HeroPhoto src="/hero/hero-6.webp" alt="Foam cleaning gun (Tornador)" className="-rotate-2" />
        </div>
        <div className="pointer-events-none absolute end-[3%] top-1/2 hidden -translate-y-1/2 flex-col items-end gap-4 xl:flex 2xl:end-[6%]">
          <HeroPhoto src="/hero/hero-3.webp" alt="Ricci Car Care wet and dry extractor" className="rotate-3" />
          <HeroPhoto src="/hero/hero-4.webp" alt="Ricci Car Care foam tank" className="me-10 -rotate-2" />
          <HeroPhoto src="/hero/hero-7.webp" alt="Pressure washer brass valve" className="rotate-2" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-64 pt-24 text-center sm:pb-72 sm:pt-32 xl:py-28">
          <h1 className="mx-auto max-w-3xl text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-brand-900 min-[380px]:text-4xl sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-slate-600 sm:mt-5 sm:max-w-2xl sm:text-lg">
            {t("subtitle")}
          </p>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-slate-600 sm:mt-4 sm:max-w-2xl sm:text-base">
            {t("company")}
          </p>
          <div className="mx-auto mt-7 flex max-w-xs flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-7 py-3 font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:bg-brand-700"
            >
              {t("ctaCatalogue")}
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-600 px-7 py-3 font-semibold text-white shadow-lg shadow-accent-500/40 transition hover:-translate-y-0.5 hover:bg-accent-700"
            >
              <WhatsAppIcon size={18} />
              {t("ctaQuote")}
            </Link>
          </div>
          {/* Big logo under the text */}
          <Image
            src="/logo.png"
            alt="Sile Chemicals"
            width={800}
            height={192}
            priority
            className="mx-auto mt-12 w-72 mix-blend-multiply sm:mt-14 sm:w-[28rem] lg:w-[34rem]"
          />
        </div>
      </section>

      <CategoryCollections categories={categories} counts={counts} />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-8 text-center text-2xl font-extrabold text-brand-900 sm:text-3xl">
          {t("modesTitle")}
        </h2>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0">
          <div className="w-[85%] shrink-0 snap-center rounded-3xl border border-brand-100 bg-white p-7 shadow-sm sm:w-auto">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
              <Boxes size={24} />
            </div>
            <h3 className="text-lg font-bold text-brand-900">
              {t("wholesaleTitle")}
            </h3>
            <p className="mt-2 text-slate-600">{t("wholesaleText")}</p>
          </div>
          <div className="w-[85%] shrink-0 snap-center rounded-3xl border border-accent-200 bg-white p-7 shadow-sm sm:w-auto">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
              <Package size={24} />
            </div>
            <h3 className="text-lg font-bold text-brand-900">
              {t("pieceTitle")}
            </h3>
            <p className="mt-2 text-slate-600">{t("pieceText")}</p>
          </div>
        </div>
      </section>

      {shown.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">
              {t("featuredTitle")}
            </h2>
            <Link
              href="/catalogue"
              className="flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline"
            >
              {t("viewAll")}
              <ArrowRight size={16} className="rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {shown.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section
        id="about"
        className="scroll-mt-20 border-y border-brand-100 bg-brand-50/60"
      >
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">
              {a("title")}
            </h2>
            <p className="mt-4 text-lg text-slate-600">{a("intro")}</p>
          </div>
          <div className="mt-10 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
            {values.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="w-[85%] shrink-0 snap-center rounded-3xl border border-brand-100 bg-white p-7 shadow-sm md:w-auto"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-brand-900">{title}</h3>
                <p className="mt-2 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">
            {c("title")}
          </h2>
          <p className="mt-4 text-slate-600">{c("subtitle")}</p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-5">
          {site.whatsapp && (
            <InfoCard
              icon={<WhatsAppIcon size={26} />}
              tile="bg-[#25D366] text-white"
              label={c("whatsapp")}
            >
              <p>{c("whatsappText")}</p>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1fb957]"
              >
                <WhatsAppIcon size={18} />
                {c("whatsappCta")}
              </a>
            </InfoCard>
          )}

          {site.phone && (
            <InfoCard icon={<Phone size={24} />} label={c("phone")}>
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                dir="ltr"
                className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
              >
                <Phone size={16} />{site.phone}
              </a>
            </InfoCard>
          )}

          {site.email && (
            <InfoCard icon={<Mail size={24} />} label={c("email")}>
              <a
                href={`mailto:${site.email}`}
                dir="ltr"
                className="break-all font-semibold text-brand-700 hover:underline"
              >
                {site.email}
              </a>
            </InfoCard>
          )}

          {site.address && (
            <InfoCard icon={<MapPin size={24} />} label={c("address")}>
              <p>{site.address}</p>
            </InfoCard>
          )}
        </div>

        <div className="mt-8 rounded-3xl bg-brand-50 p-8 text-center">
          <h3 className="text-xl font-extrabold text-brand-900">
            {c("quoteTitle")}
          </h3>
          <Link
            href="/cart"
            className="mt-5 inline-block rounded-full bg-brand-600 px-7 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {c("quoteCta")}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl bg-linear-to-br from-brand-600 to-brand-500 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            {t("ctaBannerTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-50">
            {t("ctaBannerText")}
          </p>
          <Link
            href="/catalogue"
            className="mt-7 inline-block rounded-full bg-accent-600 px-8 py-3 font-bold text-white transition-colors hover:bg-accent-700"
          >
            {t("ctaCatalogue")}
          </Link>
        </div>
      </section>
    </>
  );
}