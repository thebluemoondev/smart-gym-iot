from fastapi import APIRouter
from app.api.v1 import workout

api_router = APIRouter()

api_router.include_router(workout.router, prefix="/workout")