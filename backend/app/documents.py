"""Persistence for chat-drafted documents.

A document row is created once the chat's intake step classifies a document
type (see ``app/main.py``'s ``/api/chat`` handler) and updated on every turn
after that - covering both in-progress drafts (``is_complete=False``) and
finished documents, so a user can resume an unfinished conversation or
revisit a finished one from "My Documents". The chat engine itself stays
stateless (see ``chat/engine.py``); this module is a persistence side-effect
layered on top of it, not a change to how a turn is computed.
"""

import json
import sqlite3

from app import db
from app.schemas import ChatMessage, DocumentDetail, DocumentSummary, FieldValue


def _serialize_messages(messages: list[ChatMessage]) -> str:
    return json.dumps([m.model_dump(mode="json") for m in messages])


def _deserialize_messages(raw: str) -> list[ChatMessage]:
    return [ChatMessage.model_validate(m) for m in json.loads(raw)]


def _row_to_summary(row: sqlite3.Row) -> DocumentSummary:
    return DocumentSummary(
        id=row["id"],
        document_type=row["document_type"],
        is_complete=bool(row["is_complete"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def create(
    user_id: int,
    document_type: str,
    fields: dict[str, FieldValue],
    messages: list[ChatMessage],
    is_complete: bool,
) -> int:
    with db.get_connection() as conn:
        cursor = conn.execute(
            """INSERT INTO documents (user_id, document_type, fields, messages, is_complete)
               VALUES (?, ?, ?, ?, ?)""",
            (user_id, document_type, json.dumps(fields), _serialize_messages(messages), int(is_complete)),
        )
        assert cursor.lastrowid is not None
        return cursor.lastrowid


def update(
    document_id: int, fields: dict[str, FieldValue], messages: list[ChatMessage], is_complete: bool
) -> None:
    with db.get_connection() as conn:
        conn.execute(
            """UPDATE documents SET fields = ?, messages = ?, is_complete = ?, updated_at = datetime('now')
               WHERE id = ?""",
            (json.dumps(fields), _serialize_messages(messages), int(is_complete), document_id),
        )


def list_for_user(user_id: int) -> list[DocumentSummary]:
    with db.get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC", (user_id,)
        ).fetchall()
    return [_row_to_summary(row) for row in rows]


def get_owned(document_id: int, user_id: int) -> DocumentDetail | None:
    with db.get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM documents WHERE id = ? AND user_id = ?", (document_id, user_id)
        ).fetchone()
    if row is None:
        return None
    return DocumentDetail(
        **_row_to_summary(row).model_dump(),
        fields=json.loads(row["fields"]),
        messages=_deserialize_messages(row["messages"]),
    )


def is_owned(document_id: int, user_id: int) -> bool:
    with db.get_connection() as conn:
        row = conn.execute(
            "SELECT 1 FROM documents WHERE id = ? AND user_id = ?", (document_id, user_id)
        ).fetchone()
    return row is not None


def delete_owned(document_id: int, user_id: int) -> bool:
    with db.get_connection() as conn:
        cursor = conn.execute("DELETE FROM documents WHERE id = ? AND user_id = ?", (document_id, user_id))
        return cursor.rowcount > 0
