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
