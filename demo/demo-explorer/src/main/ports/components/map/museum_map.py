# The Python twin (mateu-ui): a component-tree view returning a Map; a marker click runs the
# method named by marker_action_id, with the marker id in _markerId.
from mateu_ui.core import RunActionRq
from mateu_ui.uidl import ComponentTreeSupplier, Message, action, ui
from mateu_ui.uidl import components as fluent

MUSEUMS = (
    fluent.MapMarker(id="louvre", latitude=48.8606, longitude=2.3376, label="Louvre",
                     description="35,000 works on display"),
    fluent.MapMarker(id="orsay", latitude=48.8600, longitude=2.3266, label="Musée d'Orsay",
                     description="Impressionism", color="#2563eb"),
    fluent.MapMarker(id="pompidou", latitude=48.8607, longitude=2.3522, label="Centre Pompidou",
                     description="Modern art", color="#dc2626"),
)


@ui("museum-map")
class MuseumMap(ComponentTreeSupplier):
    def component(self):
        return fluent.Map(markers=MUSEUMS, marker_action_id="museumClicked",
                          style="height: 22rem; width: 100%;")

    @action
    def museum_clicked(self, request: RunActionRq) -> Message:
        marker_id = (request.parameters or {}).get("_markerId")
        museum = next(m for m in MUSEUMS if m.id == marker_id)
        return Message(f"{museum.label} — {museum.description}")
