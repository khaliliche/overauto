"use client";

import { useState } from "react";
import Image from "next/image";
import { Droplets, Minus, Plus, Send, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { whatsappUrl } from "@/lib/site";

type L = "fr" | "en" | "ar";
type OrderType = "wholesale" | "retail";

const field =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function CartView() {
  const t = useTranslations("cart");
  const c = useTranslations("common");
  const locale = useLocale() as L;
  const { items, ready, setQty, remove, clear } = useCart();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<OrderType>("wholesale");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const typeLabel = type === "wholesale" ? c("wholesale") : c("pieceByPiece");

  function send() {
    if (!name.trim()) return setError(t("errName"));
    if (!city.trim()) return setError(t("errCity"));
    setError("");

    const lines = items.map((i) => {
      const title = i.title[locale] || i.title.fr;
      const v = i.variant ? i.variant.name[locale] || i.variant.name.fr : "";
      return `- ${title}${v ? ` (${v})` : ""} × ${i.quantity}`;
    });

    const parts = [
      `*${t("wa.title")}*`,
      `${t("wa.customer")} ${name.trim()}`,
      `${t("wa.type")} ${typeLabel}`,
      t("wa.products"),
      ...lines,
      `${t("wa.city")} ${city.trim()}`,
    ];
    if (note.trim()) parts.push(`${t("wa.note")} ${note.trim()}`);
    parts.push("", t("wa.closing"));

    window.open(whatsappUrl(parts.join("\n")), "_blank", "noopener");
    setSent(true);
  }

  if (!ready) {
    return <section className="mx-auto max-w-6xl px-4 py-12" />;
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
          {t("title")}
        </h1>
        <div className="mt-8 rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-14 text-center">
          <p className="mb-5 text-slate-600">{t("empty")}</p>
          <Link
            href="/catalogue"
            className="inline-block rounded-full bg-brand-600 px-7 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {t("emptyCta")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-slate-600">{t("subtitle")}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((i) => {
            const title = i.title[locale] || i.title.fr;
            const v = i.variant
              ? i.variant.name[locale] || i.variant.name.fr
              : "";
            return (
              <div
                key={i.key}
                className="flex gap-4 rounded-2xl border border-brand-100 bg-white p-4"
              >
                <Link
                  href={`/catalogue/${i.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-50"
                >
                  {i.image ? (
                    <Image
                      src={i.image}
                      alt={title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-brand-200">
                      <Droplets size={28} />
                    </span>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="font-bold text-brand-900">{title}</p>
                  {i.variant && (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      {i.variant.type === "color" && (
                        <span
                          className="h-4 w-4 rounded-full border border-slate-200"
                          style={{ backgroundColor: i.variant.hex ?? "#06b6d4" }}
                        />
                      )}
                      {v}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="inline-flex items-center overflow-hidden rounded-full border border-brand-200">
                      <button
                        type="button"
                        onClick={() => setQty(i.key, i.quantity - 1)}
                        className="px-3 py-2 text-slate-600 hover:bg-brand-50"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={9999}
                        value={i.quantity}
                        onChange={(e) =>
                          setQty(i.key, parseInt(e.target.value, 10) || 1)
                        }
                        className="w-14 border-x border-brand-200 py-1.5 text-center text-sm font-bold outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(i.key, i.quantity + 1)}
                        className="px-3 py-2 text-slate-600 hover:bg-brand-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(i.key)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:underline"
                    >
                      <Trash2 size={15} />
                      {t("remove")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={clear}
            className="text-sm font-semibold text-slate-500 underline hover:text-slate-800"
          >
            {t("clear")}
          </button>
        </div>

        <aside className="h-fit rounded-3xl border border-brand-100 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="mb-5 text-lg font-bold text-brand-900">
            {t("yourInfo")}
          </h2>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                {t("fullName")}
              </span>
              <input
                className={field}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                {t("city")}
              </span>
              <input
                className={field}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>

            <div>
              <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                {t("type")}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(["wholesale", "retail"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setType(k)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                      type === k
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-slate-200 text-slate-700 hover:bg-brand-50"
                    }`}
                  >
                    {k === "wholesale" ? c("wholesale") : c("pieceByPiece")}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                {t("note")}
              </span>
              <textarea
                rows={3}
                className={field}
                placeholder={t("notePlaceholder")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={send}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent-600 px-6 py-3.5 font-bold text-white transition-colors hover:bg-accent-700"
          >
            <Send size={18} className="rtl:-scale-x-100" />
            {t("send")}
          </button>

          {sent && (
            <p className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800">
              {t("sent")}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}