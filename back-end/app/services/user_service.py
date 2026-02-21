"""Serviço de usuário — perfil e configurações."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.users.schemas import (
    UpdateProfileRequest,
    UpdateSettingsRequest,
    UserProfile,
    UserSettings as UserSettingsSchema,
)
from app.repositories.user_repository import UserRepository


async def get_me(db: AsyncSession, user_id: str) -> UserProfile:
    """Retorna o perfil do usuário autenticado."""
    repo = UserRepository(db)
    user = await repo.get_by_id(uuid.UUID(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )
    return UserProfile(
        id=str(user.id),
        name=user.name,
        email=user.email,
        avatar_url=user.avatar_url,
        membership_since=str(user.created_at.year),
        plan=user.plan,
    )


async def update_me(
    db: AsyncSession, user_id: str, data: UpdateProfileRequest
) -> UserProfile:
    """Atualiza campos permitidos do perfil."""
    repo = UserRepository(db)
    user = await repo.get_by_id(uuid.UUID(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    fields = data.model_dump(exclude_none=True)
    if fields:
        await repo.update(user, **fields)

    return UserProfile(
        id=str(user.id),
        name=user.name,
        email=user.email,
        avatar_url=user.avatar_url,
        membership_since=str(user.created_at.year),
        plan=user.plan,
    )


async def get_settings(db: AsyncSession, user_id: str) -> UserSettingsSchema:
    """Retorna configurações do usuário (cria padrão se não existir)."""
    repo = UserRepository(db)
    settings = await repo.get_or_create_settings(uuid.UUID(user_id))
    return UserSettingsSchema(
        theme=settings.theme,
        ai_insights=settings.ai_insights,
        biblical_reminders=settings.biblical_reminders,
        rag_memory=settings.rag_memory,
    )


async def update_settings(
    db: AsyncSession, user_id: str, data: UpdateSettingsRequest
) -> UserSettingsSchema:
    """Atualiza configurações do usuário."""
    repo = UserRepository(db)
    settings = await repo.get_or_create_settings(uuid.UUID(user_id))

    fields = data.model_dump(exclude_none=True)
    if fields:
        await repo.update_settings(settings, **fields)

    return UserSettingsSchema(
        theme=settings.theme,
        ai_insights=settings.ai_insights,
        biblical_reminders=settings.biblical_reminders,
        rag_memory=settings.rag_memory,
    )
