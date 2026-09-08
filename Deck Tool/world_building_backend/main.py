from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from custom_exceptions import register_custom_handlers
from database import db_manager
from routes.decks import deck_api_router
from routes.users import user_api_router


@asynccontextmanager
async def lifetime(app_inst: FastAPI):
    await db_manager.connect()
    db_manager.db["decks"].create_index("deck_id", unique=True)
    db_manager.db["users"].create_index("user_id", unique=True)
    db_manager.db["users"].create_index("username", unique=True)
    yield
    await db_manager.close()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:8000",
]


app = FastAPI(lifetime=lifetime)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(deck_api_router)
app.include_router(user_api_router)
register_custom_handlers(app)