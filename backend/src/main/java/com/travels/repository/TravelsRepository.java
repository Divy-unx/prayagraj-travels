package com.travels.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * All MySQL operations via JDBC Template (no JPA).
 */
@Repository
public class TravelsRepository {

    @Autowired
    private JdbcTemplate jdbc;

    // ══════════════════════════════════════════════════════════════════════════
    // BUS QUERIES
    // ══════════════════════════════════════════════════════════════════════════

    public List<Map<String, Object>> findAllBuses() {
        String sql = "SELECT * FROM buses ORDER BY id";
        return jdbc.queryForList(sql);
    }

    public List<Map<String, Object>> findAllBusSummaries() {
        String sql = "SELECT id, name, source, destination, capacity, fare FROM buses ORDER BY id";
        return jdbc.queryForList(sql);
    }

    public Map<String, Object> findBusById(Long busId) {
        String sql = "SELECT * FROM buses WHERE id = ?";
        List<Map<String, Object>> rows = jdbc.queryForList(sql, busId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public List<String> suggestLocations(String query) {
        String sql = """
                SELECT DISTINCT location FROM (
                    SELECT source AS location FROM buses
                    UNION
                    SELECT destination AS location FROM buses
                    UNION
                    SELECT name AS location FROM buses
                ) places
                WHERE LOWER(location) LIKE LOWER(CONCAT('%', ?, '%'))
                ORDER BY location
                LIMIT 10
                """;
        return jdbc.queryForList(sql, String.class, query);
    }

    /**
     * Case-insensitive search by source + destination.
     */
    public List<Map<String, Object>> searchBuses(String source, String destination, int limit, int offset) {
        String sql = """
                SELECT * FROM buses
                WHERE LOWER(source) LIKE LOWER(CONCAT('%', ?, '%'))
                  AND LOWER(destination) LIKE LOWER(CONCAT('%', ?, '%'))
                ORDER BY id
                LIMIT ? OFFSET ?
                """;
        return jdbc.queryForList(sql, source, destination, limit, offset);
    }

    public int countBuses(String source, String destination) {
        String sql = """
                SELECT COUNT(*)
                FROM buses
                WHERE LOWER(source) LIKE LOWER(CONCAT('%', ?, '%'))
                  AND LOWER(destination) LIKE LOWER(CONCAT('%', ?, '%'))
                """;
        Integer count = jdbc.queryForObject(sql, Integer.class, source, destination);
        return count == null ? 0 : count;
    }

    public long createBus(String name, String source, String destination, int capacity, double fare) {
        String sql = "INSERT INTO buses (name, source, destination, capacity, fare) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, name);
            ps.setString(2, source);
            ps.setString(3, destination);
            ps.setInt(4, capacity);
            ps.setDouble(5, fare);
            return ps;
        }, keyHolder);
        return Objects.requireNonNull(keyHolder.getKey()).longValue();
    }

    public int updateBus(long id, String name, String source, String destination, int capacity, double fare) {
        String sql = "UPDATE buses SET name = ?, source = ?, destination = ?, capacity = ?, fare = ? WHERE id = ?";
        return jdbc.update(sql, name, source, destination, capacity, fare, id);
    }

    public int deleteBus(long id) {
        return jdbc.update("DELETE FROM buses WHERE id = ?", id);
    }

    public List<Map<String, Object>> findFavoriteRoutes(long userId) {
        String sql = "SELECT * FROM favorite_routes WHERE user_id = ? ORDER BY created_at DESC";
        return jdbc.queryForList(sql, userId);
    }

    public int saveFavoriteRoute(long userId, String source, String destination, String notes) {
        String sql = """
                INSERT INTO favorite_routes (user_id, source, destination, notes)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE notes = VALUES(notes)
                """;
        return jdbc.update(sql, userId, source, destination, notes);
    }

