# Prayagraj Travels — Backend System Summary

> **Version:** 1.0.0 | **Last Updated:** May 2026 | **Environment:** Production (Render)

---

## 1. Project Overview

Prayagraj Travels is a **city-level bus booking backend** designed for intra-city travel within Prayagraj, India. It powers a complete ticket reservation workflow — from searching available buses to confirming seats, managing bookings, and processing cancellations.

### What the backend does

- Accepts search queries and returns matching buses with real-time seat availability
- Creates and persists confirmed bookings in a relational database
- Enforces seat-level locking to prevent double-booking under concurrent load
- Handles cancellations safely with refund tracking and a full audit trail
- Simulates live GPS movement for all active buses on a scheduled cycle
- Secures all user-facing operations with stateless JWT authentication

### The problem it solves

Traditional city bus systems have no digital booking layer — passengers board manually, seats are untracked, and there is no cancellation or refund mechanism. This backend provides a structured, API-driven system that allows passengers to reserve seats in advance, ensures no two passengers can book the same seat, and gives operators visibility into booking status and occupancy.

---

## 2. Architecture Overview

### High-Level Architecture

```
Client (React SPA)
       │
       │ HTTPS / REST
       ▼
┌──────────────────────┐
│   Spring Boot API    │   ← Stateless application server
│   (port 8081)        │
│                      │
│  ┌─────────────────┐ │
│  │ Security Filter │ │   ← JWT validation on every protected request
│  │ (JWT + CORS)    │ │
│  └────────┬────────┘ │
│           │          │
│  ┌────────▼────────┐ │
│  │   Controller    │ │   ← Route handlers, input parsing
│  │   Service       │ │   ← Business logic, validation rules
│  │   Repository    │ │   ← SQL queries via JdbcTemplate
│  └────────┬────────┘ │
└───────────┼──────────┘
            │
     ┌──────┴───────┐
     │              │
 ┌───▼────┐   ┌─────▼────┐
 │ MySQL  │   │  Redis   │
 │  8.0   │   │  7.x     │
 │ (data) │   │ (locks)  │
 └────────┘   └──────────┘
```

### Request Flow (example: Book a seat)

```
1. Client sends POST /api/travels/book with JWT in Authorization header
2. JwtAuthenticationFilter validates token signature and expiry
3. SecurityConfig checks the user has role USER
4. TravelsController parses and validates the request body
5. TravelsService runs business logic:
   a. Verify seat is still held in Redis under this user's key
   b. Insert booking row into MySQL (AUTO_INCREMENT generates ID)
   c. Delete the Redis seat-hold key
   d. Return the confirmed booking with its database-assigned ID
6. Controller sends HTTP 200 with JSON response
```

### Stateless vs Stateful

This backend is **stateless** — no session data is stored in the server's memory between requests. Every request must carry a JWT token that proves who the user is. The server validates the token cryptographically on each call without needing to look up a session store.

The only exception is seat-hold state, which is stored in **Redis with a 2-minute TTL** — this is intentionally short-lived and expires automatically, so it does not create a persistent session dependency.

---

## 3. Tech Stack Breakdown

### Backend Framework — Spring Boot 3.2.5 (Java 21)

| | |
|---|---|
| **What it does** | Hosts all REST API endpoints, manages the application lifecycle, handles dependency injection, security, and scheduling |
| **Why chosen** | Spring Boot's production-grade ecosystem provides built-in connection pooling (HikariCP), security (Spring Security), and scheduled tasks — avoiding the need to integrate these separately |
| **Benefits** | Fast startup with auto-configuration, mature ecosystem, compile-time type safety via Java, and strong support for concurrent request handling via the embedded Tomcat server |

### Database — MySQL 8.0

| | |
|---|---|
| **What it does** | Stores all persistent data: users, buses, bookings, cancellation logs, favorites, and live location snapshots |
| **Why chosen** | The booking domain has clearly defined, relational entities with strong consistency requirements. A bus seat can only belong to one confirmed booking — this uniqueness constraint is enforced at the database level with a UNIQUE index |
| **Benefits** | ACID transactions guarantee that a booking insertion and a seat-hold deletion happen atomically. AUTO_INCREMENT provides stable, monotonically increasing booking IDs that are safe to expose to clients |
| **Query Access** | Raw `JdbcTemplate` (Spring JDBC) — no ORM. SQL is written explicitly, which gives full control over query shape and avoids N+1 problems common in JPA |

