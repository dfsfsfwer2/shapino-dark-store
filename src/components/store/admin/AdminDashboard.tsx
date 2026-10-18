"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatToman, formatDate, toFaDigits } from "@/lib/format";
import { orderStatusMeta } from "@/lib/order-status";
import type { AdminStatsResponse } from "@/lib/types";

const adminHeaders = (token: string): HeadersInit => ({ "x-admin-token": token });

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-zinc-500">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-6 w-24 bg-zinc-800/70" />
          ) : (
            <p className="truncate text-lg font-extrabold text-zinc-100">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ token }: { token: string }) {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", { headers: adminHeaders(token) });
      if (!res.ok) throw new Error();
      setStats((await res.json()) as AdminStatsResponse);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="درآمد کل"
          value={stats ? formatToman(stats.revenue) : "—"}
          loading={loading}
        />
        <StatCard
          icon={ShoppingBag}
          label="تعداد سفارش‌ها"
          value={stats ? toFaDigits(stats.ordersCount) : "—"}
          loading={loading}
        />
        <StatCard
          icon={Package}
          label="تعداد محصولات"
          value={stats ? toFaDigits(stats.productsCount) : "—"}
          loading={loading}
        />
        <StatCard
          icon={Clock}
          label="سفارش‌های در انتظار"
          value={stats ? toFaDigits(stats.pendingCount) : "—"}
          loading={loading}
        />
      </div>

      {/* Latest orders */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <div className="border-b border-zinc-800/70 px-5 py-4">
          <h3 className="text-sm font-bold text-zinc-200">آخرین سفارش‌ها</h3>
        </div>
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-zinc-800/70" />
            ))}
          </div>
        ) : !stats || stats.latestOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            هنوز سفارشی ثبت نشده است.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800/70 hover:bg-transparent">
                  <TableHead className="text-zinc-500">کد</TableHead>
                  <TableHead className="text-zinc-500">مشتری</TableHead>
                  <TableHead className="text-zinc-500">مبلغ</TableHead>
                  <TableHead className="text-zinc-500">وضعیت</TableHead>
                  <TableHead className="text-zinc-500">تاریخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.latestOrders.map((order) => {
                  const meta = orderStatusMeta(order.status);
                  return (
                    <TableRow key={order.id} className="border-zinc-800/70">
                      <TableCell className="font-bold text-amber-400">
                        #{toFaDigits(order.id)}
                      </TableCell>
                      <TableCell className="text-zinc-200">{order.customerName}</TableCell>
                      <TableCell className="text-zinc-200">{formatToman(order.total)}</TableCell>
                      <TableCell>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${meta.className}`}>
                          {meta.label}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-zinc-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
