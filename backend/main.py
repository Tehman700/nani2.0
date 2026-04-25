from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, section, ws, booking, queue, location
import app.models  # noqa: F401 — registers all models with Base

app = FastAPI(title="nani2.0 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(section.router)
app.include_router(ws.router)
app.include_router(booking.router)
app.include_router(queue.router)
app.include_router(location.router)


@app.get("/health")
def health():
    return {"status": "ok"}
