package com.parkease.dao;

import com.parkease.model.ParkingTicket;
import com.parkease.model.VehicleType;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) for parking ticket persistence in SQLite DBMS.
 */
public class TicketDAO {

    public boolean createTicket(ParkingTicket ticket) throws SQLException {
        String sql = "INSERT INTO parking_tickets (" +
                "ticket_id, centre_id, vehicle_number, vehicle_type, owner_name, " +
                "allocated_slots_json, entry_time, hourly_rate, status" +
                ") VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 'ACTIVE');";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, ticket.getTicketId());
            ps.setString(2, ticket.getCentreId());
            ps.setString(3, ticket.getVehicleNumber());
            ps.setString(4, ticket.getVehicleType().getCode());
            ps.setString(5, ticket.getOwnerName());
            ps.setString(6, ticket.getAllocatedSlotsJson());
            ps.setDouble(7, ticket.getHourlyRate());
            return ps.executeUpdate() > 0;
        }
    }

    public ParkingTicket getTicketById(String ticketId) throws SQLException {
        String sql = "SELECT * FROM parking_tickets WHERE ticket_id = ?;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, ticketId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToTicket(rs);
                }
            }
        }
        return null;
    }

    public ParkingTicket getActiveTicketByPlate(String centreId, String plate) throws SQLException {
        String sql = "SELECT * FROM parking_tickets WHERE centre_id = ? AND UPPER(REPLACE(vehicle_number, ' ', '')) = UPPER(REPLACE(?, ' ', '')) AND status = 'ACTIVE' LIMIT 1;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, centreId);
            ps.setString(2, plate);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToTicket(rs);
                }
            }
        }
        return null;
    }

    public boolean closeTicket(String ticketId, double durationHours, int billableHours, double totalAmount, String notes) throws SQLException {
        String sql = "UPDATE parking_tickets SET " +
                "status = 'EXITED', " +
                "exit_time = CURRENT_TIMESTAMP, " +
                "duration_hours = ?, " +
                "billable_hours = ?, " +
                "total_amount = ?, " +
                "notes = ? " +
                "WHERE ticket_id = ?;";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDouble(1, durationHours);
            ps.setInt(2, billableHours);
            ps.setDouble(3, totalAmount);
            ps.setString(4, notes);
            ps.setString(5, ticketId);
            return ps.executeUpdate() > 0;
        }
    }

    public List<ParkingTicket> getAllTickets(String centreId) throws SQLException {
        List<ParkingTicket> list = new ArrayList<>();
        String sql = "SELECT * FROM parking_tickets WHERE centre_id = ? ORDER BY created_at DESC;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, centreId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToTicket(rs));
                }
            }
        }
        return list;
    }

    public List<ParkingTicket> getTicketsByPlates(List<String> plates) throws SQLException {
        List<ParkingTicket> list = new ArrayList<>();
        if (plates == null || plates.isEmpty()) return list;

        StringBuilder placeholders = new StringBuilder();
        for (int i = 0; i < plates.size(); i++) {
            placeholders.append("?");
            if (i < plates.size() - 1) placeholders.append(", ");
        }

        String sql = "SELECT * FROM parking_tickets WHERE UPPER(REPLACE(vehicle_number, ' ', '')) IN (" + placeholders + ") ORDER BY created_at DESC;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < plates.size(); i++) {
                ps.setString(i + 1, plates.get(i).replace(" ", "").toUpperCase());
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapResultSetToTicket(rs));
                }
            }
        }
        return list;
    }

    private ParkingTicket mapResultSetToTicket(ResultSet rs) throws SQLException {
        ParkingTicket t = new ParkingTicket();
        t.setTicketId(rs.getString("ticket_id"));
        t.setCentreId(rs.getString("centre_id"));
        t.setVehicleNumber(rs.getString("vehicle_number"));
        t.setVehicleType(VehicleType.fromString(rs.getString("vehicle_type")));
        t.setOwnerName(rs.getString("owner_name"));
        t.setEntryTime(rs.getTimestamp("entry_time"));
        t.setExitTime(rs.getTimestamp("exit_time"));
        t.setDurationHours(rs.getDouble("duration_hours"));
        t.setBillableHours(rs.getInt("billable_hours"));
        t.setHourlyRate(rs.getDouble("hourly_rate"));
        t.setTotalAmount(rs.getDouble("total_amount"));
        t.setStatus(rs.getString("status"));
        t.setNotes(rs.getString("notes"));

        // Parse allocated slots JSON
        String slotsJson = rs.getString("allocated_slots_json");
        List<Integer> slots = new ArrayList<>();
        if (slotsJson != null && !slotsJson.trim().isEmpty()) {
            String cleaned = slotsJson.replace("[", "").replace("]", "").trim();
            if (!cleaned.isEmpty()) {
                String[] parts = cleaned.split(",");
                for (String p : parts) {
                    try {
                        slots.add(Integer.parseInt(p.trim()));
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        t.setAllocatedSlots(slots);
        return t;
    }
}
