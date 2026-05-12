# app/main.py
from fastapi import FastAPI
from app.db.database import test_connection
from app.api.v1.router import api_router

app = FastAPI(
    title="Payment Service",
    description="API thanh toán - Momo, ZaloPay, QR Ngân hàng",
    version="1.0.0"
)

@app.on_event("startup")
def startup():
    test_connection()

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Payment Service API"}

@app.get("/health")
def health():
    return {"status": "ok"}