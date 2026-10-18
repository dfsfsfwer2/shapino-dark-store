import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const [revenueAgg, ordersCount, productsCount, pendingCount, latestOrders] =
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
          take: 5,
          include: { items: true },
        }),
      ]);

    return NextResponse.json({
      revenue: revenueAgg._sum.total ?? 0,
      ordersCount,
      productsCount,
      pendingCount,
      latestOrders,
    });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
