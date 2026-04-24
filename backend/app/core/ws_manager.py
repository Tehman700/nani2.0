from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._channels: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, channel: str, websocket: WebSocket):
        await websocket.accept()
        self._channels[channel].append(websocket)

    def disconnect(self, channel: str, websocket: WebSocket):
        connections = self._channels.get(channel, [])
        if websocket in connections:
            connections.remove(websocket)
        if not connections:
            self._channels.pop(channel, None)

    async def broadcast(self, channel: str, data: dict):
        """Send data to every client subscribed to channel. Dead connections are pruned."""
        connections = list(self._channels.get(channel, []))
        dead = []
        for ws in connections:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(channel, ws)

    def subscriber_count(self, channel: str) -> int:
        return len(self._channels.get(channel, []))


# Single shared instance — import this everywhere you need to broadcast
manager = ConnectionManager()
