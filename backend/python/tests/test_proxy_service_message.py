"""What a failed proxied call tells the user: the service's own message (Java's
RestProxyServiceMessageTest and the browser's serviceMessage tests — the same cases)."""

from mateu_ui.core.sync_handler.proxy import _restfetch_error, service_message_of


def test_the_usual_error_shapes_give_their_message_in_order():
    assert (
        service_message_of('{"status":400,"error":"Bad Request","message":"Image larger than 2 MB"}')
        == "Image larger than 2 MB"
    )
    assert service_message_of('{"title":"Invalid","detail":"Name is required"}') == "Name is required"
    assert service_message_of('{"error":"not allowed"}') == "not allowed"
    assert service_message_of('{"error":{"message":"quota exceeded"}}') == "quota exceeded"
    assert service_message_of('{"title":"Conflict"}') == "Conflict"
    assert service_message_of("Astronaut still on a crew") == "Astronaut still on a crew"


def test_nothing_worth_showing_gives_none():
    for body in (None, "  ", "<html><body>502</body></html>", "[1,2]", "x" * 301, '{"status":500}', "{not json"):
        assert service_message_of(body) is None, body


def test_control_characters_go_and_a_long_message_is_clipped():
    assert service_message_of('{"message":"two\\u0007\\n  lines"}') == "two lines"
    clipped = service_message_of('{"message":"' + "y" * 400 + '"}')
    assert len(clipped) == 300 and clipped.endswith("…")


def test_the_error_carries_the_detail_only_when_there_is_one():
    with_detail = _restfetch_error(400, "Image larger than 2 MB").app_data["_restfetchError"]
    assert with_detail == {"status": 400, "message": "Request failed (HTTP 400)", "detail": "Image larger than 2 MB"}
    without = _restfetch_error(500).app_data["_restfetchError"]
    assert without == {"status": 500, "message": "Request failed (HTTP 500)"}
