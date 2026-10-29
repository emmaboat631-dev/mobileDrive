export function formatPrice(amount: number, currency: 'USD' | 'GHS' | 'EUR' = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDelta(amount: number, currency: 'USD' | 'GHS' | 'EUR' = 'USD') {
  if (amount === 0) return 'Included';
  const sign = amount > 0 ? '+' : '-';
  return `${sign}${formatPrice(Math.abs(amount), currency)}`;
}

/** Human-readable "2h ago" / "Yesterday" / "3 days ago" for timestamps. */
export function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.round(days / 7)} weeks ago`;
  return d.toLocaleDateString();
}
