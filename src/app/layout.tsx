import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "شاپینو | فروشگاه آنلاین مدرن",
  description:
    "شاپینو — فروشگاه آنلاین مدرن با بهترین محصولات دیجیتال، لوازم جانبی، مد و استایل و خانه و آشپزخانه. خریدی لوکس با ارسال سریع و ضمانت اصالت کالا.",
  keywords: ["شاپینو", "فروشگاه آنلاین", "خرید اینترنتی", "e-commerce", "تومان"],
  openGraph: {
    title: "شاپینو | فروشگاه آنلاین مدرن",
    description: "خرید آنلاین، تجربه‌ای لوکس — ارسال سریع و ضمانت اصالت کالا.",
    siteName: "شاپینو",
    type: "website",
    locale: "fa_IR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="dark" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster richColors position="top-center" theme="dark" />
      </body>
    </html>
  );
}