### Connection Pool — HikariCP

| | |
|---|---|
| **What it does** | Maintains a pool of pre-opened MySQL connections, reused across requests |
| **Configuration** | Max 20 connections, min idle 5, connection timeout 30s, max lifetime 30 min |
| **Why it matters** | Opening a new database connection on every request adds 50–200ms of latency. HikariCP eliminates this overhead and is the fastest JDBC connection pool available for Java |

### Cache / Locking — Redis 7

| | |
|---|---|
| **What it does** | Holds short-lived seat-hold locks while a user is filling in passenger details before confirming |
| **Key format** | `seat:hold:{busId}:{seatNumber}:{travelDate}` |
| **TTL** | 120 seconds — expires automatically if the user abandons the booking |
| **Why not MySQL** | A TTL-based lock in a relational database requires a background cleanup job. Redis natively expires keys, making it far simpler and faster for this use case |
| **Client** | Lettuce (non-blocking, bundled with Spring Data Redis) |

### Authentication — Custom JWT (HMAC-SHA256)

| | |
|---|---|
| **What it does** | Generates signed tokens on login and validates them on every protected request |
| **Implementation** | Hand-rolled using `javax.crypto.Mac` — no third-party JWT library (`jjwt`, etc.) |
| **Token payload** | `uid` (user ID), `email`, `role`, `iat` (issued at), `exp` (expiry) |
| **Expiry** | 7 days (configurable via `JWT_EXPIRATION_MINUTES` environment variable) |
| **Why custom** | Reduces dependency surface; HMAC-SHA256 is well-understood and the implementation is under 90 lines of code, making it auditable |

### Hosting — Render (Docker)

| | |
|---|---|
| **What it does** | Runs the Spring Boot JAR inside a Docker container |
| **Build** | Multi-stage Dockerfile: Maven builds the JAR in stage 1; Alpine JDK image runs it in stage 2 |
| **Why Render** | Native Docker service support, free-tier available for prototyping, automatic TLS, and environment variable management |

---

## 4. API Design

All endpoints are prefixed with `/api/travels` or `/api/auth`. The API follows REST conventions — resources are nouns, HTTP methods express the action, and HTTP status codes communicate outcomes.

### Authentication Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Create a new user account |
| `POST` | `/api/auth/login` | ❌ | Authenticate and receive JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |

### Bus & Search Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/travels/health` | ❌ | Server health check |
| `GET` | `/api/travels/search` | ❌ | Search buses by source, destination, date |
| `GET` | `/api/travels/locations/suggest` | ❌ | Autocomplete location names |
| `GET` | `/api/travels/buses/:id` | ✅ | Get details for a specific bus |
| `GET` | `/api/travels/seats` | ✅ | Get seat map for a bus on a date |

### Booking Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/travels/seats/hold` | ✅ | Lock a seat for 2 minutes |
| `POST` | `/api/travels/seats/release` | ✅ | Release a seat lock early |
| `POST` | `/api/travels/book` | ✅ | Confirm a booking |
| `GET` | `/api/travels/bookings` | ✅ | Get all bookings for the current user |
| `DELETE` | `/api/travels/bookings/:id` | ✅ | Cancel a booking |
| `GET` | `/api/travels/bookings/cancellations` | ✅ | Get cancellation history |

### Tracking Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/travels/live-location` | ❌ | Live GPS data for one bus |
| `GET` | `/api/travels/live-location/all` | ❌ | Live GPS data for all buses |

### Request / Response Structure

**POST /api/travels/book (Request)**
```json
{
  "busId": 4,
  "seatNumber": "12",
  "travelDate": "2026-05-10",
  "userId": "101",
  "passengerName": "Divyanshu Sharma",
  "passengerPhone": "9876543210"
}
```

**POST /api/travels/book (Success Response — HTTP 200)**
```json
{
  "success": true,
  "message": "🎉 Booking confirmed!",
  "bookingId": 47,
  "booking": {
    "booking_id": 47,
    "bus_id": 4,
    "seat_number": "12",
    "travel_date": "2026-05-10",
    "status": "CONFIRMED",
    "fare_paid": 25.0,
    "passenger_name": "Divyanshu Sharma",
    "booked_at": "2026-05-05T10:30:00"
  }
}
```

