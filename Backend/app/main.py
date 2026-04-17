from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import index as indexRoute
from .models import model_loader


app = FastAPI()

DEFAULT_CORS_ORIGINS = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "https://localhost",
    "https://localhost:3000",
    "https://127.0.0.1",
    "https://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=DEFAULT_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

model_loader.index()
indexRoute.load_routes(app)
