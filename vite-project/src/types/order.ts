import type { Timestamp } from 'firebase/firestore';
import type { CartItem } from './cart';

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface Order {
  id?: string;
  userId: string;
  userEmail: string;
  shippingDetails: ShippingDetails;
  items: CartItem[];
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Cancelled';
  createdAt: Timestamp;
}
