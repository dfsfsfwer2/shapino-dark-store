import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUS_KEYS } from "@/lib/order-status";

export const dynamic = "force-dynamic";

const statusSchema = z.object({
  status: z.enum(
    ORDER_STATUS_KEYS as [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]
  ),
});

type RouteContext = { params: Promise<{ id: string }> };

async function parseId(context: RouteContext): Promise<number | null> {
  const { id } = await context.params;
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const id = await parseId(context);
    if (id === null) {
      return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const id = await parseId(context);
    if (id === null) {
      return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "وضعیت سفارش نامعتبر است" },
        { status: 400 }
      );
    }

    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    const order = await db.order.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { items: true },
    });

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
