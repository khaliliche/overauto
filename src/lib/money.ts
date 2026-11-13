const NUMBER_LOCALE: Record<string, string> = {
  fr: "fr-FR",
  en: "en-US",
  ar: "ar-MA-u-nu-latn",
};

const CURRENCY: Record<string, string> = { fr: "DH", en: "DH", ar: "د.م" };

/** 1250 -> "1 250 DH" (Moroccan dirham). */
export function formatPrice(n: number, locale: string) {
  const value = new Intl.NumberFormat(NUMBER_LOCALE[locale] ?? "fr-FR", {
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
  return `${value} ${CURRENCY[locale] ?? "DH"}`;
}

/** Percentage saved when a crossed-out price is set, else 0. */
export function discountPercent(price: number, compareAt: number | null) {
  const p = Number(price);
  const c = Number(compareAt);
  if (!c || c <= p || p <= 0) return 0;
  return Math.round(((c - p) / c) * 100);
}
