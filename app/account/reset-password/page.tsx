import { AuthLayout } from '@/components/auth/AuthLayout';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata = { title: 'Set a new password · mobileDrive' };
export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      headline="Pick something strong."
      description="You're updating the password on your mobileDrive account. You'll stay signed in once this is set."
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold text-white">Set a new password</h1>
          <p className="text-sm text-ink-200">
            Choose a password at least 8 characters long.
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </AuthLayout>
  );
}
