from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from app import db
from app.nda_chat import NdaChatError, run_chat_turn
from app.schemas import NdaChatRequest, NdaChatResponse

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.reset_database()
    yield


app = FastAPI(title="Prelegal API", lifespan=lifespan)


@app.get("/api/health")
def health() -> dict[str, str]:
    with db.get_connection() as conn:
        conn.execute("SELECT 1")
    return {"status": "ok"}


@app.post("/api/nda/chat")
def nda_chat(request: NdaChatRequest) -> NdaChatResponse:
    try:
        assistant_message, fields, is_complete = run_chat_turn(
            request.messages, request.current_fields
        )
    except NdaChatError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return NdaChatResponse(
        assistant_message=assistant_message, fields=fields, is_complete=is_complete
    )


if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
