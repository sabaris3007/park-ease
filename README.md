# ParkEase — Smart Parking Lot Management System

A smart, human-centered parking lot management web application featuring nearby parking hub discovery, live interactive bay occupancy maps, dynamic vehicle tariffs, instant ticket issuing, and customer garage management.

---

## Key Features

- **Nearby Parking Hub Discovery**: Browse and search parking facilities across Coimbatore, Chennai, Bengaluru, and Hyderabad with live availability counters, distance calculation, and GPS sorting.
- **Interactive Live Bay Visualizer**: Visual layout showing all parking bays with color-coded occupancy (available, car, bike, tandem heavy vehicle). Click any bay for instant booking or slip details.
- **Smart Vehicle Allocation**: Automated slot assignment with support for compact 2-wheelers, standard 4-wheelers, and tandem heavy vehicles (2 adjacent slots).
- **Vehicle Garage & User Portal**: Manage registered vehicles, view active parking passes, track parking receipts, and sign in with 1-click demo profiles.
- **Dynamic Billing**: Accurate duration calculation with hourly tariffs and an 8-hour daily cap.
- **Universal SQLite Integration**: Embedded relational SQLite database with zero external compilation dependencies.

---

## Quick Start

### Prerequisites
- Node.js (v20+ recommended; built-in `node:sqlite` supported on Node 22/24)
- npm

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Initialize Database (Optional / Reset)
```bash
node scripts/init_database.js
```

### 3. Run the Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## Demo Accounts (1-Click Sign-In Available)

You can sign in with 1-click in the app, or use any of the pre-seeded accounts:

| Name | Email | Password | Pre-registered Vehicles |
|---|---|---|---|
| **Kavitha R.** | `kavitha@example.com` | `Password@123` | Bike (`TN 38 BH 1234`), Car (`TN 38 CD 4321`) |
| **Rajesh Kumar** | `rajesh@example.com` | `Password@123` | Car (`TN 38 AZ 5678`) |
| **Dr. Arvind Swamy** | `arvind@example.com` | `Password@123` | Car (`TN 38 AA 9999`) |

---

## Java & DBMS Coursework Architecture

This project was built to satisfy comprehensive academic requirements for **Java & Relational Database Management Systems (DBMS)**:

1. **Relational Database Schemas**:
   - [`database/mysql_schema.sql`](database/mysql_schema.sql): Complete MySQL 8.0+ InnoDB DDL with primary keys, unique constraints, foreign keys with `ON DELETE CASCADE`, check constraints, indexes, and analytical views.
   - [`java-backend/schema.sql`](java-backend/schema.sql): SQLite-compatible relational schema running in the embedded full-stack app.
   - **Analytical Views**:
     - `v_centre_occupancy`: Computes real-time capacity percentage, vacant bays, and total revenue across all parking facilities.
     - `v_revenue_by_vehicle`: Aggregates trip count, average duration, and gross revenue by vehicle category (Bike, Car, Truck).

2. **Java Backend Reference**:
   - Location: [`java-backend/src/com/parkease/Main.java`](java-backend/src/com/parkease/Main.java)
   - Packages:
     - `dao`: Data Access Objects utilizing `PreparedStatement` to prevent SQL injection (`UserDAO`, `VehicleDAO`, `SlotDAO`, `TicketDAO`, `ReportsDAO`, `ParkingCentreDAO`).
     - `service`: Business logic for transaction management and tandem slot allocation.
     - `model`: Strong entity classes mapping relational tables (`User`, `Vehicle`, `ParkingCentre`, `ParkingSlot`, `ParkingTicket`).
     - `util`: SHA-256 + salt password hashing utility.
   - Jars: SQLite JDBC and SLF4J drivers included in `java-backend/lib/`.

---

## Deploying to Vercel

The application is pre-configured for **zero-config Vercel deployment**:

1. Push this repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/new), click **Import Project** and select your repository.
3. Keep default settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

Vercel automatically builds the Vite frontend and routes all `/api/*` endpoints through the serverless function in [`api/index.ts`](api/index.ts). On Vercel, the database is mounted in `/tmp/parking_system.db` with writable support.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, TypeScript (TSX)
- **Serverless API**: Vercel Serverless Functions (`api/index.ts`)
- **Database**: Relational SQLite (Node built-in `node:sqlite` / `better-sqlite3`) & MySQL schema
- **Java Reference**: Java 17+, JDBC, PreparedStatements


# park-ease