**DELETE /api/travels/bookings/47 (Success Response — HTTP 200)**
```json
{
  "success": true,
  "message": "Booking #47 cancelled successfully.",
  "bookingId": 47,
  "refundAmount": 25.0,
  "refundStatus": "PENDING"
}
```

**Error Response Structure**
```json
{
  "success": false,
  "errorCode": "ALREADY_CANCELLED",
  "message": "Booking #47 is already cancelled."
}
```

### Error Codes and HTTP Status Mapping

| Error Code | HTTP Status | Meaning |
|------------|-------------|---------|
| `INVALID_ID` | 400 | Booking ID is missing or ≤ 0 |
| `NOT_FOUND` | 404 | Booking does not exist in the database |
| `FORBIDDEN` | 403 | User does not own this booking |
| `ALREADY_CANCELLED` | 409 | Booking is already in CANCELLED status |
| `PAST_DEPARTURE` | 400 | Travel date has already passed |
| `CANCEL_FAILED` | 500 | Database update did not affect any rows |

---

## 5. Data Model Design

### `users` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT AUTO_INCREMENT PK | Stable, database-assigned user ID |
| `name` | VARCHAR(100) | Passenger display name |
| `email` | VARCHAR(150) UNIQUE | Login identifier |
| `phone` | VARCHAR(15) | Contact number |
| `password_hash` | VARCHAR(255) | BCrypt hash — never stored in plain text |
| `role` | ENUM('USER', 'ADMIN') | Role-based access control |
| `created_at` | TIMESTAMP | Account creation time |

### `buses` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | INT AUTO_INCREMENT PK | Stable bus identifier |
| `name` | VARCHAR(100) UNIQUE | Bus operator name |
| `source` | VARCHAR(100) | Departure city/stop |
| `destination` | VARCHAR(100) | Arrival city/stop |
| `capacity` | INT | Total number of seats |
| `fare` | DOUBLE | Standard fare in INR |

### `bookings` table

| Column | Type | Notes |
|--------|------|-------|
| `booking_id` | INT AUTO_INCREMENT PK | **Database-generated — never set by client** |
| `bus_id` | INT FK → buses.id | Which bus was booked |
| `seat_number` | VARCHAR(10) | Seat identifier (e.g. "12", "A3") |
| `travel_date` | DATE | Journey date |
| `user_id` | VARCHAR(50) | Who made the booking |
| `passenger_name` | VARCHAR(100) | Name on the ticket |
| `passenger_phone` | VARCHAR(15) | Contact for the passenger |
| `status` | ENUM('CONFIRMED', 'CANCELLED') | Current booking state |
| `fare_paid` | DOUBLE | Amount charged at booking time |
| `booked_at` | TIMESTAMP DEFAULT NOW() | Creation timestamp |
| `cancelled_at` | TIMESTAMP NULL | Set when cancellation occurs |
| `refund_status` | ENUM('NONE', 'PENDING', 'PROCESSED', 'FAILED') | Refund workflow state |
| `refund_amount` | DOUBLE DEFAULT 0 | Amount to be refunded |

**Key constraint:** `UNIQUE(bus_id, seat_number, travel_date)` — the database itself prevents two bookings for the same seat on the same date, even under concurrent load.

### `cancellation_logs` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | INT AUTO_INCREMENT PK | Log entry ID |
| `booking_id` | INT FK → bookings.booking_id | Which booking was cancelled |
| `user_id` | VARCHAR(50) | Who initiated the cancellation |
| `reason` | TEXT | Free-text reason for cancellation |
| `refund_amount` | DOUBLE | Refund amount calculated at cancellation |
| `refund_status` | ENUM | Refund state at time of logging |
| `cancelled_at` | TIMESTAMP DEFAULT NOW() | When the cancellation happened |

This table is an **append-only audit log** — records are never updated or deleted.

### `bus_live_location` table

| Column | Type | Notes |
|--------|------|-------|
| `bus_id` | INT PK FK → buses.id | One row per bus |
| `latitude` | DOUBLE | Current GPS latitude |
| `longitude` | DOUBLE | Current GPS longitude |
| `speed_kmh` | INT | Simulated speed |
| `heading_degrees` | INT | Direction of travel |
| `next_stop` | VARCHAR(100) | Upcoming stop name |
| `status` | ENUM('ON_TIME', 'ARRIVED') | Bus operational status |
| `last_updated` | TIMESTAMP | When this row was last written |

