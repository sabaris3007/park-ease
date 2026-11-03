package com.parkease.service;

import com.parkease.dao.TicketDAO;
import com.parkease.dao.UserDAO;
import com.parkease.dao.VehicleDAO;
import com.parkease.model.ParkingTicket;
import com.parkease.model.User;
import com.parkease.model.Vehicle;
import com.parkease.util.PasswordUtil;

import java.sql.SQLException;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Service Layer for User Management and Vehicle Management.
 * Encapsulates validation, password hashing, credential authentication,
 * and user dashboard aggregation.
 */
public class UserService {
    private final UserDAO userDAO = new UserDAO();
    private final VehicleDAO vehicleDAO = new VehicleDAO();
    private final TicketDAO ticketDAO = new TicketDAO();

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^[0-9+\\-\\s]{7,15}$");

    /**
     * Registers a new user account with validation and duplicate prevention.
     */
    public User registerUser(String name, String email, String phone, String rawPassword) throws SQLException {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        if (email == null || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("Please provide a valid email address.");
        }
        if (phone == null || !PHONE_PATTERN.matcher(phone.trim()).matches()) {
            throw new IllegalArgumentException("Please provide a valid phone number (minimum 7 digits).");
        }
        if (rawPassword == null || rawPassword.trim().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        String cleanEmail = email.trim().toLowerCase();
        String cleanPhone = phone.trim();

        // 1. Prevent duplicate email
        if (userDAO.emailExists(cleanEmail, null)) {
            throw new IllegalArgumentException("An account with email '" + cleanEmail + "' already exists.");
        }

        // 2. Prevent duplicate phone
        if (userDAO.phoneExists(cleanPhone, null)) {
            throw new IllegalArgumentException("An account with phone number '" + cleanPhone + "' already exists.");
        }

        // 3. Hash password securely
        String hashedPassword = PasswordUtil.hashPassword(rawPassword.trim());

        // 4. Create and persist user
        User user = new User(name.trim(), cleanEmail, cleanPhone, hashedPassword);
        boolean created = userDAO.createUser(user);
        if (!created) {
            throw new SQLException("Failed to create user account. Please try again.");
        }

        return user;
    }

    /**
     * Authenticates user with email and password.
     */
    public User login(String email, String rawPassword) throws SQLException {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        User user = userDAO.authenticate(email.trim().toLowerCase(), rawPassword.trim());
        if (user == null) {
            throw new SecurityException("Invalid email or password. Please verify your credentials.");
        }
        return user;
    }

    /**
     * Retrieves user profile by user ID.
     */
    public User getUserProfile(int userId) throws SQLException {
        User user = userDAO.getUserById(userId);
        if (user == null) {
            throw new NoSuchElementException("User not found with ID: " + userId);
        }
        return user;
    }

    /**
     * Updates personal profile information with duplicate conflict checks.
     */
    public boolean updateProfile(int userId, String name, String email, String phone) throws SQLException {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Full name cannot be empty.");
        }
        if (email == null || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("Valid email is required.");
        }
        if (phone == null || !PHONE_PATTERN.matcher(phone.trim()).matches()) {
            throw new IllegalArgumentException("Valid phone number is required.");
        }

        String cleanEmail = email.trim().toLowerCase();
        String cleanPhone = phone.trim();

        if (userDAO.emailExists(cleanEmail, userId)) {
            throw new IllegalArgumentException("Email '" + cleanEmail + "' is already in use by another account.");
        }
        if (userDAO.phoneExists(cleanPhone, userId)) {
            throw new IllegalArgumentException("Phone number '" + cleanPhone + "' is already in use by another account.");
        }

        return userDAO.updateProfile(userId, name.trim(), cleanEmail, cleanPhone);
    }

