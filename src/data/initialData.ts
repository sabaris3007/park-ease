import { ParkingSlot, ParkingTicket, Vehicle } from '../types/parking';

export interface DummyVehiclePreset extends Vehicle {
  sNo: number;
  hourlyRate: number;
}

export const DUMMY_VEHICLES_CATALOG: DummyVehiclePreset[] = [
  { sNo: 1, type: 'Bike', plateNumber: 'TN37AB1234', ownerName: 'Arun Kumar', hourlyRate: 10 },
  { sNo: 2, type: 'Car', plateNumber: 'TN37CD5678', ownerName: 'Priya', hourlyRate: 30 },
  { sNo: 3, type: 'Truck', plateNumber: 'TN38EF9012', ownerName: 'Karthik', hourlyRate: 60 },
  { sNo: 4, type: 'Bike', plateNumber: 'TN45GH2345', ownerName: 'Divya', hourlyRate: 10 },
  { sNo: 5, type: 'Car', plateNumber: 'TN45JK6789', ownerName: 'Rahul', hourlyRate: 30 },
  { sNo: 6, type: 'Bike', plateNumber: 'TN48LM1234', ownerName: 'Sanjay', hourlyRate: 10 },
  { sNo: 7, type: 'Truck', plateNumber: 'TN49NP5678', ownerName: 'Vignesh', hourlyRate: 60 },
  { sNo: 8, type: 'Car', plateNumber: 'TN55QR9012', ownerName: 'Harini', hourlyRate: 30 },
  { sNo: 9, type: 'Bike', plateNumber: 'TN57ST3456', ownerName: 'Naveen', hourlyRate: 10 },
  { sNo: 10, type: 'Car', plateNumber: 'TN60UV7890', ownerName: 'Keerthana', hourlyRate: 30 },
  { sNo: 11, type: 'Bike', plateNumber: 'TN63WX1234', ownerName: 'Manoj', hourlyRate: 10 },
  { sNo: 12, type: 'Truck', plateNumber: 'TN72YZ5678', ownerName: 'Bala', hourlyRate: 60 },
];

/**
 * 7 Historical completed transactions from the problem specification:
 * Total collection = ₹30 + ₹60 + ₹240 + ₹10 + ₹150 + ₹80 + ₹480 = ₹1,050
 */
export function getInitialHistoricalTickets(): ParkingTicket[] {
  const baseTime = new Date('2026-10-17T08:00:00Z').getTime();

  return [
    {
      ticketId: 'T-1007',
      vehicleNumber: 'TN37AB1234',
      vehicleType: 'Bike',
      ownerName: 'Arun Kumar',
      allocatedSlots: [1],
      entryTime: new Date(baseTime).toISOString(),
      exitTime: new Date(baseTime + 3 * 3600 * 1000).toISOString(),
      durationHours: 3,
      billableHours: 3,
      hourlyRate: 10,
      totalAmount: 30,
      status: 'EXITED',
      notes: 'Standard 3-hour session',
    },
    {
      ticketId: 'T-1008',
      vehicleNumber: 'TN37CD5678',
      vehicleType: 'Car',
      ownerName: 'Priya',
      allocatedSlots: [2],
      entryTime: new Date(baseTime + 1800 * 1000).toISOString(),
      exitTime: new Date(baseTime + 1800 * 1000 + 2 * 3600 * 1000).toISOString(),
      durationHours: 2,
      billableHours: 2,
      hourlyRate: 30,
      totalAmount: 60,
      status: 'EXITED',
      notes: '2-hour parking',
    },
    {
      ticketId: 'T-1009',
      vehicleNumber: 'TN38EF9012',
      vehicleType: 'Truck',
      ownerName: 'Karthik',
      allocatedSlots: [3, 4],
      entryTime: new Date(baseTime + 3600 * 1000).toISOString(),
      exitTime: new Date(baseTime + 3600 * 1000 + 4 * 3600 * 1000).toISOString(),
      durationHours: 4,
      billableHours: 4,
      hourlyRate: 60,
      totalAmount: 240,
      status: 'EXITED',
      notes: 'Consecutive tandem slots [3, 4]',
    },
    {
      ticketId: 'T-1010',
      vehicleNumber: 'TN45GH2345',
      vehicleType: 'Bike',
      ownerName: 'Divya',
      allocatedSlots: [5],
      entryTime: new Date(baseTime + 2 * 3600 * 1000).toISOString(),
      exitTime: new Date(baseTime + 2 * 3600 * 1000 + 1 * 3600 * 1000).toISOString(),
      durationHours: 1,
      billableHours: 1,
      hourlyRate: 10,
      totalAmount: 10,
      status: 'EXITED',
      notes: 'Quick 1-hour parking',
    },
    {
      ticketId: 'T-1011',
      vehicleNumber: 'TN45JK6789',
      vehicleType: 'Car',
      ownerName: 'Rahul',
      allocatedSlots: [6],
      entryTime: new Date(baseTime + 1200 * 1000).toISOString(),
      exitTime: new Date(baseTime + 1200 * 1000 + 5 * 3600 * 1000).toISOString(),
      durationHours: 5,
      billableHours: 5,
      hourlyRate: 30,
      totalAmount: 150,
      status: 'EXITED',
      notes: '5-hour shopping session',
    },
    {
      ticketId: 'T-1012',
      vehicleNumber: 'TN48LM1234',
      vehicleType: 'Bike',
      ownerName: 'Sanjay',
      allocatedSlots: [7],
      entryTime: new Date(baseTime).toISOString(),
      exitTime: new Date(baseTime + 10 * 3600 * 1000).toISOString(),
      durationHours: 10,
      billableHours: 8,
      hourlyRate: 10,
      totalAmount: 80,
      status: 'EXITED',
      notes: '10 hrs parked (8-Hour Max Cap applied: ₹80)',
    },
    {
      ticketId: 'T-1013',
      vehicleNumber: 'TN49NP5678',
      vehicleType: 'Truck',
      ownerName: 'Vignesh',
      allocatedSlots: [8, 9],
      entryTime: new Date(baseTime + 1800 * 1000).toISOString(),
      exitTime: new Date(baseTime + 1800 * 1000 + 9 * 3600 * 1000).toISOString(),
      durationHours: 9,
      billableHours: 8,
      hourlyRate: 60,
      totalAmount: 480,
      status: 'EXITED',
      notes: '9 hrs parked (8-Hour Max Cap applied: ₹480)',
    },
  ];
}

