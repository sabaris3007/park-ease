import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  DashboardMetrics,
  ParkingCentre,
  ParkingSlot,
  ParkingTicket,
  VehicleType,
} from '../types/parking';
import {
  formatCurrency,
  calculateParkingBill,
} from '../utils/billing';
import {
  allocateSlots,
  validateVehiclePlate,
} from '../utils/validation';
import {
  DUMMY_VEHICLES_CATALOG,
  getInitialHistoricalTickets,
  getInitialSlotsAndActiveTickets,
} from '../data/initialData';
import { PARKING_CENTRES, calculateDistanceKm } from '../data/parkingCentres';
import { User } from '../types/user';

export type ActiveTab = 'centres' | 'dashboard' | 'park' | 'user';

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface CentreLotState {
  slots: ParkingSlot[];
  activeTickets: ParkingTicket[];
  historyTickets: ParkingTicket[];
  ticketCounter: number;
}

interface ParkingContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCentre: ParkingCentre;
  setSelectedCentre: (centre: ParkingCentre) => void;
  selectCentreAndBook: (centre: ParkingCentre) => void;
  parkingCentres: ParkingCentre[];
  locationSearch: string;
  setLocationSearch: (query: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  userCoords: { lat: number; lng: number } | null;
  isLocating: boolean;
  requestUserLocation: () => void;
  clearUserLocation: () => void;
  toggleUserLocation: () => void;
  slots: ParkingSlot[];
  activeTickets: ParkingTicket[];
  yourTickets: ParkingTicket[];
  historyTickets: ParkingTicket[];
  metrics: DashboardMetrics;
  notification: AppNotification | null;
  setNotification: (notif: AppNotification | null) => void;
  ticketForModal: ParkingTicket | null;
  setTicketForModal: (ticket: ParkingTicket | null) => void;
  selectedSlotForModal: ParkingSlot | null;
  setSelectedSlotForModal: (slot: ParkingSlot | null) => void;
  parkVehicle: (
    type: VehicleType,
    rawPlate: string,
    ownerName: string,
    customEntryTime?: string
  ) => { success: boolean; message: string; ticket?: ParkingTicket };
  exitVehicle: (ticketId: string) => { success: boolean; message: string; ticket?: ParkingTicket };
  findActiveTicket: (query: string) => ParkingTicket | null;
  resetDemoData: () => void;
  clearAllData: () => void;
  fillLotToCapacityForTesting: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logoutUser: () => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const STORAGE_KEY = 'parkease_multicentre_state_v5_dynamic_rates';

const SAMPLE_CUSTOMER_NAMES = [
  'Aarav Sharma', 'Pooja Patel', 'Rohan Mehta', 'Sneha Iyer', 'Vikram Reddy',
  'Meera Krishnan', 'Deepak Nair', 'Kavitha R.', 'Rajesh Kumar', 'Dr. Arvind Swamy',
  'Ananya Sundaram', 'Suresh Babu', 'Naveen Prakash', 'Harini Venkat', 'Karthik Raja',
  'Divya Murthy', 'Arun Chandran', 'Vimal Nathan', 'Priya Mani', 'Balaji Subramanian',
];

function buildInitialCentreLot(centre: ParkingCentre): CentreLotState {
  const total = centre.totalSlots;
  const occupiedCounts: Record<string, number> = {
    'cbe-gandhipuram': 6,     // 50 total -> 6 occupied, 44 free
    'cbe-brookefields': 48,   // 80 total -> 48 occupied, 32 free
    'cbe-airport': 88,        // 120 total -> 88 occupied, 32 free
    'cbe-townhall': 27,       // 35 total -> 27 occupied, 8 free
    'chn-tnagar': 63,         // 90 total -> 63 occupied, 27 free
    'chn-central': 98,        // 140 total -> 98 occupied, 42 free
    'blr-indiranagar': 41,    // 65 total -> 41 occupied, 24 free
    'blr-koramangala': 36,    // 45 total -> 36 occupied, 9 free
    'hyd-hitech': 76,         // 110 total -> 76 occupied, 34 free
  };

  const occupiedCount = occupiedCounts[centre.id] ?? Math.min(total - 4, Math.floor(total * 0.6));
  const slots: ParkingSlot[] = [];
  const activeTickets: ParkingTicket[] = [];
  const prefix = centre.id.slice(0, 3).toUpperCase();
  const now = Date.now();

  let s = 1;
  let ticketSeq = 101;

  while (s <= total) {
    if (s <= occupiedCount) {
      // Determine vehicle type: 10% Trucks (occupies 2 consecutive slots), 30% Bikes, 60% Cars
      const isTruck = s % 11 === 0 && s + 1 <= occupiedCount;
      const isBike = !isTruck && s % 3 === 0;
      const vType: VehicleType = isTruck ? 'Truck' : isBike ? 'Bike' : 'Car';
      const allocated = isTruck ? [s, s + 1] : [s];
      const rate = isTruck
        ? centre.tariff.truck
        : isBike
        ? centre.tariff.bike
        : centre.tariff.car;

      const ticketId = `T-${prefix}-${ticketSeq++}`;
      const entryTime = new Date(now - (((s * 17) % 300) + 15) * 60000).toISOString();
      const stateCode = centre.city === 'Bengaluru' ? 'KA' : centre.city === 'Hyderabad' ? 'TS' : 'TN';
      const rto = String(10 + ((s * 7) % 80)).padStart(2, '0');
      const plate = `${stateCode}${rto}AB${1000 + ((s * 37) % 8990)}`;
      const ownerName = SAMPLE_CUSTOMER_NAMES[(s - 1) % SAMPLE_CUSTOMER_NAMES.length];

      activeTickets.push({
        ticketId,
        vehicleNumber: plate,
        vehicleType: vType,
        ownerName,
        allocatedSlots: allocated,
        entryTime,
        hourlyRate: rate,
        status: 'ACTIVE',
      });

      if (isTruck) {
        slots.push({
          slotNumber: s,
          isOccupied: true,
          occupiedBy: {
            ticketId,
            vehicleType: 'Truck',
            plateNumber: plate,
            ownerName,
            entryTime,
            isPrimarySlot: true,
            companionSlot: s + 1,
          },
        });
        slots.push({
          slotNumber: s + 1,
          isOccupied: true,
          occupiedBy: {
            ticketId,
            vehicleType: 'Truck',
            plateNumber: plate,
            ownerName,
            entryTime,
            isPrimarySlot: false,
            companionSlot: s,
          },
        });
        s += 2;
      } else {
        slots.push({
          slotNumber: s,
          isOccupied: true,
          occupiedBy: {
            ticketId,
            vehicleType: vType,
            plateNumber: plate,
            ownerName,
            entryTime,
          },
        });
        s += 1;
      }
    } else {
      slots.push({
        slotNumber: s,
        isOccupied: false,
      });
      s += 1;
    }
  }

  return {
    slots,
    activeTickets,
    historyTickets: [],
    ticketCounter: ticketSeq,
  };
}

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('centres');
  const [selectedCentre, setSelectedCentreState] = useState<ParkingCentre>(PARKING_CENTRES[0]);
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Store per-centre lots so each parking hub maintains its own slots & tickets
  const [centresData, setCentresData] = useState<Record<string, CentreLotState>>({});

  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [ticketForModal, setTicketForModal] = useState<ParkingTicket | null>(null);
  const [selectedSlotForModal, setSelectedSlotForModal] = useState<ParkingSlot | null>(null);

  // User Management State
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('parkease_logged_in_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      try {
        localStorage.setItem('parkease_logged_in_user', JSON.stringify(user));
      } catch {}
    } else {
      localStorage.removeItem('parkease_logged_in_user');
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Logged Out',
      message: 'You have been securely logged out of your account.',
    });
  };

  // Initial loader
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.centresData && parsed.selectedCentreId) {
          setCentresData(parsed.centresData);
          const foundCentre = PARKING_CENTRES.find((c) => c.id === parsed.selectedCentreId);
          if (foundCentre) {
            setSelectedCentreState(foundCentre);
          }
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Default initialization: construct dedicated lots for each centre using its unique totalSlots and tariffs
    const initialCentresMap: Record<string, CentreLotState> = {};
    PARKING_CENTRES.forEach((centre) => {
      initialCentresMap[centre.id] = buildInitialCentreLot(centre);
    });

    setCentresData(initialCentresMap);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (Object.keys(centresData).length > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            centresData,
            selectedCentreId: selectedCentre.id,
          })
        );
      } catch {
        // Storage full or private mode
      }
    }
  }, [centresData, selectedCentre]);

  // Active centre's current lot state
  const currentLot: CentreLotState = useMemo(() => {
    if (centresData[selectedCentre.id]) {
      return centresData[selectedCentre.id];
    }
    return buildInitialCentreLot(selectedCentre);
  }, [centresData, selectedCentre]);

  const slots = currentLot.slots;
  const activeTickets = currentLot.activeTickets;
  const historyTickets = currentLot.historyTickets;
  const ticketCounter = currentLot.ticketCounter;

  // Auto-dismiss notifications after 6 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Request ID ref to cancel/discard stale async geolocation responses
  const locationRequestIdRef = useRef<number>(0);

  // Request user location with HTML5 Geolocation API (with fast fallback for sandbox/iframe)
  const requestUserLocation = () => {
    const requestId = ++locationRequestIdRef.current;
    setIsLocating(true);

    const applyFallback = () => {
      if (locationRequestIdRef.current !== requestId) return;
      const fallback = { lat: 11.0183, lng: 76.9644 };
      setUserCoords(fallback);
      setIsLocating(false);
      setNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'GPS Location Active',
        message: 'GPS enabled. Showing parking centres sorted by nearest distance from your location.',
      });
    };

    // Fast timer: if geolocation is blocked or slow in iframe, activate immediately
    const fallbackTimer = setTimeout(() => {
      applyFallback();
    }, 1500);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(fallbackTimer);
            if (locationRequestIdRef.current !== requestId) return;
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserCoords(coords);
            setIsLocating(false);
            setNotification({
              id: Date.now().toString(),
              type: 'success',
              title: 'GPS Location Active',
              message: 'Live GPS position acquired. Parking centres sorted by nearest distance.',
            });
          },
          () => {
            clearTimeout(fallbackTimer);
            applyFallback();
          },
          { timeout: 3000, maximumAge: 60000 }
        );
      } catch {
        clearTimeout(fallbackTimer);
        applyFallback();
      }
    } else {
      clearTimeout(fallbackTimer);
      applyFallback();
    }
  };

  const clearUserLocation = () => {
    // Invalidate any in-flight geolocation requests immediately
    locationRequestIdRef.current++;
    setUserCoords(null);
    setIsLocating(false);
    setNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'GPS Location Disabled',
      message: 'GPS turned OFF. Distance calculations and GPS sorting cleared.',
    });
  };

  const toggleUserLocation = () => {
    if (userCoords || isLocating) {
      clearUserLocation();
    } else {
      requestUserLocation();
    }
  };

  // Compute live slot stats and distances for all centres
  const parkingCentres: ParkingCentre[] = useMemo(() => {
    return PARKING_CENTRES.map((centre) => {
      // Calculate live occupied count for this centre if available
      const centreState = centresData[centre.id];
      const occCount = centreState
        ? centreState.slots.filter((s) => s.isOccupied).length
        : Math.min(centre.totalSlots - 4, Math.floor(centre.totalSlots * 0.6));

      const availCount = Math.max(0, centre.totalSlots - occCount);

      let distanceKm: number | undefined = undefined;
      if (userCoords) {
        distanceKm = calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          centre.coordinates.lat,
          centre.coordinates.lng
        );
      }

      return {
        ...centre,
        occupiedSlots: occCount,
        availableSlots: availCount,
        distanceKm,
      };
    });
  }, [centresData, userCoords]);

  // Dynamic Dashboard Metrics for the ACTIVE centre
  const metrics: DashboardMetrics = useMemo(() => {
    const totalSlots = slots.length || selectedCentre.totalSlots;
    const occupiedSlots = slots.filter((s) => s.isOccupied).length;
    const availableSlots = Math.max(0, totalSlots - occupiedSlots);
    const occupancyPercentage = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    const totalCollection = historyTickets.reduce(
      (sum, t) => sum + (t.totalAmount || 0),
      0
    );

    const activeBikes = activeTickets.filter((t) => t.vehicleType === 'Bike').length;
    const activeCars = activeTickets.filter((t) => t.vehicleType === 'Car').length;
    const activeTrucks = activeTickets.filter((t) => t.vehicleType === 'Truck').length;

    return {
      totalSlots,
      occupiedSlots,
      availableSlots,
      occupancyPercentage,
      totalCollection,
      activeVehiclesCount: activeTickets.length,
      activeBikes,
      activeCars,
      activeTrucks,
      totalExitedCount: historyTickets.length,
    };
  }, [slots, activeTickets, historyTickets]);

  // Compute booked tickets belonging strictly to the currently logged-in user
  const yourTickets: ParkingTicket[] = useMemo(() => {
    if (!currentUser) return [];
    const userTicketsList: ParkingTicket[] = [];
    const curUserName = currentUser.name.trim().toLowerCase();

    Object.entries(centresData).forEach(([cId, lotState]) => {
      const centreObj = PARKING_CENTRES.find((c) => c.id === cId);
      lotState.activeTickets.forEach((ticket) => {
        const isUserTicket =
          ticket.userId === currentUser.userId ||
          (ticket.ownerName && ticket.ownerName.trim().toLowerCase() === curUserName);

        if (isUserTicket) {
          userTicketsList.push({
            ...ticket,
            centreId: ticket.centreId || cId,
            centreName: ticket.centreName || centreObj?.name || selectedCentre.name,
          });
        }
      });
    });

    return userTicketsList;
  }, [centresData, currentUser, selectedCentre.name]);

  const setSelectedCentre = (centre: ParkingCentre) => {
    setSelectedCentreState(centre);
  };

  // BookMyShow Style action: select parking centre and redirect to slot booking process
  const selectCentreAndBook = (centre: ParkingCentre) => {
    setSelectedCentreState(centre);
    setActiveTab('park');
    setNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Centre Selected',
      message: `Now booking at ${centre.name}. Enter your vehicle details to reserve your bay!`,
    });
  };

  // Helper to update current centre's lot state
  const updateCurrentLot = (updater: (prev: CentreLotState) => CentreLotState) => {
    setCentresData((prevMap) => {
      const current = prevMap[selectedCentre.id] || currentLot;
      const updated = updater(current);
      return {
        ...prevMap,
        [selectedCentre.id]: updated,
      };
    });
  };

  // Find active ticket by query in current centre
  const findActiveTicket = (query: string): ParkingTicket | null => {
    const trimmed = query.trim().toUpperCase().replace(/[\s-]/g, '');
    if (!trimmed) return null;

    return (
      activeTickets.find(
        (t) =>
          t.ticketId.toUpperCase() === query.trim().toUpperCase() ||
          t.vehicleNumber.replace(/[\s-]/g, '').toUpperCase() === trimmed
      ) || null
    );
  };

  // Park vehicle logic in current centre
  const parkVehicle = (
    type: VehicleType,
    rawPlate: string,
    ownerName: string,
    customEntryTime?: string
  ): { success: boolean; message: string; ticket?: ParkingTicket } => {
    const trimOwner = ownerName.trim();
    if (!trimOwner) {
      setNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Validation Error',
        message: 'Owner name cannot be empty.',
      });
      return { success: false, message: 'Owner name cannot be empty.' };
    }

    const validation = validateVehiclePlate(rawPlate);
    if (!validation.isValid) {
      setNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Invalid Number Plate',
        message: validation.errorMessage || 'Invalid plate format.',
      });
      return { success: false, message: validation.errorMessage || 'Invalid plate format.' };
    }

    const plateNumber = validation.normalizedPlate;

    const duplicate = activeTickets.find((t) => t.vehicleNumber === plateNumber);
    if (duplicate) {
      const errMsg = `Duplicate Vehicle! Vehicle ${plateNumber} is already parked in Slot ${duplicate.allocatedSlots.join(
        ' & '
      )} at ${selectedCentre.name} under Ticket ${duplicate.ticketId}.`;
      setNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Vehicle Already Parked',
        message: errMsg,
      });
      return { success: false, message: errMsg };
    }

    const allocResult = allocateSlots(type, slots);
    if (!allocResult.success || !allocResult.allocatedSlots.length) {
      setNotification({
        id: Date.now().toString(),
        type: 'error',
        title:
          allocResult.error === 'INSUFFICIENT_CONSECUTIVE_SLOTS'
            ? 'Insufficient Consecutive Slots'
            : 'Parking Full',
        message: allocResult.message || 'Cannot allocate parking space.',
      });
      return { success: false, message: allocResult.message || 'Cannot allocate space.' };
    }

    const allocatedSlots = allocResult.allocatedSlots;
    const ticketId = `T-${selectedCentre.id.slice(0, 3).toUpperCase()}-${ticketCounter}`;
    const entryTime = customEntryTime || new Date().toISOString();
    const hourlyRate =
      type === 'Bike'
        ? selectedCentre.tariff.bike
        : type === 'Car'
        ? selectedCentre.tariff.car
        : selectedCentre.tariff.truck;

    const newTicket: ParkingTicket = {
      ticketId,
      vehicleNumber: plateNumber,
      vehicleType: type,
      ownerName: trimOwner,
      allocatedSlots,
      entryTime,
      hourlyRate,
      status: 'ACTIVE',
      userId: currentUser?.userId,
      centreId: selectedCentre.id,
      centreName: selectedCentre.name,
    };

    updateCurrentLot((prev) => {
      const nextSlots = prev.slots.map((slot) => {
        if (allocatedSlots.includes(slot.slotNumber)) {
          const isPrimary = slot.slotNumber === allocatedSlots[0];
          const companion =
            allocatedSlots.length > 1
              ? allocatedSlots.find((s) => s !== slot.slotNumber)
              : undefined;

          return {
            ...slot,
            isOccupied: true,
            occupiedBy: {
              ticketId,
              vehicleType: type,
              plateNumber,
              ownerName: trimOwner,
              entryTime,
              isPrimarySlot: isPrimary,
              companionSlot: companion,
            },
          };
        }
        return slot;
      });

      return {
        ...prev,
        slots: nextSlots,
        activeTickets: [newTicket, ...prev.activeTickets],
        ticketCounter: prev.ticketCounter + 1,
      };
    });

    setTicketForModal(newTicket);

    const slotText =
      allocatedSlots.length === 1
        ? `Bay #${allocatedSlots[0]}`
        : `Bays #${allocatedSlots[0]} & #${allocatedSlots[1]} (Tandem)`;

    setNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Slot Booked Successfully',
      message: `${type} ${plateNumber} allocated to ${slotText} at ${selectedCentre.name}. Ticket: ${ticketId}`,
    });

    return {
      success: true,
      message: `Vehicle booked successfully in ${slotText}!`,
      ticket: newTicket,
    };
  };

  // Exit vehicle: free slot(s), compute bill, move ticket to history
  const exitVehicle = (
    ticketId: string
  ): { success: boolean; message: string; ticket?: ParkingTicket } => {
    const ticket = activeTickets.find((t) => t.ticketId === ticketId);
    if (!ticket) {
      return { success: false, message: `Ticket ${ticketId} not found.` };
    }

    const exitTime = new Date().toISOString();
    const billing = calculateParkingBill(ticket.vehicleType, ticket.entryTime, exitTime);

    const exitedTicket: ParkingTicket = {
      ...ticket,
      exitTime,
      durationHours: billing.exactHours,
      billableHours: billing.billableHours,
      totalAmount: billing.totalAmount,
      status: 'EXITED',
    };

    updateCurrentLot((prev) => {
      // Free every slot this ticket occupied
      const nextSlots = prev.slots.map((slot) => {
        if (
          slot.isOccupied &&
          slot.occupiedBy?.ticketId === ticketId
        ) {
          return { slotNumber: slot.slotNumber, isOccupied: false };
        }
        return slot;
      });

      return {
        ...prev,
        slots: nextSlots,
        activeTickets: prev.activeTickets.filter((t) => t.ticketId !== ticketId),
        historyTickets: [exitedTicket, ...prev.historyTickets],
      };
    });

    const slotText =
      ticket.allocatedSlots.length === 1
        ? `Bay #${ticket.allocatedSlots[0]}`
        : `Bays #${ticket.allocatedSlots[0]} & #${ticket.allocatedSlots[1]}`;

    setNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Vehicle Exited',
      message: `${ticket.vehicleType} ${ticket.vehicleNumber} exited from ${slotText}. Bill: ${formatCurrency(billing.totalAmount)} (${billing.billableHours} hr${billing.billableHours !== 1 ? 's' : ''})`,
    });

    return { success: true, message: 'Exit processed.', ticket: exitedTicket };
  };

  const resetDemoData = () => {
    const { slots: initSlots, activeTickets: initActive } = getInitialSlotsAndActiveTickets();
    const initHistory = getInitialHistoricalTickets();

    updateCurrentLot(() => ({
      slots: initSlots,
      activeTickets: initActive,
      historyTickets: initHistory,
      ticketCounter: 1019,
    }));

    setNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Demo Data Restored',
      message: `Demo state restored for ${selectedCentre.name}: 5 vehicles parked, ₹1,050 history.`,
    });
  };

  const clearAllData = () => {
    const emptySlots: ParkingSlot[] = Array.from({ length: selectedCentre.totalSlots }, (_, idx) => ({
      slotNumber: idx + 1,
      isOccupied: false,
    }));

    updateCurrentLot(() => ({
      slots: emptySlots,
      activeTickets: [],
      historyTickets: [],
      ticketCounter: 1001,
    }));

    setNotification({
      id: Date.now().toString(),
      type: 'warning',
      title: 'Parking Lot Cleared',
      message: `All ${selectedCentre.totalSlots} slots at ${selectedCentre.name} are now empty.`,
    });
  };

  const fillLotToCapacityForTesting = () => {
    const nowIso = new Date().toISOString();
    const newActive: ParkingTicket[] = [];
    const newSlots: ParkingSlot[] = [];

    for (let i = 1; i <= selectedCentre.totalSlots; i++) {
      const dummyPlate = `TN99TEST${1000 + i}`;
      const tId = `T-FULL-${2000 + i}`;
      newSlots.push({
        slotNumber: i,
        isOccupied: true,
        occupiedBy: {
          ticketId: tId,
          vehicleType: 'Car',
          plateNumber: dummyPlate,
          ownerName: `Test Driver #${i}`,
          entryTime: nowIso,
        },
      });
      newActive.push({
        ticketId: tId,
        vehicleNumber: dummyPlate,
        vehicleType: 'Car',
        ownerName: `Test Driver #${i}`,
        allocatedSlots: [i],
        entryTime: nowIso,
        hourlyRate: selectedCentre.tariff.car,
        status: 'ACTIVE',
      });
    }

    updateCurrentLot((prev) => ({
      ...prev,
      slots: newSlots,
      activeTickets: newActive,
    }));

    setNotification({
      id: Date.now().toString(),
      type: 'warning',
      title: `Parking Lot Full (${selectedCentre.totalSlots}/${selectedCentre.totalSlots})`,
      message: `Simulated 100% capacity at ${selectedCentre.name}. All bays are now marked full.`,
    });
  };

  return (
    <ParkingContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCentre,
        setSelectedCentre,
        selectCentreAndBook,
        parkingCentres,
        locationSearch,
        setLocationSearch,
        selectedCity,
        setSelectedCity,
        userCoords,
        isLocating,
        requestUserLocation,
        clearUserLocation,
        toggleUserLocation,
        slots,
        activeTickets,
        yourTickets,
        historyTickets,
        metrics,
        notification,
        setNotification,
        ticketForModal,
        setTicketForModal,
        selectedSlotForModal,
        setSelectedSlotForModal,
        parkVehicle,
        exitVehicle,
        findActiveTicket,
        resetDemoData,
        clearAllData,
        fillLotToCapacityForTesting,
        currentUser,
        setCurrentUser,
        logoutUser,      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = (): ParkingContextType => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
