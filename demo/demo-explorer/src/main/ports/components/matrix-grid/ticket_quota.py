# The Python twin (mateu-ui): an editable quota row and clickable "sold" cells; both actions get
# _rowId, _columnId and _value.
from datetime import date, timedelta

from mateu_ui.core import RunActionRq
from mateu_ui.uidl import ComponentTreeSupplier, Message, action, ui
from mateu_ui.uidl import components as fluent

FROM = date(2026, 11, 9)
SOLD = (120, 95, 140, 180, 210, 260, 240)


@ui("ticket-quota")
class TicketQuota(ComponentTreeSupplier):
    # day (ISO date) → quota: the editable state
    quota: dict = {}

    def component(self):
        days = [FROM + timedelta(days=i) for i in range(len(SOLD))]
        quota_of = lambda d: int(self.quota.get(d.isoformat(), 250))  # noqa: E731
        return fluent.MatrixGrid(
            row_header_label="Timed entry · 10:00",
            columns=tuple(fluent.MatrixColumn(id=d.isoformat(), label=str(d.day), group="November") for d in days),
            sections=(
                fluent.MatrixSection(id="tickets", title="Tickets", rows=(
                    fluent.MatrixRow(id="quota", label="Quota", editable=True,
                                     cells=tuple(fluent.MatrixCell.of(quota_of(d)) for d in days)),
                    fluent.MatrixRow(id="sold", label="Sold",
                                     cells=tuple(fluent.MatrixCell(str(s), link=True) for s in SOLD)),
                    fluent.MatrixRow(id="left", label="Left", emphasis=True,
                                     cells=tuple(fluent.MatrixCell.of(quota_of(d) - s) for d, s in zip(days, SOLD))),
                )),
            ),
            edit_action_id="quotaEdited",
            cell_action_id="cellClicked",
        )

    @action
    def quota_edited(self, request: RunActionRq) -> Message:
        p = request.parameters or {}
        self.quota = {**self.quota, p["_columnId"]: int(p["_value"])}
        return Message(f"Quota for {p['_columnId']} is now {p['_value']}")

    @action
    def cell_clicked(self, request: RunActionRq) -> Message:
        p = request.parameters or {}
        return Message(f"{p['_value']} tickets sold on {p['_columnId']}")
