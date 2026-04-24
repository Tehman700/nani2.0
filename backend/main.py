from fastapi import FastAPI
from app.routers import auth, section, ws
import app.models  # noqa: F401 — registers all models with Base

app = FastAPI(title="nani2.0 API")

app.include_router(auth.router)
app.include_router(section.router)
app.include_router(ws.router)


@app.get("/health")
def health():
    return {"status": "ok"}
