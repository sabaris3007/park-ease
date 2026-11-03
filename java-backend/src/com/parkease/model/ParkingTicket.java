package com.parkease.model;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Model representing a parking transaction ticket, duration calculation, and billing.
 */
public class ParkingTicket {
    private String ticketId;
    private String centreId;
    private String vehicleNumber;
    private VehicleType vehicleType;
    private String ownerName;
    private List<Integer> allocatedSlots = new ArrayList<>();
    private Timestamp entryTime;
    private Timestamp exitTime;
    private double durationHours;
    private int billableHours;
    private double hourlyRate;
    private double totalAmount;
    private String status; // ACTIVE or EXITED
    private String notes;

    public ParkingTicket() {
        this.status = "ACTIVE";
    }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getCentreId() { return centreId; }
    public void setCentreId(String centreId) { this.centreId = centreId; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public List<Integer> getAllocatedSlots() { return allocatedSlots; }
    public void setAllocatedSlots(List<Integer> allocatedSlots) { this.allocatedSlots = allocatedSlots; }

    public Timestamp getEntryTime() { return entryTime; }
    public void setEntryTime(Timestamp entryTime) { this.entryTime = entryTime; }

    public Timestamp getExitTime() { return exitTime; }
    public void setExitTime(Timestamp exitTime) { this.exitTime = exitTime; }

    public double getDurationHours() { return durationHours; }
    public void setDurationHours(double durationHours) { this.durationHours = durationHours; }

    public int getBillableHours() { return billableHours; }
    public void setBillableHours(int billableHours) { this.billableHours = billableHours; }

    public double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(double hourlyRate) { this.hourlyRate = hourlyRate; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getAllocatedSlotsJson() {
        if (allocatedSlots == null || allocatedSlots.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < allocatedSlots.size(); i++) {
            sb.append(allocatedSlots.get(i));
            if (i < allocatedSlots.size() - 1) sb.append(", ");
        }
        sb.append("]");
        return sb.toString();
    }
}
