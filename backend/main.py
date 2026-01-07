from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, farmer, expert, common, websocket

app = FastAPI(title="AgroTech Mock Backend")

# Helper to write to local storage (optional, simple in-memory for now)

# CORS Setup
origins = [
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*" # Open for dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(farmer.router, prefix="/api/v1")
app.include_router(expert.router, prefix="/api/v1")
app.include_router(common.router, prefix="/api/v1")
app.include_router(websocket.router)

@app.get("/")
async def root():
    return {"message": "Welcome to AgroTech Mock Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
