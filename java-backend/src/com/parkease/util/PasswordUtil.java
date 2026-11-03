package com.parkease.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Utility for hashing and verifying passwords using SHA-256 with a system salt.
 */
public class PasswordUtil {
    private static final String SALT = "ParkEase_Secure_Salt_2026_DBMS";

    /**
     * Hashes a raw password string using SHA-256 and the internal salt.
     *
     * @param rawPassword the plain-text password
     * @return 64-character hexadecimal SHA-256 hash
     */
    public static String hashPassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String salted = rawPassword + SALT;
            byte[] hashBytes = md.digest(salted.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Verifies that a raw password matches a stored SHA-256 hash.
     *
     * @param rawPassword plain-text password to test
     * @param storedHash the existing hashed password from database
     * @return true if password matches, false otherwise
     */
    public static boolean verifyPassword(String rawPassword, String storedHash) {
        if (rawPassword == null || storedHash == null) {
            return false;
        }
        String calculated = hashPassword(rawPassword);
        return calculated.equalsIgnoreCase(storedHash);
    }
}
