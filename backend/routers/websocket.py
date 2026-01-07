from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import List, Dict

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/status/")
async def websocket_endpoint(websocket: WebSocket, user_id: str = Query(...)):
    await manager.connect(websocket, user_id)
    try:
        # Send a welcome message or initial status
        await manager.send_personal_message(
            {
                "type": "notification", 
                "payload": {"message": "Connected to Mock Notification Service"}
            }, 
            user_id
        )
        while True:
            # Keep connection open and listen for messages (ack or ping)
            data = await websocket.receive_text()
            # Echo back or handle commands if needed
            # For now just keep alive
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"WS Error: {e}")
        manager.disconnect(user_id)
