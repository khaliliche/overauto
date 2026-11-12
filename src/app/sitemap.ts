import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { languageAlternates, pageUrl } from "@/lib/seo";
import { supabasePublic } from "@/lib/supabase/public";

export const revalidate = 3600;

type Freq = "daily" | "weekly" | "monthly";

function entries(
  path: string,
  lastModified: Date,
  changeFrequency: Freq,
  priority: number
): MetadataRoute.Sitemap {
  return routing.locales.map((l) => ({
    url: pageUrl(l, path),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: languageAlternates(path) },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const list: MetadataRoute.Sitemap = [
    ...entries("", now, "weekly", 1),
    ...entries("/catalogue", now, "daily", 0.9),
    ...entries("/about", now, "monthly", 0.5),
    ...entries("/contact", now, "monthly", 0.5),
  ];

  try {
    const { data } = await supabasePublic()
      .from("products")
      .select("slug, updated_at")
      .eq("is_visible", true);

    for (const p of data ?? []) {
      list.push(
        ...entries(
          `/catalogue/${p.slug}`,
          new Date(p.updated_at),
          "weekly",
          0.8
        )
      );
    }
  } catch {
    // keep the static pages if the database is unreachable
  }

  return list;
}