from app.features.explore.repository import (
    count_filtered_profiles,
    get_filtered_profiles,
)
from app.features.explore.schemas import ExploreProfileNode


def get_explore_profiles(
    pool, current_user: dict, filters: dict
) -> list[ExploreProfileNode]:
    records = get_filtered_profiles(pool, current_user, filters)

    return [
        ExploreProfileNode(
            id=str(r["id"]),
            firstname=r["firstname"],
            lastname=r["lastname"],
            fameRating=r.get("fame_rating"),
            latitude=r.get("latitude"),
            longitude=r.get("longitude"),
            tags=r.get("tags", []),
            photos=r.get("photos", []),
        )
        for r in records
    ]


def get_explore_profiles_count(pool, current_user: dict, filters: dict) -> int:
    return count_filtered_profiles(pool, current_user, filters)
