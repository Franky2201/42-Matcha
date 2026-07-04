import json
from app.main import app

def main():
    openapi_schema = app.openapi()
    print(json.dumps(openapi_schema, indent=2))

if __name__ == "__main__":
    main()
