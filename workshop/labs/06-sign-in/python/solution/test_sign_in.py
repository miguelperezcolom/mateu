"""Workshop, lab 06: the access rule, tested with no Keycloak at all — the harness opens the screen
as a given identity, exactly as Mateu reads the one the middleware established from the token."""

from fastapi.testclient import TestClient
from mateu_ui.core.identity import identity_from_claims
from mateu_ui.testing import MateuTest

import main
import views


def test_a_clerk_sees_no_discount():
    assert not MateuTest(views).open("/quote", MateuTest.user("clerk")).has_field("discount")


def test_anonymous_sees_no_discount_either():
    assert not MateuTest(views).open("/quote").has_field("discount")


def test_a_manager_gives_a_discount():
    quote = MateuTest(views).open("/quote", MateuTest.user("manager"))
    quote.field("quantity").set(2)
    quote.field("unitPrice").set(50.0)
    quote.field("discount").set(20)
    quote.button("Calculate").press()
    assert quote.field("total").value == 80.0


def test_the_roles_of_a_keycloak_token_count():
    # what an access token of labs/06-sign-in/keycloak carries (its "roles" mapper)
    ada = identity_from_claims({"sub": "ada", "preferred_username": "ada", "roles": ["manager"]})
    assert MateuTest(views).open("/quote", ada).has_field("discount")


def test_a_mateu_call_without_a_token_is_refused():
    r = TestClient(main.app).post("/mateu/v3/sync/quote", json={"route": "quote", "actionId": "", "componentState": {}})
    assert r.status_code == 401

