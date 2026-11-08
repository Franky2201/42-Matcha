import strawberry


@strawberry.type
class AuthPayload:
    token: str | None
    message: str
