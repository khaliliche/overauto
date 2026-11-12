import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductsTable from "@/components/admin/ProductsTable";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-900">Produits</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
        >
          + Nouveau produit
        </Link>
      </div>
      <ProductsTable products={(data ?? []) as Product[]} />
    </div>
  );
}