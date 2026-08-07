from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.domain.users.schemas import (
    UpdateProfileRequest,
    UpdateSettingsRequest,
    UserProfile,
    UserSettings,
)
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfile)
async def get_me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> UserProfile:
    """Retorna o perfil do usuário autenticado."""
    return await user_service.get_me(db, user_id)


@router.patch("/me", response_model=UserProfile)
async def update_me(
    body: UpdateProfileRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> UserProfile:
    """Atualiza o perfil do usuário."""
    return await user_service.update_me(db, user_id, body)


@router.get("/me/settings", response_model=UserSettings)
async def get_settings(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> UserSettings:
    """Retorna as configurações do usuário."""
    return await user_service.get_settings(db, user_id)


@router.patch("/me/settings", response_model=UserSettings)
async def update_settings(
    body: UpdateSettingsRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> UserSettings:
    """Atualiza as configurações do usuário."""
    return await user_service.update_settings(db, user_id, body)
