import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import type { LowStockProduct, OrderStatusCount, RevenueDay, TopProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

/** برچسب فارسی روز هفته برای یک تاریخ */
function faWeekday(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", { weekday: "short" }).format(date);
}

export async function GET(req: NextRequest) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const [revenueAgg, ordersCount, productsCount, pendingCount, latestOrders, ordersForAnalytics, orderItemGroups, lowStockProducts] =
      await Promise.all([
        db.order.aggregate({
          where: { status: { not: "cancelled" } },
          _sum: { total: true },
        }),
        db.order.count(),
        db.product.count(),
        db.order.count({ where: { status: "pending" } }),
        db.order.findMany({
          orderBy: { createdAt: "desc" },
          take: 6,
          include: { items: true },
        }),
        // سفارش‌های ۷ روز اخیر برای نمودار
        db.order.findMany({
          where: { createdAt: { gte: new Date(Date.now() - 6 * DAY_MS) } },
          select: { createdAt: true, total: true, status: true },
        }),
        // پرفروش‌ترین محصولات بر اساس تعداد فروخته‌شده (به‌جز سفارش‌های لغوشده)
        db.orderItem.groupBy({
          by: ["productName"],
          _sum: { quantity: true },
          where: { order: { status: { not: "cancelled" } } },
          orderBy: { _sum: { quantity: "desc" } },
          take: 5,
        }),
        // محصولات با موجودی کم
        db.product.findMany({
          where: { stock: { lte: 8 } },
          orderBy: { stock: "asc" },
          take: 6,
          select: { id: true, name: true, image: true, stock: true },
        }),
      ]);

    /* ---------- نمودار ۷ روز اخیر ---------- */
    const dayMap = new Map<string, RevenueDay>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * DAY_MS);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { key, label: faWeekday(d), revenue: 0, orders: 0 });
    }
    for (const order of ordersForAnalytics) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      const day = dayMap.get(key);
      if (!day) continue;
      day.orders += 1;
      if (order.status !== "cancelled") {
        day.revenue += order.total;
      }
    }
    const revenueByDay: RevenueDay[] = Array.from(dayMap.values());

    /* ---------- شمارش وضعیت‌ها ---------- */
    const statusCounts: OrderStatusCount = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const order of ordersForAnalytics) {
      if (order.status in statusCounts) {
        statusCounts[order.status as keyof OrderStatusCount] += 1;
      }
    }
    // سفارش‌های قدیمی‌تر از ۷ روز هم باید در شمارش وضعیت‌ها بیایند
    const allStatuses = await db.order.groupBy({ by: ["status"], _count: { _all: true } });
    for (const row of allStatuses) {
      if (row.status in statusCounts) {
        statusCounts[row.status as keyof OrderStatusCount] = row._count._all;
      }
    }

    /* ---------- پرفروش‌ها ---------- */
    const topProducts: TopProduct[] = orderItemGroups.map((g) => ({
      productName: g.productName,
      qty: g._sum.quantity ?? 0,
    }));

    const lowStock: LowStockProduct[] = lowStockProducts;

    return NextResponse.json({
      revenue: revenueAgg._sum.total ?? 0,
      ordersCount,
      productsCount,
      pendingCount,
      latestOrders,
      statusCounts,
      revenueByDay,
      topProducts,
      lowStock,
    });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
