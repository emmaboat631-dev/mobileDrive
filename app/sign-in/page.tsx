import Link from 'next/link';
import { SignInForm } from './SignInForm';

export const metadata = { title: 'Sign in — mobileDrive' };

export default function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams.next && searchParams.next.startsWith('/') ? searchParams.next : '/account';
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
            Configure.<br />Experience.<br />Drive.
          </h2>
          <p className="mt-6 max-w-md text-base text-ink-100 leading-relaxed">
            Sign in to continue your builds, track orders, and manage your saved configurations.
          </p>
        </div>
        {/* Mini car */}
        <div className="pointer-events-none absolute inset-x-0 bottom-20 flex justify-center">
          <svg viewBox="0 0 500 180" className="w-[500px]" aria-hidden>
            <ellipse cx="250" cy="160" rx="220" ry="10" fill="#000" opacity="0.5" />
            <path
              d="M60,120 L95,70 Q150,50 250,48 Q350,50 405,70 L440,120 Q435,138 410,140 L395,140 Q391,128 378,128 Q365,128 361,140 L139,140 Q135,128 122,128 Q109,128 105,140 L90,140 Q65,138 60,120 Z"
              fill="#0F2341"
            />
            <path
              d="M160,70 Q210,52 250,51 Q290,52 340,70 L330,86 L170,86 Z"
              fill="#0A0C10"
              opacity="0.9"
            />
            <circle cx="105" cy="135" r="18" fill="#0A0B0E" stroke="#3A3F48" strokeWidth="1.5" />
            <circle cx="395" cy="135" r="18" fill="#0A0B0E" stroke="#3A3F48" strokeWidth="1.5" />
          </svg>
        </div>
      </aside>

      {/* Right form pane */}
      <main className="flex items-center justify-center px-6 py-16 lg:px-16">
        <div className="w-full max-w-md">
          <div className="eyebrow mb-3">Welcome back</div>
          <h1 className="font-display text-4xl font-semibold -tracking-[0.025em] text-white">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-ink-100">
            Don't have an account?{' '}
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
        </div>
      </main>
    </div>
  );
}

