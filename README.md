# Hall Reservation System

A production-ready college Hall Reservation System that allows faculty members to reserve halls without administrator approval. Built with **React + Vite** (frontend) and **Node.js + Express** (backend), powered by **Supabase PostgreSQL**.

---

## Features

- **Faculty Registration** with OTP email verification
- **JWT Authentication** — secure login/logout
- **5 Halls** across Ground, Second, and Fifth floors
- **Real-time Availability** — live status based on current bookings
- **Instant Booking Confirmation** — no admin approval needed
- **Overlap Detection** — prevents double-booking automatically
- **Email Notifications** — OTP, booking confirmation, and cancellation emails
- **Booking History** — search, filter, sort, and cancel
- **Interactive Calendar** — monthly view with color-coded booking dots
- **Profile Management** — update personal details and password
- **Responsive Design** — works on desktop, tablet, and mobile

---

## Tech Stack

| Layer          | Technology                            |
|----------------|---------------------------------------|
| Frontend       | React 18, Vite 5, Tailwind CSS 3      |
| Routing        | React Router v6                       |
| HTTP Client    | Axios                                 |
| Backend        | Node.js, Express.js                   |
| Authentication | JWT (jsonwebtoken), bcryptjs          |
| Database       | Supabase (PostgreSQL)                 |
| Email          | Nodemailer (Gmail SMTP)               |

---

## Project Structure

```
hall/
├── backend/
│   ├── src/
│   │   ├── config/          ← Supabase client
│   │   ├── controllers/     ← Request handlers
│   │   ├── middleware/      ← JWT auth, validation
│   │   ├── routes/          ← API route definitions
│   │   ├── services/        ← Business logic
│   │   ├── utils/           ← OTP generator, email transport
│   │   └── database/        ← schema.sql, seed.sql
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      ← UI primitives + layout components
    │   ├── context/         ← AuthContext
    │   ├── layouts/         ← AuthLayout, DashboardLayout
    │   ├── lib/             ← Supabase client
    │   ├── pages/           ← All page components
    │   ├── services/        ← Axios API service
    │   └── utils/           ← formatters, validators
    ├── index.html
    ├── .env
    └── package.json
```

---

## Quick Start

### Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) and open your project
2. Navigate to **SQL Editor**
3. Run `backend/src/database/schema.sql` to create all tables
4. Run `backend/src/database/seed.sql` to insert the 5 halls

### Step 2 — Get your Supabase keys

From your Supabase project → **Settings → API**:
- `SUPABASE_URL` — Project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Service Role key *(keep secret — backend only)*
- `VITE_SUPABASE_ANON_KEY` — Anon/Public key *(used on frontend)*

### Step 3 — Set up Gmail SMTP

1. Enable **2-Factor Authentication** on your Gmail account
2. Go to Google Account → **Security → App Passwords**
3. Create an App Password for "Mail"
4. Use that 16-character password as `SMTP_PASS`

### Step 4 — Configure Environment Variables

**`backend/.env`**
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_strong_random_secret_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM_NAME=Hall Reservation System
```

**`frontend/.env`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 5 — Install & Run

Open **two terminal windows**:

**Terminal 1 — Backend**
```bash
cd hall/backend
npm install
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd hall/frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

| Method | Endpoint                 | Auth | Description                        |
|--------|--------------------------|------|------------------------------------|
| POST   | `/api/auth/register`     | ✗    | Register + send OTP                |
| POST   | `/api/auth/verify-otp`   | ✗    | Verify OTP + create account        |
| POST   | `/api/auth/login`        | ✗    | Login + get JWT                    |
| GET    | `/api/halls`             | ✓    | List all halls with live status    |
| GET    | `/api/halls/availability`| ✓    | Check hall availability for date   |
| POST   | `/api/bookings`          | ✓    | Create booking (conflict check)    |
| GET    | `/api/bookings`          | ✓    | Get user's bookings                |
| DELETE | `/api/bookings/:id`      | ✓    | Cancel a future booking            |
| GET    | `/api/profile`           | ✓    | Get current user profile           |
| PUT    | `/api/profile`           | ✓    | Update profile / change password   |

---

## Halls

| Hall Name       | Floor        | Location                        |
|-----------------|--------------|---------------------------------|
| Board Room      | Ground Floor | Admin Block, Room G-01          |
| Mini Board Room | Ground Floor | Admin Block, Room G-02          |
| SDC Hall        | Ground Floor | Student Development Centre      |
| Conference Hall | Second Floor | Main Block, Room S-01           |
| Quantum Theatre | Fifth Floor  | Innovation Block, Room F-01     |

---

## Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT** tokens expire after 7 days
- Service role key is **server-side only** — never exposed to the browser
- All dashboard routes protected by JWT middleware
- Input validation on both frontend and backend
- CORS restricted to the frontend origin

---

## Database Schema

```sql
users    (id, first_name, last_name, staff_id, department,
          college_email, personal_email, phone, password_hash, created_at)

otp      (id, personal_email, otp, expires_at, verified, metadata, created_at)

halls    (id, name, floor, location, description, status)

bookings (id, user_id, hall_id, purpose, date, start_time, end_time,
          participants, requirements, status, created_at)
```

---

## License

This project is built as a college final-year project and is open for academic use.
