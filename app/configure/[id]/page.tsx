import { notFound } from 'next/navigation';
import { getVehicleById, listVehicles } from '@/lib/vehicles/data';
import { ConfigureClient } from './ConfigureClient';

export function generateStaticParams() {
  return listVehicles().map((v) => ({ id: v.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const v = getVehicleById(params.id);
  if (!v) return { title: 'Configure — mobileDrive' };
  return {
    title: `${v.brand} ${v.model} — Configure | mobileDrive`,
    description: v.description,
  };
}

export default function ConfigurePage({ params }: { params: { id: string } }) {
  const vehicle = getVehicleById(params.id);
  if (!vehicle) notFound();
  return <ConfigureClient vehicle={vehicle} />;
}
