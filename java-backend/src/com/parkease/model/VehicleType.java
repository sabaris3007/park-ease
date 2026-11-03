package com.parkease.model;

/**
 * Represents supported vehicle types and their physical parking requirements.
 * Used across the Java backend and mapped to SQLite DBMS tables.
 */
public enum VehicleType {
    BIKE("Bike", "Two Wheeler (Motorcycle / Scooter)", 10.0, 1),
    CAR("Car", "Four Wheeler (Sedan / SUV / Hatchback)", 30.0, 1),
    TRUCK("Truck", "Heavy Vehicle (Truck / Bus / Van)", 60.0, 2);

    private final String code;
    private final String displayName;
    private final double defaultHourlyRate;
    private final int slotsRequired;

    VehicleType(String code, String displayName, double defaultHourlyRate, int slotsRequired) {
        this.code = code;
        this.displayName = displayName;
        this.defaultHourlyRate = defaultHourlyRate;
        this.slotsRequired = slotsRequired;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public double getDefaultHourlyRate() {
        return defaultHourlyRate;
    }

    public int getSlotsRequired() {
        return slotsRequired;
    }

    public static VehicleType fromString(String text) {
        for (VehicleType b : VehicleType.values()) {
            if (b.code.equalsIgnoreCase(text) || b.name().equalsIgnoreCase(text)) {
                return b;
            }
        }
        return CAR;
    }
}
