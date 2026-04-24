from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError, jwt
from app.core.config import settings
from app.core.ws_manager import manager

ALGORITHM = "HS256"
VALID_CHANNEL_PREFIXES = ("queue:", "task:", "notification:")

router = APIRouter(tags=["websocket"])


def _decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


@router.websocket("/ws/{channel}")
async def websocket_endpoint(
    websocket: WebSocket,
    channel: str,
    token: str = Query(..., description="JWT access token"),
):
    # Reject unknown channel patterns before accepting the connection
    if not any(channel.startswith(prefix) for prefix in VALID_CHANNEL_PREFIXES):
        await websocket.close(code=4400)
        return

    # Reject invalid / expired tokens
    payload = _decode_token(token)
    if not payload:
        await websocket.close(code=4001)
        return

    await manager.connect(channel, websocket)
    try:
        while True:
            # Keep connection alive; clients may send pings as plain text
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(channel, websocket)
