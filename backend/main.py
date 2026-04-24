from fastapi import FastAPI
import app.models  # noqa: F401 — registers all models with Base

app = FastAPI(title="nani2.0 API")


@app.get("/health")
def health():
    return {"status": "ok"}
