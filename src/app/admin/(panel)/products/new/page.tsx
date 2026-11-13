import ProductForm from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">
        Nouveau produit
      </h1>
      <ProductForm categories={(data ?? []) as Category[]} />
    </div>
  );
}