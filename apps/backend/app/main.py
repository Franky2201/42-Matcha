from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Matcha API", version="1.0.0")

# Configure CORS origins for local and container development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://localhost",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    id: int
    name: str
    description: str | None = None
    price: float
    is_offer: bool | None = None

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/api/items", response_model=List[Item])
async def get_items():
    return [
        Item(id=1, name="Matcha Latte", price=4.5, description="Ceremonial grade matcha with oat milk"),
        Item(id=2, name="Matcha Ice Cream", price=3.99, is_offer=True)
    ]
