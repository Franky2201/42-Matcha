from psycopg2.extras import RealDictCursor


def build_explore_query_and_params(
    user_id: int,
    user_lat: float | None,
    user_lng: float | None,
    filters: dict,
    is_count: bool = False,
) -> tuple[str, list]:
    where_clauses = ["id != %s", "is_verified = TRUE"]
    params = [user_id]

    if filters.get("ageMin"):
        where_clauses.append("age >= %s")
        params.append(filters["ageMin"])

    if filters.get("ageMax"):
        where_clauses.append("age <= %s")
        params.append(filters["ageMax"])

    if filters.get("fameMin"):
        where_clauses.append("fame_rating >= %s")
        params.append(filters["fameMin"])

    if filters.get("fameMax"):
        where_clauses.append("fame_rating <= %s")
        params.append(filters["fameMax"])

    if filters.get("tags") and len(filters["tags"]) > 0:
        where_clauses.append("tags && %s")
        params.append(filters["tags"])

    if filters.get("distanceMax") and user_lat is not None and user_lng is not None:
        haversine_sql = """(
            6371 * acos(
                cos(radians(%s)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(%s)) + 
                sin(radians(%s)) * sin(radians(latitude))
            )
        ) <= %s"""
        where_clauses.append(haversine_sql)
        params.extend([user_lat, user_lng, user_lat, filters["distanceMax"]])

    where_sql = " AND ".join(where_clauses)

    if is_count:
        return f"SELECT COUNT(*) as total FROM users WHERE {where_sql}", params

    order_sql = ""
    sort_by = filters.get("sortBy")
    sort_order = "DESC" if filters.get("sortOrder") == "desc" else "ASC"

    if sort_by == "age":
        order_sql = f"ORDER BY age {sort_order}"
    elif sort_by == "fame":
        order_sql = f"ORDER BY fame_rating {sort_order}"
    elif sort_by == "distance" and user_lat is not None and user_lng is not None:
        order_sql = f"""ORDER BY (
            6371 * acos(
                cos(radians(%s)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(%s)) + 
                sin(radians(%s)) * sin(radians(latitude))
            )
        ) {sort_order}"""
        params.extend([user_lat, user_lng, user_lat])
    elif sort_by == "tags" and filters.get("tags"):
        order_sql = f"""ORDER BY (
            SELECT COUNT(*) FROM unnest(tags) AS t WHERE t = ANY(%s)
        ) {sort_order}"""
        params.append(filters["tags"])
    else:
        order_sql = "ORDER BY created_at DESC"

    limit = filters.get("limit", 10)
    offset = filters.get("offset", 0)

    query = f"""
        SELECT id, firstname, lastname, fame_rating, latitude, longitude, tags, photos 
        FROM users 
        WHERE {where_sql} 
        {order_sql} 
        LIMIT %s OFFSET %s
    """
    params.extend([limit, offset])

    return query, params


def get_filtered_profiles(pool, current_user: dict, filters: dict) -> list[dict]:
    user_id = current_user["id"]
    user_lat = current_user.get("latitude")
    user_lng = current_user.get("longitude")

    query, params = build_explore_query_and_params(
        user_id, user_lat, user_lng, filters, is_count=False
    )

    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            return [dict(record) for record in cur.fetchall()]
    finally:
        pool.putconn(conn)


def count_filtered_profiles(pool, current_user: dict, filters: dict) -> int:
    user_id = current_user["id"]
    user_lat = current_user.get("latitude")
    user_lng = current_user.get("longitude")

    query, params = build_explore_query_and_params(
        user_id, user_lat, user_lng, filters, is_count=True
    )

    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            result = cur.fetchone()
            return result["total"] if result else 0
    finally:
        pool.putconn(conn)
