import { NextResponse } from 'next/server';
import { listVehiclesWithHeroes } from '@/lib/vehicles/server-data';

// Runtime env diagnostic — tells us whether Vercel's serverless function
// can see the Supabase env vars and whether the hero overlay actually
// returns hero URLs. TEMPORARY: remove once we've confirmed the pipeline
// works end to end.
export const dynamic = 'force-dynamic';

export async function GET() {
  const vehicles = await listVehiclesWithHeroes();
  return NextResponse.json({
    envPresent: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    },
    vehicleCount: vehicles.length,
    firstThreeHeroes: vehicles.slice(0, 3).map((v) => ({
      id: v.id,
      hero: v.heroImageUrl ? v.heroImageUrl.slice(0, 80) + '…' : null,
    })),
  });
}
