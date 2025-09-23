import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Product, CartItem, Discount } from '../types/api';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;

  // Discount
  discount: Discount | null;
  setDiscount: (discount: Discount | null) => void;

  // UI
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Cart
      cart: [],
      addToCart: (product) => {
        set((state) => {
          const existingItem = state.cart.find(item => item.productId === product.id);
          
          if (existingItem) {
            // Проверяем, не превышает ли новое количество доступный запас
            const newQty = existingItem.qty + 1;
            if (newQty > product.stock) {
              // Не добавляем, если превышаем запас
              return state;
            }
            
            return {
              cart: state.cart.map(item =>
                item.productId === product.id
                  ? { ...item, qty: newQty }
                  : item
              )
            };
          }
          
          // Проверяем, есть ли товар в наличии
          if (product.stock <= 0) {
            return state;
          }
          
          return {
            cart: [...state.cart, {
              productId: product.id,
              product,
              qty: 1
            }]
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter(item => item.productId !== productId)
        }));
      },

      updateCartItemQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set((state) => {
          const cartItem = state.cart.find(item => item.productId === productId);
          if (!cartItem) return state;

          // Проверяем, не превышает ли новое количество доступный запас
          if (qty > cartItem.product.stock) {
            // Ограничиваем количество доступным запасом
            qty = cartItem.product.stock;
          }

          return {
            cart: state.cart.map(item =>
              item.productId === productId
                ? { ...item, qty }
                : item
            )
          };
        });
      },

      clearCart: () => set({ cart: [], discount: null }),

      getCartTotal: () => {
        const state = get();
        const subtotal = state.cart.reduce((sum, item) => {
          return sum + (item.product.finalPrice * item.qty);
        }, 0);

        if (!state.discount) {
          return subtotal;
        }

        let discountAmount = 0;
        if (state.discount.type === 'PERCENT') {
          discountAmount = Math.floor(subtotal * state.discount.value / 100);
        } else {
          discountAmount = Math.min(state.discount.value, subtotal);
        }

        return Math.max(0, subtotal - discountAmount);
      },

      getCartItemsCount: () => {
        return get().cart.reduce((count, item) => count + item.qty, 0);
      },

      // Discount
      discount: null,
      setDiscount: (discount) => set({ discount }),

      // UI
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'tg-shop-storage',
      partialize: (state) => ({
        cart: state.cart,
        discount: state.discount
      })
    }
  )
);

