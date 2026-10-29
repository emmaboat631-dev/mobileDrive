'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useCart } from '@/store/cartStore';
import { Lockup } from '@/components/brand/Logo';

const NAV_ITEMS = [
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/compare', label: 'Compare' },
  { href: '/configure/m4-competition', label: 'Configure' },
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
          <Link
            href="/"
            aria-label="mobileDrive — home"
            className="flex items-center text-white"
          >
            <Lockup size="md" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="btn-ghost h-9 px-4">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/vehicles"
              aria-label="Search vehicles"
              className="btn-ghost h-10 w-10 px-0"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
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
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
              className="btn-ghost h-10 w-10 px-0 md:hidden"
            >
              {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 top-16 z-30 border-b border-white/[0.06] bg-ink-900/95 backdrop-blur-xl md:hidden">
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

