How to test
Start the server:


uvicorn main:app --reload
Option 1 — Swagger UI (easiest)
Open http://localhost:8000/docs and test all 3 endpoints interactively.

Option 2 — curl / Postman
Register a user:


curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Ali Hassan", "email": "ali@test.com", "password": "secret123", "role": "parent"}'
Expected: { "access_token": "...", "token_type": "bearer", "role": "parent", "user_id": "..." }

Login:


curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ali@test.com", "password": "secret123"}'
Get current user (copy the token from above):


curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer <token_here>"
What to verify
Test	Expected
Register with same email twice	409 Email already registered
Login with wrong password	401 Invalid email or password
/auth/me with no token	401 Not authenticated
/auth/me with valid token	Returns user id, name, role, section_id
Once all 4 pass — Phase 2 is done and you're ready for Phase 3 (WebSocket infrastructure).