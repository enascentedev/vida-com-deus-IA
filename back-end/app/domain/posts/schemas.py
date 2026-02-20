from pydantic import BaseModel


class PostSummary(BaseModel):
    id: str
    title: str
    reference: str
    category: str
    date: str
    thumbnail_url: str | None = None
    is_new: bool = False
    is_starred: bool = False
    tags: list[str] = []


class PostKeyPoint(BaseModel):
    text: str


class PostDetail(BaseModel):
    id: str
    title: str
    reference: str
    category: str
    date: str
    thumbnail_url: str | None = None
    verse_content: str
    ai_summary: str
    key_points: list[PostKeyPoint] = []
    tags: list[str] = []
    devotional_meditation: str
    devotional_prayer: str
    audio_url: str | None = None
    audio_duration: str | None = None


class FeedResponse(BaseModel):
    post_of_day: PostSummary
    recent_posts: list[PostSummary]


class AudioResponse(BaseModel):
    post_id: str
    url: str
    duration: str
    title: str
