import type { Metadata } from 'next';
import { WishlistClient } from './WishlistClient';

export const metadata: Metadata = { title: 'Wishlist — mobileDrive' };

export default function WishlistPage() {
  return <WishlistClient />;
}
