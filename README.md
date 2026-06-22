# NANI 2.0 — Smart School Pickup System

A full-stack web application that manages the school pickup queue for students. Parents book pickup slots, teachers see their live queue, and admins have full system oversight. Built as a database-focused project to demonstrate relational schema design, normalized data, and real-time data flow.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + Vite | React 18, Vite 5 |
| Styling | Tailwind CSS | v3 |
| Routing | React Router DOM | v6 |
| Backend | FastAPI (Python) | 0.115+ |
| ORM | SQLAlchemy | v2 |
| Migrations | Alembic | v1.13 |
| Database | MySQL | 8.0 |
| Auth | JWT (python-jose) | HS256 |
| Password Hashing | passlib + bcrypt | — |
| Real-time | WebSockets (built into FastAPI) | — |
| Queue Cache | Redis | — |
| HTTP Client | fetch (browser native) | — |

---

## Architecture Overview

```
Browser (React SPA)
    │
    ├── HTTP REST  →  FastAPI Backend  →  SQLAlchemy ORM  →  MySQL Database
    │
    └── WebSocket  →  FastAPI WS endpoint  →  Redis pub/sub  →  live queue updates
```

The backend is a single FastAPI app (`backend/main.py`). The frontend is a React SPA that talks to it via `http://localhost:8000`. Authentication is JWT — the token is stored in `localStorage` and sent as `Authorization: Bearer <token>` on every request.

---

## Prerequisites (for any machine)

1. **Python 3.11+** — https://www.python.org/downloads/ (check "Add to PATH")
2. **Node.js LTS** — https://nodejs.org/
3. **MySQL 8.0** — https://dev.mysql.com/downloads/mysql/ + MySQL Workbench
4. **Redis** — `winget install Redis.Redis` (Windows) — needed for live queue feature

---

## Setup & Run (Windows)

### First time only
```
1. Clone or extract the project folder
2. Double-click  setup.bat
3. Follow the prompts — it will:
   - Create a Python virtual environment
   - Install all Python packages
   - Ask you to edit backend/.env with your MySQL password
   - Create all database tables via Alembic
   - Install frontend npm packages
```

### Every subsequent run
```
Double-click  start.bat
```

This opens two terminal windows (backend + frontend) and the app is live at:
- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:8000
- **Auto-generated API docs** → http://localhost:8000/docs

### Viewing the database in MySQL Workbench
```
Host:     localhost
Port:     3306
Username: root
Password: (whatever you set in .env)
Database: nani2
```
All 9 tables will be visible with data after registering users and creating bookings.

---

## Environment Variables (`backend/.env`)

| Variable | Example | Description |
|---|---|---|
| `DATABASE_URL` | `mysql+pymysql://root:pass@localhost:3306/nani2` | Full MySQL connection string |
| `SECRET_KEY` | `abc123...` (32+ chars) | Signs JWT tokens — keep secret |
| `REDIS_URL` | `redis://localhost:6379` | Redis for WebSocket pub/sub |
| `ADMIN_EMAIL` | `admin@gmail.com` | Auto-created admin account |
| `ADMIN_PASSWORD` | `qwerty123` | Auto-created admin password |

---

## Database Schema

### Entity-Relationship Summary

```
Organization ──< Branch ──< Class ──< Section ──<─── Student ──< Booking ──1:1── QueueEntry
                                          │                │
                                      User (teacher)   Parent (via parent_id)
                                          │
                                      User ──1:1── Parent
```

### Tables

#### `organizations`
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(36) | PK, UUID |
| name | VARCHAR(255) | NOT NULL |

#### `branches`
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(36) | PK, UUID |
| org_id | VARCHAR(36) | FK → organizations.id, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| location_lat | FLOAT | nullable |
| location_lng | FLOAT | nullable |
| safe_zone_radius | FLOAT | nullable (meters) |

#### `classes`
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(36) | PK, UUID |
| branch_id | VARCHAR(36) | FK → branches.id, NOT NULL |
| name | VARCHAR(255) | NOT NULL |

#### `sections`
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(36) | PK, UUID |
| class_id | VARCHAR(36) | FK → classes.id, NOT NULL |
| name | VARCHAR(255) | NOT NULL |

