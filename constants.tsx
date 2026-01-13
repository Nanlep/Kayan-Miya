
import { Product, AnalyticsData } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Fresh Jos Tomatoes (Large Basket)',
    description: 'Freshly harvested firm tomatoes from the local plains of Jos. Perfect for rich stews and pastes.',
    price: 18500.00,
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    stock: 15,
    tags: ['fresh', 'stew', 'bulk']
  },
  {
    id: '2',
    name: 'Aged Local Beef (5kg Cut)',
    description: 'Premium grass-fed beef, slaughtered under strict hygienic conditions. Tender and rich in flavor.',
    price: 24500.00,
    category: 'Meats',
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    stock: 20,
    tags: ['protein', 'halal', 'fresh']
  },
  {
    id: '3',
    name: 'Local Stone-free Rice (50kg Bag)',
    description: 'High-quality parboiled local rice, meticulously de-stoned. Swells beautifully when cooked.',
    price: 72000.00,
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    rating: 4.7,
    stock: 50,
    tags: ['staple', 'bulk', 'rice']
  },
  {
    id: '4',
    name: 'Fresh Habanero Peppers (Atarodo)',
    description: 'Extra spicy, farm-fresh red peppers. Essential for that signature local heat.',
    price: 4500.00,
    category: 'Spices',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    stock: 30,
    tags: ['spicy', 'essential']
  },
  {
    id: '5',
    name: 'Golden Palm Oil (5 Liters)',
    description: 'Pure, unadulterated palm oil sourced from the best local refineries. Rich in Vitamin A.',
    price: 8500.00,
    category: 'Oils',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=800',
    rating: 4.6,
    stock: 25,
    tags: ['cooking', 'oil', 'traditional']
  },
  {
    id: '6',
    name: 'Whole Hard Chicken (Local)',
    description: 'Grown locally and processed fresh. Tougher meat preferred for traditional long-cook soups.',
    price: 6500.00,
    category: 'Meats',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    stock: 12,
    tags: ['poultry', 'traditional']
  }
];

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { date: 'Mon', sales: 42000, orders: 45 },
  { date: 'Tue', sales: 38000, orders: 32 },
  { date: 'Wed', sales: 51000, orders: 58 },
  { date: 'Thu', sales: 49000, orders: 46 },
  { date: 'Fri', sales: 72000, orders: 75 },
  { date: 'Sat', sales: 125000, orders: 110 },
  { date: 'Sun', sales: 91000, orders: 80 },
];
