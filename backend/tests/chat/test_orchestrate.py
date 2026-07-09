import app.chat.orchestrate as orchestrate_module
from app.chat.orchestrate import run_turn


def test_run_turn_classifies_when_document_type_is_unknown(monkeypatch):
    def fake_classify(history):
        return "mutual-nda", "Let's draft your NDA."

    def fake_run_field_turn(spec, history, fields):
        assert spec.key == "mutual-nda"
        return "What's the purpose?", fields | {"purpose": "Testing."}, False

    monkeypatch.setattr(orchestrate_module, "classify", fake_classify)
    monkeypatch.setattr(orchestrate_module, "run_field_turn", fake_run_field_turn)

    document_type, message, fields, complete = run_turn(None, [], {})

    assert document_type == "mutual-nda"
    assert message == "What's the purpose?"
    assert fields["purpose"] == "Testing."
    assert complete is False


def test_run_turn_returns_none_type_when_intake_does_not_match(monkeypatch):
    def fake_classify(history):
        return None, "We can't generate that, but here's the closest option..."

    monkeypatch.setattr(orchestrate_module, "classify", fake_classify)

    document_type, message, fields, complete = run_turn(None, [], {})

    assert document_type is None
    assert fields == {}
    assert complete is False


def test_run_turn_continues_known_document_type(monkeypatch):
    def fake_run_field_turn(spec, history, fields):
        assert spec.key == "mutual-nda"
        return "Great, what about party 2?", fields | {"governingLaw": "Delaware"}, False

    monkeypatch.setattr(orchestrate_module, "run_field_turn", fake_run_field_turn)

    document_type, message, fields, complete = run_turn("mutual-nda", [], {"purpose": "Testing."})

    assert document_type == "mutual-nda"
    assert fields["governingLaw"] == "Delaware"
    assert fields["purpose"] == "Testing."


def test_run_turn_raises_for_unknown_document_type():
    from app.chat.engine import ChatError

    try:
        run_turn("not-a-real-doc", [], {})
        assert False, "expected ChatError"
    except ChatError:
        pass
