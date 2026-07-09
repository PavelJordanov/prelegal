import app.chat.engine as engine_module
from app.chat.engine import ChatError
from app.chat.intake import classify
from app.schemas import ChatMessage


class FakeMessage:
    def __init__(self, content: str):
        self.content = content


class FakeChoice:
    def __init__(self, content: str):
        self.message = FakeMessage(content)


class FakeResponse:
    def __init__(self, content: str):
        self.choices = [FakeChoice(content)]


def test_classify_returns_matched_key_and_message(monkeypatch):
    def fake_completion(**kwargs):
        return FakeResponse(
            '{"assistant_message": "Let\'s draft your NDA.", "matched_document_key": "mutual-nda"}'
        )

    monkeypatch.setattr(engine_module, "completion", fake_completion)

    matched_key, message = classify([ChatMessage(role="user", content="I need an NDA")])

    assert matched_key == "mutual-nda"
    assert message == "Let's draft your NDA."


def test_classify_returns_none_when_unmatched(monkeypatch):
    def fake_completion(**kwargs):
        return FakeResponse(
            '{"assistant_message": "We can\'t generate that.", "matched_document_key": null}'
        )

    monkeypatch.setattr(engine_module, "completion", fake_completion)

    matched_key, message = classify([ChatMessage(role="user", content="I need a will")])

    assert matched_key is None
    assert message == "We can't generate that."


def test_classify_wraps_completion_failures(monkeypatch):
    def fake_completion(**kwargs):
        raise RuntimeError("network down")

    monkeypatch.setattr(engine_module, "completion", fake_completion)

    try:
        classify([ChatMessage(role="user", content="hello")])
        assert False, "expected ChatError"
    except ChatError:
        pass
