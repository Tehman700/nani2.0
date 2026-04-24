What was built

backend/
├── app/
│   ├── core/
│   │   ├── config.py       ← pydantic-settings (reads .env)
│   │   └── database.py     ← SQLAlchemy engine, SessionLocal, Base, get_db()
│   └── models/
│       ├── enums.py        ← UserRole enum
│       ├── organization.py
│       ├── branch.py       ← has lat/lng + safe_zone_radius
│       ├── class_.py
│       ├── section.py
│       ├── user.py         ← email index, role enum, optional section_id
│       ├── parent.py       ← 1:1 with User, 1:many with Student
│       ├── student.py      ← belongs to Section and Parent
│       └── __init__.py     ← imports all models in correct order
├── alembic/
│   ├── env.py              ← reads DATABASE_URL from .env, knows all models
│   └── versions/
├── alembic.ini
├── main.py                 ← FastAPI app + /health endpoint
├── requirements.txt
└── .env.example
To get running
1. Copy env file and fill in your DB credentials:


cd backend
cp .env.example .env
# edit .env with your postgres credentials
2. Install dependencies:


pip install -r requirements.txt
3. Generate and run the first migration:


alembic revision --autogenerate -m "init shared schema"
alembic upgrade head
4. Start the server:


uvicorn main:app --reload
5. Verify at http://localhost:8000/health — should return {"status": "ok"}

Phase 2 (Auth endpoints) can start as soon as Postgres is up and alembic upgrade head runs clean.