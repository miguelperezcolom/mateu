"""URL templates encode by position — same cases as Java TemplateInterpolatorUrlTest, libs/mateu
interpolateUrl.test.ts and .NET UrlTemplateTests: both legs must reach the same url."""

import pytest

from mateu_core.sync_handler import SyncHandler
from mateu_core.url_template import interpolate_url, secret_env_name


def url(template, state, secrets=None):
    secrets = secrets or {}

    def value_of(expr):
        if expr.startswith("state."):
            v = state.get(expr[6:])
            return "" if v is None else str(v)
        if expr.startswith("secret."):
            return secrets.get(expr[7:], "")
        return ""

    return interpolate_url(template, value_of)


def test_a_path_value_cannot_add_segments_or_a_query():
    assert (
        url("https://api.example.com/people/${state.id}", {"id": "1/../../admin?x="})
        == "https://api.example.com/people/1%2F..%2F..%2Fadmin%3Fx%3D"
    )


def test_a_query_value_cannot_add_parameters():
    assert (
        url("/search?q=${state.q}&page=1", {"q": "a b&page=99#frag"})
        == "/search?q=a%20b%26page%3D99%23frag&page=1"
    )


def test_reserved_and_unicode_characters_are_encoded_like_the_other_backends():
    assert url("/x/${state.v}", {"v": "Ñandú !'()*~._-"}) == "/x/%C3%91and%C3%BA%20%21%27%28%29%2A~._-"


def test_a_secret_in_the_query_is_encoded_and_a_configured_origin_is_raw():
    secrets = {"KEY": "a&b=c d", "BASE": "https://api.example.com/v1"}
    assert url("https://h/x?key=${secret.KEY}", {}, secrets) == "https://h/x?key=a%26b%3Dc%20d"
    assert url("${secret.BASE}/people/${state.id}", {"id": 7}, secrets) == "https://api.example.com/v1/people/7"


def test_client_state_cannot_choose_the_origin():
    with pytest.raises(ValueError):
        url("${state.base}/people", {"base": "http://169.254.169.254"})
    with pytest.raises(ValueError):
        url("https://${state.host}/people", {"host": "evil"})


def test_a_dot_segment_is_refused_in_the_path_but_not_in_the_query():
    with pytest.raises(ValueError):
        url("/people/${state.id}", {"id": ".."})
    assert url("/people?id=${state.id}", {"id": ".."}) == "/people?id=.."


def test_missing_values_and_templates_without_placeholders():
    assert url("/people/${state.missing}", {}) == "/people/"
    assert url("https://h/x", {}) == "https://h/x"
    assert url(None, {}) == ""


def test_secret_env_fallback_reads_only_prefixed_variables(monkeypatch):
    monkeypatch.setenv("DATABASE_PASSWORD", "hunter2")
    monkeypatch.setenv("MATEU_SECRET_API_TOKEN", "tok")
    handler = SyncHandler.__new__(SyncHandler)
    handler._secrets = None
    assert handler._resolve_secret("DATABASE_PASSWORD") is None
    assert handler._resolve_secret("API_TOKEN") == "tok"
    assert handler._resolve_secret("MATEU_SECRET_API_TOKEN") == "tok"
    assert secret_env_name("X") == "MATEU_SECRET_X"
