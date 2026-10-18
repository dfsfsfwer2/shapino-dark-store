import type { OrderStatus } from "./types";

/** Persian labels + badge styles for order statuses (dark zinc/amber palette only).
 *  Every class is duplicated with a `dark:` variant because the app is permanently
 *  dark and shadcn defaults ship higher-specificity `dark:` classes. */
export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "در انتظار",
    className:
      "bg-amber-500/15 text-amber-400 border border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
  },
  processing: {
    label: "در حال پردازش",
    className:
      "bg-zinc-500/15 text-zinc-200 border border-zinc-500/30 dark:bg-zinc-500/15 dark:text-zinc-200 dark:border-zinc-500/30",
  },
  shipped: {
    label: "ارسال شده",
    className:
      "bg-amber-500/25 text-amber-300 border border-amber-400/40 dark:bg-amber-500/25 dark:text-amber-300 dark:border-amber-400/40",
  },
  delivered: {
    label: "تحویل شده",
    className:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
  },
  cancelled: {
    label: "لغو شده",
    className:
      "bg-red-500/15 text-red-400 border border-red-500/30 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30",
  },
};

export const ORDER_STATUS_KEYS: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function orderStatusMeta(status: string) {
  return (
    ORDER_STATUS_META[status as OrderStatus] ?? {
      label: status,
      className: "bg-zinc-500/15 text-zinc-300 border border-zinc-500/30",
    }
  );
}
