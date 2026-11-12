import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { Category, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, variants(*)")
    .eq("id", id)
    .single();

  

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-900">
        Modifier le produit
      </h1>
      <ProductForm
        product={product as Product}
        categories={(categories ?? []) as Category[]}
      />
    </div>
  );
}