"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Package, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import LoginGate from "./LoginGate";
import AdminDashboard from "./AdminDashboard";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import { useAdminStore, useShopStore } from "@/store/useShopStore";
import { useMounted } from "@/hooks/use-mounted";
import { ADMIN_TOKEN } from "@/lib/admin";

export default function AdminPanel() {
  const adminOpen = useShopStore((s) => s.adminOpen);
  const setAdminOpen = useShopStore((s) => s.setAdminOpen);
  const adminAuthed = useAdminStore((s) => s.adminAuthed);
  const setAdminAuthed = useAdminStore((s) => s.setAdminAuthed);
  const adminToken = useAdminStore((s) => s.adminToken);
  const setAdminToken = useAdminStore((s) => s.setAdminToken);
  const mounted = useMounted();

  // Prevent page scroll while the full-screen panel is open.
  useEffect(() => {
    if (!adminOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [adminOpen]);

  if (!adminOpen) return null;

  const token = adminToken ?? ADMIN_TOKEN;

  const close = () => setAdminOpen(false);

  const logout = () => {
    setAdminAuthed(false);
    setAdminToken(null);
    toast.info("از پنل مدیریت خارج شدید");
  };

  if (!mounted || !adminAuthed) {
    return (
      <LoginGate
        onClose={close}
        onSuccess={(t) => {
          setAdminToken(t);
          setAdminAuthed(true);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Panel header */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-zinc-800/70 px-4 md:px-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <div className="leading-tight">
          <h1 className="text-base font-extrabold md:text-lg">پنل مدیریت شاپینو</h1>
          <p className="text-[11px] text-zinc-500">مدیریت محصولات و سفارش‌ها</p>
        </div>
        <div className="ms-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            onClick={logout}
            className="min-h-11 gap-2 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">خروج</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            aria-label="بستن پنل مدیریت"
            className="min-h-11 min-w-11 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-auto mt-4 h-11 w-fit justify-start rounded-xl border border-zinc-800 bg-zinc-900/70 p-1">
          <TabsTrigger
            value="dashboard"
            className="min-h-9 gap-2 rounded-lg px-4 text-sm font-medium text-zinc-400 data-[state=active]:bg-amber-500 data-[state=active]:font-bold data-[state=active]:text-zinc-950 dark:data-[state=active]:bg-amber-500 dark:data-[state=active]:text-zinc-950"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            داشبورد
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="min-h-9 gap-2 rounded-lg px-4 text-sm font-medium text-zinc-400 data-[state=active]:bg-amber-500 data-[state=active]:font-bold data-[state=active]:text-zinc-950 dark:data-[state=active]:bg-amber-500 dark:data-[state=active]:text-zinc-950"
          >
            <Package className="h-4 w-4" aria-hidden />
            محصولات
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="min-h-9 gap-2 rounded-lg px-4 text-sm font-medium text-zinc-400 data-[state=active]:bg-amber-500 data-[state=active]:font-bold data-[state=active]:text-zinc-950 dark:data-[state=active]:bg-amber-500 dark:data-[state=active]:text-zinc-950"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            سفارش‌ها
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="dashboard"
          className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
        >
          <AdminDashboard token={token} />
        </TabsContent>
        <TabsContent
          value="products"
          className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
        >
          <AdminProducts token={token} />
        </TabsContent>
        <TabsContent
          value="orders"
          className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
        >
          <AdminOrders token={token} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
