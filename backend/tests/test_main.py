from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_ok():
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_resets_database_between_starts(tmp_path, monkeypatch):
    from app import db

    monkeypatch.setattr(db, "DATA_DIR", tmp_path)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "app.db")

    db.DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db.DB_PATH.write_text("stale contents")

    db.reset_database()

    assert db.DB_PATH.exists()
    assert db.DB_PATH.read_text() == ""
