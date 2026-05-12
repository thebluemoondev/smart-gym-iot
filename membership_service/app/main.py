from fastapi import FastAPI
from app.db.database import test_connection
from app.api.v1.router import api_router

# Import all models
from app.models import package, subscription, product

app = FastAPI(
    title="GYM Membership Service",
    docs_url="/docs",
    openapi_url="/openapi.json",
    version="1.0.0",
    root_path="/membership"
)

@app.on_event("startup")
def startup():
    test_connection()

app.include_router(api_router, prefix="/api/v1")