"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  DollarSign,
  Flame,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import type { AdminStatsResponse, OrderStatusCount } from "@/lib/types";

const adminHeaders = (token: string): HeadersInit => ({ "x-admin-token": token });

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  loading,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  hint?: string;
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
          {!loading && hint ? (
            <p className="mt-0.5 truncate text-[11px] text-zinc-500">{hint}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const STATUS_BARS: Array<{
  key: keyof OrderStatusCount;
  bar: string;
}> = [
  { key: "pending", bar: "bg-amber-400" },
  { key: "processing", bar: "bg-zinc-300" },
  { key: "shipped", bar: "bg-amber-500" },
  { key: "delivered", bar: "bg-emerald-400" },
  { key: "cancelled", bar: "bg-red-400" },
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      dir="rtl"
      className="rounded-xl border border-zinc-700 bg-zinc-950/95 px-3 py-2 text-xs shadow-xl"
    >
      <p className="font-bold text-zinc-200">{label}</p>
      <p className="text-amber-400">{formatToman(payload[0].value)}</p>
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

  const statusTotal = stats
    ? Object.values(stats.statusCounts).reduce((a, b) => a + b, 0)
    : 0;

  const chartData = stats?.revenueByDay ?? [];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="درآمد کل (بدون لغوشده)"
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
          hint={stats ? `${toFaDigits(stats.lowStock.length)} محصول موجودی کم` : undefined}
          loading={loading}
        />
        <StatCard
          icon={Clock}
          label="سفارش‌های در انتظار"
          value={stats ? toFaDigits(stats.pendingCount) : "—"}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue chart — 7 days */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-200">
              <TrendingUp className="h-4 w-4 text-amber-400" aria-hidden />
              فروش ۷ روز اخیر
            </h3>
            {chartData.length > 0 && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400">
                مجموع هفته: {formatToman(chartData.reduce((s, d) => s + d.revenue, 0))}
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full bg-zinc-800/70" />
          ) : (
            <div dir="ltr" className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    reversed
                    tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    axisLine={{ stroke: "#3f3f46" }}
                    tickLine={false}
                  />
                  <YAxis
                    orientation="right"
                    tick={{ fill: "#71717a", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={54}
                    tickFormatter={(v: number) =>
                      v >= 1_000_000
                        ? `${toFaDigits(Math.round(v / 1_000_000))}م`
                        : toFaDigits(v)
                    }
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#52525b" }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#fbbf24"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={{ r: 3, fill: "#fbbf24", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status distribution */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="mb-4 text-sm font-bold text-zinc-200">وضعیت سفارش‌ها</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full bg-zinc-800/70" />
              ))}
            </div>
          ) : (
            <ul className="space-y-3.5">
              {STATUS_BARS.map(({ key, bar }) => {
                const meta = orderStatusMeta(key);
                const count = stats?.statusCounts[key] ?? 0;
                const pct = statusTotal > 0 ? Math.round((count / statusTotal) * 100) : 0;
                return (
                  <li key={key}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.className}`}>
                        {meta.label}
                      </span>
                      <span className="font-bold text-zinc-300">
                        {toFaDigits(count)} ({toFaDigits(pct)}٪)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${bar} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${meta.label}: ${count}`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top products */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-200">
            <Flame className="h-4 w-4 text-amber-400" aria-hidden />
            پرفروش‌ترین محصولات
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full bg-zinc-800/70" />
              ))}
            </div>
          ) : !stats || stats.topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">هنوز فروشی ثبت نشده است.</p>
          ) : (
            <ol className="space-y-2.5">
              {stats.topProducts.map((p, i) => (
                <li
                  key={p.productName}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2.5"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                      i === 0
                        ? "bg-amber-400 text-zinc-950"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {toFaDigits(i + 1)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">
                    {p.productName}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-amber-400">
                    {i === 0 ? <ArrowUp className="h-3.5 w-3.5" aria-hidden /> : null}
                    {toFaDigits(p.qty)} فروش
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-200">
            <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden />
            هشدار موجودی کم
            {stats && stats.lowStock.length > 0 && (
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-400">
                {toFaDigits(stats.lowStock.length)} مورد
              </span>
            )}
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-zinc-800/70" />
              ))}
            </div>
          ) : !stats || stats.lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">
              همه‌ی محصولات موجودی کافی دارند. 👌
            </p>
          ) : (
            <ul className="space-y-2.5">
              {stats.lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2"
                >
                  <img
                    src={p.image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-lg border border-zinc-800 object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{p.name}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      p.stock <= 5
                        ? "bg-red-500/15 text-red-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {toFaDigits(p.stock)} عدد
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Latest orders */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <div className="border-b border-zinc-800/70 px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-200">
            <ArrowDown className="h-4 w-4 text-amber-400" aria-hidden />
            آخرین سفارش‌ها
          </h3>
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
