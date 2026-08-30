import json


def generate_openapi_spec() -> dict:
    return {
        "openapi": "3.1.0",
        "info": {
            "title": "Matcha API",
            "version": "1.0.0",
        },
        "paths": {
            "/": {
                "get": {
                    "summary": "Root",
                    "operationId": "root__get",
                    "responses": {
                        "200": {
                            "description": "Successful Response",
                            "content": {"application/json": {"schema": {}}},
                        }
                    },
                }
            },
            "/graphql": {
                "get": {
                    "summary": "Handle Http Get",
                    "operationId": "handle_http_get_graphql_get",
                    "responses": {
                        "200": {"description": "GraphiQL IDE"},
                        "404": {"description": "Not found"},
                    },
                },
                "post": {
                    "summary": "Handle Http Post",
                    "operationId": "handle_http_post_graphql_post",
                    "responses": {"200": {"description": "Successful Response"}},
                },
            },
        },
    }


def main():
    openapi_schema = generate_openapi_spec()
    print(json.dumps(openapi_schema, indent=2))


if __name__ == "__main__":
    main()
