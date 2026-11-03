package com.parkease.dao;

import com.parkease.model.User;
import com.parkease.util.PasswordUtil;

import java.sql.*;

/**
 * Data Access Object (DAO) for User entity.
 * Uses JDBC PreparedStatements for SQL injection prevention and secure transaction execution.
 */
public class UserDAO {

    /**
     * Inserts a new user into the database.
     *
     * @param user the User object to persist
     * @return true if user inserted successfully
     * @throws SQLException if a database error occurs
     */
    public boolean createUser(User user) throws SQLException {
        String sql = "INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?);";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, user.getName().trim());
            ps.setString(2, user.getEmail().trim().toLowerCase());
            ps.setString(3, user.getPhone().trim());
            ps.setString(4, user.getPasswordHash());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        user.setUserId(keys.getInt(1));
                    }
                }
                return true;
            }
            return false;
        }
    }

    /**
     * Retrieves a user by their unique email.
     */
    public User getUserByEmail(String email) throws SQLException {
        String sql = "SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email.trim().toLowerCase());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        }
        return null;
    }

    /**
     * Retrieves a user by their user ID.
     */
    public User getUserById(int userId) throws SQLException {
        String sql = "SELECT * FROM users WHERE user_id = ? LIMIT 1;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        }
        return null;
    }

    /**
     * Retrieves a user by their unique phone number.
     */
    public User getUserByPhone(String phone) throws SQLException {
        String sql = "SELECT * FROM users WHERE phone = ? LIMIT 1;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, phone.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        }
        return null;
    }

    /**
     * Checks if an email is already registered, optionally excluding a specific user ID.
     */
    public boolean emailExists(String email, Integer excludeUserId) throws SQLException {
        String sql = excludeUserId == null
                ? "SELECT 1 FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1;"
                : "SELECT 1 FROM users WHERE LOWER(email) = LOWER(?) AND user_id != ? LIMIT 1;";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email.trim().toLowerCase());
            if (excludeUserId != null) {
                ps.setInt(2, excludeUserId);
            }
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    /**
     * Checks if a phone number is already registered, optionally excluding a specific user ID.
     */
    public boolean phoneExists(String phone, Integer excludeUserId) throws SQLException {
        String sql = excludeUserId == null
                ? "SELECT 1 FROM users WHERE phone = ? LIMIT 1;"
                : "SELECT 1 FROM users WHERE phone = ? AND user_id != ? LIMIT 1;";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, phone.trim());
            if (excludeUserId != null) {
                ps.setInt(2, excludeUserId);
            }
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    /**
     * Authenticates a user using email and plain-text password.
     *
     * @return the User if credentials are valid, null otherwise
     */
    public User authenticate(String email, String rawPassword) throws SQLException {
        User user = getUserByEmail(email);
        if (user != null && PasswordUtil.verifyPassword(rawPassword, user.getPasswordHash())) {
            return user;
        }
        return null;
    }

    /**
     * Updates personal profile information for an existing user.
     */
    public boolean updateProfile(int userId, String name, String email, String phone) throws SQLException {
        String sql = "UPDATE users SET name = ?, email = ?, phone = ? WHERE user_id = ?;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, name.trim());
            ps.setString(2, email.trim().toLowerCase());
            ps.setString(3, phone.trim());
            ps.setInt(4, userId);
            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Updates user password with new hashed password.
     */
    public boolean updatePassword(int userId, String newPasswordHash) throws SQLException {
        String sql = "UPDATE users SET password_hash = ? WHERE user_id = ?;";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, newPasswordHash);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        }
    }

    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User u = new User();
        u.setUserId(rs.getInt("user_id"));
        u.setName(rs.getString("name"));
        u.setEmail(rs.getString("email"));
        u.setPhone(rs.getString("phone"));
        u.setPasswordHash(rs.getString("password_hash"));
        try {
            u.setCreatedAt(rs.getTimestamp("created_at"));
        } catch (SQLException ignored) {}
        return u;
    }
}
