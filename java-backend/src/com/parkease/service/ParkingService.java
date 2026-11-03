package com.parkease.service;

import com.parkease.dao.ParkingCentreDAO;
import com.parkease.dao.SlotDAO;
import com.parkease.dao.TicketDAO;
import com.parkease.model.ParkingCentre;
import com.parkease.model.ParkingSlot;
import com.parkease.model.ParkingTicket;
import com.parkease.model.VehicleType;

import java.sql.SQLException;
import java.util.*;

/**
 * Service Layer encapsulating core business rules, automated slot allocation algorithms,
 * tandem truck slot matching, and exit duration billing.
 */
public class ParkingService {
    private final SlotDAO slotDAO = new SlotDAO();
    private final TicketDAO ticketDAO = new TicketDAO();
    private final ParkingCentreDAO centreDAO = new ParkingCentreDAO();

    /**
     * Automated slot allocation algorithm:
     * - Bike & Car: finds first available slot in Floor 1 (1-25) then Floor 2 (26-50).
     * - Truck: requires 2 adjacent slots on the same floor (e.g., [1, 2] or [3, 4]).
     */
    public synchronized List<Integer> findOptimalSlots(String centreId, VehicleType type) throws SQLException {
        List<ParkingSlot> slots = slotDAO.getSlotsByCentre(centreId);
        Set<Integer> occupiedSet = new HashSet<>();
        for (ParkingSlot s : slots) {
            if (s.isOccupied()) {
                occupiedSet.add(s.getSlotNumber());
            }
        }

        if (type == VehicleType.TRUCK) {
            // Find 2 consecutive adjacent slots on the same floor
            for (int s = 1; s <= 49; s++) {
                // Ensure both are on the same floor: 1..25 is Floor 1, 26..50 is Floor 2
                if (s == 25) continue; // 25 and 26 are on different floors
                if (!occupiedSet.contains(s) && !occupiedSet.contains(s + 1)) {
                    return Arrays.asList(s, s + 1);
                }
            }
            return Collections.emptyList(); // No tandem slots available
        } else {
            // Single slot allocation for Bike or Car
            for (int s = 1; s <= 50; s++) {
                if (!occupiedSet.contains(s)) {
                    return Collections.singletonList(s);
                }
            }
            return Collections.emptyList(); // Centre full
        }
    }

    /**
     * Complete park vehicle workflow:
     * 1. Check slot availability.
     * 2. Generate unique ticket ID.
     * 3. Insert into parking_tickets table.
     * 4. Update parking_slots table with transactional consistency.
     */
    public ParkingTicket parkVehicle(String centreId, String plateNumber, VehicleType vehicleType, String ownerName) throws SQLException {
        List<Integer> allocated = findOptimalSlots(centreId, vehicleType);
        if (allocated.isEmpty()) {
            throw new IllegalStateException("No available parking slots found for " + vehicleType.getDisplayName());
        }

        ParkingCentre centre = centreDAO.getCentreById(centreId);
        double rate = vehicleType.getDefaultHourlyRate();
        if (centre != null) {
            if (vehicleType == VehicleType.BIKE) rate = centre.getTariffBike();
            else if (vehicleType == VehicleType.CAR) rate = centre.getTariffCar();
            else if (vehicleType == VehicleType.TRUCK) rate = centre.getTariffTruck();
        }

        String ticketId = "T-" + (1000 + (int)(Math.random() * 9000));
        ParkingTicket ticket = new ParkingTicket();
        ticket.setTicketId(ticketId);
        ticket.setCentreId(centreId);
        ticket.setVehicleNumber(plateNumber.trim().toUpperCase());
        ticket.setVehicleType(vehicleType);
        ticket.setOwnerName(ownerName.trim());
        ticket.setAllocatedSlots(allocated);
        ticket.setHourlyRate(rate);

        // 1. Create Ticket
        ticketDAO.createTicket(ticket);

        // 2. Occupy Slots
        slotDAO.occupySlots(centreId, allocated, ticket);

        return ticket;
    }

    /**
     * Exit vehicle workflow:
     * 1. Retrieve active ticket.
     * 2. Calculate elapsed duration and billable hours.
     * 3. Compute total bill = billableHours * hourlyRate.
     * 4. Update ticket status to EXITED.
     * 5. Release slots.
     */
    public ParkingTicket exitVehicle(String centreId, String plateNumber) throws SQLException {
        ParkingTicket ticket = ticketDAO.getActiveTicketByPlate(centreId, plateNumber);
        if (ticket == null) {
            throw new IllegalArgumentException("No active parking ticket found for plate: " + plateNumber);
        }

        long entryTime = ticket.getEntryTime() != null ? ticket.getEntryTime().getTime() : System.currentTimeMillis();
        long now = System.currentTimeMillis();
        double durationHours = Math.max(0.1, (now - entryTime) / (1000.0 * 60.0 * 60.0));
        int billableHours = Math.max(1, (int) Math.ceil(durationHours));
        double totalAmount = billableHours * ticket.getHourlyRate();

        ticketDAO.closeTicket(ticket.getTicketId(), durationHours, billableHours, totalAmount, "Payment Completed via DBMS POS");
        slotDAO.freeSlots(centreId, ticket.getAllocatedSlots());

        ticket.setStatus("EXITED");
        ticket.setDurationHours(durationHours);
        ticket.setBillableHours(billableHours);
        ticket.setTotalAmount(totalAmount);
        return ticket;
    }
}