/**
 * Creates 50 parking slots with initial 5 vehicles parked:
 * Slot 1: Bike (Arun Kumar)
 * Slot 2: Car (Priya)
 * Slot 3 & 4: Truck (Karthik)
 * Slot 5: Bike (Divya)
 * Slot 6: Car (Rahul)
 * Slots 7-50: Free
 */
export function getInitialSlotsAndActiveTickets(): {
  slots: ParkingSlot[];
  activeTickets: ParkingTicket[];
} {
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2.5 * 3600 * 1000).toISOString();
  const oneHourAgo = new Date(now.getTime() - 1.2 * 3600 * 1000).toISOString();
  const fourHoursAgo = new Date(now.getTime() - 4.1 * 3600 * 1000).toISOString();
  const threeHoursAgo = new Date(now.getTime() - 3.0 * 3600 * 1000).toISOString();
  const thirtyMinsAgo = new Date(now.getTime() - 0.5 * 3600 * 1000).toISOString();

  const activeTickets: ParkingTicket[] = [
    {
      ticketId: 'T-1014',
      vehicleNumber: 'TN37AB1234',
      vehicleType: 'Bike',
      ownerName: 'Arun Kumar',
      allocatedSlots: [1],
      entryTime: twoHoursAgo,
      hourlyRate: 10,
      status: 'ACTIVE',
    },
    {
      ticketId: 'T-1015',
      vehicleNumber: 'TN37CD5678',
      vehicleType: 'Car',
      ownerName: 'Priya',
      allocatedSlots: [2],
      entryTime: oneHourAgo,
      hourlyRate: 30,
      status: 'ACTIVE',
    },
    {
      ticketId: 'T-1016',
      vehicleNumber: 'TN38EF9012',
      vehicleType: 'Truck',
      ownerName: 'Karthik',
      allocatedSlots: [3, 4],
      entryTime: fourHoursAgo,
      hourlyRate: 60,
      status: 'ACTIVE',
    },
    {
      ticketId: 'T-1017',
      vehicleNumber: 'TN45GH2345',
      vehicleType: 'Bike',
      ownerName: 'Divya',
      allocatedSlots: [5],
      entryTime: thirtyMinsAgo,
      hourlyRate: 10,
      status: 'ACTIVE',
    },
    {
      ticketId: 'T-1018',
      vehicleNumber: 'TN45JK6789',
      vehicleType: 'Car',
      ownerName: 'Rahul',
      allocatedSlots: [6],
      entryTime: threeHoursAgo,
      hourlyRate: 30,
      status: 'ACTIVE',
    },
  ];

  const slots: ParkingSlot[] = [];

  for (let i = 1; i <= 50; i++) {
    if (i === 1) {
      slots.push({
        slotNumber: 1,
        isOccupied: true,
        occupiedBy: {
          ticketId: 'T-1014',
          vehicleType: 'Bike',
          plateNumber: 'TN37AB1234',
          ownerName: 'Arun Kumar',
          entryTime: twoHoursAgo,
        },
      });
    } else if (i === 2) {
      slots.push({
        slotNumber: 2,
        isOccupied: true,
        occupiedBy: {
          ticketId: 'T-1015',
          vehicleType: 'Car',
          plateNumber: 'TN37CD5678',
          ownerName: 'Priya',
          entryTime: oneHourAgo,
        },
      });
    } else if (i === 3) {
      slots.push({
        slotNumber: 3,
        isOccupied: true,
        occupiedBy: {
          ticketId: 'T-1016',
          vehicleType: 'Truck',
          plateNumber: 'TN38EF9012',
          ownerName: 'Karthik',
          entryTime: fourHoursAgo,
          isPrimarySlot: true,
          companionSlot: 4,
        },
      });
    } else if (i === 4) {
      slots.push({
        slotNumber: 4,
        isOccupied: true,
        occupiedBy: {
          ticketId: 'T-1016',
          vehicleType: 'Truck',
          plateNumber: 'TN38EF9012',
          ownerName: 'Karthik',
          entryTime: fourHoursAgo,
          isPrimarySlot: false,
          companionSlot: 3,
        },
      });
    } else if (i === 5) {
      slots.push({
        slotNumber: 5,
        isOccupied: true,
        occupiedBy: {
          ticketId: 'T-1017',
          vehicleType: 'Bike',
          plateNumber: 'TN45GH2345',
          ownerName: 'Divya',
          entryTime: thirtyMinsAgo,
        },
      });
    } else if (i === 6) {
      slots.push({
        slotNumber: 6,
        isOccupied: true,
        occupiedBy: {
          ticketId: 'T-1018',
          vehicleType: 'Car',
          plateNumber: 'TN45JK6789',
          ownerName: 'Rahul',
          entryTime: threeHoursAgo,
        },
      });
    } else {
      slots.push({
        slotNumber: i,
        isOccupied: false,
      });
    }
  }

  return { slots, activeTickets };
}
