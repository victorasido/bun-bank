# Bun Bank API 🏦⚡

**Bun Bank** is a backend banking simulation built with **Bun Runtime**, **TypeScript**, and **PostgreSQL**. This project is designed to show how a modern backend can be **fast, explicit, and safe**, without relying on heavy abstractions or magic.

Think of this as a **clean rewrite** of a classic Java/Spring-style banking system into a lighter, more transparent stack.

---

## 🎯 What This Project Is About

This project exists to prove that:

* You can build a **serious banking backend** with Bun
* **Atomic transactions** matter, especially for money
* Raw SQL is not scary — it’s powerful and predictable
* Backend architecture should be **clear, not clever**

---

## ✨ Features

### 🔐 Authentication

* User registration & login
* JWT-based authentication (using `jose`)

### 🏦 Accounts

* Create bank accounts
* Check balances and account info

### 💸 Transactions

* Deposit
* Withdraw
* Transfer between accounts
* Transaction history

### ⚙️ System

* Health check endpoint
* Database migrations
* Manual transaction control (`BEGIN / COMMIT / ROLLBACK`)

---

## 🏗️ Architecture (Straightforward & Explicit)

This app uses a **Monolithic Layered Architecture** — simple, readable, and scalable enough for real-world use.

1. **Routes (`src/routes`)**
   Handle HTTP requests and responses

2. **Middleware (`src/middleware`)**
   Auth checks and request validation

3. **Business Logic (`src/logic`)**
   Core rules, validations, and transaction flow

4. **Service (`src/service`)**
   Raw SQL queries using `pg`

5. **Database Layer (`src/db`)**
   PostgreSQL connection, migrations, and atomic transaction wrapper

### Why This Design?

* No ORM → full control, predictable queries
* Manual transactions → no accidental partial updates
* Clear separation of concerns → easy to reason about

---

## 🛠️ Tech Stack

* **Runtime**: Bun (v1.x)
* **Language**: TypeScript
* **Database**: PostgreSQL 16
* **Container**: Docker & Docker Compose
* **Libraries**:

  * `pg` – PostgreSQL client
  * `jose` – JWT handling

---

## ⚙️ Requirements

Make sure you have:

* Bun installed
* Docker & Docker Compose
* VS Code (REST Client extension recommended)

---

## 🚀 How to Run

### 1. Clone & Install

```bash
git clone https://github.com/victorasido/bun-bank.git
cd bun-bank
bun install
```

### 2. Start Database

```bash
docker-compose up -d
```

Make sure port `5432` is free.

### 3. Run Migrations

```bash
bun src/db/migrate.ts
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

* No ORM by design
* Built to showcase **backend fundamentals**, not frameworks
* Ideal for learning:

  * Transaction safety
  * API design
  * Bun performance

L.

## 🏗️ Architecture Overview

This backend application is built with **Bun**, **TypeScript**, and **PostgreSQL**, following a **clean, layered architecture** to ensure separation of concerns, maintainability, and scalability.

### Built With

* ⚡ **Bun** — High-performance JavaScript runtime
* 🟦 **TypeScript** — Type-safe backend development
* 🐘 **PostgreSQL** — Relational database (Dockerized)

---

### High-Level Architecture Flow

```text
+----------------------+
|   USER / CLIENT      |
+----------------------+
           |
           v
+----------------------+
|     BUN SERVER       |
|  (Single Process)    |
+----------------------+
           |
           v
+----------------------+
|      IO LAYER        |
|   src/routes         |
|   Controllers        |
+----------------------+
           |
           v
+----------------------+
|     LOGIC LAYER      |
|   src/logic          |
|   Business Rules     |
|   Atomic Tx          |
+----------------------+
           |
           v
+----------------------+
|  DEPENDENCY LAYER    |
|   src/repo           |
|   Repositories       |
+----------------------+
           |
           v
+----------------------+
|   POSTGRESQL (DB)    |
|   Docker Container   |
|                      |
+----------------------+
```

---

### Layer Responsibilities

#### 1. IO Layer (`src/routes`)

* Handles HTTP requests and responses
* Acts as the entry point of the application
* Delegates processing to the Logic Layer
* Contains controllers only (no business rules)

#### 2. Logic Layer (`src/logic`)

* Contains core business rules
* Orchestrates use cases (deposit, withdrawal, transfer, auth)
* Manages **atomic transactions** to ensure data consistency
* Independent from HTTP and database implementations

#### 3. Dependency Layer (`src/repo`)

* Handles database access logic
* Implements repositories (User, Account, Transaction)
* Contains database entities and configuration
* No business rules allowed

#### 4. Database

* PostgreSQL running inside a Docker container
* Communicates via TCP port `5432`
* Stores users, accounts, and transaction data

---

### Design Principles

* ➡️ **Unidirectional dependency**: IO → Logic → Repository → DB
* 🧠 Business logic is isolated and testable
* 🔒 Data consistency ensured through atomic transactions
* 🧼 Clean separation between delivery, domain, and data access

This architecture is inspired by **Clean Architecture** and adapted for a **Bun + TypeScript** backend environment.


