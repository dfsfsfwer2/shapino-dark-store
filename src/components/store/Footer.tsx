"use client";

import { Mail, MapPin, Phone, ShieldCheck, ShoppingBag } from "lucide-react";
import { scrollToSection } from "./Header";
import { useShopStore } from "@/store/useShopStore";

const QUICK_LINKS = [
  { id: "home", label: "خانه" },
  { id: "categories", label: "دسته‌بندی‌ها" },
  { id: "products", label: "محصولات" },
];

export default function Footer() {
  const setAdminOpen = useShopStore((s) => s.setAdminOpen);

  return (
    <footer className="mt-auto border-t border-zinc-800/70 bg-zinc-900/50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-zinc-950">
                <ShoppingBag className="h-4.5 w-4.5" aria-hidden />
              </span>
              <span className="text-lg font-extrabold text-zinc-100">شاپینو</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
              شاپینو فروشگاه آنلاین مدرن با تمرکز بر کیفیت، ضمانت اصالت کالا و
              تجربه خریدی لوکس برای کاربران فارسی‌زبان است.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="لینک‌های سریع">
            <h3 className="mb-3 text-sm font-bold text-zinc-200">دسترسی سریع</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm text-zinc-400 transition-colors hover:text-amber-400"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setAdminOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-amber-400"
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  ورود مدیران
                </button>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-zinc-200">تماس با ما</h3>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                تهران، خیابان ولیعصر، پلاک ۱۲۳
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                <span dir="ltr">۰۲۱-۱۲۳۴۵۶۷۸</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                <span dir="ltr">info@shapino.example</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800/70 pt-5 text-center text-xs text-zinc-500">
          © ۱۴۰۳ شاپینو — تمامی حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}
