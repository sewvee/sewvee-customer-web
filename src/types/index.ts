// ─── Core Entity Types ────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: 'Customer';
  lastLogin?: string;
}

export interface AuthToken {
  token: string;
  expiresAt?: string;
}

// ─── Order Types ─────────────────────────────────────────────────────────────

export interface OrderCustomer {
  id?: string;
  name?: string;
  mobile?: string;
  mobile_number?: string;
  whatsappNumber?: string;
  email?: string;
}

export interface OrderPhoto {
  id: string;
  url: string;
  category?: string; // 'REFERENCE' | 'PROGRESS' | 'FINAL'
  date?: string;
}

export interface OrderOutfit {
  id: string;
  name?: string;
  type?: string;
  requestedPhotosFromClient?: boolean;
  photos?: OrderPhoto[];
}

export interface Order {
  id: string;
  billNo?: string;
  date?: string;
  createdAt?: string;
  status: string;
  customerName?: string;
  customerId?: string;
  customerMobile?: string;
  customer?: OrderCustomer;
  outfits?: OrderOutfit[];
  items?: OrderOutfit[];
  order_type?: string;
  source?: string;
  totalAmount?: number;
  advanceAmount?: number;
  boutiqueId?: string;
  boutiqueName?: string;
  companyPhone?: string;
  companyAddress?: string;
  deliveryDate?: string;
  note?: string;
  address?: {
    line_1?: string;
    line_2?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

// ─── Shop / Product Types ─────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  price: number;
  stock?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  category?: string;
  variants?: ProductVariant[];
  companyId?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export interface Boutique {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

// ─── Gallery Types ────────────────────────────────────────────────────────────

export interface GalleryImage {
  id: string;
  url: string;
  name?: string;
  date: string;
}

export interface GalleryFolder {
  id: string;
  name: string;
  images: GalleryImage[];
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
