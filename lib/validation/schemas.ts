import { z } from 'zod';

/**
 * Central Zod schemas used by server actions. Each action validates its input
 * against one of these, so bad data is rejected at the boundary before it
 * reaches the database. Keep rules in sync with the Postgres CHECK constraints
 * in `supabase/migrations/*.sql`.
 */

export const currencyEnum = z.enum(['USD', 'GHS', 'EUR']);
export const bodyTypeEnum = z.enum(['Coupe', 'Sedan', 'SUV', 'Sports', 'Electric', 'Hybrid', 'Luxury', 'Pickup']);
export const fuelTypeEnum = z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']);
export const transmissionEnum = z.enum(['Automatic', 'DCT', 'Manual']);
export const driveTypeEnum = z.enum(['RWD', 'FWD', 'AWD']);

const slug = z
  .string()
  .trim()
  .min(2, 'Slug is too short.')
  .max(80, 'Slug is too long.')
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens.');

export const vehicleSchema = z.object({
  id: slug,
  brand: z.string().trim().min(1, 'Brand is required.').max(80),
  model: z.string().trim().min(1, 'Model is required.').max(120),
  year: z.coerce.number().int().min(1980).max(2100),
  price: z.coerce.number().positive('Base price must be a positive number.'),
  currency: currencyEnum,
  bodyType: bodyTypeEnum,
  fuelType: fuelTypeEnum,
  transmission: transmissionEnum,
  driveType: driveTypeEnum,
  horsepower: z.coerce.number().int().nonnegative(),
  acceleration: z.coerce.number().nonnegative(),
  topSpeed: z.coerce.number().int().nonnegative(),
  rangeKm: z.coerce.number().int().nonnegative().nullable().optional(),
  description: z.string().trim().min(1).max(2000),
  features: z.array(z.string().trim().min(1)).default([]),
  modelPath: z.string().trim().min(1).nullable().optional(),
  heroColorId: z.string().trim().min(1),
});

export type VehicleSchemaInput = z.infer<typeof vehicleSchema>;

const phonePattern = /^\+?[\d\s\-().]{7,20}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

export const bookingSchema = z.object({
  vehicleId: slug,
  date: z.string().regex(datePattern, 'Please pick a valid date.'),
  time: z.string().regex(timePattern, 'Please pick a valid time.'),
  fullName: z.string().trim().min(2, 'Please enter your full name.').max(120),
  phone: z.string().trim().regex(phonePattern, 'Please enter a valid phone number.'),
  notes: z.string().trim().max(500).optional(),
});

export type BookingSchemaInput = z.infer<typeof bookingSchema>;

export const profileSchema = z.object({
  full_name: z.string().trim().max(120).optional(),
  phone: z.string().trim().regex(phonePattern, 'Please enter a valid phone number.').optional(),
  region: z.enum(['US', 'GH', 'EU']).optional(),
  avatar_url: z.string().trim().url().max(500).optional(),
});

export type ProfileSchemaInput = z.infer<typeof profileSchema>;

export const orderItemSchema = z.object({
  vehicleId: slug,
  configuration: z.record(z.string(), z.unknown()),
  unitPrice: z.coerce.number().int().positive(),
  optionsPrice: z.coerce.number().int().nonnegative(),
  lineTotal: z.coerce.number().int().positive(),
});

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Cart is empty.'),
  subtotal: z.coerce.number().int().nonnegative(),
  optionsTotal: z.coerce.number().int().nonnegative(),
  taxes: z.coerce.number().int().nonnegative(),
  grandTotal: z.coerce.number().int().positive(),
  currency: currencyEnum,
  deliveryMethod: z.enum(['door', 'pickup']),
  deliveryAddress: z.object({
    fullName: z.string().trim().min(2).max(120),
    phone: z.string().trim().regex(phonePattern),
    street: z.string().trim().min(2).max(200),
    city: z.string().trim().min(1).max(100),
    region: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().max(20),
  }),
  paymentMethod: z.string().trim().min(1).max(40),
});

export type OrderSchemaInput = z.infer<typeof orderSchema>;

/** Flatten a ZodError's first message for display. */
export function firstZodMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'Invalid input.';
  const path = issue.path.join('.');
  return path ? `${path}: ${issue.message}` : issue.message;
}
