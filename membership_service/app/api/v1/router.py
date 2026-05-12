from fastapi import APIRouter
from app.api.v1 import package, subscription, product

api_router = APIRouter()

api_router.include_router(
    package.router,
    prefix="/packages"
)

api_router.include_router(
    subscription.router,
    prefix="/subscriptions"
)

api_router.include_router(
    product.router,
    prefix="/products"
)