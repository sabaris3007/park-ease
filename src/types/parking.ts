export type VehicleType = 'Bike' | 'Car' | 'Truck';

export interface Vehicle {
  type: VehicleType;
  plateNumber: string;
  ownerName: string;
}

export interface ParkingSlot {
  slotNumber: number; // 1 to 50
  isOccupied: boolean;
  occupiedBy?: {
    ticketId: string;
    vehicleType: VehicleType;
    plateNumber: string;
    ownerName: string;
    entryTime: string; // ISO string
    isPrimarySlot?: boolean; // For trucks, primary slot holds the main record
    companionSlot?: number; // For trucks, points to the secondary slot
  };
}

export type TicketStatus = 'ACTIVE' | 'EXITED';

export interface ParkingTicket {
  ticketId: string; // e.g. T-1007
  vehicleNumber: string;
  vehicleType: VehicleType;
  ownerName: string;
  allocatedSlots: number[]; // e.g. [1] or [3, 4]
  entryTime: string; // ISO string
  exitTime?: string; // ISO string
  durationHours?: number; // exact or rounded
  billableHours?: number;
  hourlyRate: number;
  totalAmount?: number;
  status: TicketStatus;
  notes?: string;
  userId?: number;
  centreId?: string;
  centreName?: string;
}

export interface VehicleRateConfig {
  type: VehicleType;
  hourlyRate: number;
  slotsRequired: number;
  iconName: string;
  description: string;
}

export interface DashboardMetrics {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  occupancyPercentage: number;
  totalCollection: number;
  activeVehiclesCount: number;
  activeBikes: number;
  activeCars: number;
  activeTrucks: number;
  totalExitedCount: number;
}

export interface ParkingCentre {
  id: string;
  name: string;
  city: string;
  locality: string;
  address: string;
  landmark: string;
  phone: string;
  totalSlots: number; // 50
  rating: number;
  reviewsCount: number;
  coordinates: { lat: number; lng: number };
  openingHours: string;
  is24x7: boolean;
  amenities: string[];
  tariff: {
    bike: number;
    car: number;
    truck: number;
  };
  distanceKm?: number;
  occupiedSlots?: number;
  availableSlots?: number;
}

