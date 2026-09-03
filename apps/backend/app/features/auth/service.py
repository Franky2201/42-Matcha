from app.core.security import create_access_token, verify_password
from app.features.auth.repository import get_user_password_hash
from app.features.auth.schemas import AuthPayload


def authenticate_user(pool, username: str, password: str) -> AuthPayload:
    user = get_user_password_hash(pool, username)

    if not user or not verify_password(password, user["password_hash"]):
        return AuthPayload(
            token=None,
            message="Invalid credentials",
        )

    token = create_access_token(subject=user["id"])

    return AuthPayload(
        token=token,
        message="Login successful",
    )
