import os

import strawberry
from flask import Flask, Request, Response, jsonify, send_from_directory
from flask_cors import CORS
from strawberry.flask.views import GraphQLView

from app.core.database import GraphQLContext, get_db_pool
from app.core.oauth import init_oauth
from app.features.auth.resolver import AuthMutation
from app.features.auth.rest import auth_bp
from app.features.users.resolver import UserMutation, UserQuery
from app.features.explore.resolver import ExploreQuery

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


@strawberry.type
class Query(UserQuery, ExploreQuery):
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
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "default-dev-secret-key")

CORS(
    app,
    resources={r"/*": {"origins": origins}},
    supports_credentials=True,
)


try:
    pool = get_db_pool()
    app.config["DB_POOL"] = pool
except RuntimeError as e:
    print(f"⚠️ Avertissement : Base de données non connectée ({e}).")
except Exception as e:
    print(f"⚠️ Avertissement : Erreur de connexion DB ({e}).")

init_oauth(app)
app.register_blueprint(auth_bp)


@app.route("/")
def root():
    return jsonify({"status": "ok"})


@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(os.path.abspath("uploads"), filename)


app.add_url_rule(
    "/graphql",
    view_func=CustomGraphQLView.as_view("graphql_view", schema=schema),
)
