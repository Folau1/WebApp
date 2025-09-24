import axios, { AxiosError } from 'axios';
import type { 
  AdminUser,
  LoginResponse,
  Category,
  Product,
  Discount,
  Order,
  Stats,
  PaginationInfo,
  PresignUrlResponse,
  Media
} from '../types/api';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error: string; details?: any }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>('/auth/admin/login', { email, password });
    localStorage.setItem('adminToken', data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  }
};

export const statsApi = {
  getDashboard: async () => {
    const { data } = await api.get<{ stats: Stats }>('/admin/stats');
    return data.stats;
  }
};

export const categoriesApi = {
  getAll: async () => {
    const { data } = await api.get<{ categories: Category[] }>('/admin/categories');
    return data.categories;
  },

  create: async (input: { name: string; slug: string; parentId?: string }) => {
    const { data } = await api.post<{ category: Category }>('/admin/categories', input);
    return data.category;
  },

  update: async (id: string, input: Partial<{ name: string; slug: string; parentId?: string }>) => {
    const { data } = await api.put<{ category: Category }>(`/admin/categories/${id}`, input);
    return data.category;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/categories/${id}`);
  }
};

export const productsApi = {
  getAll: async () => {
    const { data } = await api.get<{ products: Product[] }>('/admin/products');
    return data.products;
  },

  create: async (input: {
    title: string;
    slug: string;
    description?: string;
    price: number;
    compareAt?: number;
    categoryId: string;
    active?: boolean;
  }) => {
    const { data } = await api.post<{ product: Product }>('/admin/products', input);
    return data.product;
  },

  update: async (id: string, input: Partial<{
    title: string;
    slug: string;
    description?: string;
    price: number;
    compareAt?: number;
    categoryId: string;
    active?: boolean;
  }>) => {
    const { data } = await api.put<{ product: Product }>(`/admin/products/${id}`, input);
    return data.product;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/products/${id}`);
  }
};

export const mediaApi = {
  getPresignUrl: async (filename: string, contentType: string, kind: 'IMAGE' | 'VIDEO') => {
    const { data } = await api.post<PresignUrlResponse>('/media/presign', {
      filename,
      contentType,
      kind
    });
    return data;
  },

  uploadFile: async (uploadUrl: string, file: File) => {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      }
    });
  },

  create: async (productId: string, url: string, kind: 'IMAGE' | 'VIDEO', order: number = 0) => {
    const { data } = await api.post<{ media: Media }>('/admin/media', {
      productId,
      url,
      kind,
      order
    });
    return data.media;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/media/${id}`);
  },

  reorder: async (mediaIds: string[]) => {
    await api.put('/admin/media/reorder', { mediaIds });
  }
};

export const discountsApi = {
  getAll: async () => {
    const { data } = await api.get<{ discounts: Discount[] }>('/admin/discounts');
    return data.discounts;
  },

  create: async (input: {
    code?: string;
    type: 'PERCENT' | 'FIXED';
    value: number;
    startsAt?: Date;
    endsAt?: Date;
    active?: boolean;
    productIds?: string[];
    categoryIds?: string[];
  }) => {
    const { data } = await api.post<{ discount: Discount }>('/admin/discounts', input);
    return data.discount;
  },

  update: async (id: string, input: Partial<{
    code?: string;
    type: 'PERCENT' | 'FIXED';
    value: number;
    startsAt?: Date;
    endsAt?: Date;
    active?: boolean;
    productIds?: string[];
    categoryIds?: string[];
  }>) => {
    const { data } = await api.put<{ discount: Discount }>(`/admin/discounts/${id}`, input);
    return data.discount;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/discounts/${id}`);
  }
};

export const ordersApi = {
  getAll: async (params?: {
    status?: 'PENDING' | 'PAID' | 'CANCELED' | 'FULFILLED';
    userId?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get<{
      orders: Order[];
      pagination: PaginationInfo;
    }>('/admin/orders', { params });
    return data;
  },

  updateStatus: async (id: string, status: 'PENDING' | 'PAID' | 'CANCELED' | 'FULFILLED') => {
    const { data } = await api.put<{ order: Order }>(`/admin/orders/${id}/status`, { status });
    return data.order;
  }
};







