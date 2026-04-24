This is changed by dada


🔵 Module A — Booking & Queue System (YOU)
🟣 Module B — Staff Management System (TEAMMATE)
⚪ Module C — Core Shared System (BOTH)
🔵 MODULE A: Booking & Queue System (YOU)
🎯 Goal

Handle parent booking → queue generation → live ordering

🧩 Pages (Frontend – React)
Parent Dashboard
Book pickup time
View status
Live Queue Page
Real-time queue position
Estimated waiting time
⚙️ Backend (FastAPI)
1. Booking Service
Create booking
Cancel booking
Update booking status
2. Queue Engine (CORE LOGIC)
Priority calculation
Insert into queue
Reorder queue
3. Location Processor
Safe zone validation
Distance calculation
Apply penalties/bonuses
🗄️ Database Tables
Booking
QueueEntry
Student
Parent
⚡ Key APIs
POST /booking/create
POST /booking/cancel
GET  /queue/{section_id}
POST /location/update
🔥 YOUR DELIVERABLE
Working queue system
Live ordering logic
Redis integration (optional but strong)
WebSocket updates for queue
🟣 MODULE B: Staff Management System (YOUR TEAMMATE)
🎯 Goal

Handle teacher/assistant workflow + student pickup execution

🧩 Pages (React)
Teacher Dashboard
Current queue view
Next student call
Assistant Dashboard
Task list
Student preparation status
Pickup Control Panel
Mark student as handed over
Resolve issues
⚙️ Backend (FastAPI)
1. Task Engine
Create tasks from queue events
Assign tasks to staff
Track task status
2. Attendance / Pickup Service
Mark student picked
Mark no-show
Handle wrong booking
3. Staff Workflow Engine
Teacher action triggers next queue step
🗄️ Database Tables
Staff
Task
AttendanceLog
⚡ Key APIs
GET  /tasks/{staff_id}
POST /task/complete
POST /student/picked
POST /student/no-show
🔥 THEIR DELIVERABLE
Staff dashboard working
Task assignment system
Teacher controls queue flow
⚪ MODULE C: CORE SHARED SYSTEM (BOTH OF YOU)

This is the MOST IMPORTANT part.

🔐 1. Authentication System
JWT login
Role-based access:
Parent
Teacher
Assistant
🏫 2. School Structure Model

Hierarchy:

Organization
  └── Branch
        └── Class
              └── Section
                    ├── Teacher
                    ├── Assistant
                    ├── Students
                    └── Parents
📡 3. Real-Time System
WebSockets for:
Queue updates
Task updates
Notifications
🧾 4. Shared API Contracts (CRITICAL)

You BOTH must agree on:

GET  /auth/login
GET  /user/me
GET  /section/{id}