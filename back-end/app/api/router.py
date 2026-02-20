from fastapi import APIRouter

from app.api.v1 import admin, auth, chat, library, posts, users

v1_router = APIRouter(prefix="/v1")

v1_router.include_router(auth.router)
v1_router.include_router(users.router)
v1_router.include_router(posts.router)
v1_router.include_router(library.router)
v1_router.include_router(chat.router)
v1_router.include_router(admin.router)
