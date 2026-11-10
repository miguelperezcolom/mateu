# island-data

**Pins:** an `EmbeddedView` island carries its OWN data (`ServerSideComponentDto.data`): the
lookup label (`supplier-label`) and the selected option page of the embedded view, which has no
fragment of its own to carry them. Only the island has `data`; the host's fragment has none.
