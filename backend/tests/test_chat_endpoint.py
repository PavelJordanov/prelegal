from fastapi.testclient import TestClient

from app import main
from app.chat.engine import ChatError

REQUEST_BODY = {
    "messages": [{"role": "user", "content": "I need an NDA"}],
    "documentId": None,
    "documentType": None,
    "currentFields": {},
}


def _sign_up(client: TestClient, email: str = "chat-user@example.com") -> None:
    response = client.post("/api/auth/signup", json={"email": email, "password": "password123"})
    assert response.status_code == 201


def test_chat_returns_matched_document_type_and_fields(monkeypatch):
    def fake_run_turn(document_type, history, fields):
        assert document_type is None
        assert fields == {}
        return "mutual-nda", "Let's draft your NDA. What's the purpose?", {"governingLaw": "Delaware"}, False

    monkeypatch.setattr(main, "run_turn", fake_run_turn)

    with TestClient(main.app) as client:
        _sign_up(client)
        response = client.post("/api/chat", json=REQUEST_BODY)

    assert response.status_code == 200
    body = response.json()
    assert body["documentType"] == "mutual-nda"
    assert body["fields"]["governingLaw"] == "Delaware"
    assert body["isComplete"] is False
    assert body["documentId"] is not None


def test_chat_returns_null_document_type_while_intake_is_unresolved(monkeypatch):
    def fake_run_turn(document_type, history, fields):
        return None, "We can't generate that, but here's the closest option...", {}, False

    monkeypatch.setattr(main, "run_turn", fake_run_turn)

    with TestClient(main.app) as client:
        _sign_up(client)
        response = client.post("/api/chat", json=REQUEST_BODY)

    assert response.status_code == 200
    body = response.json()
    assert body["documentType"] is None
    assert body["documentId"] is None


def test_chat_persists_the_document_and_resumes_by_id(monkeypatch):
    calls = []

    def fake_run_turn(document_type, history, fields):
        calls.append((document_type, fields))
        return "mutual-nda", "Great, what's next?", {"purpose": "Evaluating a deal"}, False

    monkeypatch.setattr(main, "run_turn", fake_run_turn)

    with TestClient(main.app) as client:
        _sign_up(client)
        first = client.post("/api/chat", json=REQUEST_BODY).json()
        document_id = first["documentId"]

        second_body = {
            "messages": REQUEST_BODY["messages"],
            "documentId": document_id,
            "documentType": "mutual-nda",
            "currentFields": first["fields"],
        }
        second = client.post("/api/chat", json=second_body)

        detail = client.get(f"/api/documents/{document_id}")

    assert second.status_code == 200
    assert second.json()["documentId"] == document_id
    assert detail.status_code == 200
    assert detail.json()["fields"]["purpose"] == "Evaluating a deal"


def test_chat_rejects_a_document_id_owned_by_another_user(monkeypatch):
    def fake_run_turn(document_type, history, fields):
        return "mutual-nda", "Hi", {}, False

    monkeypatch.setattr(main, "run_turn", fake_run_turn)

    with TestClient(main.app) as client:
        _sign_up(client, "owner@example.com")
        owned_id = client.post("/api/chat", json=REQUEST_BODY).json()["documentId"]
        client.post("/api/auth/signout")

        _sign_up(client, "intruder@example.com")
        body = {**REQUEST_BODY, "documentId": owned_id}
        response = client.post("/api/chat", json=body)

    assert response.status_code == 404


def test_chat_returns_502_when_the_ai_call_fails(monkeypatch):
    def fake_run_turn(document_type, history, fields):
        raise ChatError("Failed to get a response from the AI assistant.")

    monkeypatch.setattr(main, "run_turn", fake_run_turn)

    with TestClient(main.app) as client:
        _sign_up(client)
        response = client.post("/api/chat", json=REQUEST_BODY)

    assert response.status_code == 502


def test_chat_requires_authentication(monkeypatch):
    def fake_run_turn(document_type, history, fields):
        raise AssertionError("should not be called when unauthenticated")

    monkeypatch.setattr(main, "run_turn", fake_run_turn)

    with TestClient(main.app) as client:
        response = client.post("/api/chat", json=REQUEST_BODY)

    assert response.status_code == 401
