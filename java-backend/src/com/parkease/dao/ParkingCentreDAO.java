package com.parkease.dao;

import com.parkease.model.ParkingCentre;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object (DAO) for parking centres master records in SQLite DBMS.
 */
public class ParkingCentreDAO {

    public List<ParkingCentre> getAllCentres() throws SQLException {
        List<ParkingCentre> list = new ArrayList<>();
        String sql = "SELECT * FROM parking_centres ORDER BY name ASC;";
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapResultSetToCentre(rs));
            }
        }
        return list;
    }

    public ParkingCentre getCentreById(String id) throws SQLException {
        String sql = "SELECT * FROM parking_centres WHERE id = ?;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToCentre(rs);
                }
            }
        }
        return null;
    }

    private ParkingCentre mapResultSetToCentre(ResultSet rs) throws SQLException {
        ParkingCentre c = new ParkingCentre();
        c.setId(rs.getString("id"));
        c.setName(rs.getString("name"));
        c.setCity(rs.getString("city"));
        c.setLocality(rs.getString("locality"));
        c.setAddress(rs.getString("address"));
        c.setLandmark(rs.getString("landmark"));
        c.setPhone(rs.getString("phone"));
        c.setTotalSlots(rs.getInt("total_slots"));
        c.setRating(rs.getDouble("rating"));
        c.setReviewsCount(rs.getInt("reviews_count"));
        c.setLatitude(rs.getDouble("latitude"));
        c.setLongitude(rs.getDouble("longitude"));
        c.setOpeningHours(rs.getString("opening_hours"));
        c.setIs24x7(rs.getInt("is_24x7") == 1);
        c.setTariffBike(rs.getDouble("tariff_bike"));
        c.setTariffCar(rs.getDouble("tariff_car"));
        c.setTariffTruck(rs.getDouble("tariff_truck"));
        c.setAmenities(rs.getString("amenities"));
        return c;
    }
}
