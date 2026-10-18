"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CheckoutDialog from "./CheckoutDialog";
import { scrollToSection } from "./Header";
import {
  cartSubtotal,
  useShopStore,
} from "@/store/useShopStore";
import { formatToman } from "@/lib/format";

export default function CartSheet() {
  const cart = useShopStore((s) => s.cart);
  const cartOpen = useShopStore((s) => s.cartOpen);
  const setCartOpen = useShopStore((s) => s.setCartOpen);
  const setQty = useShopStore((s) => s.setQty);
  const removeFromCart = useShopStore((s) => s.removeFromCart);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const subtotal = cartSubtotal(cart);

  const goCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const goShop = () => {
    setCartOpen(false);
    scrollToSection("products");
  };

  return (
    <>
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="left"
          className="flex w-full flex-col gap-0 border-zinc-800 bg-zinc-950 p-0 text-zinc-100 sm:max-w-md"
        >
          <SheetHeader className="border-b border-zinc-800/60 px-4 py-4">
            <SheetTitle className="flex items-center gap-2 text-zinc-100">
              <ShoppingCart className="h-5 w-5 text-amber-400" aria-hidden />
              سبد خرید
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-500">
              محصولات انتخابی شما
            </SheetDescription>
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900">
                <ShoppingCart className="h-9 w-9 text-zinc-600" aria-hidden />
              </div>
              <p className="text-base font-bold text-zinc-300">سبد خرید خالی است</p>
              <p className="text-sm text-zinc-500">
                هنوز محصولی به سبد خرید اضافه نکرده‌اید.
              </p>
              <Button
                onClick={goShop}
                className="mt-2 min-h-11 rounded-xl bg-amber-500 px-6 font-bold text-zinc-950 hover:bg-amber-400"
              >
                رفتن به فروشگاه
              </Button>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="scrollbar-thin max-h-[46vh] flex-1 space-y-3 overflow-y-auto p-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-1 text-sm font-bold text-zinc-100">
                          {item.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label={`حذف ${item.name} از سبد`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-amber-400">
                        {formatToman(item.price)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center overflow-hidden rounded-lg border border-zinc-800">
                          <button
                            type="button"
                            onClick={() => setQty(item.productId, item.qty - 1)}
                            aria-label="کاهش تعداد"
                            className="flex h-8 w-8 items-center justify-center text-zinc-300 transition-colors hover:bg-zinc-800"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">
                            {new Intl.NumberFormat("fa-IR").format(item.qty)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(item.productId, item.qty + 1)}
                            aria-label="افزایش تعداد"
                            className="flex h-8 w-8 items-center justify-center text-zinc-300 transition-colors hover:bg-zinc-800"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                        <span className="text-xs text-zinc-500">
                          جمع: {formatToman(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer summary */}
              <div className="space-y-3 border-t border-zinc-800/60 bg-zinc-950 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">جمع کالاها</span>
                  <span className="font-medium text-zinc-200">
                    {formatToman(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">هزینه ارسال</span>
                  <span className="font-bold text-emerald-400">رایگان</span>
                </div>
                <Separator className="bg-zinc-800" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-200">مبلغ نهایی</span>
                  <span className="text-lg font-extrabold text-amber-400">
                    {formatToman(subtotal)}
                  </span>
                </div>
                <Button
                  size="lg"
                  onClick={goCheckout}
                  className="min-h-12 w-full rounded-xl bg-amber-500 text-base font-bold text-zinc-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400"
                >
                  ادامه خرید
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  );
}
