"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toFaDigits } from "@/lib/format";
import type { ProductWithCategory } from "@/lib/types";

/** ردیف افقی «پیشنهاد ویژه» — محصولات featured با اسکرول snap */
export default function FeaturedRow() {
  const [products, setProducts] = useState<ProductWithCategory[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products?featured=true", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { products: ProductWithCategory[] }) => setProducts(data.products))
      .catch((err) => {
        if (err.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, []);

  if (error) return null;
  if (products && products.length === 0) return null;

  return (
    <section aria-labelledby="featured-heading" className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2
            id="featured-heading"
            className="flex items-center gap-2 text-2xl font-extrabold text-zinc-100 md:text-3xl"
          >
            <Sparkles className="h-6 w-6 text-amber-400" aria-hidden />
            پیشنهاد ویژه شاپینو
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            خفن‌ترین‌ها را زودتر از همه امتحان کن
          </p>
        </div>
        {products && (
          <span className="hidden shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 sm:block">
            {toFaDigits(products.length)} محصول ویژه
          </span>
        )}
      </div>

      <div
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-track]:bg-zinc-900"
        role="list"
      >
        {!products
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
                <Skeleton className="aspect-square w-full rounded-2xl bg-zinc-900" />
                <Skeleton className="mt-3 h-4 w-3/4 bg-zinc-900" />
                <Skeleton className="mt-2 h-4 w-1/2 bg-zinc-900" />
              </div>
            ))
          : products.map((product) => (
              <div
                key={product.id}
                role="listitem"
                className="w-[260px] shrink-0 snap-start sm:w-[280px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
}
