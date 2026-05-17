package com.travels.service;

import com.travels.model.BookingRequest;
import com.travels.model.SeatHoldRequest;
import com.travels.repository.TravelsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Core business logic for Prayagraj Travels.
 * Redis is used for seat locking (HELD state, TTL = 2 min).
 * MySQL is source of truth for CONFIRMED bookings.
 */
@Service
@SuppressWarnings("null")
public class TravelsService {

    private static final Logger log = LoggerFactory.getLogger(TravelsService.class);

    /** Redis TTL for seat hold: 2 minutes */
    private static final long HOLD_TTL_SECONDS = 120L;

    @Autowired
    private TravelsRepository repo;

    @Autowired
    private RedisTemplate<String, Object> redis;

    // ══════════════════════════════════════════════════════════════════════════
    // BUS
    // ══════════════════════════════════════════════════════════════════════════

    public List<Map<String, Object>> getAllBuses() {
        return repo.findAllBuses();
    }

    public List<Map<String, Object>> getBusSummaries() {
        return repo.findAllBusSummaries();
    }

    public Map<String, Object> getBusById(Long id) {
        Map<String, Object> bus = repo.findBusById(id);
        if (bus == null) throw new NoSuchElementException("Bus not found: " + id);
        return bus;
    }

    public List<String> suggestLocations(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        return repo.suggestLocations(query.trim());
    }

    /**
     * Case-insensitive search for buses matching source & destination.
     */
    public Map<String, Object> searchBuses(String source, String destination, String sortBy, String timing, Integer maxFare, String busType, int page, int size) {
        if (source == null || source.isBlank() || destination == null || destination.isBlank()) {
            throw new IllegalArgumentException("source and destination are required");
        }

        String normalizedSource = source.trim();
        String normalizedDestination = destination.trim();
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 50);
        int offset = (safePage - 1) * safeSize;

        List<Map<String, Object>> buses = repo.searchBuses(normalizedSource, normalizedDestination, safeSize, offset);
        List<Map<String, Object>> enriched = new ArrayList<>();

        for (Map<String, Object> bus : buses) {
            Map<String, Object> copy = new LinkedHashMap<>(bus);
            long id = ((Number) bus.get("id")).longValue();
            int fare = ((Number) bus.getOrDefault("fare", 0)).intValue();
            int departureMinutes = 8 * 60 + (int) ((id % 6) * 45);
            int durationMinutes = 55 + (int) ((id % 4) * 15);
            int arrivalMinutes = departureMinutes + durationMinutes;

            copy.put("operator", operatorName(id));
            copy.put("busType", busType(id));
            copy.put("departureTime", formatMinutes(departureMinutes));
            copy.put("arrivalTime", formatMinutes(arrivalMinutes));
            copy.put("durationMinutes", durationMinutes);
            copy.put("availableSeats", Math.max(5, ((Number) bus.getOrDefault("capacity", 40)).intValue() - (int) (id % 18)));
            copy.put("liveStatus", liveStatus(id));
            copy.put("timingSlot", timingSlot(departureMinutes));
            copy.put("score", fare + durationMinutes);
            enriched.add(copy);
        }

        if (maxFare != null) {
            enriched.removeIf(bus -> ((Number) bus.getOrDefault("fare", 0)).doubleValue() > maxFare);
        }

        if (busType != null && !busType.isBlank()) {
            String needle = busType.trim().toLowerCase();
            enriched.removeIf(bus -> !String.valueOf(bus.getOrDefault("busType", "")).toLowerCase().contains(needle));
        }

        if (timing != null && !timing.isBlank()) {
            String slot = timing.trim().toLowerCase();
            enriched.removeIf(bus -> !String.valueOf(bus.getOrDefault("timingSlot", "")).toLowerCase().contains(slot));
        }

