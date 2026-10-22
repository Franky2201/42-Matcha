import os

from flask import Request, Response
from psycopg2.pool import SimpleConnectionPool

_db_pool: SimpleConnectionPool | None = None


def get_db_pool() -> SimpleConnectionPool:
    global _db_pool

    if _db_pool is None:
        db_url = os.getenv("DATABASE_URL")

        if not db_url:
            raise RuntimeError("DATABASE_URL is not set")

        _db_pool = SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=db_url,
        )

    return _db_pool


def close_db_pool() -> None:
    global _db_pool

    if _db_pool is not None:
        _db_pool.closeall()
        _db_pool = None


class GraphQLContext:
    def __init__(
        self,
        db_pool: SimpleConnectionPool,
        request: Request,
        response: Response,
    ):
        self.db_pool = db_pool
        self.request = request
        self.response = response
