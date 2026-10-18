"use client";

import { useState } from "react";
import { Lock, Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_PASSWORD } from "@/lib/admin";
import type { AdminLoginResponse } from "@/lib/types";

interface LoginGateProps {
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export default function LoginGate({ onClose, onSuccess }: LoginGateProps) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("رمز عبور را وارد کنید");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as AdminLoginResponse & { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "رمز عبور اشتباه است");
        return;
      }
      toast.success("خوش آمدید! ورود موفق بود.");
      onSuccess(data.token);
    } catch {
      toast.error("خطا در برقراری ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="بستن پنل مدیریت"
        className="absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
      >
        <X className="h-5 w-5" aria-hidden />
      </button>

      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
            <ShieldCheck className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="text-xl font-extrabold text-zinc-100">پنل مدیریت شاپینو</h1>
          <p className="text-sm text-zinc-500">برای ادامه، رمز عبور را وارد کنید</p>
        </div>

        <div className="relative">
          <Lock
            className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز عبور"
            aria-label="رمز عبور مدیر"
            autoComplete="current-password"
            className="min-h-12 rounded-xl border-zinc-800 bg-zinc-950/70 pe-10 text-zinc-100 focus-visible:ring-amber-400/50 dark:bg-zinc-950/70"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="mt-4 min-h-12 w-full rounded-xl bg-amber-500 font-bold text-zinc-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              در حال بررسی...
            </>
          ) : (
            "ورود به پنل"
          )}
        </Button>

        <p className="mt-4 text-center text-xs text-zinc-500">
          رمز پیش‌فرض: <span dir="ltr" className="font-mono text-zinc-400">{ADMIN_PASSWORD}</span>
        </p>
      </form>
    </div>
  );
}
