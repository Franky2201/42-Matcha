import strawberry
from strawberry.types import Info

from app.core.security import verify_email_token
from app.features.users.repository import verify_user_in_db
from app.features.users.schemas import User, UserPayload
from app.features.users.service import (
    get_me,
    process_password_reset,
    process_password_reset_request,
    process_update_location,
    process_update_profile,
    register_user,
)


@strawberry.type
class UserMutation:
    @strawberry.mutation
    def register(
        self,
        info: Info,
        email: str,
        username: str,
        firstname: str,
        lastname: str,
        password: str,
    ) -> UserPayload:
        return register_user(
            info.context.db_pool, email, username, firstname, lastname, password
        )

    @strawberry.mutation
    def verify_email(self, info: Info, token: str) -> str:
        email = verify_email_token(token)
        if not email:
            return "Invalid or expired token."

        success = verify_user_in_db(info.context.db_pool, email)
        if not success:
            return "User not found."

        return "Email verified successfully."

    @strawberry.mutation
    def request_password_reset(self, info: Info, email: str) -> str:
        return process_password_reset_request(info.context.db_pool, email)

    @strawberry.mutation
    def reset_password(self, info: Info, token: str, new_password: str) -> str:
        return process_password_reset(info.context.db_pool, token, new_password)

    @strawberry.mutation
    def update_profile(
        self,
        info: Info,
        firstname: str,
        lastname: str,
        email: str,
        gender: str | None = None,
        preference: str | None = None,
        biography: str | None = None,
        tags: list[str] | None = None,
        new_photos: list[str] | None = None,
        photo_mapping: str | None = None,
    ) -> User:
        return process_update_profile(
            info.context.db_pool,
            info.context.request,
            firstname,
            lastname,
            email,
            gender,
            preference,
            biography,
            tags,
            new_photos,
            photo_mapping,
        )

    @strawberry.mutation
    def update_location(
        self, info: Info, latitude: float, longitude: float
    ) -> User:
        return process_update_location(
            info.context.db_pool,
            info.context.request,
            latitude,
            longitude,
        )


@strawberry.type
class UserQuery:
    @strawberry.field
    def me(self, info: Info) -> User | None:
        return get_me(info.context.db_pool, info.context.request)
