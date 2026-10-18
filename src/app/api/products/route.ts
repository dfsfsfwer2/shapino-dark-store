import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Generate a URL-safe slug; falls back to a timestamp slug for Persian-only names. */
function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Persian-only names produce non-URL-friendly slugs → use timestamp fallback.
  if (!slug || /[^\x20-\x7E]/.test(slug)) {
    return `p-${Date.now()}`;
  }
  return slug;
}

const productSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  description: z.string().min(1, "توضیحات محصول الزامی است"),
  price: z.number().int().positive("قیمت باید بزرگ‌تر از صفر باشد"),
  comparePrice: z.number().int().positive().nullable(),
  image: z.string().min(1, "تصویر محصول الزامی است"),
  stock: z.number().int().min(0, "موجودی نمی‌تواند منفی باشد"),
  rating: z.number().min(0).max(5, "امتیاز باید بین ۰ تا ۵ باشد"),
  categoryId: z.number().int().positive(),
  featured: z.boolean(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const featured = searchParams.get("featured")?.trim() ?? "";
    const sort = searchParams.get("sort")?.trim() ?? "newest";

    const where: Prisma.ProductWhereInput = {};
    if (q) where.name = { contains: q };
    if (category) where.category = { slug: category };
    if (featured === "true") where.featured = true;

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (sort) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    const products = await db.product.findMany({
      where,
      include: { category: true },
      orderBy,
    });

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "داده‌های ورودی نامعتبر است" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const category = await db.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      return NextResponse.json(
        { error: "دسته‌بندی انتخاب‌شده یافت نشد" },
        { status: 400 }
      );
    }

    const slug = slugify(data.name);
    const product = await db.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        image: data.image,
        stock: data.stock,
        rating: data.rating,
        featured: data.featured,
        categoryId: data.categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "محصولی با این نام قبلاً ثبت شده است" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
