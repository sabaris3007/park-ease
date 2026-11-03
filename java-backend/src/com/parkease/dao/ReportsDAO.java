package com.parkease.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Data Access Object (DAO) for DBMS analytical queries, view querying,
 * revenue calculations, and occupancy statistics.
 */
public class ReportsDAO {

    /**
     * Queries the relational VIEW 'v_centre_occupancy'
     */
    public List<Map<String, Object>> getCentreOccupancySummary() throws SQLException {
        List<Map<String, Object>> results = new ArrayList<>();
        String sql = "SELECT * FROM v_centre_occupancy ORDER BY occupancy_rate_pct DESC;";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("centreId", rs.getString("centre_id"));
                row.put("centreName", rs.getString("centre_name"));
                row.put("city", rs.getString("city"));
                row.put("totalSlots", rs.getInt("total_slots"));
                row.put("occupiedSlots", rs.getInt("occupied_slots"));
                row.put("availableSlots", rs.getInt("available_slots"));
                row.put("occupancyPct", rs.getDouble("occupancy_rate_pct"));
                row.put("totalRevenue", rs.getDouble("total_revenue"));
                results.add(row);
            }
        }
        return results;
    }

    /**
     * Queries the relational VIEW 'v_revenue_by_vehicle'
     */
    public List<Map<String, Object>> getRevenueByVehicleType() throws SQLException {
        List<Map<String, Object>> results = new ArrayList<>();
        String sql = "SELECT * FROM v_revenue_by_vehicle;";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("vehicleType", rs.getString("vehicle_type"));
                row.put("totalTrips", rs.getInt("total_trips"));
                row.put("avgDurationHours", rs.getDouble("avg_duration_hours"));
                row.put("totalRevenue", rs.getDouble("total_revenue"));
                results.add(row);
            }
        }
        return results;
    }

    /**
     * Executes arbitrary user SQL queries from the DBMS Console securely.
     */
    public Map<String, Object> executeCustomQuery(String sql) throws SQLException {
        Map<String, Object> response = new HashMap<>();
        long startTime = System.currentTimeMillis();

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            boolean isResultSet = stmt.execute(sql);
            long duration = System.currentTimeMillis() - startTime;
            response.put("executionTimeMs", duration);

            if (isResultSet) {
                try (ResultSet rs = stmt.getResultSet()) {
                    ResultSetMetaData md = rs.getMetaData();
                    int columns = md.getColumnCount();
                    List<String> columnNames = new ArrayList<>();
                    for (int i = 1; i <= columns; i++) {
                        columnNames.add(md.getColumnLabel(i));
                    }
                    response.put("columns", columnNames);

                    List<List<Object>> rows = new ArrayList<>();
                    while (rs.next()) {
                        List<Object> row = new ArrayList<>();
                        for (int i = 1; i <= columns; i++) {
                            row.add(rs.getObject(i));
                        }
                        rows.add(row);
                    }
                    response.put("rows", rows);
                    response.put("rowCount", rows.size());
                }
            } else {
                int updateCount = stmt.getUpdateCount();
                response.put("updateCount", updateCount);
                response.put("message", "Query OK, " + updateCount + " rows affected.");
            }
        }
        return response;
    }
}
