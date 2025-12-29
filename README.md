# Bun Bank API 🏦⚡

**Bun Bank** is a high-performance banking backend simulation built with **Bun**, **Hono**, and **Prisma ORM**.

This project demonstrates how to build a type-safe, scalable financial system using modern TypeScript tooling, moving away from legacy patterns while maintaining strict **ACID compliance** for transactions.

---

## 🎯 Key Features

### ⚡ Performance & Stack
* **Runtime:** Bun (Super fast JavaScript runtime)
* **Framework:** Hono (Lightweight, web-standard aligned framework)
* **ORM:** Prisma (Type-safe database access with Migration tool)
* **Database:** PostgreSQL 16 (Dockerized)

### 🏦 Banking Logic
* **Atomic Transactions:** Uses Prisma Interactive Transactions (`$transaction`) to ensure money transfers are safe (ACID). If one step fails, everything rolls back.
* **Concurrency Control:** Handles race conditions using atomic increments/decrements.
* **Data Integrity:** Uses `BigInt` for balance precision to avoid floating-point errors.

### 🔐 Security
* **JWT Authentication:** Secure stateless authentication using `jose`.
* **Password Hashing:** User passwords are encrypted before storage.
* **Middleware:** Protected routes via custom Hono middleware.

---

## 🏗️ Architecture

This project follows a **Clean Layered Architecture** to separate concerns:

1.  **Presentation Layer (`src/routes`)**
    * Handles HTTP requests using Hono.
    * Parses JSON and validates inputs via DTOs.
2.  **Logic Layer (`src/logic`)**
    * Contains purely business rules (e.g., "Cannot transfer to self", "Check balance").
    * Orchestrates transactions using `withTransaction` wrapper.
3.  **Data Access Layer (`src/service`)**
    * Interacts directly with the database via **Prisma Client**.
    * Reusable functions that can run inside or outside a transaction.
4.  **Infrastructure (`src/db`)**
    * Manages Database Connection Pooling (via `pg` + `Prisma Adapter`).

---

## 🛠️ Tech Stack

* **Runtime**: Bun v1.x
* **Language**: TypeScript
* **Framework**: Hono
* **Database**: PostgreSQL
* **ORM**: Prisma (with `@prisma/adapter-pg` for connection pooling)
* **Dev Tools**: Docker, Docker Compose

---

## 🚀 How to Run

### 1. Clone & Install
```bash
git clone [https://github.com/victorasido/bun-bank.git](https://github.com/victorasido/bun-bank.git)
cd bun-bank
bun install
```

### 2. Start Database

```bash
docker-compose up -d
```

Make sure port `5432` is free.
If u have port problem, u can reset port
```bash
sudo systemctl daemon-reload
sudo systemctl stop postgresql
sudo lsof -i :5432
```

### 3. Run Migrations

```bash
# Generate Prisma Client
npx prisma generate
and
# Push schema to Database
npx prisma migrate dev
```

Wait until you see a success message.

### 4. Start Server

#### Dev Mode

```bash
bun run dev
```

#### Prod Mode

```bash
bun run start
```

Server runs on `http://localhost:3000`.

---

## 🧪 API Testing

No Postman needed.

This repo includes **`api-test.http`**, ready to use with VS Code.

### Suggested Flow

1. Register users
2. Login → JWT is auto-saved
3. Create account
4. Deposit / Withdraw / Transfer
5. Check transaction history

---

## 📡 API Endpoints

### Auth

* `POST /auth/register`
* `POST /auth/login`

### Accounts

* `POST /accounts`
* `GET /accounts`

### Transactions

* `POST /transactions/deposit`
* `POST /transactions/withdraw`
* `POST /transactions/transfer`
* `GET /transactions/{accountId}`

### Health

* `GET /health`

---

## 📂 Project Structure

```
src/
├── index.ts        # App entry point
├── config/         # JWT & env config
├── constants/      # Transaction constants
├── database/       # SQL schema
├── db/             # DB connection, migrations, transactions
├── dto/            # Request/response shapes
├── entities/       # DB entities
├── errors/         # Custom errors
├── logic/          # Business logic
├── middleware/     # Auth middleware
├── service/        # Raw SQL queries
├── routes/         # API routes
└── types/          # Shared types
```

---

## 🧠 Final Notes

