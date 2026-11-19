import strawberry
from typing import List, Optional

@strawberry.type
class ExploreProfileNode:
    id: str
    firstname: str
    lastname: str
    fameRating: Optional[float]
    latitude: Optional[float]
    longitude: Optional[float]
    tags: Optional[List[str]]
    photos: Optional[List[str]]
