"""Repositório de acesso a dados para o domínio de usuários."""

import uuid
from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import PasswordResetToken, RefreshToken, User, UserSettings


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── User ──────────────────────────────────────────────────────────────────

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, name: str, email: str, hashed_password: str) -> User:
        user = User(name=name, email=email, hashed_password=hashed_password)
        self.db.add(user)
        await self.db.flush()
        return user

    async def update(self, user: User, **fields: object) -> User:
        for key, value in fields.items():
            setattr(user, key, value)
        await self.db.flush()
        return user

    # ── Refresh Token ─────────────────────────────────────────────────────────

    async def save_refresh_token(
        self, user_id: uuid.UUID, token_hash: str, expires_at: datetime
    ) -> RefreshToken:
        token = RefreshToken(
            user_id=user_id, token_hash=token_hash, expires_at=expires_at
        )
        self.db.add(token)
        await self.db.flush()
        return token

    async def get_refresh_token(self, token_hash: str) -> RefreshToken | None:
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    async def revoke_refresh_token(self, token_hash: str) -> None:
        await self.db.execute(
            update(RefreshToken)
            .where(RefreshToken.token_hash == token_hash)
            .values(is_revoked=True)
        )

    async def revoke_all_user_tokens(self, user_id: uuid.UUID) -> None:
        await self.db.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.is_revoked == False)  # noqa: E712
            .values(is_revoked=True)
        )

    # ── Password Reset Token ─────────────────────────────────────────────────

    async def save_password_reset_token(
        self, user_id: uuid.UUID, token_hash: str, expires_at: datetime
    ) -> PasswordResetToken:
        token = PasswordResetToken(
            user_id=user_id, token_hash=token_hash, expires_at=expires_at
        )
        self.db.add(token)
        await self.db.flush()
        return token

    async def get_password_reset_token(self, token_hash: str) -> PasswordResetToken | None:
        result = await self.db.execute(
            select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    # ── User Settings ─────────────────────────────────────────────────────────

    async def get_or_create_settings(self, user_id: uuid.UUID) -> UserSettings:
        result = await self.db.execute(
            select(UserSettings).where(UserSettings.user_id == user_id)
        )
        settings = result.scalar_one_or_none()
        if settings is None:
            settings = UserSettings(user_id=user_id)
            self.db.add(settings)
            await self.db.flush()
        return settings

    async def update_settings(self, settings: UserSettings, **fields: object) -> UserSettings:
        for key, value in fields.items():
            setattr(settings, key, value)
        await self.db.flush()
        return settings
