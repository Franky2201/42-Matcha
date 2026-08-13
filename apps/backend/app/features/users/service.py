import asyncpg
from app.core.security import get_current_user_id, get_password_hash
from app.features.users.repository import create_user_in_db, get_user_by_id
from app.features.users.schemas import User, UserPayload
from fastapi import Request

FORBIDDEN_PASSWORDS = {"password", "admin", "qwerty", "123456", "welcome", "love"}


async def register_user(
    pool: asyncpg.Pool, email: str, username: str, firstname: str, lastname: str, password: str
) -> UserPayload:
    if len(password) < 8 or any(word in password.lower() for word in FORBIDDEN_PASSWORDS):
        return UserPayload(user=None, message="Password contains common English words or is too short.")

    password_hash = get_password_hash(password)
    user_record = await create_user_in_db(pool, email, username, firstname, lastname, password_hash)

    if not user_record:
        return UserPayload(user=None, message="Username or email already exists.")

    user = User(**user_record)
    return UserPayload(user=user, message="Registration successful")

async def get_me(pool: asyncpg.Pool, request: Request) -> User | None:
    user_id = get_current_user_id(request)
    if not user_id:
        return None
        
    user_record = await get_user_by_id(pool, user_id)
    if not user_record:
        return None
        
    return User(**user_record)
