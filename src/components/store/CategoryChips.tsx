"use client";

import { useEffect, useState } from "react";
import {
  House,
  LayoutGrid,
  Plug,
  Shirt,
  Smartphone,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { useShopStore } from "@/store/useShopStore";
import { toFaDigits } from "@/lib/format";
import type { CategoriesResponse } from "@/lib/types";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  digital: Smartphone,
  accessories: Plug,
  fashion: Shirt,
  home: House,
};

const FALLBACK_CATEGORIES = [
  { id: 0, name: "دیجیتال", slug: "digital", _count: { products: 0 } },
  { id: 0, name: "لوازم جانبی", slug: "accessories", _count: { products: 0 } },
  { id: 0, name: "مد و استایل", slug: "fashion", _count: { products: 0 } },
  { id: 0, name: "خانه و آشپزخانه", slug: "home", _count: { products: 0 } },
];

export default function CategoryChips() {
  const selectedCategory = useShopStore((s) => s.selectedCategory);
  const setSelectedCategory = useShopStore((s) => s.setSelectedCategory);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((data: CategoriesResponse) => {
        if (!cancelled && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chips = [
    { slug: "all", name: "همه", icon: LayoutGrid, count: null as number | null },
    ...categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      icon: CATEGORY_ICONS[c.slug] ?? Tag,
      count: c._count?.products ?? null,
    })),
  ];

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-8 scroll-mt-20">
      <h2 className="mb-4 text-xl font-bold text-zinc-100">دسته‌بندی‌ها</h2>
      <div
        className="scrollbar-thin -mx-4 flex gap-3 overflow-x-auto px-4 pb-2"
        role="tablist"
        aria-label="فیلتر دسته‌بندی محصولات"
      >
        {chips.map((chip) => {
          const active = selectedCategory === chip.slug;
          return (
            <button
              key={chip.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedCategory(chip.slug)}
              className={`flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${
                active
                  ? "border-amber-500 bg-amber-500 font-bold text-zinc-950 shadow-lg shadow-amber-500/25"
                  : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-amber-500/40 hover:text-amber-400"
              }`}
            >
              <chip.icon className="h-4 w-4" aria-hidden />
              {chip.name}
              {chip.count !== null && chip.slug !== "all" && (
                <span
                  className={`rounded-full px-1.5 text-[11px] ${
                    active ? "bg-zinc-950/20 text-zinc-900" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {toFaDigits(chip.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
