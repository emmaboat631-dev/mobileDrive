import { InShellNotFound } from '@/components/ui/InShellNotFound';

export const metadata = { title: 'Not found — Admin · mobileDrive' };

export default function AdminNotFound() {
  return (
    <InShellNotFound
      backLabel="All admin"
      backHref="/admin"
      description="This id doesn't match any order, vehicle, customer or payment in the database. Double-check the URL or head back to the list."
    />
  );
}
