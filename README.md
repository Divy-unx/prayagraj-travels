# 🚌 Prayagraj Travels

> A full-stack intra-city bus booking platform for Prayagraj — featuring real-time seat locking, live GPS tracking, and concurrent booking protection.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started (Local)](#getting-started-local)
- [Deployment](#deployment)

---

## Overview

Prayagraj Travels is a **production-grade bus booking system** built for intra-city routes across Prayagraj (Allahabad). Users can search buses between 14 city stops, view an interactive seat map, hold a seat (2-minute Redis lock), and confirm their booking — all with real-time concurrency protection.

**Live demo routes include:** Civil Lines, Naini, Jhunsi, Phaphamau, Kareli, Chowk, Bamrauli, Airport, Sangam, Allahabad University, Teliyarganj, Mundera, High Court, Zero Road.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework (functional components + hooks) |
| Vite 5 | Build tool and dev server |
| Vanilla CSS | Custom styling (no framework) |
| React Context API | Global state management |

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot 3.2.5 | REST API framework |
| Java 17 | Language |
| Spring JDBC (JdbcTemplate) | Database access |
| HikariCP | Connection pooling (pool size: 20) |
| MySQL 8 | Persistent storage for bookings and buses |
| Redis | Seat hold locking with 2-minute TTL |
| Spring Scheduler | Live GPS location simulation (every 15s) |
| Jackson | JSON serialization |

---

## Features

### 🔍 Bus Search
- Search buses between any two stops in Prayagraj
- Returns matching buses with fare, capacity, operator details
- Falls back to all buses if no exact route match

### 🪑 Interactive Seat Map
- Visual 2+2 grid layout (rows A–J, seats 1–4)
- Real-time seat status: `AVAILABLE` / `HELD` / `BOOKED`
- Polling every 5 seconds for live updates

### 🔒 Seat Hold (Redis)
- Atomically locks a seat for **2 minutes** using Redis `SETIFABSENT`
- Prevents double-booking under concurrent load
- Automatically released if user deselects or hold expires

### 🎟 Booking
- Confirms booking only if Redis hold is still valid (race-condition guard)
- Final DB check before insert (double-lock safety)
- Stores: passenger name, phone, bus, seat, date, fare

### 📡 Live Bus Tracking
- Simulated GPS movement along real Prayagraj route corridors
- Updated every 15 seconds via Spring `@Scheduled`
- Shows: latitude, longitude, speed, heading, next stop, status

### 🎫 My Tickets
- View all active bookings by user ID
- Cancel bookings with one click

### 👤 Login / Register
- Simple user authentication modal
- Session stored in React context

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  SearchBar → BusResults → SeatModal → Booking Flow  │
│                  (Vite, port 3000)                   │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP (VITE_API_BASE_URL)
                      ▼
┌─────────────────────────────────────────────────────┐
│              Spring Boot REST API                    │
│         /api/travels/*  (port 8081)                 │
│                                                      │
│  TravelsController → TravelsService                  │
│         ↓                    ↓                       │
│    TravelsRepository       Redis                     │
│   (JdbcTemplate)       (Seat Holds, TTL=2min)       │
│         ↓                                            │
│        MySQL                                         │
│  buses | bookings | bus_live_location                │
└─────────────────────────────────────────────────────┘
                      ↑
               LocationSimulator
         (@Scheduled every 15s — GPS sim)
```

---

## API Reference

Base URL: `http://localhost:8081/api/travels`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/buses` | List all buses |
| `GET` | `/buses/{id}` | Get bus by ID |
| `GET` | `/search?source=&destination=` | Search buses by route |
| `GET` | `/seats?busId=&travelDate=` | Get seat map for a bus on a date |
| `POST` | `/seats/hold` | Hold a seat (Redis, 2-min TTL) |
| `POST` | `/seats/release` | Release a held seat |
| `POST` | `/book` | Confirm booking |
| `GET` | `/bookings?userId=` | Get all bookings for a user |
| `DELETE` | `/bookings/{bookingId}?userId=` | Cancel a booking |
| `GET` | `/live-location?busId=` | Get live location for one bus |
| `GET` | `/live-location/all` | Get live location for all buses |

### Example: Hold a Seat
```http
POST /api/travels/seats/hold
Content-Type: application/json

{
  "busId": 1,
  "seatNumber": "A1",
  "travelDate": "2026-05-10",
  "userId": "user_42"
}
```

### Example: Confirm Booking
```http
POST /api/travels/book
Content-Type: application/json

{
  "busId": 1,
  "seatNumber": "A1",
  "travelDate": "2026-05-10",
  "userId": "user_42",
  "passengerName": "Divyanshu",
  "passengerPhone": "9876543210"
}
```

---

## Database Schema

### `buses`
```sql
id INT PK AUTO_INCREMENT
name VARCHAR(100)
source VARCHAR(100)
destination VARCHAR(100)
capacity INT
fare DOUBLE
```

### `bookings`
```sql
booking_id INT PK AUTO_INCREMENT
bus_id INT FK
seat_number VARCHAR(5)
travel_date DATE
user_id VARCHAR(100)
passenger_name VARCHAR(100)
passenger_phone VARCHAR(15)
status ENUM('CONFIRMED','CANCELLED','PENDING')
fare_paid DOUBLE
booked_at TIMESTAMP
```

### `bus_live_location`
```sql
bus_id INT PK FK
latitude DOUBLE
longitude DOUBLE
speed_kmh INT
heading_degrees INT
next_stop VARCHAR(100)
status ENUM('ON_TIME','DELAYED','ARRIVED')
last_updated TIMESTAMP
```

> The database comes pre-seeded with **100 buses** across all major Prayagraj routes.

---

## Project Structure

```
prayagraj-travels/
├── backend/
│   ├── src/main/java/com/travels/
│   │   ├── TravelsApplication.java       # Spring Boot entry point
│   │   ├── config/
│   │   │   ├── RedisConfig.java          # Redis template + JSON serializer
│   │   │   └── WebConfig.java            # CORS configuration
│   │   ├── controller/
│   │   │   └── TravelsController.java    # REST endpoints
│   │   ├── model/
│   │   │   ├── BookingRequest.java       # Booking request body
│   │   │   └── SeatHoldRequest.java      # Hold/release request body
│   │   ├── repository/
│   │   │   └── TravelsRepository.java    # JdbcTemplate SQL queries
│   │   ├── scheduler/
│   │   │   └── LocationSimulator.java    # GPS simulation (15s interval)
│   │   └── service/
│   │       └── TravelsService.java       # Business logic + Redis locking
│   ├── src/main/resources/
│   │   ├── application.properties        # Spring config (reads from .env)
│   │   └── schema.sql                    # DB schema + 100-bus seed data
│   ├── .env                              # Local environment variables
│   ├── Dockerfile                        # Multi-stage Docker build
│   ├── pom.xml                           # Maven dependencies
│   └── start.sh                          # Local start script (loads .env)
│
├── frontend-react/
│   ├── src/
│   │   ├── App.jsx                       # Root component + routing
│   │   ├── constants.js                  # API base URL + stops + operators
│   │   ├── context/
│   │   │   └── AppContext.jsx            # Global state (search, modals, auth)
│   │   ├── components/
│   │   │   ├── Nav.jsx                   # Top navigation bar
│   │   │   ├── SearchBar.jsx             # Route + date search
│   │   │   ├── BusResults.jsx            # Search results container
│   │   │   ├── BusCard.jsx               # Individual bus card
│   │   │   ├── FilterPanel.jsx           # Filter by type, time, price
│   │   │   ├── OperatorGroup.jsx         # Operator details panel
│   │   │   ├── SeatModal.jsx             # Seat map + hold + booking flow
│   │   │   ├── TrackingModal.jsx         # Live GPS tracking modal
│   │   │   ├── LoginModal.jsx            # Auth modal
│   │   │   ├── MyTickets.jsx             # User bookings list
│   │   │   ├── LandingHero.jsx           # Homepage hero section
│   │   │   ├── LandingFeatures.jsx       # Feature highlights
│   │   │   ├── LandingRoutes.jsx         # Popular routes section
│   │   │   └── Toast.jsx                 # Notification toast
│   │   ├── index.css                     # Global styles
│   │   └── main.jsx                      # React entry point
│   ├── .env                              # Frontend environment variables
│   ├── .env.example                      # Environment variable template
│   ├── vite.config.js                    # Vite configuration
│   └── package.json
│
└── README.md
```

---

## Environment Variables

### Frontend — `frontend-react/.env`
```env
VITE_APP_TITLE=Prayagraj Travels

# Local dev  → http://localhost:8081
# Production → https://prayagraj-travels-2.onrender.com
VITE_API_BASE_URL=http://localhost:8081
```

### Backend — `backend/.env`
```env
SERVER_PORT=8081
PORT=8081

DB_HOST=localhost
DB_PORT=3306
DB_NAME=prayagraj_bus
DB_USERNAME=root
DB_PASSWORD=your_password

REDIS_HOST=localhost
REDIS_PORT=6379

# Frontend origin for CORS
FRONTEND_URL=http://localhost:3000
```

---

## Getting Started (Local)

### Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8+
- Redis 6+
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/divyanshu-4484/prayagraj-travels.git
cd prayagraj-travels
```

### 2. Set up the database
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS prayagraj_bus;"
mysql -u root -p prayagraj_bus < backend/src/main/resources/schema.sql
```

### 3. Configure environment variables
```bash
# Backend
cp backend/.env backend/.env          # Edit DB_PASSWORD to match yours

# Frontend — no changes needed for local dev
```

### 4. Start the backend
```bash
cd backend
mvn clean package -DskipTests         # Build the JAR
bash start.sh                         # Start with .env loaded
```
Backend runs at: `http://localhost:8081`

Verify: `curl http://localhost:8081/api/travels/health`

### 5. Start the frontend
```bash
cd frontend-react
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

---

## Deployment

### Backend → Render (Docker)
The `backend/Dockerfile` uses a multi-stage build:
```dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS builder  # Build stage
FROM eclipse-temurin:17-jdk                      # Runtime stage
```

Set these environment variables in Render dashboard:
```
DB_HOST      = <your MySQL host>
DB_NAME      = prayagraj_bus
DB_USERNAME  = <db user>
DB_PASSWORD  = <db password>
REDIS_HOST   = <your Redis host>
FRONTEND_URL = https://your-app.vercel.app
```

### Frontend → Vercel / Netlify
```bash
cd frontend-react

# Set in Vercel dashboard or .env.production:
VITE_API_BASE_URL=https://prayagraj-travels-2.onrender.com

npm run build   # Output in dist/
```

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| **Redis for seat hold** | Prevents double-booking without long DB transactions; TTL auto-cleans expired holds |
| **JdbcTemplate over JPA** | Full control over SQL, no ORM magic, better for interview demonstrations |
| **HikariCP (pool=20)** | Handles concurrent booking requests efficiently |
| **Double-lock booking** | Redis hold check + DB uniqueness check — guards against race conditions |
| **`@CrossOrigin("*")` on controller** | Extra safety for CORS alongside `WebConfig.java` |
| **Spring Scheduler for GPS** | Simulates realistic bus movement without external GPS integration |

---

## License

MIT © 2026 Divyanshu
