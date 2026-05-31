from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import founder, chat, session

app = FastAPI(title="Junto API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://junto.ink",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(founder.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(session.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
