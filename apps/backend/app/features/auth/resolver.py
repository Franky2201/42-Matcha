import strawberry
from strawberry.types import Info

from app.features.auth.schemas import AuthPayload
from app.features.auth.service import authenticate_user


@strawberry.type
class AuthMutation:
    @strawberry.mutation
    async def login(self, info: Info, email: str, password: str) -> AuthPayload:
        return await authenticate_user(info.context.db_pool, email, password)

    @strawberry.mutation
    async def logout(self, info: Info) -> str:
        return "Logout successful. Please remove the token on the client."
