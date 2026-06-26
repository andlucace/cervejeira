import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import beers, transactions

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cervejeira API", version="1.0.0", docs_url="/docs")

allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(beers.router)
app.include_router(transactions.router)


@app.get("/")
def root():
    return {"message": "Cervejeira API — acesse /docs para a documentação"}
