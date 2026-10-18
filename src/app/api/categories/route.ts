import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

  if (!slug || /[^\x20-\x7E]/.test(slug)) {
    return `c-${Date.now()}`;
  }
  return slug;
}

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
      | { name?: string; slug?: string }
      | null;
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "نام دسته‌بندی الزامی است" }, { status: 400 });
    }

    const slug = body?.slug?.trim() ? body.slug.trim() : slugify(name);

    const category = await db.category.create({ data: { name, slug } });

    return NextResponse.json(
      { category: { ...category, _count: { products: 0 } } },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "دسته‌بندی با این نام یا شناسه قبلاً ثبت شده است" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
