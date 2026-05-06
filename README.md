# 🚌 Prayagraj Travels

A full-stack, highly concurrent intra-city bus reservation platform built for Prayagraj. This application provides a seamless, modern, and robust system for searching routes, holding seats in real-time, and managing bookings. 

---

## 🌟 Features

- **Real-Time Seat Booking:** Interactive, visual seat map with real-time locking using Redis to prevent double booking. Seats are held for 5 minutes during checkout.
- **Intra-City Route Search:** Advanced search functionality for bus routes across Prayagraj with auto-complete, caching, and instant filtering.
- **Live Bus Tracking:** Displays live bus coordinates and speeds using an interactive UI.
- **User Dashboard:** Dedicated user space for managing profiles, viewing past bookings, downloading tickets, and processing cancellations.
- **Robust Authentication:** Secure JWT-based authentication for user sessions.
- **Premium UI/UX:** Responsive, glassmorphism-inspired design built with Tailwind CSS and Framer Motion for micro-animations.

---

## 🏗️ Architecture & Technology Stack

The project uses a detached client-server architecture, communicating via RESTful JSON APIs.

### 💻 Frontend (Client)
- **Framework:** React 18 (Bootstrapped with Vite for instant server start & fast HMR).
- **Styling:** Tailwind CSS (Utility-first styling) & custom CSS (`index.css`) for advanced design tokens.
- **State Management:** React Context API (`AppContext`, `AuthContext`) for global state.
- **Routing:** React Router v7 for client-side navigation.
- **HTTP Client:** Axios with intelligent interceptors for token injection, error normalization, and exponential backoff retries.
- **Icons & UI Elements:** Lucide React, Recharts, Swiper, and React Hot Toast.

### ⚙️ Backend (Server)
- **Framework:** Java 21 & Spring Boot 3.2.5.
- **Database Access:** Spring JDBC Template for highly optimized, raw SQL queries without ORM overhead.
- **Relational Database:** MySQL for persistent storage of users, buses, routes, and finalized bookings.
- **In-Memory Store:** Redis for distributed lock management and temporary seat holds (TTL-based expiration).
- **Security:** Spring Security & JWT for endpoint protection.
- **Build Tool:** Maven.

---

## 🔄 Project Workflow & API Integration

1. **Authentication:** 
   Users register or log in via the React app. The Spring Boot backend validates credentials and issues a JWT. The React `AuthContext` stores this token locally and attaches it to all subsequent Axios requests.

2. **Search & Discovery:** 
   When a user searches for a route, the frontend calls the `/api/travels/search` endpoint. Results are cached client-side (TTL of 5 minutes) to reduce server load. 

3. **Concurrency & Seat Locking:**
   When a user selects a seat on the frontend UI, a request is fired to `/api/travels/seats/hold`. 
   - The Spring Boot backend checks **Redis** to ensure the seat isn't currently held by another user.
   - If available, Redis creates a temporary lock key that naturally expires in 300 seconds (5 minutes).
   - The React frontend displays a countdown timer. 

4. **Booking Confirmation:**
   Upon submitting passenger details, the `/api/travels/book` endpoint is hit. The backend performs an ACID-compliant transaction in MySQL to officially reserve the seat, and then removes the temporary Redis hold.

5. **Cancellations:**
   Users can cancel tickets from their dashboard. The backend updates the booking status to `CANCELLED` and processes a mock refund logic.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- Java Development Kit (JDK 21)
- MySQL Server (Running on default port 3306)
- Redis Server (Running on default port 6379)
- Maven

### 1. Database Setup (MySQL)
1. Log in to your local MySQL instance.
2. Create the database: `CREATE DATABASE prayagraj_travels;`
3. The Spring Boot application (if configured with `spring.sql.init.mode=always` or Hibernate ddl-auto) will handle schema creation, or you can run your provided SQL scripts.

### 2. Backend Setup (Spring Boot)
1. Navigate to the backend directory: 
   ```bash
   cd backend
   ```
2. Configure `src/main/resources/application.properties` with your MySQL and Redis credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/prayagraj_travels
   spring.datasource.username=root
   spring.datasource.password=your_password
   
   spring.data.redis.host=localhost
   spring.data.redis.port=6379
   ```
3. Build and run the server:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   *The backend will run on `http://localhost:8080`.*

### 3. Frontend Setup (React)
1. Navigate to the frontend directory:
   ```bash
   cd frontend-react
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend-react` root and link the API:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 🌍 Deployment

- **Frontend:** The `frontend-react` application is optimized for deployment on **Vercel**. Simply connect your GitHub repository to Vercel, and it will auto-detect Vite settings.
- **Backend:** The Spring Boot backend can be containerized using Docker and deployed to platforms like **Render**, **Railway**, or **AWS ECS**.

## 🛡️ Best Practices Implemented
- **Optimistic UI Updates:** UI reacts instantly during cancellations while the API request processes in the background.
- **Debouncing:** Search autocomplete inputs are debounced to prevent API spamming.
- **Axios Interceptors:** Centralized error handling and automatic token attachment.
- **Separation of Concerns:** React contexts strictly manage state while API service classes (`api.js`) handle network logic.
