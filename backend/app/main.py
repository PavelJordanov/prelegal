from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles

from app import db, documents
from app.auth.deps import get_current_user
from app.auth.router import router as auth_router
from app.chat.engine import ChatError
from app.chat.orchestrate import run_turn
from app.documents_router import router as documents_router
from app.schemas import ChatMessage, ChatTurnRequest, ChatTurnResponse, UserResponse

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.reset_database()
    yield


app = FastAPI(title="Prelegal API", lifespan=lifespan)
app.include_router(auth_router)
app.include_router(documents_router)


@app.get("/api/health")
def health() -> dict[str, str]:
    with db.get_connection() as conn:
        conn.execute("SELECT 1")
    return {"status": "ok"}


@app.post("/api/chat")
def chat(
    request: ChatTurnRequest, current_user: UserResponse = Depends(get_current_user)
) -> ChatTurnResponse:
    if request.document_id is not None and not documents.is_owned(request.document_id, current_user.id):
        raise HTTPException(status_code=404, detail="Document not found.")

    try:
        document_type, message, fields, complete = run_turn(
            request.document_type, request.messages, request.current_fields
        )
    except ChatError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    document_id = request.document_id
    if document_type is not None:
        full_history = [*request.messages, ChatMessage(role="assistant", content=message)]
        if document_id is None:
            document_id = documents.create(current_user.id, document_type, fields, full_history, complete)
        else:
            documents.update(document_id, fields, full_history, complete)

    return ChatTurnResponse(
        document_id=document_id,
        document_type=document_type,
        assistant_message=message,
        fields=fields,
        is_complete=complete,
    )


if FRONTEND_DIST.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
