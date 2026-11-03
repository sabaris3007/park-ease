package com.parkease.dao;

import com.parkease.model.Vehicle;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) for Vehicle entity.
 * Associates vehicles with user accounts via user_id foreign key.
 */
public class VehicleDAO {

    /**
     * Adds a new vehicle for a user.
     */
    public boolean addVehicle(Vehicle vehicle) throws SQLException {
        String sql = "INSERT INTO vehicles (user_id, vehicle_number, vehicle_type) VALUES (?, ?, ?);";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, vehicle.getUserId());
            ps.setString(2, vehicle.getVehicleNumber().trim().toUpperCase());
            ps.setString(3, vehicle.getVehicleType().trim());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        vehicle.setVehicleId(keys.getInt(1));
                    }
                }
                return true;
            }
            return false;
        }
    }

    /**
     * Retrieves all vehicles belonging to a specific user.
     */
    public List<Vehicle> getVehiclesByUserId(int userId) throws SQLException {
        List<Vehicle> list = new ArrayList<>();
        String sql = "SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToVehicle(rs));
                }
            }
        }
        return list;
    }

    /**
     * Retrieves a vehicle by vehicle ID.
     */
    public Vehicle getVehicleById(int vehicleId) throws SQLException {
        String sql = "SELECT * FROM vehicles WHERE vehicle_id = ? LIMIT 1;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, vehicleId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToVehicle(rs);
                }
            }
        }
        return null;
    }

    /**
     * Retrieves a vehicle by registration number.
     */
    public Vehicle getVehicleByNumber(String vehicleNumber) throws SQLException {
        String sql = "SELECT * FROM vehicles WHERE UPPER(REPLACE(vehicle_number, ' ', '')) = UPPER(REPLACE(?, ' ', '')) LIMIT 1;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, vehicleNumber.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToVehicle(rs);
                }
            }
        }
        return null;
    }

    /**
     * Checks if a vehicle registration number is already registered in the system.
     */
    public boolean isVehicleNumberTaken(String vehicleNumber, Integer excludeVehicleId) throws SQLException {
        String sql = excludeVehicleId == null
                ? "SELECT 1 FROM vehicles WHERE UPPER(REPLACE(vehicle_number, ' ', '')) = UPPER(REPLACE(?, ' ', '')) LIMIT 1;"
                : "SELECT 1 FROM vehicles WHERE UPPER(REPLACE(vehicle_number, ' ', '')) = UPPER(REPLACE(?, ' ', '')) AND vehicle_id != ? LIMIT 1;";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, vehicleNumber.trim());
            if (excludeVehicleId != null) {
                ps.setInt(2, excludeVehicleId);
            }
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    /**
     * Updates vehicle registration details.
     */
    public boolean updateVehicle(int vehicleId, int userId, String vehicleNumber, String vehicleType) throws SQLException {
        String sql = "UPDATE vehicles SET vehicle_number = ?, vehicle_type = ? WHERE vehicle_id = ? AND user_id = ?;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, vehicleNumber.trim().toUpperCase());
            ps.setString(2, vehicleType.trim());
            ps.setInt(3, vehicleId);
            ps.setInt(4, userId);
            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Deletes a vehicle belonging to a user.
     */
    public boolean deleteVehicle(int vehicleId, int userId) throws SQLException {
        String sql = "DELETE FROM vehicles WHERE vehicle_id = ? AND user_id = ?;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, vehicleId);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        }
    }

    private Vehicle mapResultSetToVehicle(ResultSet rs) throws SQLException {
        Vehicle v = new Vehicle();
        v.setVehicleId(rs.getInt("vehicle_id"));
        v.setUserId(rs.getInt("user_id"));
        v.setVehicleNumber(rs.getString("vehicle_number"));
        v.setVehicleType(rs.getString("vehicle_type"));
        try {
            v.setCreatedAt(rs.getTimestamp("created_at"));
        } catch (SQLException ignored) {}
        return v;
    }
}
