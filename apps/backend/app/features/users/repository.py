import asyncpg


async def create_user_in_db(
    pool: asyncpg.Pool,
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
        VALUES ($1, $2, $3, $4, $5)
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

    try:
        async with pool.acquire() as conn:
            record = await conn.fetchrow(
                query,
                email,
                username,
                firstname,
                lastname,
                password_hash,
            )
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


async def verify_user_in_db(pool: asyncpg.Pool, email: str) -> bool:
    query = "UPDATE users SET is_verified = TRUE WHERE email = $1 RETURNING id;"
    async with pool.acquire() as conn:
        record = await conn.fetchrow(query, email)
        return bool(record)


async def check_user_exists_by_email(pool: asyncpg.Pool, email: str) -> bool:
    query = "SELECT id FROM users WHERE email = $1;"
    async with pool.acquire() as conn:
        record = await conn.fetchrow(query, email)
        return bool(record)


async def update_user_password(
    pool: asyncpg.Pool, email: str, new_password_hash: str
) -> bool:
    query = "UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id;"
    async with pool.acquire() as conn:
        record = await conn.fetchrow(query, new_password_hash, email)
        return bool(record)
