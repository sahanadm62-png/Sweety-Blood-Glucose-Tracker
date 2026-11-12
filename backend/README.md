# Sweety – Blood Glucose Tracker

Sweety is a full-stack blood glucose tracking application built using React.js, Node.js, Express.js, and PostgreSQL.

It helps users securely record, manage, and monitor their daily blood glucose readings through a simple dashboard, visual trends, and reports.

## Features

- User registration and login
- Secure password hashing using bcrypt
- JWT-based authentication
- Add, view, update, and delete glucose readings
- Four daily reading slots:
  - Morning fasting
  - After breakfast
  - After lunch
  - After dinner
- Input validation (40–600 mg/dL)
- Prevention of duplicate readings for the same slot and date
- Prevention of future-dated readings
- User-specific data access
- Daily glucose reports
- Month-to-date reports
- Previous-month reports
- Highest, lowest, and average reading calculations
- Glucose trend visualization using charts
- Sample database seeding

## Technology Stack

**Frontend**
- React.js
- JavaScript
- CSS
- Axios
- React Router
- Recharts

**Backend**
- Node.js
- Express.js
- bcrypt
- JSON Web Token (JWT)

**Database**
- PostgreSQL
- pg

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
│   ├── .env.example
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GlucoseChart.jsx
│   │   │   ├── ReadingForm.jsx
│   │   │   └── Reports.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/sahanadm62-png/Sweety-Blood-Glucose-Tracker.git
cd Sweety-Blood-Glucose-Tracker
```

### 2. Set up PostgreSQL

- Install PostgreSQL.
- Create a database named `sweety_db`.
- Open pgAdmin.
- Execute the SQL commands from `backend/models/init.sql`.

### 3. Set up the backend

Open a terminal:

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` folder.

Use `backend/.env.example` as a reference and configure your PostgreSQL credentials and JWT secret.

Never commit your actual `.env` file.

### 5. Start the backend

```bash
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 6. Set up the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

`http://localhost:5173`

### 7. Add sample data (optional)

From the backend folder:

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

All reading endpoints require a valid JWT access token.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/readings` | Add a reading |
| GET | `/api/readings` | Get user readings |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/readings/daily-report` | Daily report |
| GET | `/api/readings/month-to-date-report` | Month-to-date report |
| GET | `/api/readings/previous-month-report` | Previous-month report |

## Validation Rules

- Reading values must be whole numbers between 40 and 600 mg/dL.
- Each user can record only one reading per slot per day.
- A maximum of four readings can be recorded per day.
- Future dates are not allowed.
- Users can access and modify only their own readings.

## Reports

The application provides:

- Highest glucose reading
- Lowest glucose reading
- Average glucose reading
- Total number of readings
- Reading history

## Security

- Passwords are hashed using bcrypt.
- JWT authentication protects private API routes.
- SQL queries use parameterized inputs.
- Users can access only their own glucose records.

## Disclaimer

Sweety is an educational tracking application. It is not a medical device and does not replace professional medical advice or diagnosis.