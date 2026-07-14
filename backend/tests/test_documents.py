from fastapi.testclient import TestClient

from app import main

CHAT_BODY = {
    "messages": [{"role": "user", "content": "I need an NDA"}],
    "documentId": None,
    "documentType": None,
    "currentFields": {},
}


def _sign_up(client: TestClient, email: str) -> None:
    response = client.post("/api/auth/signup", json={"email": email, "password": "password123"})
    assert response.status_code == 201


def _create_document(client: TestClient, monkeypatch) -> int:
    monkeypatch.setattr(
        main, "run_turn", lambda document_type, history, fields: ("mutual-nda", "Hi", {"purpose": "x"}, False)
    )
    return client.post("/api/chat", json=CHAT_BODY).json()["documentId"]


def test_list_documents_is_empty_for_a_new_user():
    with TestClient(main.app) as client:
        _sign_up(client, "empty@example.com")
        response = client.get("/api/documents")

    assert response.status_code == 200
    assert response.json() == []


def test_list_and_get_document_after_a_chat_turn(monkeypatch):
    with TestClient(main.app) as client:
        _sign_up(client, "lister@example.com")
        document_id = _create_document(client, monkeypatch)

        listing = client.get("/api/documents")
        detail = client.get(f"/api/documents/{document_id}")

    assert listing.status_code == 200
    summaries = listing.json()
    assert len(summaries) == 1
    assert summaries[0]["id"] == document_id
    assert summaries[0]["documentType"] == "mutual-nda"
    assert summaries[0]["isComplete"] is False

    assert detail.status_code == 200
    body = detail.json()
    assert body["fields"]["purpose"] == "x"
    assert body["messages"][-1] == {"role": "assistant", "content": "Hi"}


def test_get_document_not_found_returns_404():
    with TestClient(main.app) as client:
        _sign_up(client, "notfound@example.com")
        response = client.get("/api/documents/999")

    assert response.status_code == 404


def test_users_cannot_see_each_others_documents(monkeypatch):
    with TestClient(main.app) as client:
        _sign_up(client, "owner2@example.com")
        document_id = _create_document(client, monkeypatch)
        client.post("/api/auth/signout")

        _sign_up(client, "other@example.com")
        get_response = client.get(f"/api/documents/{document_id}")
        list_response = client.get("/api/documents")

    assert get_response.status_code == 404
    assert list_response.json() == []


def test_delete_document_removes_it(monkeypatch):
    with TestClient(main.app) as client:
        _sign_up(client, "deleter@example.com")
        document_id = _create_document(client, monkeypatch)

        delete_response = client.delete(f"/api/documents/{document_id}")
        get_response = client.get(f"/api/documents/{document_id}")

    assert delete_response.status_code == 204
    assert get_response.status_code == 404


def test_delete_document_owned_by_another_user_returns_404(monkeypatch):
    with TestClient(main.app) as client:
        _sign_up(client, "owner3@example.com")
        document_id = _create_document(client, monkeypatch)
        client.post("/api/auth/signout")

        _sign_up(client, "attacker@example.com")
        response = client.delete(f"/api/documents/{document_id}")

    assert response.status_code == 404


def test_documents_require_authentication():
    with TestClient(main.app) as client:
        response = client.get("/api/documents")

    assert response.status_code == 401