### Why AUTO_INCREMENT over UUID

`AUTO_INCREMENT` integers are used as primary keys for all booking and user records because:
- They are compact (4–8 bytes vs 36 bytes for UUID strings)
- They are naturally ordered, which makes range queries and sorting efficient
- They are human-readable in URLs (`/bookings/47` vs `/bookings/550e8400-e29b-41d4-a716-446655440000`)
- MySQL indexes on sequential integers are more cache-friendly than random UUID values

---

## 6. Core Feature Implementation

### Travel Search

```
GET /api/travels/search?source=Civil+Lines&destination=Naini&date=2026-05-10
```

1. Controller reads and trims query parameters
2. Service validates that source and destination are non-empty and not equal
3. Repository executes a parameterized SQL query joining `buses` and `bookings`
4. For each bus, the query calculates `booked_count` — the number of CONFIRMED bookings for that date
5. `available_seats = capacity - booked_count` is computed inline in SQL
6. Results are filtered server-side by minimum available seats and optional price/time filters
7. Returned as a JSON array ordered by fare ascending

### Booking Creation Flow

```
Step 1: Client calls POST /seats/hold
  → Service checks Redis: SETNX seat:hold:{busId}:{seat}:{date} = userId EX 120
  → If key already exists and belongs to a different user → return "Seat held by another user"
  → If acquired → return "Seat held for 2 minutes"

Step 2: Client fills passenger details and calls POST /book
  → Service re-validates the Redis key exists and belongs to this user
  → Service queries MySQL: does this (bus, seat, date) already have a CONFIRMED booking?
  → If no conflict: INSERT INTO bookings (...) VALUES (...)
  → MySQL assigns booking_id via AUTO_INCREMENT
  → Service deletes the Redis key (seat hold released)
  → Returns the full booking object including the database-assigned ID
```

### Cancellation Flow

```
Step 1: Validate input
  → bookingId must be a positive integer
  → Booking must exist in database

Step 2: Ownership check (security)
  → booking.user_id must match the requesting user's ID
  → If mismatch → HTTP 403 Forbidden

Step 3: Business rule checks
  → booking.status must be CONFIRMED (not already CANCELLED → HTTP 409)
  → booking.travel_date must not be in the past (→ HTTP 400)

Step 4: Execute cancellation
  → Calculate refund (equal to fare_paid for full refund)
  → UPDATE bookings SET status='CANCELLED', cancelled_at=NOW(), refund_status='PENDING', refund_amount=? WHERE booking_id=?
  → INSERT INTO cancellation_logs (...) — audit trail, non-blocking

Step 5: Return response
  → { success: true, bookingId, refundAmount, refundStatus, message }
```

Cancellations use **soft delete** — the row is never removed from the database. The `status` column is updated from `CONFIRMED` to `CANCELLED`. This preserves the complete booking history for auditing and refund tracking.

### Live Location Simulation

A `@Scheduled` task runs every 15 seconds in a background thread pool:

- Each of the 10 buses has a predefined route corridor (start coordinates → end coordinates)
- Progress along the corridor advances by 3–7% per tick (completing a route in 4–7 minutes, then resetting)
- GPS coordinates are interpolated linearly along the corridor with a small random offset (±0.002°) to simulate realistic movement
- Speed is randomized between 30–70 km/h
- `next_stop` is derived from the bus's stop list based on current progress percentage
- Result is written to `bus_live_location` with `UPDATE ... WHERE bus_id = ?`

---

## 7. System Design Decisions

### Why REST over GraphQL

REST was chosen because:
- The API surface is small and well-defined — no need for flexible query composition
- REST has zero client-side library requirements (any HTTP client works)
- Standard HTTP verbs (`GET`, `POST`, `DELETE`) map cleanly to the booking domain
- REST error handling via HTTP status codes is universally understood

### Why Stateless APIs

Stateless design means the server stores no per-user session between requests. Each request is self-contained via JWT. This enables:
- **Horizontal scaling** — any server instance can handle any request without sharing session state
- **Simpler infrastructure** — no session store needed (except the intentionally short-lived Redis seat locks)
- **Easier debugging** — every request can be replayed independently

### Why JdbcTemplate over JPA/Hibernate

JPA (Hibernate) adds a significant abstraction layer that can:
- Produce inefficient SQL (N+1 queries) when relationships are loaded lazily
- Make it difficult to write the specific multi-table JOIN queries needed for seat availability

