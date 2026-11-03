package com.parkease;

import com.parkease.dao.DatabaseConnection;
import com.parkease.dao.ParkingCentreDAO;
import com.parkease.dao.ReportsDAO;
import com.parkease.dao.SlotDAO;
import com.parkease.model.ParkingCentre;
import com.parkease.model.ParkingSlot;
import com.parkease.model.ParkingTicket;
import com.parkease.model.User;
import com.parkease.model.Vehicle;
import com.parkease.model.VehicleType;
import com.parkease.service.ParkingService;
import com.parkease.service.UserService;

import java.sql.Connection;
import java.util.List;
import java.util.Map;

/**
 * Main Java Application Entry Point.
 * Demonstrates:
 * 1. User Management Module (Registration, Login, Vehicle Management, Profile & Personal Dashboard)
 * 2. Parking Lot Operations (Slot Allocation, Vehicle Parking, Ticketing, Duration Billing)
 * 3. DBMS Relational Features (Foreign Keys, Triggers, Views, PreparedStatements)
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("==================================================================");
        System.out.println("   PARKEASE: INTEGRATED JAVA & DBMS SMART PARKING SYSTEM");
        System.out.println("   Complete User Management + 50-Slot Multi-Centre Parking Hub");
        System.out.println("==================================================================\n");

        try {
            // 1. Verify Database Connection
            System.out.println("[Step 1] Connecting to Relational DBMS via JDBC PreparedStatement...");
            Connection conn = DatabaseConnection.getConnection();
            System.out.println("✓ JDBC Connection Established: " + conn.getMetaData().getDatabaseProductName() + " " + conn.getMetaData().getDatabaseProductVersion());

            // 2. Test User Management: Registration & Duplicate Prevention
            System.out.println("\n[Step 2] User Management: User Registration & Validation Test...");
            UserService userService = new UserService();
            String testEmail = "ananya.s@example.com";
            String testPhone = "+91 98401 23456";

            User registeredUser;
            try {
                registeredUser = userService.registerUser("Ananya S.", testEmail, testPhone, "SecurePass@2026");
                System.out.printf("  ✓ User Registered: [ID=%d] Name: %s | Email: %s | Phone: %s\n",
                        registeredUser.getUserId(), registeredUser.getName(), registeredUser.getEmail(), registeredUser.getPhone());
            } catch (IllegalArgumentException e) {
                System.out.println("  ℹ Account already exists (duplicate check working): " + e.getMessage());
                registeredUser = userService.login(testEmail, "SecurePass@2026");
            }

            // Test Duplicate Email Prevention
            System.out.println("  -> Verifying Duplicate Registration Prevention:");
            try {
                userService.registerUser("Duplicate User", testEmail, "+91 99999 88888", "AnotherPassword");
                System.err.println("  ✗ FAILED: Duplicate registration was not blocked!");
            } catch (IllegalArgumentException e) {
                System.out.println("  ✓ PASS: Duplicate email rejected properly: " + e.getMessage());
            }

            // 3. Test User Login & Password Hashing Verification
            System.out.println("\n[Step 3] User Management: Authentication & Session Verification...");
            try {
                User loggedInUser = userService.login(testEmail, "SecurePass@2026");
                System.out.println("  ✓ Login Successful! Authenticated session for: " + loggedInUser.getName() + " (" + loggedInUser.getEmail() + ")");
            } catch (SecurityException e) {
                System.err.println("  ✗ Login Failed: " + e.getMessage());
            }

            // Verify Bad Password Rejection
            try {
                userService.login(testEmail, "WrongPassword");
                System.err.println("  ✗ FAILED: Invalid credentials allowed login!");
            } catch (SecurityException e) {
                System.out.println("  ✓ PASS: Bad credentials rejected properly: " + e.getMessage());
            }

            // 4. Test Vehicle Management (Register, Associate with User ID FK)
            System.out.println("\n[Step 4] Vehicle Management: Register Vehicles for User Account...");
            String vehiclePlate1 = "TN 38 EX 7777";
            String vehiclePlate2 = "TN 38 BK 9090";

            try {
                Vehicle v1 = userService.registerVehicle(registeredUser.getUserId(), vehiclePlate1, "Car");
                System.out.printf("  ✓ Vehicle Registered: [ID=%d] %s (%s) for User ID %d\n",
                        v1.getVehicleId(), v1.getVehicleNumber(), v1.getVehicleType(), v1.getUserId());
            } catch (IllegalArgumentException e) {
                System.out.println("  ℹ Vehicle " + vehiclePlate1 + " already registered: " + e.getMessage());
            }

            try {
                Vehicle v2 = userService.registerVehicle(registeredUser.getUserId(), vehiclePlate2, "Bike");
                System.out.printf("  ✓ Vehicle Registered: [ID=%d] %s (%s) for User ID %d\n",
                        v2.getVehicleId(), v2.getVehicleNumber(), v2.getVehicleType(), v2.getUserId());
            } catch (IllegalArgumentException e) {
                System.out.println("  ℹ Vehicle " + vehiclePlate2 + " already registered: " + e.getMessage());
            }

            List<Vehicle> userVehicles = userService.getUserVehicles(registeredUser.getUserId());
            System.out.println("  -> Current Registered Vehicles for " + registeredUser.getName() + " (" + userVehicles.size() + " total):");
            for (Vehicle v : userVehicles) {
                System.out.printf("     • [%s] %-15s (Type: %s)\n", v.getVehicleId(), v.getVehicleNumber(), v.getVehicleType());
            }

            // 5. Query Master Centres
            ParkingCentreDAO centreDAO = new ParkingCentreDAO();
            List<ParkingCentre> centres = centreDAO.getAllCentres();
            System.out.println("\n[Step 5] Querying Parking Centres (" + centres.size() + " available):");
            for (ParkingCentre c : centres) {
                System.out.printf("  • [%s] %-38s | %s | %d Slots | Bike ₹%.0f, Car ₹%.0f, Truck ₹%.0f\n",
                        c.getId(), c.getName(), c.getLocality(), c.getTotalSlots(),
                        c.getTariffBike(), c.getTariffCar(), c.getTariffTruck());
            }

            // 6. Test Vehicle Parking via Java Service Layer
            String targetCentre = "cbe-gandhipuram";
            ParkingService service = new ParkingService();
            System.out.println("\n[Step 6] Automated Vehicle Parking for User's Registered Car [" + vehiclePlate1 + "]...");
            ParkingTicket ticket = service.parkVehicle(targetCentre, vehiclePlate1, VehicleType.CAR, registeredUser.getName());
            System.out.printf("  ✓ Ticket Issued: ID = %s | Bay(s) = %s | Hourly Rate = ₹%.2f\n",
                    ticket.getTicketId(), ticket.getAllocatedSlotsJson(), ticket.getHourlyRate());

            // 7. Test User Dashboard (Aggregation of Profile, Vehicles, Active Parking, History)
            System.out.println("\n[Step 7] Generating Comprehensive User Dashboard Data...");
            Map<String, Object> dashboard = userService.getUserDashboardData(registeredUser.getUserId());
            User dashUser = (User) dashboard.get("user");
            List<?> dashVehicles = (List<?>) dashboard.get("vehicles");
            List<?> activeParkings = (List<?>) dashboard.get("activeTickets");
            List<?> pastHistory = (List<?>) dashboard.get("historyTickets");

            System.out.println("  ===================== USER DASHBOARD =====================");
            System.out.printf("  Customer Name:      %s\n", dashUser.getName());
            System.out.printf("  Email Address:      %s\n", dashUser.getEmail());
            System.out.printf("  Phone Number:       %s\n", dashUser.getPhone());
            System.out.printf("  Registered Vehicles: %d vehicle(s)\n", dashVehicles.size());
            System.out.printf("  Active Parkings:    %d vehicle(s) currently parked\n", activeParkings.size());
            System.out.printf("  Past Trips & History: %d completed sessions\n", pastHistory.size());
            System.out.printf("  Total Spent:        ₹%.2f\n", (Double) dashboard.get("totalSpent"));
            System.out.println("  ==========================================================");

            // 8. Test Vehicle Exit & Bill Calculation
            System.out.println("\n[Step 8] Executing Vehicle Exit & Settlement for [" + vehiclePlate1 + "]...");
            ParkingTicket exitedTicket = service.exitVehicle(targetCentre, vehiclePlate1);
            System.out.printf("  ✓ Exit Receipt: Ticket = %s | Duration = %.1f hrs | Total Bill = ₹%.2f\n",
                    exitedTicket.getTicketId(),
                    exitedTicket.getDurationHours(),
                    exitedTicket.getTotalAmount());

            // 9. Query DBMS Analytical View
            ReportsDAO reportsDAO = new ReportsDAO();
            System.out.println("\n[Step 9] Querying Analytical View [v_centre_occupancy]:");
            List<Map<String, Object>> occupancy = reportsDAO.getCentreOccupancySummary();
            for (Map<String, Object> row : occupancy) {
                System.out.printf("  • %-36s | Occupied: %-2s / %-2s | Rate: %-5s | Revenue: ₹%.2f\n",
                        row.get("centreName"),
                        row.get("occupiedSlots"),
                        row.get("totalSlots"),
                        row.get("occupancyPct") + "%",
                        (Double) row.get("totalRevenue"));
            }

            System.out.println("\n==================================================================");
            System.out.println("✓ USER MANAGEMENT & PARKING OPERATIONS COMPLETED SUCCESSFULLY.");
            System.out.println("==================================================================");

        } catch (Exception e) {
            System.err.println("Database Error during execution: " + e.getMessage());
            e.printStackTrace();
        } finally {
            DatabaseConnection.closeConnection();
        }
    }
}
