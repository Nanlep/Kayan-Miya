
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

export type OrderStatus = 'pending' | 'dispatched' | 'shipped' | 'arrived' | 'delivered';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  customerName: string;
  paymentMethod: 'card' | 'bani';
  logistics?: {
    dispatchedAt?: string;
    arrivedAt?: string;
    estimatedDelivery?: string;
    lastLocation?: string;
  };
}

export interface AnalyticsData {
  date: string;
  sales: number;
  orders: number;
}

export type View = 'shop' | 'admin' | 'checkout' | 'product-detail' | 'track-order';
