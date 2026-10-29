import { notFound } from 'next/navigation';
import { getVehicleById, listVehicles } from '@/lib/vehicles/data';
import { listVehiclesWithHeroes } from '@/lib/vehicles/server-data';
import { VehicleDetailClient } from './VehicleDetailClient';

export function generateStaticParams() {
  return listVehicles().map((v) => ({ id: v.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const v = getVehicleById(params.id);
  if (!v) return { title: 'Vehicle — mobileDrive' };
  return {
    title: `${v.brand} ${v.model} — mobileDrive`,
    description: v.description,
  };
}

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const vehicles = await listVehiclesWithHeroes();
  const vehicle = vehicles.find((v) => v.id === params.id);
  if (!vehicle) notFound();
  return <VehicleDetailClient vehicle={vehicle} />;
}
