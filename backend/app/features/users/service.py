import base64
import json
import os
import re
import uuid

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
    update_user_profile_in_db,
)
from app.features.users.schemas import User, UserPayload

FORBIDDEN_PASSWORDS = {"password", "admin", "qwerty", "123456", "welcome", "love"}
UPLOAD_FOLDER = "uploads"


def register_user(
    pool,
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
    user_record = create_user_in_db(
        pool, email, username, firstname, lastname, password_hash
    )

    if not user_record:
        return UserPayload(user=None, message="Username or email already exists.")

    token = create_email_verification_token(email)
    send_verification_email(email, token)

    user_kwargs = {k: v for k, v in user_record.items() if k not in ["tags", "photos"]}
    user = User(
        tags=user_record.get("tags", []),
        photos=user_record.get("photos", []),
        **user_kwargs,
    )

    return UserPayload(
        user=user, message="Registration successful. Please check your emails."
    )


def get_me(pool, request: Request) -> User | None:
    user_id = get_current_user_id(request)
    if not user_id:
        return None

    user_record = get_user_by_id(pool, user_id)
    if not user_record:
        return None

    user_kwargs = {k: v for k, v in user_record.items() if k not in ["tags", "photos"]}
    return User(
        tags=user_record.get("tags", []),
        photos=user_record.get("photos", []),
        **user_kwargs,
    )


def process_password_reset_request(pool, email: str) -> str:
    user_exists = check_user_exists_by_email(pool, email)

    if user_exists:
        token = create_password_reset_token(email)
        send_password_reset_email(email, token)

    return "Un lien de réinitialisation a été envoyé."


def process_password_reset(pool, token: str, new_password: str) -> str:
    email = verify_password_reset_token(token)
    if not email:
        return "Le lien de réinitialisation est invalide ou a expiré."

    if len(new_password) < 8 or any(
        word in new_password.lower() for word in FORBIDDEN_PASSWORDS
    ):
        return "Le mot de passe est trop faible ou contient un mot courant."

    new_password_hash = get_password_hash(new_password)
    success = update_user_password(pool, email, new_password_hash)

    if not success:
        return "Erreur lors de la mise à jour du mot de passe."

    return "Votre mot de passe a été réinitialisé avec succès."


def process_update_profile(
    pool,
    request: Request,
    firstname: str,
    lastname: str,
    email: str,
    gender: str | None,
    preference: str | None,
    biography: str | None,
    tags: list[str] | None,
    new_photos: list[str] | None,
    photo_mapping: str | None,
) -> User:
    user_id = get_current_user_id(request)
    if not user_id:
        raise Exception("Unauthorized")

    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
        raise ValueError("Invalid email format")
    if not firstname.strip() or not lastname.strip():
        raise ValueError("Firstname and lastname are required")
    if gender not in ["male", "female", "other", None]:
        raise ValueError("Invalid gender")
    if preference not in ["male", "female", "all", None]:
        raise ValueError("Invalid preference")
    if biography and len(biography) > 500:
        raise ValueError("Biography too long")

    tags = tags or []
    tags = [tag.strip().lower() for tag in tags if tag.strip()]

    mapping = json.loads(photo_mapping) if photo_mapping else []
    photo_urls = []
    new_photo_idx = 0

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    for item in mapping:
        if item == "NEW":
            if new_photos and new_photo_idx < len(new_photos):
                photo_b64 = new_photos[new_photo_idx]
                if photo_b64 and "," in photo_b64:
                    header, encoded = photo_b64.split(",", 1)
                    ext = header.split(";")[0].split("/")[1]
                    ext = re.sub(r"[^a-zA-Z0-9]", "", ext) or "png"
                    filename = f"{user_id}_{uuid.uuid4().hex}.{ext}"
                    filepath = os.path.join(UPLOAD_FOLDER, filename)
                    with open(filepath, "wb") as f:
                        f.write(base64.b64decode(encoded))
                    photo_urls.append(f"/{UPLOAD_FOLDER}/{filename}")
                new_photo_idx += 1
        elif item:
            photo_urls.append(item)

    try:
        user_record = update_user_profile_in_db(
            pool,
            user_id,
            firstname,
            lastname,
            email,
            gender,
            preference,
            biography,
            tags,
            photo_urls,
        )
    except ValueError as e:
        raise Exception(str(e))

    if not user_record:
        raise Exception("User not found")

    user_kwargs = {k: v for k, v in user_record.items() if k not in ["tags", "photos"]}
    return User(
        tags=user_record.get("tags", []),
        photos=user_record.get("photos", []),
        **user_kwargs,
    )
