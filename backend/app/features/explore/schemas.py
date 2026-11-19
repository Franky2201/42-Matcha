import strawberry


@strawberry.type
class ExploreProfileNode:
    id: str
    firstname: str
    lastname: str
    fameRating: float | None
    latitude: float | None
    longitude: float | None
    tags: list[str] | None
    photos: list[str] | None
