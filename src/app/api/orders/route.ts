import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const orderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(3, "نام باید حداقل ۳ حرف باشد"),
  phone: z.string().trim().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
  address: z.string().trim().min(10, "آدرس را کامل‌تر وارد کنید"),
  note: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        qty: z.number().int().min(1, "تعداد باید حداقل ۱ باشد"),
      })
    )
    .min(1, "سبد خرید خالی است"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "داده‌های سفارش نامعتبر است" },
        { status: 400 }
      );
    }
    const { customerName, phone, address, note, items } = parsed.data;

    // Merge duplicate product entries (sum quantities).
    const qtyByProduct = new Map<number, number>();
    for (const item of items) {
      qtyByProduct.set(
        item.productId,
        (qtyByProduct.get(item.productId) ?? 0) + item.qty
      );
    }

    const productIds = [...qtyByProduct.keys()];
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    const foundIds = new Set(products.map((p) => p.id));
    const missing = productIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: "برخی از محصولات سفارش یافت نشدند" },
        { status: 400 }
      );
    }

    // Verify stock availability server-side.
    for (const product of products) {
      const wanted = qtyByProduct.get(product.id) ?? 0;
      if (product.stock < wanted) {
        return NextResponse.json(
          { error: `موجودی کافی نیست: ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Server-side total — DB prices are the single source of truth.
    const total = products.reduce(
      (sum, product) => sum + product.price * (qtyByProduct.get(product.id) ?? 0),
      0
    );

    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerName,
          phone,
          address,
          note: note?.trim() ? note.trim() : null,
          total,
          status: "pending",
          items: {
            create: products.map((product) => ({
              productId: product.id,
              productName: product.name,
              price: product.price,
              quantity: qtyByProduct.get(product.id) ?? 0,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement stock for each ordered product.
      for (const product of products) {
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: qtyByProduct.get(product.id) ?? 0 } },
        });
      }

      return created;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
