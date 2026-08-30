import asyncpg
from flask import Request

from app.core.mailer import send_password_reset_email, send_verification_email
from app.core.security import (
    create_email_verification_token,
    create_password_reset_token,
    get_current_user_id,
    get_password_hash,
    verify_password_reset_token,
)
from app.features.users.repository import (
    check_user_exists_by_email,
    create_user_in_db,
    get_user_by_id,
    update_user_password,
)
from app.features.users.schemas import User, UserPayload

FORBIDDEN_PASSWORDS = {"password", "admin", "qwerty", "123456", "welcome", "love"}


async def register_user(
    pool: asyncpg.Pool,
    email: str,
    username: str,
    firstname: str,
    lastname: str,
    password: str,
) -> UserPayload:
    if len(password) < 8 or any(
        word in password.lower() for word in FORBIDDEN_PASSWORDS
    ):
        return UserPayload(
            user=None, message="Password contains common English words or is too short."
        )

    password_hash = get_password_hash(password)
    user_record = await create_user_in_db(
        pool, email, username, firstname, lastname, password_hash
    )

    if not user_record:
        return UserPayload(user=None, message="Username or email already exists.")

    token = create_email_verification_token(email)
    await send_verification_email(email, token)

    user = User(**user_record)
    return UserPayload(
        user=user, message="Registration successful. Please check your emails."
    )


async def get_me(pool: asyncpg.Pool, request: Request) -> User | None:
    user_id = get_current_user_id(request)
    if not user_id:
        return None

    user_record = await get_user_by_id(pool, user_id)
    if not user_record:
        return None

    return User(**user_record)


async def process_password_reset_request(pool: asyncpg.Pool, email: str) -> str:
    user_exists = await check_user_exists_by_email(pool, email)

    if user_exists:
        token = create_password_reset_token(email)
        await send_password_reset_email(email, token)

    return "Un lien de réinitialisation a été envoyé."


async def process_password_reset(
    pool: asyncpg.Pool, token: str, new_password: str
) -> str:
    email = verify_password_reset_token(token)
    if not email:
        return "Le lien de réinitialisation est invalide ou a expiré."

    if len(new_password) < 8 or any(
        word in new_password.lower() for word in FORBIDDEN_PASSWORDS
    ):
        return "Le mot de passe est trop faible ou contient un mot courant."

    new_password_hash = get_password_hash(new_password)
    success = await update_user_password(pool, email, new_password_hash)

    if not success:
        return "Erreur lors de la mise à jour du mot de passe."

    return "Votre mot de passe a été réinitialisé avec succès."
