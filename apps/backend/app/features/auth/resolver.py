import strawberry
from app.core.security import verify_email_token
from app.features.auth.schemas import AuthPayload
from app.features.auth.service import authenticate_user
from app.features.users.repository import verify_user_in_db
from strawberry.types import Info


@strawberry.type
class AuthMutation:
    @strawberry.mutation
    async def login(self, info: Info, username: str, password: str) -> AuthPayload:
        return await authenticate_user(info.context.db_pool, username, password)

    @strawberry.mutation
    async def logout(self, info: Info) -> str:
        return "Logout successful. Please remove the token on the client."

    @strawberry.mutation
    async def verify_email(self, info: Info, token: str) -> str:
        email = verify_email_token(token)
        if not email:
            return "Invalid or expired token."
        
        success = await verify_user_in_db(info.context.db_pool, email)
        if not success:
            return "User not found."
        
        return "Email verified successfully."
