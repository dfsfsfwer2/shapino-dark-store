/** Shared TypeScript types for شاپینو store & API. */

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryWithCount extends Category {
  _count: {
    products: number;
  };
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  image: string;
  stock: number;
  rating: number;
  featured: boolean;
  categoryId: number;
  createdAt: string;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  note: string | null;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/* ---------- API request/response shapes ---------- */

export type ProductSort = "newest" | "price-asc" | "price-desc" | "rating";

export interface ProductsResponse {
  products: ProductWithCategory[];
}

export interface CategoriesResponse {
  categories: CategoryWithCount[];
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  image: string;
  stock: number;
  rating: number;
  categoryId: number;
  featured: boolean;
}

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  items: Array<{ productId: number; qty: number }>;
}

export interface CreateOrderResponse {
  order: OrderWithItems;
}

export interface RevenueDay {
  /** کلید روز به‌صورت yyyy-mm-dd */
  key: string;
  /** برچسب فارسی روز هفته */
  label: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productName: string;
  qty: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  image: string;
  stock: number;
}

export type OrderStatusCount = {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
};

export interface AdminStatsResponse {
  revenue: number;
  ordersCount: number;
  productsCount: number;
  pendingCount: number;
  latestOrders: OrderWithItems[];
  statusCounts: OrderStatusCount;
  revenueByDay: RevenueDay[];
  topProducts: TopProduct[];
  lowStock: LowStockProduct[];
}

export interface AdminLoginResponse {
  ok: boolean;
  token: string;
}

export interface ApiError {
  error: string;
}
