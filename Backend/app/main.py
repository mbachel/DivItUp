from fastapi import FastAPI
from .routers import router
from .dependencies.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(router)