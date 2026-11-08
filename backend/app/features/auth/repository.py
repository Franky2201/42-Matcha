from psycopg2.pool import SimpleConnectionPool


def get_user_password_hash(pool: SimpleConnectionPool, username: str) -> dict | None:
    query = "SELECT id, password_hash FROM users WHERE username = %s;"
    conn = pool.getconn()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, (username,))
            record = cursor.fetchone()
            if not record:
                return None
            return {
                "id": record[0],
                "password_hash": record[1],
            }
    finally:
        pool.putconn(conn)
