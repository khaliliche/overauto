import { supabasePublic } from "./supabase/public";
import type { Category, Product } from "./types";

const SELECT = "*, variants(*), category:categories(*)";

export async function getCategories(): Promise<Category[]> {
  const { data } = await supabasePublic()
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as Category[];
}

export async function getProducts(limit?: number): Promise<Product[]> {
  let q = supabasePublic()
    .from("products")
    .select(SELECT)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data } = await supabasePublic()
    .from("products")
    .select(SELECT)
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();
  return (data as Product | null) ?? null;
}

export async function getOtherProducts(
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  const { data } = await supabasePublic()
    .from("products")
    .select(SELECT)
    .eq("is_visible", true)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Product[];
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const { data } = await supabasePublic()
    .from("products")
    .select("category_id")
    .eq("is_visible", true);
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  }
  return counts;
}
