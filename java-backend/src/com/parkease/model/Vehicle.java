package com.parkease.model;

import java.sql.Timestamp;

/**
 * Model representing a registered Vehicle belonging to a User.
 * Adheres to Java OOP encapsulation principles.
 */
public class Vehicle {
    private int vehicleId;
    private int userId;
    private String vehicleNumber;
    private String vehicleType; // Car, Bike, Truck, Bus
    private Timestamp createdAt;

    public Vehicle() {
    }

    public Vehicle(int userId, String vehicleNumber, String vehicleType) {
        this.userId = userId;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
    }

    public Vehicle(int vehicleId, int userId, String vehicleNumber, String vehicleType, Timestamp createdAt) {
        this.vehicleId = vehicleId;
        this.userId = userId;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
        this.createdAt = createdAt;
    }

    public int getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(int vehicleId) {
        this.vehicleId = vehicleId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Vehicle{" +
                "vehicleId=" + vehicleId +
                ", userId=" + userId +
                ", vehicleNumber='" + vehicleNumber + '\'' +
                ", vehicleType='" + vehicleType + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
