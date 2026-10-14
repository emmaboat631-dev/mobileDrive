import Link from 'next/link';
import { SignUpForm } from './SignUpForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata = { title: 'Create account — mobileDrive' };

const BENEFITS = [
  'Unlimited saved builds across devices',
  'Priority access to limited inventory',
  'Direct line to a mobileDrive specialist',
];

export default function SignUpPage() {
  return (
    <AuthLayout
      headline="Join the showroom."
      description="Save configurations, track orders, and get specialist support throughout your purchase."
      aside={
        <ul className="space-y-3 text-sm text-ink-100">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {b}
            </li>
          ))}
        </ul>
      }
    >
      <div className="eyebrow mb-3">Get started</div>
      <h1 className="font-display text-4xl font-semibold -tracking-[0.025em] text-white">
        Create account
      </h1>
      <p className="mt-2 text-sm text-ink-100">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-white underline">
          Sign in.
        </Link>
      </p>

      <div className="mt-8">
        <SignUpForm />
      </div>
    </AuthLayout>
  );
}
