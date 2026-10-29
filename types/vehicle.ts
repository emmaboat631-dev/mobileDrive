export type BodyType =
  | 'SUV'
  | 'Sedan'
  | 'Coupe'
  | 'Sports'
  | 'Electric'
  | 'Luxury'
  | 'Pickup';

export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
export type Transmission = 'Automatic' | 'Manual' | 'DCT';
export type DriveType = 'RWD' | 'FWD' | 'AWD';

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  finish: 'metallic' | 'solid' | 'pearl' | 'matte';
  priceDelta: number;
}

export interface WheelOption {
  id: string;
  name: string;
  style: 'performance' | 'sport' | 'carbon' | 'luxury';
  priceDelta: number;
}

export interface InteriorOption {
  id: string;
  name: string;
  seatHex: string;
  trimHex: string;
  priceDelta: number;
}

export interface PackageOption {
  id: string;
  name: string;
  description: string;
  priceDelta: number;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  currency: 'USD' | 'GHS' | 'EUR';
  bodyType: BodyType;
  fuelType: FuelType;
  transmission: Transmission;
  driveType: DriveType;
  horsepower: number;
  acceleration: number;
  topSpeed: number;
  rangeKm?: number;
  description: string;
  features: string[];
  images: string[];
  heroImageUrl?: string;
  modelPath?: string;
  /** Which paint from `availableColors` represents this vehicle in cards, compare and marketing. */
  heroColorId: string;
  availableColors: ColorOption[];
  availableWheels: WheelOption[];
  availableInteriors: InteriorOption[];
  availablePackages: PackageOption[];
}

export interface VehicleConfiguration {
  vehicleId: string;
  colorId: string;
  wheelId: string;
  interiorId: string;
  packageIds: string[];
}
