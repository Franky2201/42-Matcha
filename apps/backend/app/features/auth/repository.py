import asyncpg


async def get_user_password_hash(pool: asyncpg.Pool, email: str) -> dict | None:
    query = "SELECT id, password_hash FROM users WHERE email = $1;"
    async with pool.acquire() as conn:
        record = await conn.fetchrow(query, email)
        return dict(record) if record else None
