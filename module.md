# Module Breakdown — nani2.0

**Project:** Smart queue-based school pickup management system
**Stack:** React + FastAPI + PostgreSQL + Redis + WebSockets

---

## Module Overview

| Module | Name | Owner | Depends On |
|--------|------|-------|------------|
| A | Booking & Queue System | You | Module C (auth, shared models) |
| B | Staff Management System | Teammate | Module C + Module A queue events |
| C | Core Shared System | Both | — (foundational) |

> Start with Module C. Neither A nor B can function without the shared auth, data models, and WebSocket infrastructure it provides.

---

## Module C — Core Shared System (Build First)

Both developers must agree on and implement this together before building A or B.

### 1. Authentication

- JWT-based login
- Roles: `parent`, `teacher`, `assistant`, `branch_admin`, `super_admin`
- Every protected route checks role from the JWT payload

**API Contract (shared):**
```
POST /auth/login         → { access_token, role, user_id }
GET  /auth/me            → { id, name, role, section_id, ... }
```

### 2. School Hierarchy Model

```
Organization
  └── Branch
        └── Class
              └── Section
                    ├── Teacher (1)
                    ├── Assistants (n)
                    ├── Students (n)
                    └── Parents (via students)
```

**Shared tables:** `Organization`, `Branch`, `Class`, `Section`, `User`, `Student`, `Parent`

**API Contract (shared):**
```
GET /section/{id}        → section details + teacher + student list
GET /user/me             → current user profile
```

### 3. Real-Time Infrastructure (WebSockets)

Three shared channels — both modules publish/subscribe:

| Channel | Publisher | Subscribers |
|---------|-----------|-------------|
| `queue:{section_id}` | Module A | Module A frontend, Module B frontend |
| `task:{staff_id}` | Module B | Module B frontend |
| `notification:{user_id}` | Both | Any client |

WebSocket endpoint: `WS /ws/{channel}`

---

## Module A — Booking & Queue System

**Your responsibility.** Parents book pickup slots; the queue engine handles ordering and live updates.

### Frontend Pages

**Parent Dashboard**
- Book a pickup slot (child selector + time picker)
- View current booking status
- See live queue position

**Live Queue Page** *(read-only for parents)*
- Real-time position in queue
- Estimated wait time

### Backend Services

#### 1. Booking Service
```
POST /booking/create        body: { student_id, pickup_time }
POST /booking/cancel        body: { booking_id }
PATCH /booking/{id}/status  body: { status }  ← called by Module B when student is picked up
```

#### 2. Queue Engine *(your core logic)*
- Calculates priority score for each booking
- Inserts entry into queue on booking creation
- Reorders queue when bookings are cancelled or status changes
- Emits update to `queue:{section_id}` WebSocket channel after every mutation

Priority factors to consider:
- Booking time (earlier = higher priority)
- Parent proximity (location bonus if within safe zone)
- Penalties for late arrivals or no-shows

#### 3. Location Processor
- Validates whether parent location is within the school's safe zone
- Calculates distance from school gate
- Applies bonuses/penalties to queue priority score

```
POST /location/update       body: { booking_id, lat, lng }
```

### Database Tables (Module A owns these)

| Table | Key Fields |
|-------|-----------|
| `Booking` | id, student_id, parent_id, pickup_time, status, priority_score |
| `QueueEntry` | id, booking_id, section_id, position, entered_at |

> `Student` and `Parent` tables are shared — defined in Module C. Do not duplicate them.

### Redis Usage (recommended)

- Cache current queue order per section: `queue:section:{id}` (sorted set by priority)
- Reduces DB reads on every WebSocket update
- Invalidate on any booking mutation

### Integration Points with Module B

Module B **reads** your queue via:
```
GET /queue/{section_id}     → ordered list of QueueEntry with student info
```

Module B **writes back** to your booking via:
```
PATCH /booking/{id}/status  { status: "picked_up" | "no_show" }
```

Agree on the exact response shape of `GET /queue/{section_id}` with your teammate before building either dashboard.

### Deliverables Checklist

- [ ] Parent can create and cancel bookings
- [ ] Queue is generated and ordered on booking creation
- [ ] Queue reorders correctly on cancellation/no-show
- [ ] `GET /queue/{section_id}` returns correct ordered list
- [ ] WebSocket emits queue update on every change
- [ ] Location-based priority bonus/penalty applied
- [ ] Redis caching for queue reads (optional but recommended)

---

## Module B — Staff Management System

**Teammate's responsibility.** Teachers and assistants manage student preparation and execute pickups.

### Frontend Pages

**Teacher Dashboard**
- View live queue for their section (reads Module A's WebSocket)
- Call next student (triggers task creation)

**Assistant Dashboard**
- View assigned tasks (student preparation)
- Mark student as ready at gate

**Pickup Control Panel**
- Confirm student handover to parent
- Log no-shows or incorrect bookings

### Backend Services

#### 1. Task Engine
```
POST /task/create           body: { student_id, staff_id, type }
GET  /tasks/{staff_id}      → list of pending tasks
POST /task/complete         body: { task_id }
```

Tasks are created when a teacher advances the queue (calls next student). Each task is assigned to an assistant.

#### 2. Attendance / Pickup Service
```
POST /student/picked        body: { booking_id, staff_id }  → notifies Module A
POST /student/no-show       body: { booking_id }            → notifies Module A
```

These endpoints must call `PATCH /booking/{id}/status` from Module A after recording the event.

#### 3. Staff Workflow Engine
- Teacher marks "send to gate" → assistant gets a task → assistant confirms ready → teacher confirms handover
- Each step emits to the relevant WebSocket channel

### Database Tables (Module B owns these)

| Table | Key Fields |
|-------|-----------|
| `Task` | id, student_id, assigned_to, type, status, created_at |
| `AttendanceLog` | id, student_id, booking_id, outcome, timestamp |

> `Staff` user records live in the shared `User` table (Module C). Do not duplicate.

### Integration Points with Module A

Module B **reads** from Module A:
- `GET /queue/{section_id}` — to display current queue on teacher dashboard
- `WS /ws/queue:{section_id}` — live updates without polling

Module B **writes** to Module A:
- `PATCH /booking/{id}/status` — after pickup confirmation or no-show

### Deliverables Checklist

- [ ] Teacher can view live queue (via Module A API + WebSocket)
- [ ] Teacher can trigger "send to gate" for next student
- [ ] Task is created and assigned to assistant
- [ ] Assistant marks student as ready
- [ ] Pickup confirmation updates booking status in Module A
- [ ] No-show is logged and queue is updated

---

## Cross-Module Checklist (Do Together)

Before each developer starts their module, agree on:

- [ ] Shared table schemas (Student, Parent, User, Section)
- [ ] JWT payload structure (what fields are in the token)
- [ ] Shape of `GET /queue/{section_id}` response
- [ ] WebSocket channel naming convention
- [ ] How `PATCH /booking/{id}/status` is authenticated (staff-only)
- [ ] Error response format (e.g., `{ detail: "..." }` FastAPI default vs custom)
