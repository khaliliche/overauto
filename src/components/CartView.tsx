"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Banknote, Minus, Package, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import { shippingFor, type Settings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/client";
type Locale = "fr" | "en" | "ar";

const field =
  "w-full rounded-sm border border-zinc-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100";

export default function CartView({ settings }: { settings: Settings }) {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { items, ready, subtotal, setQty, remove, clear, sync } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);

  // Refresh prices once the stored cart has loaded.
  const synced = useRef(false);
  useEffect(() => {
    if (!ready || synced.current || items.length === 0) return;
    synced.current = true;
    const ids = [...new Set(items.map((i) => i.productId))];
    createClient()
      .from("products")
      .select("id, price, availability, is_visible")
      .in("id", ids)
      .then(({ data }) => {
        if (!data) return;
        const prices: Record<string, number> = {};
        for (const p of data) {
          if (p.is_visible && p.availability !== "out_of_stock") {
            prices[p.id] = Number(p.price);
          }
        }
        sync(prices);
      });
  }, [ready, items, sync]);

  // Products without a price are "to be confirmed" by phone.
  const hasUnpriced = items.some((i) => i.price <= 0);
  const allUnpriced = items.length > 0 && subtotal === 0;
  const shipping = items.length && !allUnpriced ? shippingFor(subtotal, settings) : 0;
  const total = subtotal + shipping;
  const missing =
    settings.free_shipping_from != null && subtotal < settings.free_shipping_from
      ? settings.free_shipping_from - subtotal
      : 0;

  function set(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = t("errName");
    if (form.phone.replace(/\D/g, "").length < 9) err.phone = t("errPhone");
    if (!form.city.trim()) err.city = t("errCity");
    if (!form.address.trim()) err.address = t("errAddress");
    setErrors(err);
    setFormError("");
    if (Object.keys(err).length) return;

    setSending(true);
    const { data, error } = await createClient().rpc("place_order", {
      p_name: form.name,
      p_phone: form.phone,
      p_city: form.city,
      p_address: form.address,
      p_note: form.note,
      p_locale: locale,
      p_items: items.map((i) => ({
        product_id: i.productId,
        variant_id: i.variant?.id ?? null,
        quantity: i.quantity,
      })),
    });
    if (error || !data) {
      setSending(false);
      setFormError(
        error?.message?.includes("product_unavailable")
          ? t("errUnavailable")
          : t("errGeneric")
      );
      return;
    }
    const res = data as { order_number: number; total: number };
    clear();
    router.push(`/order-success?n=${res.order_number}&t=${res.total}`);
  }

  if (!ready) return <div className="mx-auto min-h-[50vh] max-w-7xl px-4 py-12" />;

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShoppingBag size={56} className="mx-auto text-zinc-300" />
        <h1 className="mt-5 font-display text-3xl font-extrabold uppercase text-zinc-900">
          {t("empty")}
        </h1>
        <Link
          href="/catalogue"
          className="mt-8 inline-block rounded-sm bg-brand-600 px-8 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-white hover:bg-brand-700"
        >
          {t("emptyCta")}
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold uppercase text-zinc-900">
        {t("title")}
      </h1>
      <p className="mt-1 text-zinc-600">{t("subtitle")}</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <ul className="divide-y divide-zinc-200 rounded-sm border border-zinc-200 bg-white">
            {items.map((i) => (
              <li key={i.key} className="flex gap-4 p-4">
                <Link
                  href={`/catalogue/${i.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-zinc-100"
                >
                  {i.image ? (
                    <Image src={i.image} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-300">
                      <Package size={32} />
                    </div>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/catalogue/${i.slug}`}
                        className="line-clamp-2 font-bold text-zinc-900 hover:text-brand-600"
                      >
                        {i.title[locale] || i.title.fr}
                      </Link>
                      {i.variant && (
                        <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                          {i.variant.type === "color" && i.variant.hex && (
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-zinc-300"
                              style={{ backgroundColor: i.variant.hex }}
                            />
                          )}
                          {i.variant.name[locale] || i.variant.name.fr}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={t("remove")}
                      onClick={() => remove(i.key)}
                      className="shrink-0 text-zinc-400 hover:text-brand-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center overflow-hidden rounded-sm border border-zinc-300">
                      <button
                        type="button"
                        aria-label="-"
                        onClick={() => setQty(i.key, i.quantity - 1)}
                        className="px-3 py-2 text-zinc-600 hover:bg-zinc-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{i.quantity}</span>
                      <button
                        type="button"
                        aria-label="+"
                        onClick={() => setQty(i.key, i.quantity + 1)}
                        className="px-3 py-2 text-zinc-600 hover:bg-zinc-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-display text-xl font-extrabold text-brand-600">
                      {i.price > 0 ? formatPrice(i.price * i.quantity, locale) : t("toConfirm")}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="rounded-sm border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="mb-5 font-display text-2xl font-extrabold uppercase text-zinc-900">
              {t("yourInfo")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase text-zinc-500">{t("fullName")} *</span>
                <input className={field} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
                {errors.name && <span className="mt-1 block text-xs font-semibold text-brand-600">{errors.name}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase text-zinc-500">{t("phone")} *</span>
                <input className={field} dir="ltr" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="06 00 00 00 00" />
                {errors.phone && <span className="mt-1 block text-xs font-semibold text-brand-600">{errors.phone}</span>}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase text-zinc-500">{t("city")} *</span>
                <input className={field} value={form.city} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" />
                {errors.city && <span className="mt-1 block text-xs font-semibold text-brand-600">{errors.city}</span>}
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-bold uppercase text-zinc-500">{t("address")} *</span>
                <input className={field} value={form.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />
                {errors.address && <span className="mt-1 block text-xs font-semibold text-brand-600">{errors.address}</span>}
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-bold uppercase text-zinc-500">{t("note")}</span>
                <textarea className={field} rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} placeholder={t("notePlaceholder")} />
              </label>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-sm border border-brand-600 bg-brand-50 p-4 text-sm">
              <Banknote size={22} className="mt-0.5 shrink-0 text-brand-600" />
              <div>
                <p className="font-bold text-zinc-900">{t("cod")}</p>
                <p className="mt-0.5 text-zinc-600">{t("codText")}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-sm border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="mb-4 font-display text-2xl font-extrabold uppercase text-zinc-900">
              {t("summary")}
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-600">{t("subtotal")}</dt>
                <dd className="font-bold">
                  {allUnpriced ? t("toConfirm") : formatPrice(subtotal, locale)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-600">{t("shipping")}</dt>
                <dd className="font-bold">
                  {allUnpriced
                    ? t("toConfirm")
                    : shipping === 0
                      ? t("free")
                      : formatPrice(shipping, locale)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-zinc-200 pt-3">
                <dt className="font-bold text-zinc-900">{t("total")}</dt>
                <dd className="font-display text-3xl font-extrabold text-brand-600">
                  {allUnpriced ? t("toConfirm") : formatPrice(total, locale)}
                </dd>
              </div>
            </dl>
            {hasUnpriced && (
              <p className="mt-4 rounded-sm bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                {t("totalNote")}
              </p>
            )}
            {missing > 0 && (
              <p className="mt-4 rounded-sm bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700">
                {t("freeFrom", { amount: formatPrice(missing, locale) })}
              </p>
            )}
            {formError && (
              <p className="mt-4 rounded-sm bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="mt-5 w-full rounded-sm bg-brand-600 py-4 font-display text-xl font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {sending ? t("placing") : t("placeOrder")}
            </button>
            <Link
              href="/catalogue"
              className="mt-3 block text-center text-sm font-semibold text-zinc-600 underline hover:text-brand-600"
            >
              {t("continue")}
            </Link>
          </div>
        </aside>
      </form>
    </section>
  );
}
