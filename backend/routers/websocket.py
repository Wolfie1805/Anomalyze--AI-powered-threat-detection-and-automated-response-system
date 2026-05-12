from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import List, Dict, Any
import json
from jose import jwt, JWTError
from backend.config import settings

router = APIRouter(tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, token: str):
        # Validate JWT token
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            username: str = payload.get("sub")
            if not username:
                await websocket.close(code=1008)
                return False
        except JWTError:
            await websocket.close(code=1008)
            return False
            
        await websocket.accept()
        self.active_connections.append(websocket)
        return True

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message_type: str, data: Dict[str, Any]):
        message = json.dumps({"type": message_type, "data": data})
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
                
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    is_connected = await manager.connect(websocket, token)
    if not is_connected:
        return
        
    try:
        while True:
            data = await websocket.receive_text()
            # In a real app we might handle incoming WS messages.
            # For now we just keep the connection open.
    except WebSocketDisconnect:
        manager.disconnect(websocket)
