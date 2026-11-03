package com.parkease.dao;

import com.parkease.model.ParkingSlot;
import com.parkease.model.ParkingTicket;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) for managing physical parking slots in SQLite DBMS.
 * Demonstrates PreparedStatements, Transaction boundaries, and Batch updates.
 */
public class SlotDAO {

    /**
     * Retrieve all 50 slots for a given parking centre, ordered by slot number.
     */
    public List<ParkingSlot> getSlotsByCentre(String centreId) throws SQLException {
        List<ParkingSlot> slots = new ArrayList<>();
        String sql = "SELECT * FROM parking_slots WHERE centre_id = ? ORDER BY slot_number ASC;";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, centreId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ParkingSlot slot = new ParkingSlot();
                    slot.setId(rs.getString("id"));
                    slot.setCentreId(rs.getString("centre_id"));
                    slot.setSlotNumber(rs.getInt("slot_number"));
                    slot.setFloorLevel(rs.getInt("floor_level"));
                    slot.setOccupied(rs.getInt("is_occupied") == 1);
                    slot.setOccupiedTicketId(rs.getString("occupied_ticket_id"));
                    slot.setOccupiedVehicleType(rs.getString("occupied_vehicle_type"));
                    slot.setOccupiedPlateNumber(rs.getString("occupied_plate_number"));
                    slot.setOccupiedOwnerName(rs.getString("occupied_owner_name"));
                    slot.setOccupiedEntryTime(rs.getTimestamp("occupied_entry_time"));
                    slot.setPrimarySlot(rs.getInt("is_primary_slot") == 1);
                    int comp = rs.getInt("companion_slot");
                    if (!rs.wasNull()) {
                        slot.setCompanionSlot(comp);
                    }
                    slots.add(slot);
                }
            }
        }
        return slots;
    }

    /**
     * Mark slots as occupied within a transaction.
     */
    public boolean occupySlots(String centreId, List<Integer> slotNumbers, ParkingTicket ticket) throws SQLException {
        String sql = "UPDATE parking_slots SET " +
                "is_occupied = 1, " +
                "occupied_ticket_id = ?, " +
                "occupied_vehicle_type = ?, " +
                "occupied_plate_number = ?, " +
                "occupied_owner_name = ?, " +
                "occupied_entry_time = CURRENT_TIMESTAMP, " +
                "is_primary_slot = ?, " +
                "companion_slot = ?, " +
                "updated_at = CURRENT_TIMESTAMP " +
                "WHERE centre_id = ? AND slot_number = ?;";

        Connection conn = DatabaseConnection.getConnection();
        boolean originalAutoCommit = conn.getAutoCommit();
        try {
            conn.setAutoCommit(false); // Begin Transaction
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                for (int i = 0; i < slotNumbers.size(); i++) {
                    int slotNum = slotNumbers.get(i);
                    ps.setString(1, ticket.getTicketId());
                    ps.setString(2, ticket.getVehicleType().getCode());
                    ps.setString(3, ticket.getVehicleNumber());
                    ps.setString(4, ticket.getOwnerName());
                    ps.setInt(5, (i == 0) ? 1 : 0); // Primary slot is first
                    if (slotNumbers.size() > 1) {
                        int comp = (i == 0) ? slotNumbers.get(1) : slotNumbers.get(0);
                        ps.setInt(6, comp);
                    } else {
                        ps.setNull(6, Types.INTEGER);
                    }
                    ps.setString(7, centreId);
                    ps.setInt(8, slotNum);
                    ps.executeUpdate();
                }
            }
            conn.commit(); // Commit Transaction
            return true;
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(originalAutoCommit);
        }
    }

    /**
     * Release slots back to available status.
     */
    public boolean freeSlots(String centreId, List<Integer> slotNumbers) throws SQLException {
        String sql = "UPDATE parking_slots SET " +
                "is_occupied = 0, " +
                "occupied_ticket_id = NULL, " +
                "occupied_vehicle_type = NULL, " +
                "occupied_plate_number = NULL, " +
                "occupied_owner_name = NULL, " +
                "occupied_entry_time = NULL, " +
                "is_primary_slot = 0, " +
                "companion_slot = NULL, " +
                "updated_at = CURRENT_TIMESTAMP " +
                "WHERE centre_id = ? AND slot_number = ?;";

        Connection conn = DatabaseConnection.getConnection();
        boolean originalAutoCommit = conn.getAutoCommit();
        try {
            conn.setAutoCommit(false);
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                for (int slotNum : slotNumbers) {
                    ps.setString(1, centreId);
                    ps.setInt(2, slotNum);
                    ps.executeUpdate();
                }
            }
            conn.commit();
            return true;
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(originalAutoCommit);
        }
    }

    /**
     * Reset all 50 slots of a centre back to available.
     */
    public void resetCentreSlots(String centreId) throws SQLException {
        String sql = "UPDATE parking_slots SET " +
                "is_occupied = 0, " +
                "occupied_ticket_id = NULL, " +
                "occupied_vehicle_type = NULL, " +
                "occupied_plate_number = NULL, " +
                "occupied_owner_name = NULL, " +
                "occupied_entry_time = NULL, " +
                "is_primary_slot = 0, " +
                "companion_slot = NULL, " +
                "updated_at = CURRENT_TIMESTAMP " +
                "WHERE centre_id = ?;";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, centreId);
            ps.executeUpdate();
        }
    }
}
