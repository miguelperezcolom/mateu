"""M-S9: a single string in an identity dimension is ONE name, not a tuple of letters."""

import pytest

from mateu_uidl.security import (
    Access,
    DisabledUnless,
    EyesOnly,
    Identity,
    ReadOnlyUnless,
    disabled_unless,
    eyes_only,
)


@pytest.mark.parametrize("gate", [EyesOnly, ReadOnlyUnless, DisabledUnless, Access, Identity])
def test_a_string_dimension_is_one_name(gate):
    g = gate(roles="admin", groups="hr", scopes="read", permissions="orders:write")
    assert g.roles == ("admin",)
    assert g.groups == ("hr",)
    assert g.scopes == ("read",)
    assert g.permissions == ("orders:write",)


@pytest.mark.parametrize("gate", [EyesOnly, ReadOnlyUnless, DisabledUnless, Access, Identity])
def test_a_list_dimension_is_kept_and_frozen_as_a_tuple(gate):
    g = gate(roles=["admin", "hr"])
    assert g.roles == ("admin", "hr")
    assert gate(roles=["admin"]) == gate(roles=("admin",)) == gate(roles="admin")


@pytest.mark.parametrize("bad", [42, object(), ["admin", 3]])
def test_a_non_string_dimension_is_rejected(bad):
    with pytest.raises(TypeError, match="roles"):
        EyesOnly(roles=bad)


def test_the_decorators_take_a_string_too():
    @eyes_only("admin")
    class AdminOnly:
        pass

    class Page:
        @disabled_unless(permissions="orders:write")
        def save(self):
            pass

    assert AdminOnly.__mateu_eyes_only__.roles == ("admin",)
    assert Page.save.__mateu_disabled_unless__.permissions == ("orders:write",)
    with pytest.raises(TypeError):
        eyes_only(roles=7)


def test_a_string_role_gate_names_the_role_not_its_letters():
    gate = EyesOnly(roles="admin")
    assert "admin" in gate.roles
    assert "a" not in gate.roles
