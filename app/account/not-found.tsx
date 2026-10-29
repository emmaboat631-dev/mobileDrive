import { InShellNotFound } from '@/components/ui/InShellNotFound';

export const metadata = { title: 'Not found — Account · mobileDrive' };

export default function AccountNotFound() {
  return (
    <InShellNotFound
      backLabel="Account overview"
      backHref="/account"
      title="Nothing here."
      description="This page isn't part of your account. Open the sidebar to pick a section."
    />
  );
}
