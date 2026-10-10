export type ProductCategory = 'perfume' | 'jewelry';

export interface ProductVariant {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // in PKR
  description: string;
  images: string[];
  model3dUrl: string;
  variants: ProductVariant[];
  stock: number;
  createdAt?: string;
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role: 'user' | 'admin';
  wishlist: string[];
  createdAt: string;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentMethod: string;
  createdAt: string;
}

