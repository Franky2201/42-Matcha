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
            password_hash
        )
        VALUES (%s, %s, %s, %s, %s)
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
            created_at;
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
               updated_at, created_at
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
