import { AccountShell } from '@/components/account/AccountShell';
import { getCurrentUser } from '@/lib/auth/currentUser';

export const metadata = { title: 'Account — mobileDrive' };
export const dynamic = 'force-dynamic';

const ROLE_SUBTITLE: Record<string, string> = {
  admin: 'Admin',
  dealer: 'Dealer',
  customer: 'Member',
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  const shellUser = user
    ? {
        initials: user.initials,
        displayName: user.fullName ?? user.email ?? 'Account',
        subtitle: ROLE_SUBTITLE[user.role] ?? 'Member',
      }
    : {
        initials: 'G',
        displayName: 'Guest',
        subtitle: 'Not signed in',
      };

  return <AccountShell user={shellUser}>{children}</AccountShell>;
}
