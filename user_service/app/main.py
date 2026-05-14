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
    ensure_rfid_access_log_table()


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


def ensure_rfid_access_log_table():
    statements = [
        """
        IF OBJECT_ID('rfid_access_logs', 'U') IS NULL
        CREATE TABLE rfid_access_logs (
            id INT IDENTITY(1,1) PRIMARY KEY,
            card_uid VARCHAR(50) NOT NULL,
            user_id INT NULL,
            access_granted BIT NOT NULL DEFAULT 0,
            reason NVARCHAR(255) NULL,
            checked_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
        )
        """,
        """
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_rfid_access_logs_user_id')
        CREATE INDEX IX_rfid_access_logs_user_id ON rfid_access_logs(user_id)
        """,
        """
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_rfid_access_logs_checked_at')
        CREATE INDEX IX_rfid_access_logs_checked_at ON rfid_access_logs(checked_at)
        """,
    ]
    try:
        with engine.begin() as conn:
            for statement in statements:
                conn.execute(text(statement))
    except Exception as exc:
        print("Không thể đảm bảo bảng lịch sử quẹt thẻ:", exc)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok"}
