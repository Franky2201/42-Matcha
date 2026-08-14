import asyncpg


async def get_user_password_hash(pool: asyncpg.Pool, username: str) -> dict | None:
    query = "SELECT id, password_hash FROM users WHERE username = $1;"
    async with pool.acquire() as conn:
        record = await conn.fetchrow(query, username)
        return dict(record) if record else None
