import { NextRequest, NextResponse } from "next/server";
import { ADMIN_PASSWORD, ADMIN_TOKEN } from "@/lib/admin";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { password?: string } | null;
    const password = body?.password;

    if (typeof password !== "string" || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true, token: ADMIN_TOKEN });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
