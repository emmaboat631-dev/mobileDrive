'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useCart } from '@/store/cartStore';

const NAV_ITEMS = [
  { href: '/vehicles', label: 'Explore' },
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/compare', label: 'Compare' },
  { href: '/deals', label: 'Deals' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const cartItems = useCart((s) => s.items);
  const cartHydrated = useCart((s) => s.hydrated);
  const cartCount = cartHydrated ? cartItems.length : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-colors duration-300',
          scrolled
            ? 'bg-ink-900/70 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <LogoMark />
            <span className="font-display text-base font-semibold tracking-tight">
              mobileDrive
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="btn-ghost h-9 px-4">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              className="btn-ghost h-10 w-10 px-0"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link href="/account" aria-label="Account" className="btn-ghost h-10 w-10 px-0 hidden sm:inline-flex">
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link href="/cart" aria-label={`Cart (${cartCount} items)`} className="btn-ghost relative h-10 w-10 px-0">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-ink-900">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
              className="btn-ghost h-10 w-10 px-0 md:hidden"
            >
              {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-x-0 top-16 z-30 border-b border-white/[0.06] bg-ink-900/95 backdrop-blur-xl md:hidden">
          <nav className="container-page flex flex-col py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="py-3 text-base font-medium text-ink-100 hover:text-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/account"
              className="py-3 text-base font-medium text-ink-100 hover:text-white"
              onClick={() => setOpen(false)}
            >
              Account
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 15.5c0-1 .4-1.9 1.1-2.6l5-5c.7-.7 1.6-1.1 2.6-1.1h.6c1 0 1.9.4 2.6 1.1l5 5c.7.7 1.1 1.6 1.1 2.6V17a2 2 0 0 1-2 2h-1.1a2 2 0 0 1-1.9-1.4l-.3-.9H8l-.3.9A2 2 0 0 1 5.8 19H4.7a2 2 0 0 1-2-2v-1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="15.5" r="1.3" fill="currentColor" />
      <circle cx="16" cy="15.5" r="1.3" fill="currentColor" />
    </svg>
  );
}
