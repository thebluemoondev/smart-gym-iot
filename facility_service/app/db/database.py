from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Khởi tạo engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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