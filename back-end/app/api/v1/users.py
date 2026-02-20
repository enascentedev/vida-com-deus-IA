from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user_id
from app.domain.users.schemas import (
    UpdateProfileRequest,
    UpdateSettingsRequest,
    UserProfile,
    UserSettings,
)

router = APIRouter(prefix="/users", tags=["Users"])

MOCK_PROFILE = UserProfile(
    id="user-mock-001",
    name="Gabriel Santos",
    email="gabriel.santos@vidacomdeus.com",
    avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    membership_since="2023",
    plan="free",
)

MOCK_SETTINGS = UserSettings(
    theme="system",
    ai_insights=True,
    biblical_reminders=True,
    rag_memory=False,
)


@router.get("/me", response_model=UserProfile)
def get_me(user_id: str = Depends(get_current_user_id)) -> UserProfile:
    """Retorna o perfil do usuário autenticado."""
    return MOCK_PROFILE


@router.patch("/me", response_model=UserProfile)
def update_me(
    body: UpdateProfileRequest,
    user_id: str = Depends(get_current_user_id),
) -> UserProfile:
    """Atualiza o perfil do usuário."""
    updated = MOCK_PROFILE.model_copy(update=body.model_dump(exclude_none=True))
    return updated


@router.get("/me/settings", response_model=UserSettings)
def get_settings(user_id: str = Depends(get_current_user_id)) -> UserSettings:
    """Retorna as configurações do usuário."""
    return MOCK_SETTINGS


@router.patch("/me/settings", response_model=UserSettings)
def update_settings(
    body: UpdateSettingsRequest,
    user_id: str = Depends(get_current_user_id),
) -> UserSettings:
    """Atualiza as configurações do usuário."""
    updated = MOCK_SETTINGS.model_copy(update=body.model_dump(exclude_none=True))
    return updated
