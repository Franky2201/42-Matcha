import strawberry

from app.core.security import get_current_user_id
from app.features.explore.schemas import ExploreProfileNode
from app.features.explore.service import (
    get_explore_profiles,
    get_explore_profiles_count,
)
from app.features.users.repository import get_user_by_id


def get_authenticated_user(info: strawberry.Info) -> dict:
    user_id = get_current_user_id(info.context.request)

    if not user_id:
        raise Exception("Token invalide ou non autorisé")

    user = get_user_by_id(info.context.db_pool, user_id)
    if not user:
        raise Exception("Utilisateur introuvable")

    return user


@strawberry.type
class ExploreQuery:
    @strawberry.field
    def exploreProfiles(
        self,
        info: strawberry.Info,
        limit: int,
        offset: int,
        ageMin: int | None = None,
        ageMax: int | None = None,
        fameMin: float | None = None,
        fameMax: float | None = None,
        distanceMax: float | None = None,
        tags: list[str] | None = None,
        sortBy: str | None = None,
        sortOrder: str | None = None,
    ) -> list[ExploreProfileNode]:
        user = get_authenticated_user(info)

        filters = {
            "limit": limit,
            "offset": offset,
            "ageMin": ageMin,
            "ageMax": ageMax,
            "fameMin": fameMin,
            "fameMax": fameMax,
            "distanceMax": distanceMax,
            "tags": tags,
            "sortBy": sortBy,
            "sortOrder": sortOrder,
        }

        return get_explore_profiles(info.context.db_pool, user, filters)

    @strawberry.field
    def exploreProfilesCount(
        self,
        info: strawberry.Info,
        ageMin: int | None = None,
        ageMax: int | None = None,
        fameMin: float | None = None,
        fameMax: float | None = None,
        distanceMax: float | None = None,
        tags: list[str] | None = None,
    ) -> int:
        user = get_authenticated_user(info)

        filters = {
            "ageMin": ageMin,
            "ageMax": ageMax,
            "fameMin": fameMin,
            "fameMax": fameMax,
            "distanceMax": distanceMax,
            "tags": tags,
        }

        return get_explore_profiles_count(info.context.db_pool, user, filters)
