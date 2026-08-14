import strawberry
from strawberry.types import Info

from app.features.users.schemas import User, UserPayload
from app.features.users.service import get_me, register_user


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


@strawberry.type
class UserQuery:
    @strawberry.field
    async def me(self, info: Info) -> User | None:
        return await get_me(info.context.db_pool, info.context.request)