With `JdbcTemplate`, every SQL query is explicit and reviewed. This project has fewer than 10 distinct query patterns — the complexity of JPA is not justified.

### Trade-offs Made

| Decision | Trade-off |
|----------|-----------|
| No ORM | More SQL to write manually, but full query control |
| Custom JWT | Must maintain own signing/verification code, but no external library dependency |
| Simulated GPS | Not real GPS — location data is synthetic, suitable for demonstration only |
| Soft delete | Cancelled bookings remain in the `bookings` table — table will grow over time without archival |
| No email/SMS | Booking confirmations are API-only — no notification delivery implemented |

---

## 8. Error Handling & Validation

### Input Validation Strategy

Validation is applied at two layers:

**Controller layer (structural):**
- Request body must be parseable JSON (Jackson handles deserialization)
- Required fields (`busId`, `seatNumber`, `travelDate`, `userId`, etc.) checked for null/blank
- Phone numbers validated against regex `^[6-9]\d{9}$`
- Booking ID path variable parsed as `long` — non-numeric values return 400 automatically

**Service layer (business rules):**
- `bookingId > 0` check before any database call
- Booking must exist (`NOT_FOUND`)
- User must own the booking (`FORBIDDEN`)
- Booking must not already be cancelled (`ALREADY_CANCELLED`)
- Travel date must not be in the past (`PAST_DEPARTURE`)

### Error Response Format

All error responses follow a consistent structure:

```json
{
  "success": false,
  "errorCode": "MACHINE_READABLE_CODE",
  "message": "Human-readable explanation for the user."
}
```

Error codes are designed to be handled by the frontend without string-matching the message — the `errorCode` field is stable across releases.

### How Invalid Booking IDs Are Handled

- A non-numeric ID in the URL (e.g. `/bookings/abc`) causes Spring to return HTTP 400 before the controller is invoked
- A numeric but non-existent ID (e.g. `/bookings/99999`) returns HTTP 404 with `errorCode: NOT_FOUND`
- An ID of 0 or negative returns HTTP 400 with `errorCode: INVALID_ID`
- All rejection events are logged with the booking ID and requesting user ID for audit purposes

---

## 9. Performance Considerations

### Query Optimization

- The seat availability query joins `buses` and `bookings` in a single SQL call, computing `COUNT(CONFIRMED bookings)` per bus — no application-level loops
- `bookings` table has indexes on `(bus_id, travel_date, status)` to accelerate the availability join
- `bus_live_location` uses `UPDATE ... WHERE bus_id = ?` rather than INSERT + DELETE, keeping the table at a fixed 10-row size
- HikariCP connection pool eliminates per-request TCP connection overhead

### Redis Seat Locking

Redis `SETNX` (Set If Not Exists) is an atomic operation — it is impossible for two concurrent requests to acquire the same seat lock simultaneously. This prevents double-booking without requiring a database-level transaction lock on the `bookings` table.

### Cold Start Handling

Render's free-tier containers may be paused after inactivity. The `/api/travels/health` endpoint is available without authentication so uptime monitors can keep the container warm. The frontend also shows a "Waking server…" indicator when response time exceeds 2.2 seconds.

---

## 10. Security Considerations

### Authentication & Authorization

- All booking-related endpoints require a valid JWT in the `Authorization: Bearer <token>` header
- `JwtAuthenticationFilter` runs before every request, verifies the HMAC-SHA256 signature, and checks the `exp` claim
- Invalid or expired tokens silently clear the SecurityContext — the request proceeds as unauthenticated and hits a 403 from the authorization layer
- Admin-only endpoints (`/api/admin/**`) require `ROLE_ADMIN`, enforced at the `SecurityConfig` level

### Ownership Enforcement

The cancellation endpoint verifies that `booking.user_id == requesting user's ID` in the service layer, before any database write. A user cannot cancel another user's booking even if they know the booking ID.

### Password Security

- Passwords are hashed with BCrypt (strength 10) before storage — the plain-text password is never persisted
- BCrypt is a slow, adaptive hash function designed to resist brute-force attacks

### CORS Policy

Cross-Origin Resource Sharing is configured to allow only explicitly whitelisted origins, set via the `ALLOWED_ORIGINS` environment variable. The wildcard `*` is never used in production.

