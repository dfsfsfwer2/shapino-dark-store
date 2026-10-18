"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatToman, toFaDigits } from "@/lib/format";
import { ORDER_STATUS_KEYS, orderStatusMeta } from "@/lib/order-status";
import type { OrderStatus, OrderWithItems } from "@/lib/types";

const adminHeaders = (token: string): HeadersInit => ({ "x-admin-token": token });

export default function AdminOrders({ token }: { token: string }) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", { headers: adminHeaders(token) });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { orders: OrderWithItems[] };
      setOrders(data.orders ?? []);
    } catch {
      toast.error("خطا در دریافت سفارش‌ها");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (order: OrderWithItems, status: OrderStatus) => {
    if (status === order.status) return;
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status } : o))
    );
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...adminHeaders(token) },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "خطا در تغییر وضعیت");
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: order.status } : o))
        );
        return;
      }
      toast.success(
        `وضعیت سفارش #${toFaDigits(order.id)} به «${orderStatusMeta(status).label}» تغییر کرد`
      );
    } catch {
      toast.error("خطا در برقراری ارتباط با سرور");
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: order.status } : o))
      );
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-zinc-200">
        مدیریت سفارش‌ها {loading ? "" : `(${toFaDigits(orders.length)})`}
      </h3>

      <div className="scrollbar-thin max-h-[62vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-zinc-800/70" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            هنوز سفارشی ثبت نشده است.
          </p>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-zinc-900">
              <TableRow className="border-zinc-800/70 hover:bg-transparent">
                <TableHead className="text-zinc-500">کد</TableHead>
                <TableHead className="text-zinc-500">مشتری</TableHead>
                <TableHead className="text-zinc-500">موبایل</TableHead>
                <TableHead className="text-zinc-500">مبلغ</TableHead>
                <TableHead className="text-zinc-500">تاریخ</TableHead>
                <TableHead className="text-zinc-500">وضعیت</TableHead>
                <TableHead className="text-zinc-500">اقلام</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const meta = orderStatusMeta(order.status);
                const expanded = expandedId === order.id;
                return (
                  <TableRow key={order.id} className="border-zinc-800/70 align-top">
                    <TableCell className="whitespace-nowrap pt-4 font-bold text-amber-400">
                      #{toFaDigits(order.id)}
                    </TableCell>
                    <TableCell className="max-w-36 pt-4">
                      <p className="truncate text-sm text-zinc-200">
                        {order.customerName}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap pt-4 font-mono text-xs text-zinc-400" dir="ltr">
                      {order.phone}
                    </TableCell>
                    <TableCell className="whitespace-nowrap pt-4 text-sm font-bold text-zinc-200">
                      {formatToman(order.total)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap pt-4 text-xs text-zinc-500">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="pt-3">
                      <Select
                        value={order.status}
                        onValueChange={(v) => changeStatus(order, v as OrderStatus)}
                      >
                        <SelectTrigger
                          aria-label={`تغییر وضعیت سفارش ${order.id}`}
                          className={`h-9 w-32 rounded-lg text-xs font-bold ${meta.className}`}
                        >
                          {meta.label}
                        </SelectTrigger>
                        <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                          {ORDER_STATUS_KEYS.map((key) => (
                            <SelectItem
                              key={key}
                              value={key}
                              className="focus:bg-zinc-800 focus:text-amber-400"
                            >
                              {orderStatusMeta(key).label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="pt-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : order.id)}
                        aria-label={expanded ? "بستن جزئیات" : "مشاهده اقلام سفارش"}
                        aria-expanded={expanded}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-amber-400"
                      >
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" aria-hidden />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Expanded details — rendered under the table for the selected order */}
      {(() => {
        const order = orders.find((o) => o.id === expandedId);
        if (!order) return null;
        return (
          <div className="rounded-2xl border border-amber-500/20 bg-zinc-900/80 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-amber-400">
                اقلام سفارش #{toFaDigits(order.id)}
              </h4>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${orderStatusMeta(order.status).className}`}>
                {orderStatusMeta(order.status).label}
              </span>
            </div>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/50 px-4 py-2.5 text-sm"
                >
                  <span className="font-medium text-zinc-200">{item.productName}</span>
                  <span className="text-zinc-400">
                    {toFaDigits(item.quantity)} عدد ×{" "}
                    {formatToman(item.price)} ={" "}
                    <span className="font-bold text-amber-400">
                      {formatToman(item.price * item.quantity)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2 text-xs text-zinc-400">
              <p>
                <span className="text-zinc-500">آدرس:</span> {order.address}
              </p>
              {order.note && (
                <p>
                  <span className="text-zinc-500">یادداشت:</span> {order.note}
                </p>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