#### `users`
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(36) | PK, UUID |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL, indexed |
| hashed_password | VARCHAR(255) | NOT NULL |
| role | ENUM | parent / teacher / branch_admin / super_admin |
| section_id | VARCHAR(36) | FK → sections.id, nullable |
| cnic | VARCHAR(20) | nullable, indexed |

Role notes:
- `teacher` role stores their CNIC here — used to match students to teachers
- `section_id` is set for teachers to assign them to a class section

#### `parents`
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(36) | PK, UUID |
| user_id | VARCHAR(36) | FK → users.id, UNIQUE (1-to-1 with users) |
| phone | VARCHAR(20) | nullable |

This is a profile extension of `users`. Every user with role=parent gets a corresponding row here.

#### `students`
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(36) | PK, UUID |
| name | VARCHAR(255) | NOT NULL |
| roll_number | VARCHAR(50) | nullable |
| photo_url | LONGTEXT | nullable — stores base64-encoded image directly |
| qr_hash | VARCHAR(64) | UNIQUE, indexed — SHA-256 hash for QR code scanning |
| class_name | VARCHAR(100) | nullable — **denormalized text copy** |
| section_name | VARCHAR(100) | nullable — **denormalized text copy** |
| teacher_name | VARCHAR(255) | nullable — **denormalized text copy** |
| teacher_cnic | VARCHAR(20) | nullable, indexed — used to join with users.cnic |
| section_id | VARCHAR(36) | FK → sections.id, nullable |
| parent_id | VARCHAR(36) | FK → parents.id, nullable |

**Denormalization note:** `class_name`, `section_name`, `teacher_name` are free-text copies of data that also exists in the relational hierarchy. This was intentional — when a parent registers a child they type in the teacher's CNIC and class/section as plain text, without needing to navigate a dropdown. The system resolves the actual teacher by matching `student.teacher_cnic == users.cnic` at query time. The proper normalized FK (`section_id`) is also stored when the link can be resolved.

#### `bookings`
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(36) | PK, UUID |
| student_id | VARCHAR(36) | FK → students.id, NOT NULL |
| parent_id | VARCHAR(36) | FK → parents.id, NOT NULL |
| pickup_time | DATETIME | NOT NULL |
| status | ENUM | pending / confirmed / picked_up / cancelled / no_show |
| priority_score | FLOAT | NOT NULL, default 0.0 — computed at creation |
| created_at | DATETIME | NOT NULL, auto-set to UTC now |

#### `queue_entries`
| Column | Type | Constraints |
|---|---|---|
| id | VARCHAR(36) | PK, UUID |
| booking_id | VARCHAR(36) | FK → bookings.id, UNIQUE (1-to-1 with bookings) |
| section_id | VARCHAR(36) | FK → sections.id, NOT NULL |
| position | INT | NOT NULL — queue order (1 = next to be picked up) |
| entered_at | DATETIME | NOT NULL, auto-set to UTC now |

### All Foreign Key Relationships

| Child Table.Column | References |
|---|---|
| branches.org_id | organizations.id |
| classes.branch_id | branches.id |
| sections.class_id | classes.id |
| users.section_id | sections.id |
| parents.user_id | users.id |
| students.section_id | sections.id |
| students.parent_id | parents.id |
| bookings.student_id | students.id |
| bookings.parent_id | parents.id |
| queue_entries.booking_id | bookings.id |
| queue_entries.section_id | sections.id |

### Normalization Analysis

- **1NF ✅** — All columns atomic, single PK per table, no repeating groups
- **2NF ✅** — All PKs are single columns so partial dependency cannot exist
- **3NF ⚠️ Partial** — `students.teacher_name` transitively depends on `students.teacher_cnic → users.name`, and `class_name`/`section_name` duplicate data reachable via `section_id`. This is an intentional design tradeoff for UX simplicity.

---

## API Reference

Base URL: `http://localhost:8000`

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register as parent or teacher |
| POST | `/login` | No | Login, returns JWT token |
| GET | `/me` | Yes | Get current user profile |
| POST | `/admin-login` | No | Admin-specific login |