        Comparator<Map<String, Object>> comparator;
        String sortKey = sortBy == null ? "price" : sortBy.toLowerCase();
        switch (sortKey) {
            case "time" -> comparator = Comparator.comparing((Map<String, Object> bus) -> String.valueOf(bus.get("departureTime")));
            case "duration" -> comparator = Comparator.comparingInt((Map<String, Object> bus) -> ((Number) bus.getOrDefault("durationMinutes", 0)).intValue());
            case "seats" -> comparator = Comparator.comparingInt((Map<String, Object> bus) -> ((Number) bus.getOrDefault("availableSeats", 0)).intValue()).reversed();
            default -> comparator = Comparator.comparingDouble((Map<String, Object> bus) -> ((Number) bus.getOrDefault("fare", 0)).doubleValue());
        }
        enriched.sort(comparator);

        int total = repo.countBuses(normalizedSource, normalizedDestination);
        int totalPages = (int) Math.ceil(total / (double) safeSize);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("source", normalizedSource);
        response.put("destination", normalizedDestination);
        response.put("page", safePage);
        response.put("pageSize", safeSize);
        response.put("total", total);
        response.put("totalPages", totalPages);
        response.put("count", enriched.size());
        response.put("buses", enriched);
        return response;
    }

    public long createBus(Map<String, Object> payload) {
        return repo.createBus(
                String.valueOf(payload.get("name")),
                String.valueOf(payload.get("source")),
                String.valueOf(payload.get("destination")),
                Integer.parseInt(String.valueOf(payload.getOrDefault("capacity", 40))),
                Double.parseDouble(String.valueOf(payload.getOrDefault("fare", 0))));
    }

    public int updateBus(long id, Map<String, Object> payload) {
        return repo.updateBus(
                id,
                String.valueOf(payload.get("name")),
                String.valueOf(payload.get("source")),
                String.valueOf(payload.get("destination")),
                Integer.parseInt(String.valueOf(payload.getOrDefault("capacity", 40))),
                Double.parseDouble(String.valueOf(payload.getOrDefault("fare", 0))));
    }

    public int deleteBus(long id) {
        return repo.deleteBus(id);
    }

    public List<Map<String, Object>> getFavoriteRoutes(long userId) {
        return repo.findFavoriteRoutes(userId);
    }

    public Map<String, Object> saveFavoriteRoute(long userId, String source, String destination, String notes) {
        repo.saveFavoriteRoute(userId, source, destination, notes);
        return Map.of("success", true, "message", "Route saved to favorites");
    }

    public Map<String, Object> deleteFavoriteRoute(long userId, String source, String destination) {
        int rows = repo.deleteFavoriteRoute(userId, source, destination);
        return rows > 0 ? Map.of("success", true, "message", "Route removed from favorites") : Map.of("success", false, "message", "Favorite route not found");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SEAT MAP
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Returns full seat map with AVAILABLE / BOOKED / HELD status.
     * Total seats determined from the bus record.
     */
    public Map<String, Object> getSeatMap(Long busId, String travelDate) {
        Map<String, Object> bus = getBusById(busId);
        int totalSeats = ((Number) bus.get("capacity")).intValue();

        // DB-confirmed bookings
        List<String> bookedSeats = repo.findBookedSeats(busId, travelDate);

        // Redis-held seats (degrade gracefully if Redis is unavailable)
        Set<String> heldSeats = new HashSet<>();
        try {
            String pattern = redisHoldKey(busId, "*", travelDate);
            Set<String> heldKeys = redis.keys(pattern);
            if (heldKeys != null) {
                for (String key : heldKeys) {
                    // key format: seat:hold:{busId}:{seatNumber}:{date}
                    String[] parts = key.split(":");
                    if (parts.length >= 5) heldSeats.add(parts[3]);
                }
            }
        } catch (Exception e) {
            log.warn("Redis unavailable for seat hold lookup, continuing without held seats: {}", e.getMessage());
        }

        // Build seat list
        List<Map<String, Object>> seats = new ArrayList<>();
        for (int i = 1; i <= totalSeats; i++) {
            String seatNum = generateSeatId(i);
            String status;
            if (bookedSeats.contains(seatNum))      status = "BOOKED";
            else if (heldSeats.contains(seatNum))   status = "HELD";
            else                                     status = "AVAILABLE";

            Map<String, Object> seat = new LinkedHashMap<>();
            seat.put("seatNumber", seatNum);
            seat.put("status", status);
            seats.add(seat);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("busId", busId);
        response.put("busName", bus.get("name"));
        response.put("travelDate", travelDate);
        response.put("totalSeats", totalSeats);
        response.put("availableCount",
                seats.stream().filter(s -> "AVAILABLE".equals(s.get("status"))).count());
        response.put("seats", seats);
        return response;
    }

    /**
     * Seat ID uses row-letter + number within that row.
     * Layout: 2 seats | aisle | 2 seats (standard 2+2).
     */
    private String generateSeatId(int index) {
        int seatsPerRow = 4;
        int row   = (index - 1) / seatsPerRow;
        int col   = (index - 1) % seatsPerRow;
        char letter = (char) ('A' + row);
        int colNum  = col + 1;
        return letter + String.valueOf(colNum);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SEAT HOLD (Redis)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Atomically holds a seat in Redis for 2 minutes.
     * Returns false if already held or booked.
     */
    public Map<String, Object> holdSeat(SeatHoldRequest req) {
        validateHoldRequest(req);

        // 1. Check DB (CONFIRMED booking)
        if (repo.isSeatBooked(req.getBusId(), req.getSeatNumber(), req.getTravelDate())) {
            return errorResponse("SEAT_BOOKED", "This seat is already confirmed by another passenger.");
        }

        // 2. Try atomic Redis set-if-absent
        String key = redisHoldKey(req.getBusId(), req.getSeatNumber(), req.getTravelDate());
        Boolean acquired = redis.opsForValue()
                .setIfAbsent(key, req.getUserId(), HOLD_TTL_SECONDS, TimeUnit.SECONDS);

        if (Boolean.TRUE.equals(acquired)) {
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("message", "Seat held for 2 minutes. Complete payment to confirm.");
            res.put("seatNumber", req.getSeatNumber());
            res.put("holdExpiresInSeconds", HOLD_TTL_SECONDS);
            return res;
        } else {
            // Already held — check if held by same user
            Object holder = redis.opsForValue().get(key);
            if (req.getUserId().equals(holder)) {
                // Refresh TTL
                redis.expire(key, HOLD_TTL_SECONDS, TimeUnit.SECONDS);
                Long ttl = redis.getExpire(key, TimeUnit.SECONDS);
                Map<String, Object> res = new LinkedHashMap<>();
                res.put("success", true);
                res.put("message", "Seat hold refreshed.");
                res.put("seatNumber", req.getSeatNumber());
                res.put("holdExpiresInSeconds", ttl);
                return res;
            }
            return errorResponse("SEAT_HELD", "Seat is temporarily held by another user. Try after 2 minutes.");
        }
    }

    /**
     * Releases a Redis hold (user deselects seat).
     */
    public Map<String, Object> releaseSeat(SeatHoldRequest req) {
        validateHoldRequest(req);
        String key = redisHoldKey(req.getBusId(), req.getSeatNumber(), req.getTravelDate());
        Object holder = redis.opsForValue().get(key);
        if (req.getUserId().equals(holder)) {
            redis.delete(key);
            return successResponse("Seat released successfully.");
        }
        return errorResponse("NOT_YOUR_HOLD", "You do not hold this seat.");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BOOKING (MySQL confirmation)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Confirms booking:
     * 1. Verify Redis hold belongs to this user.
     * 2. Verify not booked in DB.
     * 3. Insert booking record.
     * 4. Delete Redis hold.
     */
    public Map<String, Object> confirmBooking(BookingRequest req) {
        validateBookingRequest(req);

        String redisKey = redisHoldKey(req.getBusId(), req.getSeatNumber(), req.getTravelDate());

        // 1. Atomically claim the hold: read + delete in a single operation.
        //    Only ONE concurrent request will receive a non-null value; subsequent
        //    identical requests get null → HOLD_EXPIRED, preventing double-booking.
        Object holder = redis.opsForValue().getAndDelete(redisKey);
        if (holder == null) {
            return errorResponse("HOLD_EXPIRED",
                    "Your seat hold has expired. Please select the seat again.");
        }
        if (!req.getUserId().equals(holder.toString())) {
            // Not our hold — restore it so the actual holder can still confirm.
            redis.opsForValue().set(redisKey, holder.toString(), HOLD_TTL_SECONDS, java.util.concurrent.TimeUnit.SECONDS);
            return errorResponse("NOT_YOUR_HOLD",
                    "Seat is held by a different user.");
        }

        // 2. Double-check DB (guard against stale holds surviving a prior crash)
        if (repo.isSeatBooked(req.getBusId(), req.getSeatNumber(), req.getTravelDate())) {
            return errorResponse("ALREADY_BOOKED",
                    "Seat was just confirmed by another booking. Please choose another seat.");
        }

        // 3. Fetch fare
        Map<String, Object> bus = repo.findBusById(req.getBusId());
        double fare = bus != null ? ((Number) bus.get("fare")).doubleValue() : 0.0;

        // 4. Insert booking (repository uses WHERE NOT EXISTS for DB-level safety)
        long bookingId = repo.confirmBooking(
                req.getBusId(), req.getSeatNumber(), req.getTravelDate(),
                req.getUserId(), req.getPassengerName(),
                req.getPassengerPhone(), fare);

        if (bookingId <= 0) {
            return errorResponse("ALREADY_BOOKED",
                    "Seat was already confirmed. Please choose another seat.");
        }

        // 5. Return booking details
        Map<String, Object> booking = repo.findBookingById(bookingId);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("message", "Booking confirmed!");
        res.put("booking", booking);
        return res;
    }

    public List<Map<String, Object>> getBookingsByUser(String userId) {
        return repo.findBookingsByUser(userId);
    }

    /**
     * Cancel a booking with full validation:
     * 1. Verify booking exists
     * 2. Verify ownership (security)
     * 3. Check if already cancelled
     * 4. Check departure time (no cancellation after departure)
     * 5. Calculate refund amount
     * 6. Update booking status + refund fields
     * 7. Insert cancellation audit log
     */
    public Map<String, Object> cancelBooking(long bookingId, String userId) {
        log.info("Cancel request: bookingId={} userId={}", bookingId, userId);

        // 1. Validate booking ID
        if (bookingId <= 0) {
            log.warn("Cancel rejected: invalid bookingId={}", bookingId);
            return errorResponse("INVALID_ID", "Invalid booking ID.");
        }

        // 2. Check booking exists
        Map<String, Object> booking = repo.findBookingForCancel(bookingId);
        if (booking == null) {
            log.warn("Cancel rejected: booking not found, bookingId={}", bookingId);
            return errorResponse("NOT_FOUND", "Booking #" + bookingId + " not found.");
        }

        // 3. Verify ownership (security: user can only cancel their own)
        String bookingUserId = String.valueOf(booking.get("user_id"));
        if (!bookingUserId.equals(userId)) {
            log.warn("Cancel rejected: ownership mismatch, bookingId={} requestedBy={} ownedBy={}",
                    bookingId, userId, bookingUserId);
            return errorResponse("FORBIDDEN", "You can only cancel your own bookings.");
        }

        // 4. Check if already cancelled
        String status = String.valueOf(booking.get("status"));
        if ("CANCELLED".equalsIgnoreCase(status)) {
            log.info("Cancel rejected: already cancelled, bookingId={}", bookingId);
            return errorResponse("ALREADY_CANCELLED", "Booking #" + bookingId + " is already cancelled.");
        }

        // 5. Check departure time (don't allow cancellation after travel date)
        Object travelDateObj = booking.get("travel_date");
        if (travelDateObj != null) {
            try {
                java.time.LocalDate travelDate;
                if (travelDateObj instanceof java.sql.Date) {
                    travelDate = ((java.sql.Date) travelDateObj).toLocalDate();
                } else {
                    travelDate = java.time.LocalDate.parse(String.valueOf(travelDateObj));
                }
                java.time.LocalDate today = java.time.LocalDate.now();
                if (travelDate.isBefore(today)) {
                    log.warn("Cancel rejected: past travel date, bookingId={} travelDate={}", bookingId, travelDate);
                    return errorResponse("PAST_DEPARTURE",
                            "Cannot cancel — the travel date (" + travelDate + ") has already passed.");
                }
            } catch (Exception e) {
                log.warn("Cancel: could not parse travel_date={}, proceeding with cancellation", travelDateObj);
            }
        }

        // 6. Calculate refund amount (full refund for now; business logic can adjust)
        double farePaid = booking.get("fare_paid") != null
                ? ((Number) booking.get("fare_paid")).doubleValue()
                : 0.0;
        double refundAmount = farePaid; // Full refund — adjust for partial refund policy

        // 7. Update booking in DB
        boolean cancelled = repo.cancelBooking(bookingId, userId, refundAmount);
        if (!cancelled) {
            log.error("Cancel failed: DB update returned false, bookingId={}", bookingId);
            return errorResponse("CANCEL_FAILED", "Cancellation failed. Booking may have already been cancelled.");
        }

        // 8. Insert cancellation audit log
        try {
            repo.insertCancellationLog(bookingId, userId, "User requested cancellation", refundAmount);
        } catch (Exception e) {
            log.error("Failed to insert cancellation log for bookingId={}: {}", bookingId, e.getMessage());
            // Don't fail the cancellation — the booking is already cancelled
        }

        log.info("Cancel success: bookingId={} refund=₹{}", bookingId, refundAmount);

        // 9. Return success with details
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("message", "Booking #" + bookingId + " cancelled successfully.");
        res.put("id", bookingId);
        res.put("refundAmount", refundAmount);
        res.put("refundStatus", "PENDING");
        res.put("refundMessage", refundAmount > 0
                ? "Refund of ₹" + String.format("%.0f", refundAmount) + " will be processed within 3-5 business days."
                : "No refund applicable.");
        return res;
    }

    /**
     * Get cancellation history for a user.
     */
    public List<Map<String, Object>> getCancellationHistory(String userId) {
        return repo.findCancellationsByUser(userId);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LIVE LOCATION
    // ══════════════════════════════════════════════════════════════════════════

    public Map<String, Object> getLiveLocation(Long busId) {
        Map<String, Object> loc = repo.findLiveLocation(busId);
        if (loc == null) throw new NoSuchElementException("Live location not found for bus: " + busId);
        return loc;
    }

    public List<Map<String, Object>> getAllLiveLocations() {
        return repo.findAllLiveLocations();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private String redisHoldKey(Long busId, String seatNumber, String date) {
        return "seat:hold:" + busId + ":" + seatNumber + ":" + date;
    }

    private String operatorName(long id) {
        return switch ((int) (id % 3)) {
            case 0 -> "UPSRTC";
            case 1 -> "Prayagraj City Bus";
            default -> "Triveni Transport";
        };
    }

    private String busType(long id) {
        return switch ((int) (id % 4)) {
            case 0 -> "AC Sleeper";
            case 1 -> "AC Seater";
            case 2 -> "Non AC Seater";
            default -> "Deluxe";
        };
    }

    private String liveStatus(long id) {
        return switch ((int) (id % 3)) {
            case 0 -> "ON_TIME";
            case 1 -> "DELAYED";
            default -> "ARRIVED";
        };
    }

    private String timingSlot(int minutes) {
        if (minutes < 12 * 60) return "morning";
        if (minutes < 17 * 60) return "afternoon";
        return "evening";
    }

    private String formatMinutes(int minutes) {
        int hour = (minutes / 60) % 24;
        int minute = minutes % 60;
        return String.format("%02d:%02d", hour, minute);
    }

    private Map<String, Object> successResponse(String message) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("message", message);
        return res;
    }

    private Map<String, Object> errorResponse(String code, String message) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", false);
        res.put("errorCode", code);
        res.put("message", message);
        return res;
    }

    private void validateHoldRequest(SeatHoldRequest req) {
        if (req.getBusId() == null || req.getSeatNumber() == null ||
                req.getTravelDate() == null || req.getUserId() == null) {
            throw new IllegalArgumentException("busId, seatNumber, travelDate, userId are required");
        }
    }

    private void validateBookingRequest(BookingRequest req) {
        if (req.getBusId() == null || req.getSeatNumber() == null ||
                req.getTravelDate() == null || req.getUserId() == null) {
            throw new IllegalArgumentException("busId, seatNumber, travelDate, userId are required");
        }
    }
}
