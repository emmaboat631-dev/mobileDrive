/**
 * Payment provider abstraction.
 *
 * mobileDrive is designed to run in multiple regions. In Phase 1 we only ship
 * mock implementations, but the surface area is wired so Stripe/Paystack/
 * Mobile Money adapters drop in without changing the checkout UI.
 */

export type PaymentMethodId =
  | 'card'
  | 'mtn-momo'
  | 'telecel-cash'
  | 'airteltigo-money'
  | 'paystack';

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  subtitle: string;
  provider: 'stripe' | 'paystack' | 'mobile-money';
  availableIn: Array<'US' | 'GH' | 'EU'>;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'card',             name: 'Card',          subtitle: 'Visa, Mastercard, Amex', provider: 'stripe',        availableIn: ['US', 'GH', 'EU'] },
  { id: 'mtn-momo',         name: 'MTN MoMo',      subtitle: 'Mobile money',           provider: 'mobile-money',  availableIn: ['GH'] },
  { id: 'telecel-cash',     name: 'Telecel Cash',  subtitle: 'Mobile money',           provider: 'mobile-money',  availableIn: ['GH'] },
  { id: 'airteltigo-money', name: 'AirtelTigo',    subtitle: 'Mobile money',           provider: 'mobile-money',  availableIn: ['GH'] },
  { id: 'paystack',         name: 'Paystack',      subtitle: 'Bank transfer',          provider: 'paystack',      availableIn: ['GH'] },
];

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: 'USD' | 'GHS' | 'EUR';
  status: 'pending' | 'succeeded' | 'failed';
}

export interface PaymentProvider {
  id: 'stripe' | 'paystack' | 'mobile-money';
  createIntent(amount: number, currency: PaymentIntent['currency']): Promise<PaymentIntent>;
}

class MockProvider implements PaymentProvider {
  constructor(public id: PaymentProvider['id']) {}
  async createIntent(amount: number, currency: PaymentIntent['currency']) {
    return {
      id: `mock_${Date.now()}`,
      amount,
      currency,
      status: 'pending' as const,
    };
  }
}

export function getProvider(method: PaymentMethod): PaymentProvider {
  // In Phase 1 every provider is mocked; replace with real adapters later.
  return new MockProvider(method.provider);
}
