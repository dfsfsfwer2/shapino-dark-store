"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShopStore } from "@/store/useShopStore";
import {
  discountPercent,
  formatRating,
  formatToman,
  toFaDigits,
} from "@/lib/format";
import type { ProductWithCategory } from "@/lib/types";

export default function ProductDetailDialog() {
  const selectedProductId = useShopStore((s) => s.selectedProductId);
  const setSelectedProductId = useShopStore((s) => s.setSelectedProductId);
  const addToCart = useShopStore((s) => s.addToCart);

  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);

  const open = selectedProductId !== null;

  const closeDialog = useCallback(() => {
    setSelectedProductId(null);
    setProduct(null);
    setQty(1);
    setLoading(false);
  }, [setSelectedProductId]);

  useEffect(() => {
    if (selectedProductId === null) return;
    let cancelled = false;

    fetch(`/api/products/${selectedProductId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("محصول یافت نشد");
        const data = (await res.json()) as { product: ProductWithCategory };
        if (cancelled) return;
        setProduct(data.product);
        setQty(1);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("محصول یافت نشد");
          closeDialog();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedProductId, closeDialog]);

  if (!open) return null;

  const discount = product
    ? discountPercent(product.price, product.comparePrice)
    : null;
  const outOfStock = product ? product.stock === 0 : false;
  const lowStock = product ? product.stock > 0 && product.stock <= 3 : false;

  const handleAdd = () => {
    if (!product || outOfStock) return;
    addToCart(product, qty);
    toast.success("به سبد خرید اضافه شد");
    closeDialog();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-zinc-800 bg-zinc-900 p-0 text-zinc-100 sm:rounded-2xl">
        {loading || !product ? (
          <div className="flex min-h-64 items-center justify-center p-10">
            <DialogHeader className="sr-only">
              <DialogTitle>در حال بارگذاری محصول</DialogTitle>
              <DialogDescription>لطفاً چند لحظه صبر کنید</DialogDescription>
            </DialogHeader>
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" aria-label="در حال بارگذاری" />
          </div>
        ) : (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{product.name}</DialogTitle>
              <DialogDescription>جزئیات محصول {product.name}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                {discount !== null && (
                  <span className="absolute end-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-zinc-950">
                    ٪{toFaDigits(discount)} تخفیف
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col gap-3">
                <Badge className="w-fit border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/10">
                  {product.category.name}
                </Badge>
                <h2 className="text-xl font-extrabold leading-snug md:text-2xl">
                  {product.name}
                </h2>

                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  <span className="text-sm font-bold text-amber-400">
                    {formatRating(product.rating)}
                  </span>
                  <span className="text-xs text-zinc-500">از ۵</span>
                </div>

                <p className="text-sm leading-relaxed text-zinc-400">
                  {product.description}
                </p>

                <div className="mt-1 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-2xl font-extrabold text-amber-400">
                      {formatToman(product.price)}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-xs text-zinc-500 line-through">
                        {formatToman(product.comparePrice)}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs">
                    {outOfStock ? (
                      <span className="font-bold text-red-400">این محصول موجود نیست</span>
                    ) : lowStock ? (
                      <span className="font-bold text-amber-400">
                        تنها {toFaDigits(product.stock)} عدد باقی مانده
                      </span>
                    ) : (
                      <span className="text-zinc-500">
                        موجودی انبار: {toFaDigits(product.stock)} عدد
                      </span>
                    )}
                  </p>
                </div>

                {/* Quantity stepper */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400">تعداد:</span>
                  <div className="flex items-center overflow-hidden rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      aria-label="کاهش تعداد"
                      className="flex h-11 w-11 items-center justify-center text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-600"
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <span
                      className="w-10 text-center text-sm font-bold"
                      aria-live="polite"
                    >
                      {toFaDigits(qty)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQty((q) => Math.min(product.stock, q + 1))
                      }
                      disabled={outOfStock || qty >= product.stock}
                      aria-label="افزایش تعداد"
                      className="flex h-11 w-11 items-center justify-center text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-600"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleAdd}
                  disabled={outOfStock}
                  className="mt-auto min-h-12 w-full rounded-xl bg-amber-500 text-base font-bold text-zinc-950 shadow-lg shadow-amber-500/25 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
                >
                  <ShoppingCart className="h-5 w-5" aria-hidden />
                  {outOfStock ? "ناموجود" : "افزودن به سبد خرید"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
