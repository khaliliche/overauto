"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BUCKET, imagePathFromUrl } from "@/lib/admin";
import type { Product } from "@/lib/types";

const AVAILABILITY: Record<string, [string, string]> = {
  in_stock: ["En stock", "bg-emerald-100 text-emerald-800"],
  out_of_stock: ["Rupture", "bg-red-100 text-red-700"],
  on_request: ["Sur demande", "bg-amber-100 text-amber-800"],
};

function Switch({
  on,
  onClick,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
        on ? "bg-brand-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? "left-5.5" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(p: Product, field: "is_visible" | "is_featured") {
    setBusy(p.id);
    await createClient()
      .from("products")
      .update({ [field]: !p[field] })
      .eq("id", p.id);
    setBusy(null);
    router.refresh();
  }

  async function remove(p: Product) {
    if (!confirm(`Supprimer « ${p.title_fr} » ?`)) return;
    setBusy(p.id);
    const supabase = createClient();
    const paths = p.images
      .map(imagePathFromUrl)
      .filter((x): x is string => !!x);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    await supabase.from("products").delete().eq("id", p.id);
    setBusy(null);
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center text-slate-500">
        Aucun produit pour le moment. Cliquez sur « Nouveau produit » pour
        commencer.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-170 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Produit</th>
            <th className="px-4 py-3">Disponibilité</th>
            <th className="px-4 py-3">Visible</th>
            <th className="px-4 py-3">Vedette</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((p) => {
            const [label, cls] =
              AVAILABILITY[p.availability] ?? AVAILABILITY.in_stock;
            return (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-brand-50" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">
                        {p.title_fr}
                      </p>
                      <p className="text-xs text-slate-400">
                        {p.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}
                  >
                    {label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Switch
                    on={p.is_visible}
                    disabled={busy === p.id}
                    onClick={() => toggle(p, "is_visible")}
                  />
                </td>
                <td className="px-4 py-3">
                  <Switch
                    on={p.is_featured}
                    disabled={busy === p.id}
                    onClick={() => toggle(p, "is_featured")}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="mr-3 font-semibold text-brand-600 hover:underline"
                  >
                    Modifier
                  </Link>
                  <button
                    type="button"
                    disabled={busy === p.id}
                    onClick={() => remove(p)}
                    className="font-semibold text-red-600 hover:underline disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}