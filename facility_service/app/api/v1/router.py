from fastapi import APIRouter
from app.api.v1 import facility

api_router = APIRouter()
api_router.include_router(facility.router, prefix="/facility")