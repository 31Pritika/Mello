from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.auth_routes import router as auth_router
from routes.content_routes import router as content_router
from routes.circle_routes import router as circle_router
from routes.matching_routes import router as matching_router

load_dotenv()

app = FastAPI(title="Mello API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(content_router)
app.include_router(circle_router)
app.include_router(matching_router)

@app.get("/")
def root():
    return {"status": "Mello API running", "version": "1.0.0"}