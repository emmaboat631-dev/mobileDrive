import { DealerShell } from '@/components/dealer/DealerShell';

export const metadata = { title: 'Dealer — mobileDrive' };

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  return <DealerShell>{children}</DealerShell>;
}
