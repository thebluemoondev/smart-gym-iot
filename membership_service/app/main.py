from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import test_connection
from app.api.v1.router import api_router

# Import all models
from app.models import package, subscription, product

app = FastAPI(
    title="GYM Membership Service",
    docs_url="/docs",
    openapi_url="/openapi.json",
    version="1.0.0",
    root_path="/membership"
)

# CORS configuration - Allow frontend (localhost:3000 and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
        "http://127.0.0.1",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    test_connection()

app.include_router(api_router, prefix="/api/v1")