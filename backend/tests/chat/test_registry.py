"""Cross-checks the hand-authored document specs against catalog.json so the
two can't silently drift apart. Not read at runtime by the app - see
chat/registry.py."""

import json
from pathlib import Path

from app.chat.registry import REGISTRY
from app.chat.specs import ALL_SPECS

CATALOG_PATH = Path(__file__).resolve().parents[3] / "catalog.json"


def _catalog_entries() -> list[dict[str, str]]:
    return json.loads(CATALOG_PATH.read_text(encoding="utf-8"))


def test_every_spec_key_is_unique_kebab_case():
    keys = [spec.key for spec in ALL_SPECS]

    assert len(keys) == len(set(keys))
    for key in keys:
        assert key == key.lower()
        assert "_" not in key
        assert " " not in key


def test_every_catalog_entry_is_covered_by_exactly_one_spec():
    catalog = _catalog_entries()
    catalog_names = {entry["name"] for entry in catalog}
    catalog_filenames = {entry["filename"] for entry in catalog}

    spec_names = {name for spec in ALL_SPECS for name in spec.catalog_names}
    spec_filenames = {filename for spec in ALL_SPECS for filename in spec.catalog_filenames}

    assert spec_names == catalog_names
    assert spec_filenames == catalog_filenames


def test_every_spec_name_and_filename_pairs_match_catalog():
    catalog = _catalog_entries()
    catalog_by_name = {entry["name"]: entry["filename"] for entry in catalog}

    for spec in ALL_SPECS:
        for name, filename in zip(spec.catalog_names, spec.catalog_filenames, strict=True):
            assert catalog_by_name[name] == filename


def test_registry_is_keyed_by_spec_key():
    assert set(REGISTRY.keys()) == {spec.key for spec in ALL_SPECS}


def test_every_spec_field_key_is_used_in_its_declared_topic():
    for spec in ALL_SPECS:
        topic_set = set(spec.topics)
        for field in spec.fields:
            assert field.topic in topic_set, f"{spec.key}: field {field.key!r} has unknown topic {field.topic!r}"


def test_every_party_role_label_prefix_is_used_by_a_field():
    for spec in ALL_SPECS:
        prefixes = {f.key.split(".", 1)[0] for f in spec.fields if "." in f.key}
        for prefix in spec.party_role_labels:
            assert prefix in prefixes, f"{spec.key}: unused party_role_labels prefix {prefix!r}"
