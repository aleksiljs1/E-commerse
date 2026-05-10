import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  subtotal: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, qty = 1) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          const newQty = Math.min(existing.quantity + qty, item.stock);
          if (newQty === existing.quantity) return;
          set({
            items: get().items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: Math.min(qty, item.stock) }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const item = get().items.find((i) => i.productId === productId);
        const clamped = item ? Math.min(quantity, item.stock) : quantity;
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: clamped } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "premiumvault-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
