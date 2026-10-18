/** Persian number/date formatting helpers. */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert any 0-9 digits inside a string/number to Persian digits. */
export function toFaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Format a number as Persian currency: ۸٬۹۰۰٬۰۰۰ تومان */
export function formatToman(n: number): string {
  return `${new Intl.NumberFormat("fa-IR").format(n)} تومان`;
}

/** Format an ISO date string to a medium Persian date + short time. */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

/** Discount percent between price and comparePrice, or null if no discount. */
export function discountPercent(
  price: number,
  comparePrice: number | null | undefined
): number | null {
  if (!comparePrice || comparePrice <= price) return null;
  const percent = Math.round(((comparePrice - price) / comparePrice) * 100);
  return percent > 0 ? percent : null;
}

/** Format a rating like ۴٫۸ (Persian digits with Persian decimal separator). */
export function formatRating(rating: number): string {
  return new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);
}
