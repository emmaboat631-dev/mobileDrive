import { ImageResponse } from 'next/og';
import { listVehiclesWithHeroes } from '@/lib/vehicles/server-data';

/**
 * Dynamic Open Graph card for every vehicle. When somebody shares a vehicle
 * link on WhatsApp, Twitter, iMessage, Slack, etc., the platform fetches
 * `/vehicles/<id>/opengraph-image` and shows this PNG as a rich preview
 * instead of a plain URL.
 */

export const alt = 'mobileDrive vehicle';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function formatPrice(price: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'GH₵';
  return `${symbol}${price.toLocaleString()}`;
}

export default async function OgImage({ params }: { params: { id: string } }) {
  const list = await listVehiclesWithHeroes();
  const vehicle = list.find((v) => v.id === params.id);
  if (!vehicle) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0E0F13',
            color: '#E7E9EC',
            fontSize: 60,
            fontFamily: 'sans-serif',
          }}
        >
          mobileDrive
        </div>
      ),
      size,
    );
  }

  const heroUrl = vehicle.heroImageUrl;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          background:
            'radial-gradient(120% 85% at 50% 55%, #3a3d44 0%, #22242a 55%, #0f1013 100%)',
          color: '#E7E9EC',
          fontFamily: 'sans-serif',
        }}
      >
        {heroUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroUrl}
            alt=""
            width={1200}
            height={420}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '70%',
              objectFit: 'cover',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(14,15,19,0.65) 70%, rgba(14,15,19,0.98) 100%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 48,
            left: 56,
            right: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          <span style={{ opacity: 0.85 }}>mobileDrive</span>
          <span
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.1)',
              fontSize: 20,
            }}
          >
            {vehicle.bodyType}
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            left: 56,
            right: 56,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 30, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 2, display: 'flex' }}>
            {vehicle.brand} · {vehicle.year}
          </div>
          <div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1, display: 'flex' }}>
            {vehicle.model}
          </div>
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              fontSize: 32,
              opacity: 0.9,
            }}
          >
            <span>{formatPrice(vehicle.price, vehicle.currency)}</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{vehicle.horsepower} HP</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>0–100 in {vehicle.acceleration}s</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
