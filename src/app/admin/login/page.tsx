"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
      password: code,
    });
    if (error) {
      setError("Code incorrect.");
      setLoading(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-brand-50 to-white px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-brand-100 bg-white p-8 shadow-lg"
      >
        <p className="text-center text-2xl font-extrabold text-brand-700">
          Sile <span className="text-accent-500">Chemicals</span>
        </p>
        <p className="mb-6 mt-1 text-center text-sm text-slate-500">
          Espace administrateur
        </p>

        <label className="mb-5 block">
          <span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
            Code d&apos;accès
          </span>
          <input
            type="password"
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand-600 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Entrer"}
        </button>
      </form>
    </div>
  );
}