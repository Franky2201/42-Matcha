import strawberry
from flask import Flask, Request, Response, jsonify
from flask_cors import CORS
from strawberry.flask.views import GraphQLView

from app.core.database import GraphQLContext, get_db_pool
from app.features.auth.resolver import AuthMutation
from app.features.users.resolver import UserMutation, UserQuery

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


class CustomGraphQLView(GraphQLView):
    def get_context(self, request: Request, response: Response) -> GraphQLContext:
        pool = get_db_pool()
        return GraphQLContext(db_pool=pool, request=request, response=response)


app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": origins}},
    supports_credentials=True,
)


@app.route("/")
def root():
    return jsonify({"status": "ok"})


app.add_url_rule(
    "/graphql",
    view_func=CustomGraphQLView.as_view("graphql_view", schema=schema),
)
