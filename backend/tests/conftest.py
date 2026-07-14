import pytest


@pytest.fixture(autouse=True)
def _jwt_secret(monkeypatch):
    monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-pytest-only-not-for-production-use")


@pytest.fixture(autouse=True)
def _isolated_database(tmp_path, monkeypatch):
    """Point every test at its own throwaway SQLite file instead of the real
    backend/data/app.db - keeps test runs isolated from each other and from
    any dev server that happens to be running locally against that file."""
    from app import db

    monkeypatch.setattr(db, "DATA_DIR", tmp_path)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "app.db")
