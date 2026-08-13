import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import router

app = FastAPI(
    title="Datavue HealthPrint API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("output", exist_ok=True)

app.include_router(router)

app.mount(
    "/pdfs",
    StaticFiles(directory="output"),
    name="pdfs"
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Datavue HealthPrint"
    }