### Students
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/student/add` | Parent | Add a child to your account |
| GET | `/student/my-kids` | Parent | List your children |
| PUT | `/student/{id}` | Parent | Update child info |
| DELETE | `/student/{id}` | Parent | Remove a child |
| POST | `/student/{id}/regenerate-qr` | Parent | Generate new QR hash |
| GET | `/student/teacher-view` | Teacher | List students matched to your CNIC |

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/booking/create` | Parent | Book a pickup slot |
| POST | `/booking/cancel` | Parent | Cancel a booking |
| PATCH | `/booking/{id}/status` | Teacher | Update booking status |

### Queue
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/queue/{section_id}` | Yes | Get current queue for a section |
| GET | `/teacher/today-queue` | Teacher | Get today's queue for teacher's section |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | System-wide counts |
| GET | `/admin/teacher-tree` | Admin | Teachers with their linked students |
| GET | `/admin/users` | Admin | All users |
| PUT | `/admin/users/{id}` | Admin | Edit a user |
| DELETE | `/admin/users/{id}` | Admin | Delete a user |
| GET | `/admin/students` | Admin | All students |
| DELETE | `/admin/students/{id}` | Admin | Delete a student |
| GET | `/admin/bookings` | Admin | All bookings |
| PATCH | `/admin/bookings/{id}/status` | Admin | Change booking status |
| DELETE | `/admin/bookings/{id}` | Admin | Delete a booking |

### WebSocket
| Endpoint | Description |
|---|---|
| `ws://localhost:8000/ws/queue:{section_id}?token=JWT` | Live queue updates for a section |
| `ws://localhost:8000/ws/teacher:{cnic}?token=JWT` | Live queue updates for a teacher |

---

## Frontend Pages

| Route | File | Role | Description |
|---|---|---|---|
| `/` | LoginPage.jsx | Public | Email + password login |
| `/register` | RegisterPage.jsx | Public | Register as parent or teacher |
| `/dashboard` | DashboardPage.jsx | Parent | Book pickup, view live queue |
| `/queue/:sectionId` | QueuePage.jsx | Parent | Full queue view with live updates |
| `/kids` | ParentKidsPage.jsx | Parent | Add/edit/delete children, view QR codes |
| `/teacher` | TeacherStudentsPage.jsx | Teacher | List of students matched by CNIC |
| `/teacher-queue` | TeacherQueuePage.jsx | Teacher | Today's pickup queue, live |
| `/admin-login` | AdminLoginPage.jsx | Public | Admin-only login page |
| `/admin` | AdminDashboard.jsx | Admin | Full system stats, users, students, bookings |

---

## Authentication Flow

1. User POSTs to `/login` or `/register` with email + password
2. Backend returns `{ access_token, role, user_id, cnic }`
3. Frontend stores all values in `localStorage`
4. Every subsequent API request sends `Authorization: Bearer <token>`
5. Backend decodes JWT (HS256, `SECRET_KEY`) to get `user_id` and `role`
6. Role-based route guards in React (`PrivateRoute`, `AdminRoute` in `App.jsx`)

---

## How the Queue Works

1. Parent books a pickup via `POST /booking/create`
2. Backend creates a `Booking` row and a `QueueEntry` row (with calculated `position` and `priority_score`)
3. Backend broadcasts the update to the section's WebSocket channel via Redis pub/sub
4. All connected clients (parents and teachers viewing that section) receive the update instantly
5. Teacher updates booking status (`confirmed` → `picked_up`) via `PATCH /booking/{id}/status`
6. Status change is broadcast via WebSocket to all clients

---

## File Structure

