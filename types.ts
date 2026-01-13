
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  stock: number;
  tags: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  date: string;
  customerName: string;
  paymentMethod: 'card' | 'bani';
}

export interface AnalyticsData {
  date: string;
  sales: number;
  orders: number;
}

export type View = 'shop' | 'admin' | 'checkout' | 'product-detail' | 'track-order';
