from datetime import UTC, datetime, timedelta

import bcrypt
import jwt
from flask import Request

SECRET_KEY = "votre_clef_secrete_super_longue_et_aleatoire"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


def create_access_token(subject: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_email_verification_token(email: str) -> str:
    expire = datetime.now(UTC) + timedelta(hours=24)
    to_encode = {"exp": expire, "sub": email, "type": "email_verification"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_email_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "email_verification":
            return None
        return payload.get("sub")
    except jwt.PyJWTError:
        return None


def create_password_reset_token(email: str) -> str:
    expire = datetime.now(UTC) + timedelta(hours=1)
    to_encode = {"exp": expire, "sub": email, "type": "password_reset"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password_reset_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "password_reset":
            return None
        return payload.get("sub")
    except jwt.PyJWTError:
        return None


def get_current_user_id(request: Request) -> int | None:
    token = request.cookies.get("token")

    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
