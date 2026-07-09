from fastapi.testclient import TestClient

from app import main
from app.chat.engine import ChatError

REQUEST_BODY = {
    "messages": [{"role": "user", "content": "I need an NDA"}],
    "documentType": None,
    "currentFields": {},
}


def test_chat_returns_matched_document_type_and_fields(monkeypatch):
    def fake_run_turn(document_type, history, fields):
        assert document_type is None
        assert fields == {}
        return "mutual-nda", "Let's draft your NDA. What's the purpose?", {"governingLaw": "Delaware"}, False

    monkeypatch.setattr(main, "run_turn", fake_run_turn)

    with TestClient(main.app) as client:
        response = client.post("/api/chat", json=REQUEST_BODY)

    assert response.status_code == 200
    body = response.json()
    assert body["documentType"] == "mutual-nda"
    assert body["fields"]["governingLaw"] == "Delaware"
    assert body["isComplete"] is False


def test_chat_returns_null_document_type_while_intake_is_unresolved(monkeypatch):
    def fake_run_turn(document_type, history, fields):
        return None, "We can't generate that, but here's the closest option...", {}, False

    monkeypatch.setattr(main, "run_turn", fake_run_turn)

    with TestClient(main.app) as client:
        response = client.post("/api/chat", json=REQUEST_BODY)

    assert response.status_code == 200
    assert response.json()["documentType"] is None


def test_chat_returns_502_when_the_ai_call_fails(monkeypatch):
    def fake_run_turn(document_type, history, fields):
        raise ChatError("Failed to get a response from the AI assistant.")

    monkeypatch.setattr(main, "run_turn", fake_run_turn)

    with TestClient(main.app) as client:
        response = client.post("/api/chat", json=REQUEST_BODY)

    assert response.status_code == 502
