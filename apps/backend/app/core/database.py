import asyncpg
from fastapi import Request
from strawberry.fastapi import BaseContext


class GraphQLContext(BaseContext):
    def __init__(self, db_pool: asyncpg.Pool, request: Request):
        self.db_pool = db_pool
        self.request = request


async def get_context(request: Request) -> GraphQLContext:
    return GraphQLContext(db_pool=request.app.state.pool, request=request)
