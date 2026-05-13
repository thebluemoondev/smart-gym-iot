from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import chat

app = FastAPI(
    title="GYM Chatbot Service",
    docs_url="/docs",
    openapi_url="/openapi.json",
    version="1.0.0",
    root_path="/chatbot"
)

# CORS configuration - Allow frontend (localhost:3000 and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
        "http://127.0.0.1",
        "https://thanhchinh.io.vn",
        "http://thanhchinh.io.vn",
        "https://www.thanhchinh.io.vn",
        "http://www.thanhchinh.io.vn",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Đăng ký router
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chatbot AI"])

@app.get("/")
def root():
    return {"message": "Chatbot Service is running!"}