    /**
     * Changes user password after verifying existing password.
     */
    public boolean changePassword(int userId, String currentPassword, String newPassword) throws SQLException {
        User user = userDAO.getUserById(userId);
        if (user == null) {
            throw new NoSuchElementException("User not found.");
        }

        if (!PasswordUtil.verifyPassword(currentPassword, user.getPasswordHash())) {
            throw new SecurityException("Incorrect current password.");
        }

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        String newHash = PasswordUtil.hashPassword(newPassword.trim());
        return userDAO.updatePassword(userId, newHash);
    }

    /**
     * Registers a new vehicle under the user's account.
     */
    public Vehicle registerVehicle(int userId, String vehicleNumber, String vehicleType) throws SQLException {
        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Vehicle registration number is required.");
        }
        if (vehicleType == null || vehicleType.trim().isEmpty()) {
            throw new IllegalArgumentException("Vehicle type is required.");
        }

        String normalizedPlate = vehicleNumber.trim().toUpperCase();

        // Prevent duplicate vehicle registration numbers system-wide
        if (vehicleDAO.isVehicleNumberTaken(normalizedPlate, null)) {
            throw new IllegalArgumentException("Vehicle number '" + normalizedPlate + "' is already registered in the system.");
        }

        Vehicle vehicle = new Vehicle(userId, normalizedPlate, vehicleType.trim());
        boolean created = vehicleDAO.addVehicle(vehicle);
        if (!created) {
            throw new SQLException("Failed to register vehicle. Please try again.");
        }

        return vehicle;
    }

    /**
     * Retrieves all vehicles belonging to the user.
     */
    public List<Vehicle> getUserVehicles(int userId) throws SQLException {
        return vehicleDAO.getVehiclesByUserId(userId);
    }

    /**
     * Updates an existing vehicle belonging to the user.
     */
    public boolean updateVehicle(int vehicleId, int userId, String vehicleNumber, String vehicleType) throws SQLException {
        if (vehicleNumber == null || vehicleNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Vehicle number is required.");
        }
        String normalized = vehicleNumber.trim().toUpperCase();
        if (vehicleDAO.isVehicleNumberTaken(normalized, vehicleId)) {
            throw new IllegalArgumentException("Vehicle number '" + normalized + "' is already registered to another vehicle.");
        }
        return vehicleDAO.updateVehicle(vehicleId, userId, normalized, vehicleType.trim());
    }

    /**
     * Deletes a vehicle owned by the user.
     */
    public boolean deleteVehicle(int vehicleId, int userId) throws SQLException {
        return vehicleDAO.deleteVehicle(vehicleId, userId);
    }

    /**
     * Aggregates complete personal dashboard data for the authenticated user:
     * - Profile details
     * - Registered vehicles
     * - Current active parking status
     * - Previous parking history
     * - Payment history
     */
    public Map<String, Object> getUserDashboardData(int userId) throws SQLException {
        User user = userDAO.getUserById(userId);
        if (user == null) {
            throw new NoSuchElementException("User not found.");
        }

        List<Vehicle> vehicles = vehicleDAO.getVehiclesByUserId(userId);
        List<String> plates = new ArrayList<>();
        for (Vehicle v : vehicles) {
            plates.add(v.getVehicleNumber());
        }

        List<ParkingTicket> allTickets = ticketDAO.getTicketsByPlates(plates);
        List<ParkingTicket> activeTickets = new ArrayList<>();
        List<ParkingTicket> historyTickets = new ArrayList<>();
        double totalSpent = 0.0;

        for (ParkingTicket t : allTickets) {
            if ("ACTIVE".equalsIgnoreCase(t.getStatus())) {
                activeTickets.add(t);
            } else {
                historyTickets.add(t);
                totalSpent += t.getTotalAmount();
            }
        }

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("user", user);
        dashboard.put("vehicles", vehicles);
        dashboard.put("activeTickets", activeTickets);
        dashboard.put("historyTickets", historyTickets);
        dashboard.put("totalSpent", totalSpent);
        dashboard.put("totalTrips", historyTickets.size());
        dashboard.put("activeParkingCount", activeTickets.size());

        return dashboard;
    }
}
