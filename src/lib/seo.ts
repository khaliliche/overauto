import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { loc, type Product } from "@/lib/types";

const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelHost ? `https://${vercelHost}` : "http://localhost:3000")
).replace(/\/$/, "");

export const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "";

export const SITE_NAME = "Sile Chemicals";

// Default share image. For a better WhatsApp/Facebook preview, add a
// 1200x630 image at public/og.jpg and change this to "/og.jpg".
export const DEFAULT_OG_IMAGE = "/og.png";

const OG_LOCALE: Record<string, string> = {
  fr: "fr_FR",
  ar: "ar_AR",
  en: "en_US",
};

export function pageUrl(locale: string, path = "") {
  return `${siteUrl}/${locale}${path}`;
}

export function languageAlternates(path = "") {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, pageUrl(l, path)])
  );
  languages["x-default"] = pageUrl(routing.defaultLocale, path);
  return languages;
}

type Opts = {
  ns?: string;
  title?: string;
  desc?: string;
  noindex?: boolean;
};

export async function pageMeta(
  locale: string,
  path: string,
  opts: Opts = {}
): Promise<Metadata> {
  const ns = opts.ns ?? "meta";
  const t = await getTranslations({ locale, namespace: ns });
  const title = t(opts.title ?? "title");
  const description = t(opts.desc ?? "description");
  const url = pageUrl(locale, path);

  return {
    title: ns === "meta" ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE[l]),
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
  };
}

const CRUMBS: Record<string, { home: string; catalogue: string }> = {
  fr: { home: "Accueil", catalogue: "Catalogue" },
  en: { home: "Home", catalogue: "Catalogue" },
  ar: { home: "الرئيسية", catalogue: "الكتالوج" },
};

export function siteJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        areaServed: "MA",
        ...(site.phone ? { telephone: site.phone } : {}),
        ...(site.email ? { email: site.email } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: SITE_NAME,
        url: siteUrl,
        inLanguage: locale,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };
}

export function productJsonLd(p: Product, locale: string) {
  const url = pageUrl(locale, `/catalogue/${p.slug}`);
  const name = loc(p, "title", locale);
  const description = loc(p, "description", locale);
  const crumbs = CRUMBS[locale] ?? CRUMBS.fr;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name,
        url,
        sku: p.slug,
        ...(description ? { description } : {}),
        ...(p.images?.length ? { image: p.images } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: crumbs.home,
            item: pageUrl(locale),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: crumbs.catalogue,
            item: pageUrl(locale, "/catalogue"),
          },
          { "@type": "ListItem", position: 3, name, item: url },
        ],
      },
    ],
  };
}