import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata = { title: 'Reset password — mobileDrive' };

export default function ForgotPasswordPage() {
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
            Welcome back.
          </h2>
          <p className="mt-6 max-w-md text-base text-ink-100 leading-relaxed">
            Enter your email and we'll send you a secure link to set a new password.
          </p>
        </div>
      </aside>

      {/* Right form pane */}
      <main className="flex items-center justify-center px-6 py-16 lg:px-16">
        <div className="w-full max-w-md">
          <Link
            href="/sign-in"
            className="mb-6 inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>

          <div className="eyebrow mb-3">Forgot password</div>
          <h1 className="font-display text-4xl font-semibold -tracking-[0.025em] text-white">
            Reset password
          </h1>
          <p className="mt-2 text-sm text-ink-100">
            We'll send you a link that expires in 1 hour. The link opens a secure page where
            you can choose a new password.
          </p>

          <div className="mt-8">
            <ForgotPasswordForm />
          </div>

          <p className="mt-6 text-xs text-ink-200">
            Still having trouble?{' '}
            <a href="mailto:support@mobiledrive.app" className="text-white underline">
              Contact support
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