### Input Sanitization

- All database queries use parameterized statements via `JdbcTemplate` — SQL injection is structurally impossible
- Request bodies are deserialized by Jackson with known types — arbitrary JSON fields are ignored
- Query parameters are type-coerced (e.g. `busId` is parsed as `Long`) — invalid types fail fast before business logic

---

## 11. Deployment & Environment

### Docker Build

The backend ships as a Docker image built from a two-stage Dockerfile:

```
Stage 1 — Builder
  Base image: maven:3.9.6-eclipse-temurin-17
  Action: mvn clean package -DskipTests
  Output: target/prayagraj-travels-1.0.0.jar

Stage 2 — Runtime
  Base image: eclipse-temurin:17-jdk-alpine  (minimal, ~190MB)
  Action: COPY --from=builder target/*.jar app.jar
  Entrypoint: java -jar app.jar
```

The final image contains only the JDK and the application JAR — no Maven, no source code.

### Environment Variables

All secrets and environment-specific configuration are supplied via environment variables — nothing sensitive is committed to the repository.

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | ✅ | Server port (set automatically by Render) |
| `DB_HOST` | ✅ | MySQL hostname |
| `DB_PORT` | ✅ | MySQL port (typically 3306) |
| `DB_NAME` | ✅ | Database schema name |
| `DB_USERNAME` | ✅ | MySQL username |
| `DB_PASSWORD` | ✅ | MySQL password |
| `REDIS_HOST` | ✅ | Redis hostname |
| `REDIS_PORT` | ✅ | Redis port (typically 6379) |
| `REDIS_USERNAME` | ⬜ | Redis ACL username (if applicable) |
| `REDIS_PASSWORD` | ⬜ | Redis password (if applicable) |
| `JWT_SECRET` | ✅ | HMAC-SHA256 signing key (min 32 chars) |
| `JWT_EXPIRATION_MINUTES` | ⬜ | Token TTL in minutes (default: 10080 = 7 days) |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated list of allowed CORS origins |
| `ADMIN_EMAILS` | ⬜ | Comma-separated emails granted ADMIN role |

### Production vs Development

| Aspect | Development | Production |
|--------|-------------|------------|
| Database | Local MySQL via `docker-compose.yml` | Managed MySQL on cloud provider |
| Redis | Local Redis container | Managed Redis (Upstash or similar) |
| JWT Secret | Fallback dev secret in `application.properties` | Long random secret via env var |
| CORS Origins | `localhost:3000`, `localhost:5173` | Exact Vercel deployment URL |
| Logging Level | `DEBUG` for `com.travels.*` | `INFO` |
| Schema Init | `spring.sql.init.mode=always` | `never` (migrations run manually) |

---

## 12. Future Improvements

### Real-Time Bus Tracking (WebSockets)
Replace the current HTTP polling model for live location with a WebSocket endpoint (Spring WebSocket or STOMP). Clients subscribe to a bus topic and receive push updates every 15 seconds without needing to poll.

### Payment Integration
Add a payment gateway (Razorpay or PhonePe) between booking confirmation and seat release. The booking workflow becomes: Hold → Payment → Confirm → Release hold. Refunds would be triggered automatically on cancellation via the payment gateway's refund API.

### Automated Refund Processing
Currently `refund_status` is set to `PENDING` but no actual refund is triggered. A scheduled job could poll for `PENDING` refunds and call the payment gateway's refund endpoint, then update `refund_status` to `PROCESSED` or `FAILED`.

### Search Query Caching
Popular search routes (e.g. Civil Lines → Airport on a given date) can be cached in Redis with a 1-minute TTL. This eliminates repeated identical JOIN queries under high load.

### Database Archival
As the `bookings` table grows, cancelled and past bookings should be archived to a `bookings_archive` table. This keeps the active table small and fast for seat availability queries.

### Horizontal Scaling
The stateless API design already supports horizontal scaling. The next step is to place a load balancer (e.g. Nginx) in front of multiple Spring Boot instances. Since Redis is already an external shared store, seat-lock state is consistent across all instances.

### Observability
Add structured JSON logging (Logstash format) and integrate with a log aggregation service (e.g. Grafana Loki or Datadog). Add `/actuator/metrics` via Spring Boot Actuator for Prometheus scraping. This provides per-endpoint latency histograms, JVM memory metrics, and HikariCP pool usage visibility.
