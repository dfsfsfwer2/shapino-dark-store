import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است").optional(),
  description: z.string().min(1, "توضیحات محصول الزامی است").optional(),
  price: z.number().int().positive("قیمت باید بزرگ‌تر از صفر باشد").optional(),
  comparePrice: z.number().int().positive().nullable().optional(),
  image: z.string().min(1, "تصویر محصول الزامی است").optional(),
  stock: z.number().int().min(0, "موجودی نمی‌تواند منفی باشد").optional(),
  rating: z.number().min(0).max(5, "امتیاز باید بین ۰ تا ۵ باشد").optional(),
  categoryId: z.number().int().positive().optional(),
  featured: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

async function parseId(context: RouteContext): Promise<number | null> {
  const { id } = await context.params;
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const id = await parseId(context);
    if (id === null) {
      return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const id = await parseId(context);
    if (id === null) {
      return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "داده‌های ورودی نامعتبر است" },
        { status: 400 }
      );
    }

    if (parsed.data.categoryId !== undefined) {
      const category = await db.category.findUnique({
        where: { id: parsed.data.categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: "دسته‌بندی انتخاب‌شده یافت نشد" },
          { status: 400 }
        );
      }
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    const product = await db.product.update({
      where: { id },
      data: parsed.data,
      include: { category: true },
    });

    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const id = await parseId(context);
    if (id === null) {
      return NextResponse.json({ error: "شناسه نامعتبر است" }, { status: 400 });
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    // OrderItems store a plain productId/name snapshot (no FK), so the product
    // can be removed safely without touching past orders.
    await db.product.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
