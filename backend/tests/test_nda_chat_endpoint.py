from fastapi.testclient import TestClient

from app import main
from app.nda_chat import NdaChatError
from app.schemas import MndaFields

REQUEST_BODY = {
    "messages": [{"role": "user", "content": "Acme Inc and Beta LLC"}],
    "currentFields": {},
}


def test_nda_chat_returns_assistant_turn(monkeypatch):
    def fake_run_chat_turn(history, fields):
        assert fields == MndaFields()
        return "What's the purpose of this NDA?", MndaFields(governing_law="Delaware"), False

    monkeypatch.setattr(main, "run_chat_turn", fake_run_chat_turn)

    with TestClient(main.app) as client:
        response = client.post("/api/nda/chat", json=REQUEST_BODY)

    assert response.status_code == 200
    body = response.json()
    assert body["assistantMessage"] == "What's the purpose of this NDA?"
    assert body["fields"]["governingLaw"] == "Delaware"
    assert body["isComplete"] is False


def test_nda_chat_returns_502_when_the_ai_call_fails(monkeypatch):
    def fake_run_chat_turn(history, fields):
        raise NdaChatError("Failed to get a response from the AI assistant.")

    monkeypatch.setattr(main, "run_chat_turn", fake_run_chat_turn)

    with TestClient(main.app) as client:
        response = client.post("/api/nda/chat", json=REQUEST_BODY)

    assert response.status_code == 502
