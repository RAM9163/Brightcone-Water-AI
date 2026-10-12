from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.dashboard_api import router as dashboard_router


app = FastAPI(
    title="Brightcone Water Distribution AI",
    description=(
        "Agentic AI Water Distribution Leak Detection "
        "& Resource Optimization System"
    ),
    version="1.0.0"
)

# Allow React frontend to communicate with FastAPI
frontend_url = os.getenv("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://brightcone-water-ai-six.vercel.app",
]

if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(dashboard_router)


@app.get("/")
def root():

    return {
        "message": "Brightcone Water AI Backend is running",
        "status": "success"
    }


@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }