"""The base of every wire model and the wire protocol version."""

from __future__ import annotations

from pydantic import (
    BaseModel,
    ConfigDict,
)
from pydantic.alias_generators import to_camel


class Wire(BaseModel):
    """Base for every wire model: camelCase aliases, populate by field name too, keep nulls."""

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel)


# Current wire protocol version. Bumped only on a breaking (major) wire change; additions within a
# major are backward compatible and do not change it. Mirrors io.mateu.dtos.UIIncrementDto.WIRE_VERSION.
WIRE_VERSION = "3.0"
