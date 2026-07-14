from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from app import db
from app.chat.engine import ChatError
from app.chat.orchestrate import run_turn
from app.schemas import ChatTurnRequest, ChatTurnResponse

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


@app.post("/api/chat")
def chat(request: ChatTurnRequest) -> ChatTurnResponse:
    try:
        document_type, message, fields, complete = run_turn(
            request.document_type, request.messages, request.current_fields
        )
    except ChatError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return ChatTurnResponse(
        document_type=document_type, assistant_message=message, fields=fields, is_complete=complete
    )


if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
