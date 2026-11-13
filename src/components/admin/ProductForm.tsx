"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BUCKET,
  imagePathFromUrl,
  resizeImage,
  slugify,
} from "@/lib/admin";
import type { Category, Product } from "@/lib/types";
import { PALETTE, type PaletteColor } from "@/lib/colors";

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

type FormState = {
  title_fr: string;
  title_en: string;
  title_ar: string;
  description_fr: string;
  description_en: string;
  description_ar: string;
  slug: string;
  category_id: string;
  availability: string;
  is_visible: boolean;
  is_featured: boolean;
  price: string;
  compare_at_price: string;
};

type VariantDraft = {
  key: string;
  type: "color" | "scent";
  name_fr: string;
  name_en: string;
  name_ar: string;
  color_hex: string;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5">
      <h2 className="font-bold text-slate-800">{title}</h2>
      {hint && <p className="mb-4 mt-0.5 text-xs text-slate-500">{hint}</p>}
      {!hint && <div className="mb-4" />}
      {children}
    </section>
  );
}

export default function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
})  {
  const router = useRouter();

  const [f, setF] = useState<FormState>({
    title_fr: product?.title_fr ?? "",
    title_en: product?.title_en ?? "",
    title_ar: product?.title_ar ?? "",
    description_fr: product?.description_fr ?? "",
    description_en: product?.description_en ?? "",
    description_ar: product?.description_ar ?? "",
    slug: product?.slug ?? "",
    category_id: product?.category_id ?? "",
    availability: product?.availability ?? "in_stock",
    is_visible: product?.is_visible ?? true,
    is_featured: product?.is_featured ?? false,
    price: product?.price ? String(product.price) : "",
    compare_at_price: product?.compare_at_price
      ? String(product.compare_at_price)
      : "",
  });
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [image, setImage] = useState<string>(product?.images?.[0] ?? "");
  const [removed, setRemoved] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>(
    [...(product?.variants ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({
        key: v.id,
        type: v.type,
        name_fr: v.name_fr,
        name_en: v.name_en,
        name_ar: v.name_ar,
        color_hex: v.color_hex ?? "#06b6d4",
      }))
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setF((p) => ({ ...p, [k]: v }));
  }

  function onTitleFr(v: string) {
    set("title_fr", v);
    if (!slugTouched) set("slug", slugify(v));
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    const supabase = createClient();

    try {
      const blob = await resizeImage(file);
      const path = `${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, {
          contentType: "image/webp",
          cacheControl: "31536000",
        });
      if (error) throw error;
      const url = supabase.storage.from(BUCKET).getPublicUrl(path).data
        .publicUrl;
      if (image) setRemoved((prev) => [...prev, image]);
      setImage(url);
    } catch {
      setError("L'envoi de l'image a échoué.");
    }
    setUploading(false);
  }

  function removeImage() {
    if (image) setRemoved((prev) => [...prev, image]);
    setImage("");
  }

  function addScent() {
    setVariants((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        type: "scent",
        name_fr: "",
        name_en: "",
        name_ar: "",
        color_hex: "#06b6d4",
      },
    ]);
  }

  const colorVariants = variants.filter((v) => v.type === "color");
  const scentVariants = variants.filter((v) => v.type === "scent");
  const sameHex = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  const isOn = (hex: string) =>
    colorVariants.some((v) => sameHex(v.color_hex, hex));
  const extraColors = colorVariants.filter(
    (v) => !PALETTE.some((c) => sameHex(c.hex, v.color_hex))
  );

  function toggleColor(c: PaletteColor) {
    setVariants((prev) => {
      const has = prev.some(
        (v) => v.type === "color" && sameHex(v.color_hex, c.hex)
      );
      if (has) {
        return prev.filter(
          (v) => !(v.type === "color" && sameHex(v.color_hex, c.hex))
        );
      }
      return [
        ...prev,
        {
          key: crypto.randomUUID(),
          type: "color",
          name_fr: c.fr,
          name_en: c.en,
          name_ar: c.ar,
          color_hex: c.hex,
        },
      ];
    });
  }

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariants((prev) =>
      prev.map((v) => (v.key === key ? { ...v, ...patch } : v))
    );
  }

  function fail(msg: string) {
    setError(
      msg.includes("duplicate")
        ? "Ce slug existe déjà, veuillez le modifier."
        : msg
    );
    setSaving(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!f.title_fr.trim())
      return setError("Le titre en français est obligatoire.");
    if (!f.category_id) return setError("La catégorie est obligatoire.");

    const slug = slugify(f.slug || f.title_fr);
    if (!slug) return setError("Le slug est invalide.");

    setSaving(true);
    const supabase = createClient();
    const price = Number(f.price.replace(",", "."));
    const compare = f.compare_at_price.trim()
      ? Number(f.compare_at_price.replace(",", "."))
      : null;
    if (!Number.isFinite(price) || price < 0)
      return setError("Le prix est invalide.");
    if (compare !== null && (!Number.isFinite(compare) || compare < 0))
      return setError("L'ancien prix est invalide.");
    const payload = {
      ...f,
      price,
      compare_at_price: compare && compare > price ? compare : null,
      slug,
      images: image ? [image] : [],
    };

    let id = product?.id;
    if (id) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", id);
      if (error) return fail(error.message);
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(payload)
        .select("id")
        .single();
      if (error || !data) return fail(error?.message ?? "Erreur");
      id = data.id as string;
    }

    await supabase.from("variants").delete().eq("product_id", id);
    const rows = variants
      .filter((v) => v.name_fr.trim())
      .map((v, i) => ({
        product_id: id,
        type: v.type,
        name_fr: v.name_fr.trim(),
        name_en: v.name_en.trim(),
        name_ar: v.name_ar.trim(),
        color_hex: v.type === "color" ? v.color_hex : null,
        sort_order: i,
      }));
    if (rows.length) {
      const { error } = await supabase.from("variants").insert(rows);
      if (error) return fail(error.message);
    }

    const paths = removed
      .map(imagePathFromUrl)
      .filter((x): x is string => !!x);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);

    router.push("/admin/products");
    router.refresh();
  }

  const titleKeys = [
    ["title_fr", "Titre (Français) *", undefined],
    ["title_en", "Title (English)", undefined],
    ["title_ar", "العنوان (العربية)", "rtl"],
  ] as const;

  const descKeys = [
    ["description_fr", "Description (Français)", undefined],
    ["description_en", "Description (English)", undefined],
    ["description_ar", "الوصف (العربية)", "rtl"],
  ] as const;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Card title="Titres">
        <div className="grid gap-4 sm:grid-cols-3">
          {titleKeys.map(([key, label, dir]) => (
            <Field key={key} label={label}>
              <input
                className={input}
                dir={dir}
                value={f[key]}
                onChange={(e) =>
                  key === "title_fr"
                    ? onTitleFr(e.target.value)
                    : set(key, e.target.value)
                }
              />
            </Field>
          ))}
        </div>
      </Card>

      <Card title="Descriptions">
        <div className="grid gap-4 sm:grid-cols-3">
          {descKeys.map(([key, label, dir]) => (
            <Field key={key} label={label}>
              <textarea
                rows={5}
                className={input}
                dir={dir}
                value={f[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </Card>

      <Card
        title="Prix (DH)"
        hint="Prix de vente en dirhams. Laissez 0 pour afficher « Prix sur demande » (le produit ne peut pas être commandé en ligne)."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prix de vente *">
            <input
              className={input}
              inputMode="decimal"
              value={f.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="120"
            />
          </Field>
          <Field label="Ancien prix barré (optionnel)">
            <input
              className={input}
              inputMode="decimal"
              value={f.compare_at_price}
              onChange={(e) => set("compare_at_price", e.target.value)}
              placeholder="150"
            />
          </Field>
        </div>
      </Card>

      <Card title="Détails">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Catégorie *">
            <select
              className={input}
              value={f.category_id}
              onChange={(e) => set("category_id", e.target.value)}
            >
              <option value="">Choisir…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_fr}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Disponibilité">
            <select
              className={input}
              value={f.availability}
              onChange={(e) => set("availability", e.target.value)}
            >
              <option value="in_stock">En stock</option>
              <option value="out_of_stock">Rupture de stock</option>
              <option value="on_request">Sur demande</option>
            </select>
          </Field>
          <Field label="Slug (URL)">
            <input
              className={input}
              value={f.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-6 text-sm font-semibold text-slate-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={f.is_visible}
              onChange={(e) => set("is_visible", e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            Visible sur le site
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={f.is_featured}
              onChange={(e) => set("is_featured", e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            Mis en avant sur l&apos;accueil
          </label>
        </div>
      </Card>

      <Card
        title="Image du produit"
        hint="L'image est réduite et compressée automatiquement."
      >
        {image ? (
          <div className="relative aspect-square w-56 overflow-hidden rounded-xl border border-slate-200">
            <img src={image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1.5 text-xs font-semibold text-white">
              <label className="cursor-pointer">
                {uploading ? "Envoi…" : "Remplacer"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={onPick}
                />
              </label>
              <button type="button" onClick={removeImage}>
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <label className="flex aspect-square w-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-brand-500 hover:text-brand-600">
            {uploading ? "Envoi…" : "+ Ajouter l'image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={onPick}
            />
          </label>
        )}
      </Card>

      <Card
        title="Couleurs"
        hint="Cliquez sur les couleurs disponibles pour ce produit. Le client les choisira avec de petits cercles."
      >
        <div className="flex flex-wrap gap-3">
          {PALETTE.map((c) => {
            const on = isOn(c.hex);
            return (
              <button
                key={c.hex}
                type="button"
                title={c.fr}
                aria-label={c.fr}
                aria-pressed={on}
                onClick={() => toggleColor(c)}
                style={{ backgroundColor: c.hex }}
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 transition ${
                  on
                    ? "ring-2 ring-brand-600 ring-offset-2"
                    : "opacity-50 hover:scale-110 hover:opacity-100"
                }`}
              >
                {on && (
                  <span
                    className={`text-sm font-black ${
                      c.light ? "text-slate-900" : "text-white"
                    }`}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
          {extraColors.map((v) => (
            <button
              key={v.key}
              type="button"
              title={`${v.name_fr} (personnalisée) - cliquer pour retirer`}
              onClick={() =>
                setVariants((prev) => prev.filter((x) => x.key !== v.key))
              }
              style={{ backgroundColor: v.color_hex }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 ring-2 ring-brand-600 ring-offset-2"
            >
              <span className="text-sm font-black text-white mix-blend-difference">
                ✓
              </span>
            </button>
          ))}
        </div>
        {colorVariants.length > 0 && (
          <p className="mt-3 text-xs font-semibold text-slate-500">
            {colorVariants.map((v) => v.name_fr).join(" · ")}
          </p>
        )}
      </Card>

      <Card
        title="Parfums"
        hint="Optionnel : parfums que le client choisit sur la page du produit."
      >
        <div className="space-y-3">
          {scentVariants.map((v) => (
            <div
              key={v.key}
              className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <input
                className={input}
                placeholder="Nom FR"
                value={v.name_fr}
                onChange={(e) =>
                  updateVariant(v.key, { name_fr: e.target.value })
                }
              />
              <input
                className={input}
                placeholder="Name EN"
                value={v.name_en}
                onChange={(e) =>
                  updateVariant(v.key, { name_en: e.target.value })
                }
              />
              <input
                className={input}
                dir="rtl"
                placeholder="الاسم"
                value={v.name_ar}
                onChange={(e) =>
                  updateVariant(v.key, { name_ar: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() =>
                  setVariants((prev) => prev.filter((x) => x.key !== v.key))
                }
                className="rounded-lg px-2 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addScent}
          className="mt-3 rounded-full border border-brand-200 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50"
        >
          + Ajouter un parfum
        </button>
      </Card>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <Link
          href="/admin/products"
          className="text-sm font-semibold text-slate-500 hover:text-slate-800"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-brand-600 px-7 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer le produit"}
        </button>
      </div>
    </form>
  );
}