    public int deleteFavoriteRoute(long userId, String source, String destination) {
        return jdbc.update("DELETE FROM favorite_routes WHERE user_id = ? AND source = ? AND destination = ?", userId, source, destination);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SEAT QUERIES
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Returns all BOOKED seats for a given bus + date from MySQL.
     */
    public List<String> findBookedSeats(Long busId, String travelDate) {
        String sql = """
                SELECT seat_number
                FROM bookings
                WHERE bus_id = ?
                  AND travel_date = ?
                  AND status = 'CONFIRMED'
                """;
        return jdbc.queryForList(sql, String.class, busId, travelDate);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BOOKING OPERATIONS
    // ══════════════════════════════════════════════════════════════════════════

    public boolean isSeatBooked(Long busId, String seatNumber, String travelDate) {
        String sql = """
                SELECT COUNT(*) FROM bookings
                WHERE bus_id = ? AND seat_number = ? AND travel_date = ?
                  AND status = 'CONFIRMED'
                """;
        Integer count = jdbc.queryForObject(sql, Integer.class, busId, seatNumber, travelDate);
        return count != null && count > 0;
    }

    /**
     * Inserts a confirmed booking only if no CONFIRMED booking already exists for
     * the same seat on the same date (DB-level double-booking guard).
     *
     * @return generated booking_id, or -1 if the seat was already booked
     */
    public long confirmBooking(Long busId, String seatNumber, String travelDate,
                               String userId, String passengerName,
                               String passengerPhone, double farePaid) {
        String sql = """
                INSERT INTO bookings
                    (bus_id, seat_number, travel_date, user_id, passenger_name, passenger_phone, status, fare_paid)
                SELECT ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?
                FROM DUAL
                WHERE NOT EXISTS (
                    SELECT 1 FROM bookings
                    WHERE bus_id = ? AND seat_number = ? AND travel_date = ? AND status = 'CONFIRMED'
                )
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        int rows = jdbc.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, busId);
            ps.setString(2, seatNumber);
            ps.setString(3, travelDate);
            ps.setString(4, userId);
            ps.setString(5, passengerName != null ? passengerName : "Passenger");
            ps.setString(6, passengerPhone);
            ps.setDouble(7, farePaid);
            // WHERE NOT EXISTS parameters
            ps.setLong(8, busId);
            ps.setString(9, seatNumber);
            ps.setString(10, travelDate);
            return ps;
        }, keyHolder);

        if (rows == 0 || keyHolder.getKey() == null) {
            return -1; // seat already confirmed by a concurrent request
        }
        return keyHolder.getKey().longValue();
    }

    public Map<String, Object> findBookingById(long bookingId) {
        String sql = "SELECT booking_id AS id, bus_id, seat_number, travel_date, user_id, passenger_name, passenger_phone, status, fare_paid, booked_at, cancelled_at, refund_status, refund_amount FROM bookings WHERE booking_id = ?";
        List<Map<String, Object>> rows = jdbc.queryForList(sql, bookingId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public List<Map<String, Object>> findBookingsByUser(String userId) {
        String sql = """
                SELECT bk.booking_id AS id, bk.bus_id, bk.seat_number, bk.travel_date,
                       bk.user_id, bk.passenger_name, bk.passenger_phone, bk.status,
                       bk.fare_paid, bk.booked_at, bk.cancelled_at, bk.refund_status,
                       bk.refund_amount, b.name as bus_name, b.source, b.destination
                FROM bookings bk
                JOIN buses b ON bk.bus_id = b.id
                WHERE bk.user_id = ?
                ORDER BY bk.booked_at DESC
                """;
        return jdbc.queryForList(sql, userId);
    }

    public Map<String, Object> findBookingForCancel(long bookingId) {
        String sql = """
                SELECT bk.*, b.name as bus_name, b.source, b.destination
                FROM bookings bk
                JOIN buses b ON bk.bus_id = b.id
                WHERE bk.booking_id = ?
                """;
        List<Map<String, Object>> rows = jdbc.queryForList(sql, bookingId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public boolean cancelBooking(long bookingId, String userId, double refundAmount) {
        String sql = """
                UPDATE bookings
                SET status = 'CANCELLED',
                    cancelled_at = NOW(),
                    refund_status = 'PENDING',
                    refund_amount = ?
                WHERE booking_id = ? AND user_id = ? AND status = 'CONFIRMED'
                """;
        int rows = jdbc.update(sql, refundAmount, bookingId, userId);
        return rows > 0;
    }

    public void insertCancellationLog(long bookingId, String userId, String reason, double refundAmount) {
        String sql = """
                INSERT INTO cancellation_logs (booking_id, user_id, reason, refund_amount, refund_status)
                VALUES (?, ?, ?, ?, 'PENDING')
                """;
        jdbc.update(sql, bookingId, userId, reason, refundAmount);
    }

    public List<Map<String, Object>> findCancellationsByUser(String userId) {
        String sql = """
                SELECT cl.*, bk.bus_id, bk.seat_number, bk.travel_date, bk.fare_paid,
                       b.name as bus_name, b.source, b.destination
                FROM cancellation_logs cl
                JOIN bookings bk ON cl.booking_id = bk.booking_id
                JOIN buses b ON bk.bus_id = b.id
                WHERE cl.user_id = ?
                ORDER BY cl.cancelled_at DESC
                """;
        return jdbc.queryForList(sql, userId);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LIVE LOCATION
    // ══════════════════════════════════════════════════════════════════════════

    public Map<String, Object> findLiveLocation(Long busId) {
        String sql = """
                SELECT l.*, b.name as bus_name, b.source, b.destination
                FROM bus_live_location l
                JOIN buses b ON l.bus_id = b.id
                WHERE l.bus_id = ?
                """;
        List<Map<String, Object>> rows = jdbc.queryForList(sql, busId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public List<Map<String, Object>> findAllLiveLocations() {
        String sql = """
                SELECT l.*, b.name as bus_name, b.source, b.destination
                FROM bus_live_location l
                JOIN buses b ON l.bus_id = b.id
                ORDER BY l.bus_id
                """;
        return jdbc.queryForList(sql);
    }

    public void updateLiveLocation(Long busId, double lat, double lng,
                                   int speedKmh, int heading, String nextStop, String status) {
        String sql = """
                INSERT INTO bus_live_location (bus_id, latitude, longitude, speed_kmh, heading_degrees, next_stop, status)
                VALUES (?, ?, ?, ?, ?, ?, ?) AS new_val
                ON DUPLICATE KEY UPDATE
                latitude = new_val.latitude, longitude = new_val.longitude, speed_kmh = new_val.speed_kmh,
                heading_degrees = new_val.heading_degrees, next_stop = new_val.next_stop, status = new_val.status,
                last_updated = NOW()
                """;
        jdbc.update(sql, busId, lat, lng, speedKmh, heading, nextStop, status);
    }
}
