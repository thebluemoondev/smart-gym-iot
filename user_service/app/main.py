from fastapi import FastAPI
from app.db.database import test_connection
from app.api.v1.router import api_router

app = FastAPI(
    title="GYM User Service",
    docs_url="/docs",
    openapi_url="/openapi.json",
    version="1.0.1",
    root_path="/users"
)

@app.on_event("startup")
def startup():
    test_connection()

app.include_router(api_router, prefix="/api/v1")
