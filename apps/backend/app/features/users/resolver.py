import strawberry
from strawberry.types import Info

from app.features.users.schemas import User, UserPayload
from app.features.users.service import (
    get_me,
    process_password_reset,
    process_password_reset_request,
    register_user,
)


@strawberry.type
class UserMutation:
    @strawberry.mutation
    async def register(
        self,
        info: Info,
        email: str,
        username: str,
        firstname: str,
        lastname: str,
        password: str,
    ) -> UserPayload:
        return await register_user(
            info.context.db_pool, email, username, firstname, lastname, password
        )

    @strawberry.mutation
    async def request_password_reset(self, info: Info, email: str) -> str:
        return await process_password_reset_request(info.context.db_pool, email)

    @strawberry.mutation
    async def reset_password(self, info: Info, token: str, new_password: str) -> str:
        return await process_password_reset(info.context.db_pool, token, new_password)


@strawberry.type
class UserQuery:
    @strawberry.field
    async def me(self, info: Info) -> User | None:
        return await get_me(info.context.db_pool, info.context.request)
