import type { Metadata } from 'next';
import { CartClient } from './CartClient';

export const metadata: Metadata = { title: 'Cart — mobileDrive' };

export default function CartPage() {
  return <CartClient />;
}
