# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1 import user, rfid

api_router = APIRouter()

api_router.include_router(user.router, prefix="/user")
api_router.include_router(rfid.router)