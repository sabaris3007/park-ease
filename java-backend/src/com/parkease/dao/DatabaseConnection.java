package com.parkease.dao;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Singleton Database Connection Manager for SQLite DBMS.
 * Demonstrates JDBC driver loading, connection pooling, and configuration.
 */
public class DatabaseConnection {
    private static Connection connection = null;

    private static String getDatabasePath() {
        String[] candidatePaths = {
            "database/parking_system.db",
            "/app/applet/database/parking_system.db",
            "../database/parking_system.db",
            "parking_system.db"
        };
        for (String p : candidatePaths) {
            File f = new File(p);
            if (f.exists()) {
                return f.getAbsolutePath();
            }
        }
        return new File("database/parking_system.db").getAbsolutePath();
    }

    public static synchronized Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            try {
                Class.forName("org.sqlite.JDBC");
            } catch (ClassNotFoundException e) {
                System.err.println("Warning: org.sqlite.JDBC driver not found on classpath: " + e.getMessage());
            }
            String dbPath = getDatabasePath();
            String url = "jdbc:sqlite:" + dbPath;
            connection = DriverManager.getConnection(url);
            // Enable foreign keys
            connection.createStatement().execute("PRAGMA foreign_keys = ON;");
        }
        return connection;
    }

    public static void closeConnection() {
        if (connection != null) {
            try {
                connection.close();
            } catch (SQLException ignored) {}
        }
    }
}
