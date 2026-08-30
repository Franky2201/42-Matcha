import strawberry
from flask import Flask, jsonify
from flask_cors import CORS
from strawberry.flask.views import AsyncGraphQLView

from app.core.database import get_context
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
    view_func=AsyncGraphQLView.as_view(
        "graphql_view", schema=schema, context_getter=get_context
    ),
)
