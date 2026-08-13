import asyncpg


async def create_user_in_db(
    pool: asyncpg.Pool, email: str, username: str, firstname: str, lastname: str, password_hash: str
) -> dict | None:
    query = """
        INSERT INTO users (email, username, first_name, last_name, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, username, email, first_name AS firstname, last_name AS lastname;
    """
    try:
        async with pool.acquire() as conn:
            record = await conn.fetchrow(query, email, username, firstname, lastname, password_hash)
            return dict(record) if record else None
    except asyncpg.UniqueViolationError:
        return None

async def get_user_by_id(pool: asyncpg.Pool, user_id: int) -> dict | None:
    query = """
        SELECT id, email, username, lastname, firstname, is_verified, 
               gender::text, preference::text, biography, fame_rating, 
               latitude, longitude, last_connection, is_online, 
               updated_at, created_at
        FROM users 
        WHERE id = $1;
    """
    async with pool.acquire() as conn:
        record = await conn.fetchrow(query, user_id)
        return dict(record) if record else None
