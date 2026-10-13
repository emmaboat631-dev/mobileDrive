import Link from 'next/link';
import { SignUpForm } from './SignUpForm';

export const metadata = { title: 'Create account — mobileDrive' };

export default function SignUpPage() {
  return (
    <div className="fixed inset-0 z-50 grid min-h-screen grid-cols-1 overflow-y-auto bg-ink-900 lg:grid-cols-2">
      {/* Left visual pane */}
      <aside className="relative hidden overflow-hidden lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #0F1E37 0%, #07080A 60%, #07080A 100%)',
          }}
        />
        <div
          className="absolute -left-24 top-24 h-[700px] w-[900px] rounded-full opacity-70"
          style={{
            background:
              'radial-gradient(50% 50% at 50% 50%, rgba(60,90,150,0.3), transparent 70%)',
          }}
          aria-hidden
        />
        <Link href="/" className="relative z-10 flex items-center gap-2.5 px-12 pt-12 text-white">
          <span className="h-[18px] w-[18px] rounded-full bg-white" />
          <span className="font-display text-lg font-semibold">mobileDrive</span>
        </Link>
        <div className="relative z-10 mt-32 px-12">
          <h2 className="max-w-xl font-display text-5xl font-semibold leading-[1.05] -tracking-[0.025em] text-white">
            Join the showroom.
          </h2>
          <p className="mt-6 max-w-md text-base text-ink-100 leading-relaxed">
            Save configurations, track orders, and get specialist support throughout your purchase.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-100">
            {[
              'Unlimited saved builds across devices',
              'Priority access to limited inventory',
              'Direct line to a mobileDrive specialist',
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Right form pane */}
      <main className="flex items-center justify-center px-6 py-16 lg:px-16">
        <div className="w-full max-w-md">
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
        </div>
      </main>
    </div>
  );
}
