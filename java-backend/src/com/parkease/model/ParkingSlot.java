package com.parkease.model;

import java.sql.Timestamp;

/**
 * Model representing a physical parking slot (1 to 50) within a parking centre.
 */
public class ParkingSlot {
    private String id; // Format: cbe-gandhipuram-S1
    private String centreId;
    private int slotNumber;
    private int floorLevel;
    private boolean isOccupied;
    private String occupiedTicketId;
    private String occupiedVehicleType;
    private String occupiedPlateNumber;
    private String occupiedOwnerName;
    private Timestamp occupiedEntryTime;
    private boolean isPrimarySlot;
    private Integer companionSlot;

    public ParkingSlot() {}

    public ParkingSlot(String id, String centreId, int slotNumber, int floorLevel) {
        this.id = id;
        this.centreId = centreId;
        this.slotNumber = slotNumber;
        this.floorLevel = floorLevel;
        this.isOccupied = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCentreId() { return centreId; }
    public void setCentreId(String centreId) { this.centreId = centreId; }

    public int getSlotNumber() { return slotNumber; }
    public void setSlotNumber(int slotNumber) { this.slotNumber = slotNumber; }

    public int getFloorLevel() { return floorLevel; }
    public void setFloorLevel(int floorLevel) { this.floorLevel = floorLevel; }

    public boolean isOccupied() { return isOccupied; }
    public void setOccupied(boolean occupied) { isOccupied = occupied; }

    public String getOccupiedTicketId() { return occupiedTicketId; }
    public void setOccupiedTicketId(String occupiedTicketId) { this.occupiedTicketId = occupiedTicketId; }

    public String getOccupiedVehicleType() { return occupiedVehicleType; }
    public void setOccupiedVehicleType(String occupiedVehicleType) { this.occupiedVehicleType = occupiedVehicleType; }

    public String getOccupiedPlateNumber() { return occupiedPlateNumber; }
    public void setOccupiedPlateNumber(String occupiedPlateNumber) { this.occupiedPlateNumber = occupiedPlateNumber; }

    public String getOccupiedOwnerName() { return occupiedOwnerName; }
    public void setOccupiedOwnerName(String occupiedOwnerName) { this.occupiedOwnerName = occupiedOwnerName; }

    public Timestamp getOccupiedEntryTime() { return occupiedEntryTime; }
    public void setOccupiedEntryTime(Timestamp occupiedEntryTime) { this.occupiedEntryTime = occupiedEntryTime; }

    public boolean isPrimarySlot() { return isPrimarySlot; }
    public void setPrimarySlot(boolean primarySlot) { isPrimarySlot = primarySlot; }

    public Integer getCompanionSlot() { return companionSlot; }
    public void setCompanionSlot(Integer companionSlot) { this.companionSlot = companionSlot; }

    @Override
    public String toString() {
        return String.format("Slot #%02d [Floor %d] - %s", 
            slotNumber, floorLevel, isOccupied ? "OCCUPIED (" + occupiedPlateNumber + ")" : "AVAILABLE");
    }
}
