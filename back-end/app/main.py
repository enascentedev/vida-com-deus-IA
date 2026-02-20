from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import v1_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API do aplicativo Vida com Deus — devocionais, chat bíblico com IA e biblioteca pessoal.",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router)


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    return {"status": "ok", "version": settings.app_version}
