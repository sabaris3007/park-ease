import { ParkingTicket } from './parking';

export interface User {
  userId: number;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
}

export interface UserVehicle {
  vehicle_id: number;
  user_id: number;
  vehicle_number: string;
  vehicle_type: 'Car' | 'Bike' | 'Truck' | 'Bus';
  created_at?: string;
}

export interface UserDashboardData {
  user: User;
  vehicles: UserVehicle[];
  activeTickets: any[];
  historyTickets: any[];
  totalSpent: number;
  activeCount: number;
  historyCount: number;
}
