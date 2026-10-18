"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, ProductWithCategory } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Main shop store: cart (persisted) + UI state (not persisted)        */
/* ------------------------------------------------------------------ */

interface ShopState {
  // Persisted cart
  cart: CartItem[];
  addToCart: (product: ProductWithCategory | CartItem, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clearCart: () => void;

  // UI state
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  selectedProductId: number | null;
  setSelectedProductId: (id: number | null) => void;
  adminOpen: boolean;
  setAdminOpen: (open: boolean) => void;

  // Catalog filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string; // "all" or category slug
  setSelectedCategory: (slug: string) => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],

      addToCart: (product, qty = 1) =>
        set((state) => {
          const existing = state.cart.find(
            (item) => item.productId === product.id
          );
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.productId === product.id
                  ? { ...item, qty: item.qty + qty }
                  : item
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                qty,
              },
            ],
          };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.productId !== productId),
        })),

      setQty: (productId, qty) =>
        set((state) => ({
          cart:
            qty <= 0
              ? state.cart.filter((item) => item.productId !== productId)
              : state.cart.map((item) =>
                  item.productId === productId ? { ...item, qty } : item
                ),
        })),

      clearCart: () => set({ cart: [] }),

      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),

      selectedProductId: null,
      setSelectedProductId: (id) => set({ selectedProductId: id }),

      adminOpen: false,
      setAdminOpen: (open) => set({ adminOpen: open }),

      searchQuery: "",
      setSearchQuery: (q) => set({ searchQuery: q }),

      selectedCategory: "all",
      setSelectedCategory: (slug) => set({ selectedCategory: slug }),
    }),
    {
      name: "shapino-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

/* ------------------------------------------------------------------ */
/* Admin auth store (persisted separately)                             */
/* ------------------------------------------------------------------ */

interface AdminState {
  adminAuthed: boolean;
  setAdminAuthed: (authed: boolean) => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      adminAuthed: false,
      setAdminAuthed: (authed) => set({ adminAuthed: authed }),
      adminToken: null,
      setAdminToken: (token) => set({ adminToken: token }),
    }),
    {
      name: "shapino-admin",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */

export function cartTotalQty(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

export function cartSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}
