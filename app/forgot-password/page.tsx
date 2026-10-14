import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata = { title: 'Reset password — mobileDrive' };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      headline="Welcome back."
      description="Enter your email and we'll send you a secure link to set a new password."
    >
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
        We&apos;ll send you a link that expires in 1 hour. The link opens a secure page
        where you can choose a new password.
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
    </AuthLayout>
  );
}
