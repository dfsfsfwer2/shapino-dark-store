"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRating, formatToman, toFaDigits } from "@/lib/format";
import type {
  CategoriesResponse,
  CategoryWithCount,
  ProductWithCategory,
  ProductsResponse,
} from "@/lib/types";

const adminHeaders = (token: string): HeadersInit => ({ "x-admin-token": token });

interface FormState {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  stock: string;
  rating: string;
  image: string;
  categoryId: string;
  featured: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  stock: "10",
  rating: "4.5",
  image: "/images/products/p1.png",
  categoryId: "",
  featured: false,
};

export default function AdminProducts({ token }: { token: string }) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState<ProductWithCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products?sort=newest"),
        fetch("/api/categories"),
      ]);
      const productsData = (await productsRes.json()) as ProductsResponse;
      const categoriesData = (await categoriesRes.json()) as CategoriesResponse;
      setProducts(productsData.products ?? []);
      setCategories(categoriesData.categories ?? []);
    } catch {
      toast.error("خطا در دریافت داده‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0] ? String(categories[0].id) : "" });
    setFormOpen(true);
  };

  const openEdit = (product: ProductWithCategory) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      comparePrice: product.comparePrice != null ? String(product.comparePrice) : "",
      stock: String(product.stock),
      rating: String(product.rating),
      image: product.image,
      categoryId: String(product.categoryId),
      featured: product.featured,
    });
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const stock = Number(form.stock);
    const rating = Number(form.rating);
    const categoryId = Number(form.categoryId);
    const comparePrice =
      form.comparePrice.trim() !== "" ? Number(form.comparePrice) : null;

    if (!form.name.trim() || !form.description.trim()) {
      toast.error("نام و توضیحات محصول الزامی است");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("قیمت باید عددی بزرگ‌تر از صفر باشد");
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      toast.error("موجودی باید عددی بزرگ‌تر یا مساوی صفر باشد");
      return;
    }
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      toast.error("امتیاز باید بین ۰ تا ۵ باشد");
      return;
    }
    if (!categoryId) {
      toast.error("دسته‌بندی را انتخاب کنید");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", ...adminHeaders(token) },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            price,
            comparePrice,
            image: form.image.trim() || "/images/products/p1.png",
            stock,
            rating,
            categoryId,
            featured: form.featured,
          }),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "خطا در ذخیره محصول");
        return;
      }
      toast.success(editingId ? "محصول به‌روزرسانی شد" : "محصول جدید ایجاد شد");
      setFormOpen(false);
      load();
    } catch {
      toast.error("خطا در برقراری ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, {
        method: "DELETE",
        headers: adminHeaders(token),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "خطا در حذف محصول");
        return;
      }
      toast.success(`«${deleteTarget.name}» حذف شد`);
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("خطا در برقراری ارتباط با سرور");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-zinc-200">
          مدیریت محصولات {loading ? "" : `(${toFaDigits(products.length)})`}
        </h3>
        <Button
          onClick={openCreate}
          className="min-h-11 rounded-xl bg-amber-500 font-bold text-zinc-950 hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" aria-hidden />
          افزودن محصول
        </Button>
      </div>

      <div className="scrollbar-thin max-h-[62vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/60">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-zinc-800/70" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            محصولی وجود ندارد.
          </p>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-zinc-900">
              <TableRow className="border-zinc-800/70 hover:bg-transparent">
                <TableHead className="text-zinc-500">تصویر</TableHead>
                <TableHead className="text-zinc-500">نام</TableHead>
                <TableHead className="text-zinc-500">دسته</TableHead>
                <TableHead className="text-zinc-500">قیمت</TableHead>
                <TableHead className="text-zinc-500">امتیاز</TableHead>
                <TableHead className="text-zinc-500">موجودی</TableHead>
                <TableHead className="text-zinc-500">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-zinc-800/70">
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-40">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {product.name}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-400">
                    {product.category.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm font-bold text-amber-400">
                    {formatToman(product.price)}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-300">
                    {formatRating(product.rating)}
                  </TableCell>
                  <TableCell>
                    {product.stock === 0 ? (
                      <span className="text-xs font-bold text-red-400">ناموجود</span>
                    ) : product.stock <= 3 ? (
                      <span className="text-xs font-bold text-amber-400">
                        {toFaDigits(product.stock)}
                      </span>
                    ) : (
                      <span className="text-sm text-zinc-300">
                        {toFaDigits(product.stock)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(product)}
                        aria-label={`ویرایش ${product.name}`}
                        className="h-9 w-9 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-amber-400"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(product)}
                        aria-label={`حذف ${product.name}`}
                        className="h-9 w-9 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-zinc-800 bg-zinc-900 text-zinc-100 sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {editingId ? "ویرایش محصول" : "افزودن محصول جدید"}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              اطلاعات محصول را تکمیل کنید
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={save} className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-name" className="text-zinc-300">نام محصول *</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="مثال: هدفون بی‌سیم پرو مکس"
                className="min-h-11 rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 focus-visible:ring-amber-400/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-desc" className="text-zinc-300">توضیحات *</Label>
              <Textarea
                id="p-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="توضیح کوتاه درباره محصول"
                className="rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 focus-visible:ring-amber-400/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-price" className="text-zinc-300">قیمت (تومان) *</Label>
                <Input
                  id="p-price"
                  type="number"
                  min={1}
                  dir="ltr"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="min-h-11 rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 text-start focus-visible:ring-amber-400/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-compare" className="text-zinc-300">
                  قیمت قبل از تخفیف
                </Label>
                <Input
                  id="p-compare"
                  type="number"
                  min={0}
                  dir="ltr"
                  value={form.comparePrice}
                  onChange={(e) => setForm((f) => ({ ...f, comparePrice: e.target.value }))}
                  placeholder="خالی = بدون تخفیف"
                  className="min-h-11 rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 text-start placeholder:text-zinc-600 focus-visible:ring-amber-400/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-stock" className="text-zinc-300">موجودی *</Label>
                <Input
                  id="p-stock"
                  type="number"
                  min={0}
                  dir="ltr"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  className="min-h-11 rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 text-start focus-visible:ring-amber-400/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-rating" className="text-zinc-300">امتیاز (۰ تا ۵) *</Label>
                <Input
                  id="p-rating"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  dir="ltr"
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                  className="min-h-11 rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 text-start focus-visible:ring-amber-400/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-image" className="text-zinc-300">آدرس تصویر</Label>
              <Input
                id="p-image"
                dir="ltr"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                className="min-h-11 rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 text-start font-mono text-xs focus-visible:ring-amber-400/50"
              />
              <p className="text-[11px] text-zinc-600">
                نمونه: /images/products/p1.png
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-300">دسته‌بندی *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger className="min-h-11 w-full rounded-xl border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 text-zinc-100 focus-visible:ring-amber-400/50">
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={String(cat.id)}
                      className="focus:bg-zinc-800 focus:text-amber-400"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 dark:bg-zinc-950/60 px-4 py-3">
              <Label htmlFor="p-featured" className="text-sm text-zinc-300">
                محصول ویژه (نمایش در صفحه اصلی)
              </Label>
              <Switch
                id="p-featured"
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, featured: checked }))
                }
                className="data-[state=checked]:bg-amber-500"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="submit"
                disabled={saving}
                className="min-h-12 flex-1 rounded-xl bg-amber-500 font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    در حال ذخیره...
                  </>
                ) : editingId ? (
                  "ذخیره تغییرات"
                ) : (
                  "ایجاد محصول"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                className="min-h-12 rounded-xl border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              >
                انصراف
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">حذف محصول</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-zinc-400">
              آیا از حذف «{deleteTarget?.name}» مطمئن هستید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-start gap-2">
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="min-h-11 rounded-xl bg-red-500 font-bold text-zinc-50 hover:bg-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  در حال حذف...
                </>
              ) : (
                "بله، حذف شود"
              )}
            </AlertDialogAction>
            <AlertDialogCancel className="min-h-11 rounded-xl border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
              انصراف
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
