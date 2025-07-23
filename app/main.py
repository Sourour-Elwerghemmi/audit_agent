import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.routes import router 

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

app = FastAPI(
    title="API d'Audit Web",
    description="Analyse SEO et visibilité Google Business (Gemini)",
    version="1.0.0"
)

static_dir = PROJECT_ROOT / "static"
if not static_dir.exists():
    raise RuntimeError(f"Dossier statique non trouvé : {static_dir}")

frontend_dir = PROJECT_ROOT / "frontend"
if not frontend_dir.exists():
    raise RuntimeError(f"Dossier frontend non trouvé : {frontend_dir}")

app.mount("/static", StaticFiles(directory=static_dir), name="static")
templates = Jinja2Templates(directory=str(frontend_dir))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router) 

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/ping")
async def ping():
    return {"message": "pong"}
