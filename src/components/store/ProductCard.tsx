"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useShopStore } from "@/store/useShopStore";
import {
  discountPercent,
  formatRating,
  formatToman,
  toFaDigits,
} from "@/lib/format";
import type { ProductWithCategory } from "@/lib/types";

export default function ProductCard({ product }: { product: ProductWithCategory }) {
  const addToCart = useShopStore((s) => s.addToCart);
  const setSelectedProductId = useShopStore((s) => s.setSelectedProductId);

  const discount = discountPercent(product.price, product.comparePrice);
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product, 1);
    toast.success("به سبد خرید اضافه شد");
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      onClick={() => setSelectedProductId(product.id)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition-colors hover:border-amber-500/40 outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
      role="button"
      tabIndex={0}
      aria-label={`مشاهده جزئیات ${product.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelectedProductId(product.id);
        }
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-900">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount !== null && (
          <span className="absolute end-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-zinc-950">
            ٪{toFaDigits(discount)} تخفیف
          </span>
        )}
        {outOfStock ? (
          <span className="absolute start-2 top-2 rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-400 backdrop-blur">
            ناموجود
          </span>
        ) : lowStock ? (
          <span className="absolute start-2 top-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur">
            تنها {toFaDigits(product.stock)} عدد
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs text-zinc-500">{product.category.name}</span>
        <h3 className="line-clamp-1 text-sm font-bold text-zinc-100 md:text-base">
          {product.name}
        </h3>

        <div className="flex items-center gap-1" aria-label={`امتیاز ${formatRating(product.rating)} از ۵`}>
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
          <span className="text-xs font-medium text-amber-400">
            {formatRating(product.rating)}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-amber-400 md:text-base">
              {formatToman(product.price)}
            </p>
            {product.comparePrice && product.comparePrice > product.price && (
              <p className="text-xs text-zinc-500 line-through">
                {formatToman(product.comparePrice)}
              </p>
            )}
          </div>
          <Button
            size="icon"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={`افزودن ${product.name} به سبد خرید`}
            className="h-10 w-10 shrink-0 rounded-xl bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none"
          >
            <Plus className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
