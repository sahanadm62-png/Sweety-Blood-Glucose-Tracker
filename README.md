# Sweety – Blood Glucose Tracker

Sweety is a blood glucose tracking application built using the MERN-style development approach with **React.js, Node.js, Express.js, and PostgreSQL**.

It allows users to securely register, log in, record daily blood glucose readings, manage their records, and view reports.

## Features

- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Add, view, update, and delete glucose readings.
- Four daily reading slots:
  - Morning fasting
  - After breakfast
  - After lunch
  - After dinner
- Reading validation (40–600 mg/dL).
- Prevent duplicate readings for the same slot and date.
- Prevent future-dated readings.
- User-specific data access.
- Daily glucose reports.
- Month-to-date reports.
- Previous-month reports.
- Database seeding with sample data.

## Technology Stack

**Backend**
- Node.js
- Express.js
- PostgreSQL
- pg
- bcrypt
- JSON Web Token (JWT)

**Frontend**
- React.js (planned)

**Tools**
- Visual Studio Code
- pgAdmin 4
- Git and GitHub

## Project Structure

```text
Sweety-Blood-Glucose-Tracker/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── readingController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── init.sql
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── readingRoutes.js
│   ├── tests/
│   ├── .env.example
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── frontend/
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Sweety-Blood-Glucose-Tracker
```

### 2. Set up the database

- Install PostgreSQL.
- Create a database named `sweety_db`.
- Open pgAdmin and execute the SQL commands from `backend/models/init.sql`.

### 3. Set up the backend

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` folder using `.env.example` as a reference.

Configure your PostgreSQL credentials and JWT secret.

### 5. Start the backend server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The backend runs at:

```text
http://localhost:5000
```

### 6. Seed sample data

```bash
npm run seed
```

Demo account:

- Email: `seed@sweety-demo.com`
- Password: `SweetySeed@123`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |

### Glucose Readings

All reading endpoints require a valid JWT access token in the Authorization header.

```text
Authorization: Bearer YOUR_TOKEN
```

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/readings` | Add a reading |
| GET | `/api/readings` | Get all user readings |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/readings/daily-report` | Daily report |
| GET | `/api/readings/month-to-date-report` | Month-to-date report |
| GET | `/api/readings/previous-month-report` | Previous-month report |

Example daily report:

```text
GET /api/readings/daily-report?date=2026-11-11
```

Reports include:
- Highest reading
- Lowest reading
- Average reading
- Total number of readings

## Validation Rules

- Reading value must be an integer between 40 and 600 mg/dL.
- Each user can have only one reading per slot per day.
- A maximum of four readings can be recorded per day.
- Future dates are not allowed.
- Users can access and modify only their own readings.

## Database Design

### Users Table

Stores user account information.

- id
- name
- email
- password_hash
- created_at

### Readings Table

Stores blood glucose readings.

- id
- user_id
- reading_date
- slot
- value
- created_at

The readings table