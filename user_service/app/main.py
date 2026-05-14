from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.db.database import engine, test_connection
from app.api.v1.router import api_router

app = FastAPI(
    title="GYM User Service",
    docs_url="/docs",
    openapi_url="/openapi.json",
    version="1.0.1",
    root_path="/users"
)

# CORS configuration - Allow frontend (localhost:3000 and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
        "http://127.0.0.1",
        "https://thanhchinh.io.vn",
        "http://thanhchinh.io.vn",
        "https://www.thanhchinh.io.vn",
        "http://www.thanhchinh.io.vn",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    test_connection()
    ensure_user_profile_columns()


def ensure_user_profile_columns():
    statements = [
        "IF COL_LENGTH('users', 'email') IS NULL ALTER TABLE users ADD email VARCHAR(255) NULL",
        "IF COL_LENGTH('users', 'date_of_birth') IS NULL ALTER TABLE users ADD date_of_birth DATE NULL",
        "IF COL_LENGTH('users', 'gender') IS NULL ALTER TABLE users ADD gender VARCHAR(20) NULL",
    ]
    try:
        with engine.begin() as conn:
            for statement in statements:
                conn.execute(text(statement))
    except Exception as exc:
        print("Không thể đảm bảo cột hồ sơ user:", exc)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok"}
