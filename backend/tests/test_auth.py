from fastapi.testclient import TestClient

from app.main import app


def test_signup_creates_a_user_and_signs_them_in():
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/signup", json={"email": "New.User@Example.com", "password": "password123"}
        )

        assert response.status_code == 201
        assert response.json()["email"] == "new.user@example.com"
        assert "access_token" in response.cookies

        me = client.get("/api/auth/me")
        assert me.status_code == 200
        assert me.json()["email"] == "new.user@example.com"


def test_signup_rejects_a_duplicate_email():
    with TestClient(app) as client:
        client.post("/api/auth/signup", json={"email": "dup@example.com", "password": "password123"})
        response = client.post(
            "/api/auth/signup", json={"email": "dup@example.com", "password": "password123"}
        )

    assert response.status_code == 409


def test_signup_rejects_a_short_password():
    with TestClient(app) as client:
        response = client.post("/api/auth/signup", json={"email": "a@example.com", "password": "short"})

    assert response.status_code == 422


def test_signup_rejects_an_invalid_email():
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/signup", json={"email": "not-an-email", "password": "password123"}
        )

    assert response.status_code == 422


def test_signin_with_correct_credentials_succeeds():
    with TestClient(app) as client:
        client.post("/api/auth/signup", json={"email": "signin@example.com", "password": "password123"})
        client.post("/api/auth/signout")

        response = client.post(
            "/api/auth/signin", json={"email": "signin@example.com", "password": "password123"}
        )

    assert response.status_code == 200
    assert response.json()["email"] == "signin@example.com"


def test_signin_with_wrong_password_fails():
    with TestClient(app) as client:
        client.post("/api/auth/signup", json={"email": "wrongpw@example.com", "password": "password123"})
        client.post("/api/auth/signout")

        response = client.post(
            "/api/auth/signin", json={"email": "wrongpw@example.com", "password": "nope12345"}
        )

    assert response.status_code == 401


def test_signin_with_unknown_email_fails():
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/signin", json={"email": "nobody@example.com", "password": "password123"}
        )

    assert response.status_code == 401


def test_signout_ends_the_session():
    with TestClient(app) as client:
        client.post("/api/auth/signup", json={"email": "out@example.com", "password": "password123"})

        client.post("/api/auth/signout")
        response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_requires_authentication():
    with TestClient(app) as client:
        response = client.get("/api/auth/me")

    assert response.status_code == 401