* **Modern ORM Implementation**: Uses **Prisma** for type-safe database queries and migrations, replacing legacy raw SQL patterns while keeping full control over performance.
* **Strict Transaction Safety**: Demonstrates how to handle critical financial operations (ACID) using **Prisma Interactive Transactions** (`$transaction`).
* **High Performance**: Built on top of **Bun** runtime and **Hono** framework for maximum speed and low overhead.
* **Scalable Codebase**: Designed with clear separation of concerns, making it ideal for learning enterprise-grade backend architecture.

L.

## 🏗️ Architecture Overview

This backend application is built with **Bun**, **TypeScript**, **Hono**, and **Prisma**, following a **Clean Layered Architecture**. This ensures that business logic is decoupled from the database and HTTP framework, making the system maintainable and testable.

### 🛠️ Built With

* ⚡ **Bun** — High-performance JavaScript runtime
* 🔥 **Hono** — Ultrafast web framework standard
* 💎 **Prisma** — Next-generation ORM for Type Safety & Migration
* 🟦 **TypeScript** — Static typing for robust development
* 🐘 **PostgreSQL** — Relational database (Dockerized)

---

### 🔄 High-Level Architecture Flow

```text
(1) Request Masuk
                                          |
                                          v
+----------------------------------------------------------------------------------+
|   BUN RUNTIME (Server Application)                                               |
|                                                                                  |
|   +--------------------------+                                                   |
|   |  SRC/ROUTES (IO Layer)   |                                                   |
|   |  (Hono Controller)       | <--- "Tolong transfer dong!"                      |
|   +------------+-------------+                                                   |
|                |                                                                 |
|                v (2) Panggil Logic                                               |
|   +--------------------------+                                                   |
|   |  SRC/LOGIC               |                                                   |
|   |  (Business Rules)        | <--- "Saldo cukup? Rekening valid?"               |
|   +------------+-------------+                                                   |
|                |                                                                 |
|                v (3) Panggil Service                                             |
|   +--------------------------+                                                   |
|   |  SRC/SERVICE             |      (4) Query via Prisma                         |
|   |                          | --------------------------------+                 |
|   +--------------------------+                                 |                 |
|                                                                |                 |
|            +---------------------------------------------------+                 |
|            |                                                                     |
|            v (5) Minta Koneksi                                                   |
|   +--------------------------+           +-----------------------------------+   |
|   |  SRC/DB/PRISMA.TS        |           |  SRC/DB/POSTGRES.TS               |   |
|   |  (Prisma Adapter)        | <-------> |  (The Connection Pool)            |   |
|   |  "Jembatan"              |    (6)    |  [ Motor 1 (Dipake)   ]           |   |
|   +------------+-------------+  Pinjam   |  [ Motor 2 (Standby)  ]           |   |
|                |                Koneksi  |  [ Motor 3 (Standby)  ]           |   |
|                |                         |  [ Motor 4 (Standby)  ]           |   |
|                |                         +-----------------------------------+   |
|                |                                                                 |
+----------------|-----------------------------------------------------------------+
                 |
                 | (7) Eksekusi SQL via Koneksi Pinjaman
                 |
+----------------v-----------------+
|  DOCKER CONTAINER                |
|                                  |
|  +----------------------------+  |
|  |  PostgreSQL Database       |  |
|  |  (Simpan Data Beneran)     |  |
|  +----------------------------+  |
|                                  |
+----------------------------------+
+----------------------+
```

---

### Layer Responsibilities

#### 1. IO Layer (`src/routes`)

* Handles HTTP requests/responses via Hono.
* Validates input DTOs.
* No business logic allowed here.

#### 2. Logic Layer (`src/logic`)

* Handles HTTP requests/responses via Hono.
* Validates input DTOs.
* No business logic allowed here.

#### 3. Dependency Layer (`src/service`)

* Direct interface with the Database via Prisma.
* Reusable CRUD operations.
* Agnostic of HTTP context.

#### 4. Database

* PostgreSQL running in Docker.
* Managed via Prisma Schema and Migrations.

---

### Design Principles

* ➡️ **Unidirectional dependency**: IO → Logic → Serices → DB
* 🧠 Business logic is isolated and testable
* 🔒 Data consistency ensured through atomic transactions
* 🧼 Clean separation between delivery, domain, and data access

This architecture is inspired by **Clean Architecture** and adapted for a **Bun + TypeScript** backend environment.








































































































































































```text
┌──────────────┐
│ Presentation │  (UI)
└──────┬───────┘
       │ HTTP
┌──────▼───────┐
│ Application  │  (Backend API)
└──────┬───────┘
       │ SQL
┌──────▼───────┐
│   Database   │
└──────────────┘
```