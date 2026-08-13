import os
from contextlib import asynccontextmanager

import asyncpg
import strawberry
from app.core.database import get_context
from app.features.auth.resolver import AuthMutation
from app.features.users.resolver import UserMutation, UserQuery
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

@strawberry.type
class Query(UserQuery):
    @strawberry.field
    def ping(self) -> str:
        return "pong"

@strawberry.type
class Mutation(AuthMutation, UserMutation):
    pass

schema = strawberry.Schema(query=Query, mutation=Mutation)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db_url = os.getenv("DATABASE_URL")
    app.state.pool = await asyncpg.create_pool(db_url)
    yield
    await app.state.pool.close()

app = FastAPI(lifespan=lifespan)

graphql_app = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_app, prefix="/graphql")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
