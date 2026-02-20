from pydantic import BaseModel, EmailStr


class UserProfile(BaseModel):
    id: str
    name: str
    email: EmailStr
    avatar_url: str | None = None
    membership_since: str | None = None
    plan: str = "free"


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    avatar_url: str | None = None


class UserSettings(BaseModel):
    theme: str = "system"
    ai_insights: bool = True
    biblical_reminders: bool = True
    rag_memory: bool = False


class UpdateSettingsRequest(BaseModel):
    theme: str | None = None
    ai_insights: bool | None = None
    biblical_reminders: bool | None = None
    rag_memory: bool | None = None
