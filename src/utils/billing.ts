import { VehicleRateConfig, VehicleType } from '../types/parking';

export const VEHICLE_RATES: Record<VehicleType, VehicleRateConfig> = {
  Bike: {
    type: 'Bike',
    hourlyRate: 10,
    slotsRequired: 1,
    iconName: 'Bike',
    description: 'Two-wheelers, motorcycles, and scooters',
  },
  Car: {
    type: 'Car',
    hourlyRate: 30,
    slotsRequired: 1,
    iconName: 'Car',
    description: 'Sedans, hatchbacks, SUVs, and compact cars',
  },
  Truck: {
    type: 'Truck',
    hourlyRate: 60,
    slotsRequired: 2,
    iconName: 'Truck',
    description: 'Heavy vehicles, buses, and commercial trucks (2 consecutive bays)',
  },
};

export const MAX_BILLABLE_HOURS = 8; // 8-hour cap rule

export interface BillingCalculation {
  exactHours: number;
  billableHours: number;
  hourlyRate: number;
  isCapped: boolean;
  totalAmount: number;
  durationLabel: string;
}

/**
 * Calculates billing according to ParkEase rules:
 * - Partial hours are rounded UP to next integer (e.g. 2.1h -> 3h, 0.2h -> 1h). Minimum 1 billable hour if duration > 0.
 * - Billable Hours = min(ceil(Duration in hours), 8)
 * - Total Charge = Billable Hours * Hourly Rate
 */
export function calculateParkingBill(
  vehicleType: VehicleType,
  entryTimeIso: string,
  exitTimeIso: string = new Date().toISOString()
): BillingCalculation {
  const entryMs = new Date(entryTimeIso).getTime();
  const exitMs = new Date(exitTimeIso).getTime();
  const elapsedMs = Math.max(0, exitMs - entryMs);

  // Exact hours in floating point
  const exactHours = elapsedMs / (1000 * 60 * 60);

  // Partial hours rounded up to next integer, minimum 1 hour if parked at all
  let rawCeilHours = Math.ceil(exactHours);
  if (rawCeilHours <= 0) {
    rawCeilHours = 1;
  }

  const isCapped = rawCeilHours > MAX_BILLABLE_HOURS;
  const billableHours = Math.min(rawCeilHours, MAX_BILLABLE_HOURS);
  const hourlyRate = VEHICLE_RATES[vehicleType].hourlyRate;
  const totalAmount = billableHours * hourlyRate;

  // Format readable duration label (e.g. "2 hrs 45 mins")
  const totalMinutes = Math.floor(elapsedMs / (1000 * 60));
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  let durationLabel = '';
  if (hrs === 0 && mins === 0) {
    durationLabel = 'Under 1 min';
  } else if (hrs === 0) {
    durationLabel = `${mins} min${mins !== 1 ? 's' : ''}`;
  } else {
    durationLabel = `${hrs} hr${hrs !== 1 ? 's' : ''} ${mins > 0 ? `${mins} min${mins !== 1 ? 's' : ''}` : ''}`.trim();
  }

  return {
    exactHours: Number(exactHours.toFixed(2)),
    billableHours,
    hourlyRate,
    isCapped,
    totalAmount,
    durationLabel,
  };
}

/**
 * Formats a number to Indian Rupee currency format (e.g. ₹1,050)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats ISO date to readable string like "17 Oct 2026, 04:30 PM"
 */
export function formatDisplayDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}
