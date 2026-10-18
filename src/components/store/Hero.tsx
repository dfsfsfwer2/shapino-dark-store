"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "./Header";
import { useShopStore } from "@/store/useShopStore";

const TRUST_BADGES = [
  { icon: Truck, label: "ارسال سریع" },
  { icon: ShieldCheck, label: "ضمانت اصالت" },
  { icon: RotateCcw, label: "۷ روز بازگشت" },
  { icon: Headphones, label: "پشتیبانی ۲۴/۷" },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function Hero() {
  const setAdminOpen = useShopStore((s) => s.setAdminOpen);

  return (
    <section id="home" className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Text (RTL: appears on the right) */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center lg:text-start"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              ✦ جدیدترین محصولات با بهترین قیمت
            </span>
            <h1 className="text-4xl font-extrabold leading-tight text-zinc-100 md:text-5xl xl:text-6xl">
              خرید آنلاین، <span className="text-gradient">تجربه‌ای لوکس</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-400 md:text-lg lg:mx-0">
              در شاپینو، جدیدترین گجت‌ها، لوازم جانبی و محصولات سبک زندگی را با
              ضمانت اصالت کالا، قیمت رقابتی و ارسال سریع به سراسر کشور سفارش
              دهید.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button
                size="lg"
                onClick={() => scrollToSection("products")}
                className="min-h-12 rounded-xl bg-amber-500 px-6 text-base font-bold text-zinc-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-400/30"
              >
                شروع خرید
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setAdminOpen(true)}
                className="min-h-12 rounded-xl border-zinc-700 bg-transparent px-6 text-base font-medium text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-900 hover:text-amber-400"
              >
                پنل مدیریت
              </Button>
            </div>

            {/* Trust badges */}
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TRUST_BADGES.map((badge) => (
                <li
                  key={badge.label}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-3 py-3 text-xs font-medium text-zinc-300 lg:justify-start"
                >
                  <badge.icon className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                  {badge.label}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Hero image (RTL: appears on the left) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-square max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-[0_0_90px_-24px_rgba(245,158,11,0.35)]">
              <Image
                src="/images/hero.png"
                alt="نمایی لوکس از محصولات فروشگاه شاپینو"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div
              aria-hidden
              className="absolute -bottom-6 start-6 hidden items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 backdrop-blur md:flex"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <Truck className="h-5 w-5" aria-hidden />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-zinc-100">ارسال رایگان</p>
                <p className="text-xs text-zinc-500">برای تمام سفارش‌ها</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
