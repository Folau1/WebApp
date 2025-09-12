export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  role: 'USER' | 'ADMIN';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  _count?: {
    products: number;
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
  finalPrice: number;
  discount: {
    amount: number;
    percentage: number;
  } | null;
}

export interface Media {
  id: string;
  productId: string;
  kind: 'IMAGE' | 'VIDEO';
  url: string;
  order: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  qty: number;
}

export interface Discount {
  id: string;
  code: string | null;
  type: 'PERCENT' | 'FIXED';
  value: number;
}

export interface Order {
  id: string;
  number: number;
  userId: string | null;
  items: OrderItem[];
  totalAmount: number;
  discountTotal: number;
  discountId: string | null;
  discount: Discount | null;
  status: 'PENDING' | 'PAID' | 'CANCELED' | 'FULFILLED';
  ykPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  title: string;
  unitPrice: number;
  qty: number;
  subtotal: number;
}

export interface CreateOrderInput {
  items: Array<{
    productId: string;
    qty: number;
  }>;
  discountCode?: string;
}

export interface CreatePaymentResponse {
  paymentId: string;
  confirmationUrl: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
