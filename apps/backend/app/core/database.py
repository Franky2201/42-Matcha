import os

import asyncpg
from flask import Request

_db_pool: asyncpg.Pool | None = None


async def get_db_pool() -> asyncpg.Pool:
    global _db_pool
    if _db_pool is None:
        db_url = os.getenv("DATABASE_URL")
        _db_pool = await asyncpg.create_pool(db_url)
    return _db_pool


async def close_db_pool() -> None:
    global _db_pool
    if _db_pool is not None:
        await _db_pool.close()
        _db_pool = None


class GraphQLContext:
    def __init__(self, db_pool: asyncpg.Pool, request: Request):
        self.db_pool = db_pool
        self.request = request
