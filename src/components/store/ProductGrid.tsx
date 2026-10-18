"use client";

import { useEffect, useRef, useState } from "react";
import { PackageSearch } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";
import { useShopStore } from "@/store/useShopStore";
import { toFaDigits } from "@/lib/format";
import type { ProductSort, ProductsResponse, ProductWithCategory } from "@/lib/types";

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "rating", label: "محبوب‌ترین" },
];

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
      <Skeleton className="aspect-square rounded-none bg-zinc-800/70" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-16 bg-zinc-800/70" />
        <Skeleton className="h-4 w-3/4 bg-zinc-800/70" />
        <Skeleton className="h-3 w-12 bg-zinc-800/70" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24 bg-zinc-800/70" />
          <Skeleton className="h-10 w-10 rounded-xl bg-zinc-800/70" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const searchQuery = useShopStore((s) => s.searchQuery);
  const selectedCategory = useShopStore((s) => s.selectedCategory);

  const [sort, setSort] = useState<ProductSort>("newest");
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      params.set("sort", sort);

      setLoading(true);
      fetch(`/api/products?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("خطا در دریافت محصولات");
          return res.json();
        })
        .then((data: ProductsResponse) => {
          setProducts(data.products ?? []);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setProducts([]);
          setLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [searchQuery, selectedCategory, sort]);

  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-8 scroll-mt-20">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-100">محصولات ما</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {loading ? "در حال بارگذاری..." : `${toFaDigits(products.length)} محصول`}
          </p>
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as ProductSort)}>
          <SelectTrigger
            aria-label="مرتب‌سازی محصولات"
            className="min-h-11 w-44 rounded-xl border-zinc-800 bg-zinc-900/70 text-sm text-zinc-200 focus-visible:ring-amber-400/50 dark:bg-zinc-900/70 dark:hover:bg-zinc-900"
          >
            <SelectValue placeholder="مرتب‌سازی" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
            {SORT_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="focus:bg-zinc-800 focus:text-amber-400"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 py-20 text-center">
          <PackageSearch className="h-12 w-12 text-zinc-600" aria-hidden />
          <p className="text-base font-bold text-zinc-300">محصولی یافت نشد</p>
          <p className="text-sm text-zinc-500">
            عبارت جستجو یا دسته‌بندی را تغییر دهید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
