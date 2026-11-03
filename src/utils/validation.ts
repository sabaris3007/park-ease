import { ParkingSlot, VehicleType } from '../types/parking';

export const INDIAN_PLATE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;

export interface PlateValidationResult {
  isValid: boolean;
  normalizedPlate: string;
  errorMessage?: string;
}

/**
 * Normalizes input plate by stripping whitespace, hyphens, and converting to uppercase.
 * Validates against Indian registration plate regex: ^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$
 */
export function validateVehiclePlate(input: string): PlateValidationResult {
  const normalized = input.replace(/[\s-]/g, '').toUpperCase();

  if (!normalized) {
    return {
      isValid: false,
      normalizedPlate: '',
      errorMessage: 'Vehicle number plate is required.',
    };
  }

  if (normalized.length !== 10) {
    return {
      isValid: false,
      normalizedPlate: normalized,
      errorMessage: `Plate number must be exactly 10 characters (State code + RTO + Series + 4 digits, e.g. TN37AB1234). Currently: ${normalized.length}`,
    };
  }

  if (!INDIAN_PLATE_REGEX.test(normalized)) {
    return {
      isValid: false,
      normalizedPlate: normalized,
      errorMessage: 'Invalid format! Expected Indian plate format like TN37AB1234 (2 letters + 2 digits + 2 letters + 4 digits).',
    };
  }

  return {
    isValid: true,
    normalizedPlate: normalized,
  };
}

export interface SlotAllocationResult {
  success: boolean;
  allocatedSlots: number[];
  error?: 'PARKING_FULL' | 'INSUFFICIENT_CONSECUTIVE_SLOTS' | 'UNKNOWN';
  message?: string;
}

/**
 * First-fit slot allocation logic:
 * - Bike & Car: Finds first free slot (1..50)
 * - Truck: Finds first pair of consecutive free slots (e.g. [i, i+1])
 */
export function allocateSlots(
  vehicleType: VehicleType,
  slots: ParkingSlot[]
): SlotAllocationResult {
  // Sort slots by slotNumber ascending
  const sortedSlots = [...slots].sort((a, b) => a.slotNumber - b.slotNumber);
  const occupiedCount = sortedSlots.filter((s) => s.isOccupied).length;

  if (occupiedCount >= sortedSlots.length) {
    return {
      success: false,
      allocatedSlots: [],
      error: 'PARKING_FULL',
      message: `Parking Lot is completely full! No slots available (${sortedSlots.length}/${sortedSlots.length} occupied).`,
    };
  }

  if (vehicleType === 'Bike' || vehicleType === 'Car') {
    const freeSlot = sortedSlots.find((s) => !s.isOccupied);
    if (!freeSlot) {
      return {
        success: false,
        allocatedSlots: [],
        error: 'PARKING_FULL',
        message: 'No available parking slot found.',
      };
    }
    return {
      success: true,
      allocatedSlots: [freeSlot.slotNumber],
    };
  }

  if (vehicleType === 'Truck') {
    // Requires 2 consecutive slots: slot N and slot N+1 both unoccupied
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];

      // Ensure they are strictly consecutive slot numbers
      if (
        next.slotNumber === current.slotNumber + 1 &&
        !current.isOccupied &&
        !next.isOccupied
      ) {
        return {
          success: true,
          allocatedSlots: [current.slotNumber, next.slotNumber],
        };
      }
    }

    // No consecutive pair available
    return {
      success: false,
      allocatedSlots: [],
      error: 'INSUFFICIENT_CONSECUTIVE_SLOTS',
      message:
        'Insufficient space! Trucks require 2 consecutive parking bays side-by-side. Currently available slots are non-adjacent.',
    };
  }

  return {
    success: false,
    allocatedSlots: [],
    error: 'UNKNOWN',
    message: 'Unknown vehicle type.',
  };
}
