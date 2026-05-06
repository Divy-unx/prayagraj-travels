package com.travels.controller;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.travels.model.BookingRequest;
import com.travels.model.SeatHoldRequest;
import com.travels.service.TravelsService;

@RestController
@RequestMapping("/api/travels")
@CrossOrigin(
    origins = {"http://localhost:3000", "http://localhost:5173", "https://prayagraj-travels.vercel.app"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = {"Content-Type", "Accept", "Authorization", "X-Requested-With"},
    exposedHeaders = {"Content-Type", "X-Total-Count"},
    allowCredentials = "false",
    maxAge = 3600
)
public class TravelsController {

    private static final Logger log = LoggerFactory.getLogger(TravelsController.class);

    @Autowired
    private TravelsService travelsService;

    // ── Health ────────────────────────────────────────────────────────────────

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Prayagraj Travels API",
                "version", "1.0.0"));
    }

    // ── Bus ──────────────────────────────────────────────────────────────────

    @GetMapping("/buses")
    public ResponseEntity<List<Map<String, Object>>> getAllBuses() {
        return ResponseEntity.ok(travelsService.getAllBuses());
    }

    @GetMapping("/locations/suggest")
    public ResponseEntity<List<String>> suggestLocations(@RequestParam String query) {
        return ResponseEntity.ok(travelsService.suggestLocations(query));
    }

    @GetMapping("/buses/{id}")
    public ResponseEntity<?> getBusById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(travelsService.getBusById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Search ────────────────────────────────────────────────────────────────

    /**
     * GET /api/travels/search?source=Civil+Lines&destination=Naini
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchBuses(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String timing,
            @RequestParam(required = false) Integer maxFare,
            @RequestParam(required = false) String busType,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        long start = System.currentTimeMillis();
        try {
            // Trim and validate inputs
            String trimmedSource = source != null ? source.trim() : "";
            String trimmedDest = destination != null ? destination.trim() : "";

            if (trimmedSource.isEmpty() || trimmedDest.isEmpty()) {
                log.warn("Search rejected: empty source or destination");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Source and destination are required"));
            }

            if (trimmedSource.equalsIgnoreCase(trimmedDest)) {
                log.warn("Search rejected: source equals destination ({})", trimmedSource);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Source and destination cannot be the same"));
            }

            log.info("Search: {} → {} | sort={} timing={} maxFare={} busType={} page={} size={}",
                    trimmedSource, trimmedDest, sortBy, timing, maxFare, busType, page, size);

            Map<String, Object> result = travelsService.searchBuses(
                    trimmedSource, trimmedDest, sortBy, timing, maxFare, busType, page, size);

            long duration = System.currentTimeMillis() - start;
            log.info("Search completed: {} → {} | {} buses found in {} ms",
                    trimmedSource, trimmedDest, result.get("total"), duration);

            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("Search validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Seat Map ─────────────────────────────────────────────────────────────

    /**
     * GET /api/travels/seats?busId=1&travelDate=2024-12-25
     */
    @GetMapping("/seats")
    public ResponseEntity<?> getSeatMap(
            @RequestParam Long busId,
            @RequestParam String travelDate) {
        try {
            return ResponseEntity.ok(travelsService.getSeatMap(busId, travelDate));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Seat Hold ────────────────────────────────────────────────────────────

    /**
     * POST /api/travels/seats/hold
     * Body: { busId, seatNumber, travelDate, userId }
     */
    @PostMapping("/seats/hold")
    public ResponseEntity<Map<String, Object>> holdSeat(@RequestBody SeatHoldRequest req) {
        Map<String, Object> result = travelsService.holdSeat(req);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return ResponseEntity.status(success ? HttpStatus.OK : HttpStatus.CONFLICT).body(result);
    }

    /**
     * POST /api/travels/seats/release
     */
    @PostMapping("/seats/release")
    public ResponseEntity<Map<String, Object>> releaseSeat(@RequestBody SeatHoldRequest req) {
        Map<String, Object> result = travelsService.releaseSeat(req);
        return ResponseEntity.ok(result);
    }

    // ── Booking ───────────────────────────────────────────────────────────────

    /**
     * POST /api/travels/book
     * Body: { busId, seatNumber, travelDate, userId, passengerName, passengerPhone
     * }
     */
    @PostMapping("/book")
    public ResponseEntity<Map<String, Object>> confirmBooking(@RequestBody BookingRequest req) {
        Map<String, Object> result = travelsService.confirmBooking(req);
        boolean success = Boolean.TRUE.equals(result.get("success"));
        return ResponseEntity.status(success ? HttpStatus.CREATED : HttpStatus.CONFLICT).body(result);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String, Object>>> getBookingsByUser(@RequestParam String userId) {
        return ResponseEntity.ok(travelsService.getBookingsByUser(userId));
    }

    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<Map<String, Object>> cancelBooking(
            @PathVariable long bookingId,
            @RequestParam String userId) {

        // Validate userId is provided
        if (userId == null || userId.isBlank()) {
            log.warn("Cancel rejected: missing userId for bookingId={}", bookingId);
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "errorCode", "INVALID_REQUEST",
                            "message", "User ID is required."));
        }

        Map<String, Object> result = travelsService.cancelBooking(bookingId, userId.trim());
        boolean success = Boolean.TRUE.equals(result.get("success"));

        if (success) {
            return ResponseEntity.ok(result);
        }

        // Map error codes to HTTP status codes
        String errorCode = String.valueOf(result.getOrDefault("errorCode", ""));
        HttpStatus status = switch (errorCode) {
            case "NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "FORBIDDEN" -> HttpStatus.FORBIDDEN;
            case "ALREADY_CANCELLED" -> HttpStatus.CONFLICT;
            case "PAST_DEPARTURE" -> HttpStatus.BAD_REQUEST;
            case "INVALID_ID" -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };

        return ResponseEntity.status(status).body(result);
    }

    @GetMapping("/bookings/cancellations")
    public ResponseEntity<List<Map<String, Object>>> getCancellationHistory(
            @RequestParam String userId) {
        return ResponseEntity.ok(travelsService.getCancellationHistory(userId));
    }

    // ── Live Location ─────────────────────────────────────────────────────────

    /**
     * GET /api/travels/live-location?busId=1
     */
    @GetMapping("/live-location")
    public ResponseEntity<?> getLiveLocation(@RequestParam Long busId) {
        try {
            return ResponseEntity.ok(travelsService.getLiveLocation(busId));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/live-location/all")
    public ResponseEntity<List<Map<String, Object>>> getAllLiveLocations() {
        return ResponseEntity.ok(travelsService.getAllLiveLocations());
    }

    @GetMapping("/favorites")
    public ResponseEntity<?> getFavoriteRoutes(@RequestParam long userId) {
        return ResponseEntity.ok(travelsService.getFavoriteRoutes(userId));
    }

    @PostMapping("/favorites")
    public ResponseEntity<?> saveFavoriteRoute(@RequestParam long userId, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(travelsService.saveFavoriteRoute(
                userId,
                String.valueOf(body.get("source")),
                String.valueOf(body.get("destination")),
                String.valueOf(body.getOrDefault("notes", ""))));
    }

    @DeleteMapping("/favorites")
    public ResponseEntity<?> deleteFavoriteRoute(@RequestParam long userId,
                                                 @RequestParam String source,
                                                 @RequestParam String destination) {
        return ResponseEntity.ok(travelsService.deleteFavoriteRoute(userId, source, destination));
    }

    // ── Global Exception Handler ──────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception e) {
        log.error("Unhandled exception: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "success", false,
                        "error", "Internal server error",
                        "detail", e.getMessage() != null ? e.getMessage() : "Unknown error"));
    }
}
