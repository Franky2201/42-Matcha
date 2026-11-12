from psycopg2 import errors
from psycopg2.extras import RealDictCursor


def create_user_in_db(
    pool,
    email: str,
    username: str,
    firstname: str,
    lastname: str,
    password_hash: str,
) -> dict | None:
    query = """
        INSERT INTO users (
            email,
            username,
            firstname,
            lastname,
            password_hash,
            tags,
            photos
        )
        VALUES (%s, %s, %s, %s, %s, '{}', '{}')
        RETURNING
            id,
            email,
            username,
            lastname,
            firstname,
            is_verified,
            gender::text,
            preference::text,
            biography,
            fame_rating,
            latitude,
            longitude,
            last_connection,
            is_online,
            updated_at,
            created_at,
            tags,
            photos;
    """
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            try:
                cur.execute(
                    query,
                    (email, username, firstname, lastname, password_hash),
                )
                record = cur.fetchone()
                conn.commit()
                return dict(record) if record else None
            except errors.UniqueViolation:
                conn.rollback()
                return None
    finally:
        pool.putconn(conn)


def get_user_by_id(pool, user_id: int) -> dict | None:
    query = """
        SELECT id, email, username, lastname, firstname, is_verified, 
               gender::text, preference::text, biography, fame_rating, 
               latitude, longitude, last_connection, is_online, 
               updated_at, created_at, tags, photos
        FROM users 
        WHERE id = %s;
    """
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, (user_id,))
            record = cur.fetchone()
            return dict(record) if record else None
    finally:
        pool.putconn(conn)


def verify_user_in_db(pool, email: str) -> bool:
    query = "UPDATE users SET is_verified = TRUE WHERE email = %s RETURNING id;"
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(query, (email,))
            record = cur.fetchone()
            conn.commit()
            return bool(record)
    finally:
        pool.putconn(conn)


def check_user_exists_by_email(pool, email: str) -> bool:
    query = "SELECT id FROM users WHERE email = %s;"
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(query, (email,))
            record = cur.fetchone()
            return bool(record)
    finally:
        pool.putconn(conn)


def update_user_password(pool, email: str, new_password_hash: str) -> bool:
    query = "UPDATE users SET password_hash = %s WHERE email = %s RETURNING id;"
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(query, (new_password_hash, email))
            record = cur.fetchone()
            conn.commit()
            return bool(record)
    finally:
        pool.putconn(conn)


def update_user_profile_in_db(
    pool,
    user_id: int,
    firstname: str,
    lastname: str,
    email: str,
    gender: str | None,
    preference: str | None,
    biography: str | None,
    tags: list[str],
    photos: list[str],
) -> dict | None:
    query = """
        UPDATE users SET
            firstname = %s,
            lastname = %s,
            email = %s,
            gender = %s,
            preference = %s,
            biography = %s,
            tags = %s,
            photos = %s,
            updated_at = NOW()
        WHERE id = %s
        RETURNING
            id,
            email,
            username,
            lastname,
            firstname,
            is_verified,
            gender::text,
            preference::text,
            biography,
            fame_rating,
            latitude,
            longitude,
            last_connection,
            is_online,
            updated_at,
            created_at,
            tags,
            photos;
    """
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            try:
                cur.execute(
                    query,
                    (
                        firstname,
                        lastname,
                        email,
                        gender,
                        preference,
                        biography,
                        tags,
                        photos,
                        user_id,
                    ),
                )
                record = cur.fetchone()
                conn.commit()
                return dict(record) if record else None
            except errors.UniqueViolation:
                conn.rollback()
                raise ValueError("Email already in use")
    finally:
        pool.putconn(conn)


def update_user_location_in_db(pool, user_id: int, latitude: float, longitude: float) -> dict | None:
    query = """
        UPDATE users 
        SET latitude = %s, longitude = %s, updated_at = NOW()
        WHERE id = %s
        RETURNING
            id, email, username, lastname, firstname, is_verified,
            gender::text, preference::text, biography, fame_rating,
            latitude, longitude, last_connection, is_online,
            updated_at, created_at, tags, photos;
    """
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, (latitude, longitude, user_id))
            record = cur.fetchone()
            conn.commit()
            return dict(record) if record else None
    finally:
        pool.putconn(conn)


def get_all_users_for_explore(pool, current_user_id: int, limit: int, offset: int) -> list[dict]:
    query = """
        SELECT * FROM users
        WHERE id != %s
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s;
    """
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, (current_user_id, limit, offset))
            return [dict(record) for record in cur.fetchall()]
    finally:
        pool.putconn(conn)


def get_explore_profiles_count(pool, current_user_id: int) -> int:
    query = "SELECT COUNT(*) FROM users WHERE id != %s;"
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(query, (current_user_id,))
            record = cur.fetchone()
            return record[0] if record else 0
    finally:
        pool.putconn(conn)
