from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user_id
from app.core.storage import read_json, write_json
from app.domain.users.schemas import (
    UpdateProfileRequest,
    UpdateSettingsRequest,
    UserProfile,
    UserSettings,
)

router = APIRouter(prefix="/users", tags=["Users"])

# Configurações padrão (não persistidas ainda — aguarda banco de dados)
_DEFAULT_SETTINGS = UserSettings(
    theme="system",
    ai_insights=True,
    biblical_reminders=True,
    rag_memory=False,
)

# Estado em memória para settings (perdido ao reiniciar — Fase 1)
_settings_state = _DEFAULT_SETTINGS.model_copy()


# ── Helpers de persistência ───────────────────────────────────────────────────

def _load_profile() -> UserProfile:
    """Carrega perfil do usuário do arquivo JSON."""
    data = read_json("users.json")
    if not isinstance(data, dict) or "id" not in data:
        return UserProfile(
            id="user-mock-001",
            name="Gabriel Santos",
            email="gabriel.santos@vidacomdeus.com",
            membership_since="2023",
            plan="free",
        )
    return UserProfile(**data)


def _save_profile(profile: UserProfile) -> None:
    """Persiste perfil do usuário no arquivo JSON."""
    write_json("users.json", profile.model_dump())


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserProfile)
def get_me(user_id: str = Depends(get_current_user_id)) -> UserProfile:
    """Retorna o perfil do usuário autenticado."""
    return _load_profile()


@router.patch("/me", response_model=UserProfile)
def update_me(
    body: UpdateProfileRequest,
    user_id: str = Depends(get_current_user_id),
) -> UserProfile:
    """Atualiza o perfil do usuário e persiste no JSON."""
    profile = _load_profile()
    updated = profile.model_copy(update=body.model_dump(exclude_none=True))
    _save_profile(updated)
    return updated


@router.get("/me/settings", response_model=UserSettings)
def get_settings(user_id: str = Depends(get_current_user_id)) -> UserSettings:
    """Retorna as configurações do usuário."""
    return _settings_state


@router.patch("/me/settings", response_model=UserSettings)
def update_settings(
    body: UpdateSettingsRequest,
    user_id: str = Depends(get_current_user_id),
) -> UserSettings:
    """Atualiza as configurações do usuário (estado em memória)."""
    global _settings_state
    _settings_state = _settings_state.model_copy(
        update=body.model_dump(exclude_none=True)
    )
    return _settings_state
