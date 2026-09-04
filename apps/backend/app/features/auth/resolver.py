import strawberry
from strawberry.types import Info

from app.features.auth.schemas import AuthPayload
from app.features.auth.service import authenticate_user


@strawberry.type
class AuthMutation:
    @strawberry.mutation
    def login(self, info: Info, username: str, password: str) -> AuthPayload:
        payload, token = authenticate_user(info.context.db_pool, username, password)

        if token:
            info.context.response.set_cookie(
                key="token",
                value=token,
                httponly=True,
                secure=False,
                samesite="lax",
                max_age=3600,
            )

        return payload

    @strawberry.mutation
    def logout(self, info: Info) -> str:
        info.context.response.set_cookie(
            key="token", value="", httponly=True, expires=0
        )
        return "Déconnexion réussie."
