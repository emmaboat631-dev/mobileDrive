import Link from 'next/link';
import { SignInForm } from './SignInForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata = { title: 'Sign in — mobileDrive' };

export default function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next =
    searchParams.next && searchParams.next.startsWith('/') ? searchParams.next : '/account';

  return (
    <AuthLayout
      headline={
        <>
          Configure.<br />
          Experience.<br />
          Drive.
        </>
      }
      description="Sign in to continue your builds, track orders, and manage your saved configurations."
    >
      <div className="eyebrow mb-3">Welcome back</div>
      <h1 className="font-display text-4xl font-semibold -tracking-[0.025em] text-white">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-ink-100">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-medium text-white underline">
          Create one.
        </Link>
      </p>

      <div className="mt-8">
        <SignInForm next={next} />
      </div>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="eyebrow">Or continue with</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          ['Google', 'G'],
          ['Apple', ''],
          ['GitHub', '●'],
        ].map(([name, glyph]) => (
          <button
            key={name}
            type="button"
            className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-white/15 text-sm font-medium text-white hover:bg-white/5"
          >
            <span>{glyph}</span>
            {name}
          </button>
        ))}
      </div>
    </AuthLayout>
  );
}
