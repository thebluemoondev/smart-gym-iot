# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1 import payment

api_router = APIRouter()

api_router.include_router(payment.router, prefix="/payment")