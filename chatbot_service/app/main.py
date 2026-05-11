from fastapi import FastAPI
from app.api.v1 import chat

app = FastAPI(
    title="GYM Chatbot Service",
    docs_url="/docs",
    openapi_url="/openapi.json",
    version="1.0.0",
    root_path="/chatbot"
)

# Đăng ký router
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chatbot AI"])

@app.get("/")
def root():
    return {"message": "Chatbot Service is running!"}