# app/db/database.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from .env file
load_dotenv()

# Cấu hình kết nối đến SQL Server
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

# Khởi tạo engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Hàm kiểm tra kết nối đến SQL Server
def test_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Kết nối SQL Server thành công!")
    except Exception as e:
        print("Lỗi kết nối DB:", e)

# Hàm dùng để lấy Session cho mỗi lần gọi API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
