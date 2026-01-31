
export type UserRole = 'main' | 'regular';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export interface FuelRecord {
  id: string;
  userId: string; // Linked to a user
  date: string;
  startOdometer: number;
  endOdometer: number;
  pricePerLiter: number;
  dailyPrice: number;
}

export interface RefuelRecord {
  id: string;
  userId: string; // Linked to a user
  date: string;
  amount: number;
  liters?: number;
}

export interface Statistics {
  totalDistance: number;
  totalCost: number;
  averageDailyPrice: number;
  tripsCount: number;
  totalRefuelAmount: number;
}
