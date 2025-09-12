import axios, { AxiosError } from 'axios';
import type { 
  User, 
  Category, 
  Product, 
  Order, 
  Discount,
  CreateOrderInput,
  CreatePaymentResponse,
  PaginationInfo
} from '../types/api';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add Telegram init data to requests
api.interceptors.request.use((config) => {
  if (window.Telegram?.WebApp?.initData) {
    config.headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: string; details?: any }>) => {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
);

export const authApi = {
  validateTelegram: async () => {
    const { data } = await api.post<{ user: User }>('/auth/telegram/validate', {
      initData: window.Telegram?.WebApp?.initData
    });
    return data.user;
  }
};

export const catalogApi = {
  getCategories: async () => {
    const { data } = await api.get<{ categories: Category[] }>('/catalog/categories');
    return data.categories;
  },

  getProducts: async (params?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
    sort?: 'price_asc' | 'price_desc' | 'created_desc' | 'created_asc';
  }) => {
    const { data } = await api.get<{
      products: Product[];
      pagination: PaginationInfo;
    }>('/catalog/products', { params });
    return data;
  },

  getProduct: async (slug: string) => {
    const { data } = await api.get<{ product: Product }>(`/catalog/products/${slug}`);
    return data.product;
  }
};

export const discountApi = {
  validate: async (code: string) => {
    const { data } = await api.post<{ discount: Discount }>('/discounts/validate', { code });
    return data.discount;
  }
};

export const orderApi = {
  create: async (input: CreateOrderInput) => {
    const { data } = await api.post<{ order: Order }>('/orders', input);
    return data.order;
  },

  getMyOrders: async () => {
    const { data } = await api.get<{ orders: Order[] }>('/orders/my');
    return data.orders;
  },

  getOrder: async (id: string) => {
    const { data } = await api.get<{ order: Order }>(`/orders/${id}`);
    return data.order;
  }
};

export const paymentApi = {
  createPayment: async (orderId: string) => {
    const { data } = await api.post<CreatePaymentResponse>('/payments/yookassa/create', {
      orderId
    });
    return data;
  },

  checkStatus: async (paymentId: string) => {
    const { data } = await api.get<{
      status: string;
      paid: boolean;
      orderId: string;
      orderStatus: string;
    }>(`/payments/yookassa/status/${paymentId}`);
    return data;
  }
};