```
nani2.0/
├── setup.bat                   ← First-time setup script (run once)
├── start.bat                   ← Run the app (run every time)
├── README.md                   ← This file
│
├── backend/
│   ├── main.py                 ← FastAPI app entry point, router registration, CORS
│   ├── requirements.txt        ← Python dependencies
│   ├── .env                    ← Your config (not in Git)
│   ├── .env.example            ← Config template (in Git)
│   ├── alembic.ini             ← Alembic migration config
│   ├── alembic/
│   │   ├── env.py              ← Alembic env, imports all models
│   │   └── versions/           ← Migration scripts (auto-generated)
│   └── app/
│       ├── core/
│       │   ├── config.py       ← Pydantic settings (reads .env)
│       │   ├── database.py     ← SQLAlchemy engine + session + Base
│       │   ├── security.py     ← JWT creation/verification, password hashing
│       │   ├── redis_client.py ← Redis connection instance
│       │   └── ws_manager.py   ← WebSocket connection manager
│       ├── models/
│       │   ├── enums.py        ← UserRole enum
│       │   ├── organization.py ← Organization model
│       │   ├── branch.py       ← Branch model
│       │   ├── class_.py       ← Class model
│       │   ├── section.py      ← Section model
│       │   ├── user.py         ← User model (all roles)
│       │   ├── parent.py       ← Parent profile model (extends User)
│       │   ├── student.py      ← Student model
│       │   ├── booking.py      ← Booking model + BookingStatus enum
│       │   └── queue_entry.py  ← QueueEntry model
│       ├── routers/
│       │   ├── auth.py         ← /register, /login, /me
│       │   ├── student.py      ← /student/* endpoints
│       │   ├── booking.py      ← /booking/* endpoints
│       │   ├── queue.py        ← /queue/{section_id}
│       │   ├── teacher.py      ← /teacher/today-queue
│       │   ├── section.py      ← /section/{section_id}
│       │   ├── location.py     ← /update (GPS location update)
│       │   ├── ws.py           ← WebSocket endpoint /ws/{channel}
│       │   └── admin.py        ← /admin-login, /admin/* endpoints
│       ├── schemas/            ← Pydantic request/response models
│       └── services/
│           └── queue_engine.py ← Priority score calculation, queue ordering
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js      ← Design tokens (colors, fonts, border-radius)
    ├── index.html              ← Root HTML, Google Fonts link
    └── src/
        ├── main.jsx            ← React entry point
        ├── App.jsx             ← Router, PrivateRoute, AdminRoute guards
        ├── index.css           ← Global styles, utility classes (.field, .btn-primary, .stagger)
        ├── api/
        │   └── client.js       ← fetch wrapper (api.get/post/put/patch/delete) + auth helpers
        ├── hooks/
        │   ├── useQueue.js     ← WebSocket hook for parent queue (queue:{sectionId})
        │   └── useTeacherQueue.js ← WebSocket hook for teacher queue (teacher:{cnic})
        ├── components/
        │   └── StatusChip.jsx  ← Booking status badge (pending/confirmed/picked_up/etc.)
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx
            ├── QueuePage.jsx
            ├── ParentKidsPage.jsx
            ├── TeacherStudentsPage.jsx
            ├── TeacherQueuePage.jsx
            ├── AdminLoginPage.jsx
            └── AdminDashboard.jsx
```

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| UUID strings as PKs (VARCHAR 36) | Avoids sequential ID guessing, works across distributed inserts |
| `parents` as separate table from `users` | 1NF extension pattern — keeps user table clean, parent-specific data isolated |
| `teacher_cnic` on students instead of FK | Parents don't know a teacher's system ID — CNIC is their real-world identifier. Tradeoff: denormalized but UX-friendly |
| `photo_url` stored as LONGTEXT (base64) | No file server needed. Tradeoff: DB row size grows significantly with photos |
| `priority_score` stored on booking | Avoids recomputing on every queue read. Must be recalculated when bookings change |
| `queue_entries.position` stored as INT | Same reason as priority_score — read performance over write complexity |
| Redis for WebSocket | FastAPI runs in a single process; Redis pub/sub lets multiple WS connections get the same broadcast |
| JWT in localStorage | Simpler than httpOnly cookies for a student project. Not recommended for production. |

---

## Default Admin Account

On first run, the backend automatically creates an admin user using values from `.env`:

```
Email:    admin@gmail.com   (set via ADMIN_EMAIL)
Password: qwerty123         (set via ADMIN_PASSWORD)
Role:     super_admin
```

Login at: http://localhost:5173/admin-login

---

## Common Issues

| Problem | Fix |
|---|---|
| `alembic upgrade head` fails | Check `DATABASE_URL` in `.env`, make sure MySQL is running, make sure `nani2` database exists |
| Frontend shows blank page | Check browser console — usually a CORS error meaning backend isn't running |
| Queue not updating live | Redis isn't running. Run `redis-server` in a terminal or `winget install Redis.Redis` |
| "No students found" for teacher | Make sure the teacher's CNIC in their profile matches exactly what the parent entered when adding the child |
| Photos not showing | Base64 images can be large — make sure MySQL's `max_allowed_packet` is at least 16MB |
