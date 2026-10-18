"use client";

import { useState } from "react";
import {
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  cartTotalQty,
  useShopStore,
} from "@/store/useShopStore";
import { toFaDigits } from "@/lib/format";
import { useMounted } from "@/hooks/use-mounted";

const NAV_ITEMS = [
  { id: "home", label: "خانه" },
  { id: "categories", label: "دسته‌بندی‌ها" },
  { id: "products", label: "محصولات" },
];

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Header() {
  const searchQuery = useShopStore((s) => s.searchQuery);
  const setSearchQuery = useShopStore((s) => s.setSearchQuery);
  const cart = useShopStore((s) => s.cart);
  const setCartOpen = useShopStore((s) => s.setCartOpen);
  const setAdminOpen = useShopStore((s) => s.setAdminOpen);
  const mounted = useMounted();

  const [mobileOpen, setMobileOpen] = useState(false);

  const totalQty = mounted ? cartTotalQty(cart) : 0;

  const handleNav = (id: string) => {
    setMobileOpen(false);
    scrollToSection(id);
  };

  const openAdmin = () => {
    setMobileOpen(false);
    setAdminOpen(true);
    toast.info("برای ورود به پنل مدیریت، رمز عبور را وارد کنید.");
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-3">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNav("home")}
            className="flex min-h-11 items-center gap-2.5 rounded-xl px-1 outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
            aria-label="شاپینو — صفحه اصلی"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/20">
              <ShoppingBag className="h-5 w-5" aria-hidden />
            </span>
            <span className="flex flex-col items-start leading-tight">
              <span className="text-lg font-extrabold text-zinc-100">شاپینو</span>
              <span className="text-[10px] text-zinc-500">فروشگاه مدرن</span>
            </span>
          </button>

          {/* Desktop search */}
          <div className="relative hidden ms-4 max-w-md flex-1 md:block">
            <Search
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی محصولات..."
              aria-label="جستجوی محصولات"
              className="min-h-11 rounded-xl border-zinc-800 bg-zinc-900/70 pe-10 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-amber-400/50 dark:bg-zinc-900/70"
            />
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="ناوبری اصلی">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className="min-h-11 rounded-lg px-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-amber-400"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions cluster */}
          <div className="ms-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={openAdmin}
              aria-label="پنل مدیریت"
              className="min-h-11 min-w-11 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-amber-400"
            >
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(true)}
              aria-label={`سبد خرید (${totalQty} کالا)`}
              className="relative min-h-11 min-w-11 rounded-xl text-zinc-300 hover:bg-zinc-900 hover:text-amber-400"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
              {totalQty > 0 && (
                <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-zinc-950">
                  {toFaDigits(totalQty)}
                </span>
              )}
            </Button>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 rounded-xl text-zinc-300 hover:bg-zinc-900 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="border-t border-zinc-800/60 py-3 lg:hidden">
            <div className="relative mb-3 md:hidden">
              <Search
                className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                aria-hidden
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی محصولات..."
                aria-label="جستجوی محصولات"
                className="min-h-11 rounded-xl border-zinc-800 bg-zinc-900/70 pe-10 text-sm focus-visible:ring-amber-400/50 dark:bg-zinc-900/70"
              />
            </div>
            <div className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className="min-h-11 rounded-lg px-3 text-start text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-amber-400"
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={openAdmin}
                className="min-h-11 rounded-lg px-3 text-start text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-amber-400"
              >
                پنل مدیریت
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
