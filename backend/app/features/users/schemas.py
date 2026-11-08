from datetime import datetime

import strawberry


@strawberry.type
class User:
    id: int
    email: str
    username: str
    lastname: str
    firstname: str
    is_verified: bool
    gender: str | None
    preference: str
    biography: str | None
    fame_rating: float
    latitude: float | None
    longitude: float | None
    last_connection: datetime | None
    is_online: bool
    updated_at: datetime
    created_at: datetime


@strawberry.type
class UserPayload:
    user: User | None
    message: str
