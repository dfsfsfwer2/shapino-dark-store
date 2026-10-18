"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cartSubtotal, useShopStore } from "@/store/useShopStore";
import { formatToman, toFaDigits } from "@/lib/format";
import type { CreateOrderResponse } from "@/lib/types";

const checkoutSchema = z.object({
  customerName: z.string().min(3, "نام باید حداقل ۳ حرف باشد"),
  phone: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (نمونه: 09123456789)"),
  address: z.string().min(10, "آدرس را کامل‌تر وارد کنید (حداقل ۱۰ حرف)"),
  note: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const cart = useShopStore((s) => s.cart);
  const clearCart = useShopStore((s) => s.clearCart);

  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{
    id: number;
    total: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { customerName: "", phone: "", address: "", note: "" },
  });

  // Reset everything whenever the dialog is (re)opened or closed.
  useEffect(() => {
    if (open) {
      setSuccessOrder(null);
      reset({ customerName: "", phone: "", address: "", note: "" });
    }
  }, [open, reset]);

  const subtotal = cartSubtotal(cart);

  const onSubmit = async (values: CheckoutForm) => {
    if (cart.length === 0) {
      toast.error("سبد خرید خالی است");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: values.customerName,
          phone: values.phone,
          address: values.address,
          note: values.note?.trim() ? values.note.trim() : undefined,
          items: cart.map((item) => ({ productId: item.productId, qty: item.qty })),
        }),
      });
      const data = (await res.json()) as CreateOrderResponse & { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "خطا در ثبت سفارش");
        return;
      }
      setSuccessOrder({ id: data.order.id, total: data.order.total });
      clearCart();
      toast.success("سفارش شما با موفقیت ثبت شد");
    } catch {
      toast.error("خطا در برقراری ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-zinc-800 bg-zinc-900 text-zinc-100 sm:rounded-2xl">
        {successOrder ? (
          /* ---------- Success screen ---------- */
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <DialogHeader className="sr-only">
              <DialogTitle>سفارش شما ثبت شد!</DialogTitle>
              <DialogDescription>جزئیات سفارش با موفقیت ثبت شد</DialogDescription>
            </DialogHeader>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-100">
              سفارش شما ثبت شد!
            </h2>
            <p className="text-sm text-zinc-400">
              کد سفارش:{" "}
              <span className="font-bold text-amber-400">
                #{toFaDigits(successOrder.id)}
              </span>
            </p>
            <p className="text-sm text-zinc-400">
              مبلغ کل:{" "}
              <span className="font-bold text-zinc-100">
                {formatToman(successOrder.total)}
              </span>
            </p>
            <p className="max-w-xs text-xs leading-relaxed text-zinc-500">
              جزئیات سفارش برای پیگیری ثبت شد. به‌زودی با شما تماس می‌گیریم.
            </p>
            <Button
              size="lg"
              onClick={() => onOpenChange(false)}
              className="mt-2 min-h-12 w-full rounded-xl bg-amber-500 font-bold text-zinc-950 hover:bg-amber-400"
            >
              بازگشت به فروشگاه
            </Button>
          </div>
        ) : (
          /* ---------- Checkout form ---------- */
          <>
            <DialogHeader>
              <DialogTitle className="text-zinc-100">تسویه حساب</DialogTitle>
              <DialogDescription className="text-sm text-zinc-500">
                اطلاعات ارسال را تکمیل کنید — مجموع: {formatToman(subtotal)}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="customerName" className="text-zinc-300">
                  نام و نام خانوادگی <span className="text-amber-400">*</span>
                </Label>
                <Input
                  id="customerName"
                  placeholder="مثال: علی رضایی"
                  aria-invalid={!!errors.customerName}
                  className="min-h-11 rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 focus-visible:ring-amber-400/50"
                  {...register("customerName")}
                />
                {errors.customerName && (
                  <p className="text-xs text-red-400">{errors.customerName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-zinc-300">
                  شماره موبایل <span className="text-amber-400">*</span>
                </Label>
                <Input
                  id="phone"
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="09123456789"
                  aria-invalid={!!errors.phone}
                  className="min-h-11 rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 text-start focus-visible:ring-amber-400/50"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-xs text-red-400">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-zinc-300">
                  آدرس کامل <span className="text-amber-400">*</span>
                </Label>
                <Textarea
                  id="address"
                  rows={3}
                  placeholder="استان، شهر، خیابان، پلاک و کد پستی"
                  aria-invalid={!!errors.address}
                  className="rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 focus-visible:ring-amber-400/50"
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-xs text-red-400">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note" className="text-zinc-300">
                  یادداشت <span className="text-zinc-500">(اختیاری)</span>
                </Label>
                <Input
                  id="note"
                  placeholder="مثلاً: بعد از ساعت ۱۷ تماس بگیرید"
                  className="min-h-11 rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 focus-visible:ring-amber-400/50"
                  {...register("note")}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="min-h-12 w-full rounded-xl bg-amber-500 text-base font-bold text-zinc-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    در حال ثبت سفارش...
                  </>
                ) : (
                  "ثبت نهایی سفارش"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
