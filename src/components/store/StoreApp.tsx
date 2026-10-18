"use client";

import Header from "./Header";
import Hero from "./Hero";
import CategoryChips from "./CategoryChips";
import ProductGrid from "./ProductGrid";
import Footer from "./Footer";
import CartSheet from "./CartSheet";
import ProductDetailDialog from "./ProductDetailDialog";
import AdminPanel from "./admin/AdminPanel";

export default function StoreApp() {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Subtle amber radial glow at the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_65%)]"
      />

      <Header />

      <main className="relative flex-1">
        <Hero />
        <CategoryChips />
        <ProductGrid />
      </main>

      <Footer />

      {/* Overlays */}
      <CartSheet />
      <ProductDetailDialog />
      <AdminPanel />
    </div>
  );
}
