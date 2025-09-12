export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: Category;
  _count?: {
    products: number;
    children: number;
  };
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  compareAt: number | null;
  categoryId: string;
  category: Category;
  media: Media[];
  active: boolean;
  _count?: {
    orderItems: number;
  };
}

export interface Media {
  id: string;
  productId: string;
  kind: 'IMAGE' | 'VIDEO';
  url: string;
  order: number;
}

export interface Discount {
  id: string;
  code: string | null;
  type: 'PERCENT' | 'FIXED';
  value: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
  products?: DiscountProduct[];
  categories?: DiscountCategory[];
  _count?: {
    products: number;
    categories: number;
    orders: number;
  };
}

export interface DiscountProduct {
  product: Product;
}

export interface DiscountCategory {
  category: Category;
}

export interface Order {
  id: string;
  number: number;
  userId: string | null;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
  };
  items: OrderItem[];
  totalAmount: number;
  discountTotal: number;
  discount?: Discount;
  status: 'PENDING' | 'PAID' | 'CANCELED' | 'FULFILLED';
  ykPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  title: string;
  unitPrice: number;
  qty: number;
  subtotal: number;
}

export interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PresignUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}
