# The Python twin (mateu-ui): the board is the view's component tree; where each card lives is a
# field (the view's state), and a move runs the method named by move_action_id.
from mateu_ui.core import RunActionRq
from mateu_ui.uidl import ComponentTreeSupplier, Message, action, ui
from mateu_ui.uidl import components as fluent

TASKS = (
    ("t1", "Reframe", "The Starry Night", "high"),
    ("t2", "Clean varnish", "Girl with a Pearl Earring", "normal"),
    ("t3", "Condition report", "The Night Watch", "normal"),
    ("t4", "Humidity check", "Water Lilies", "low"),
)


@ui("conservation-board")
class ConservationBoard(ComponentTreeSupplier):
    # card id → column id: the state of the board
    column_of: dict = {"t1": "todo", "t2": "todo", "t3": "doing", "t4": "done"}

    def component(self):
        return fluent.Kanban(
            move_action_id="moveTask",
            columns=(
                self.column("todo", "To do", "#64748b"),
                self.column("doing", "In progress", "#2563eb"),
                self.column("done", "Done", "#16a34a"),
            ),
        )

    def column(self, column_id, title, color):
        cards = tuple(
            fluent.KanbanCard(id=i, title=t, description=artwork, badge=priority)
            for i, t, artwork, priority in TASKS
            if self.column_of.get(i) == column_id
        )
        return fluent.KanbanColumn(id=column_id, title=title, color=color, cards=cards)

    @action
    def move_task(self, request: RunActionRq) -> Message:
        p = request.parameters or {}
        self.column_of = {**self.column_of, p["_cardId"]: p["_toColumnId"]}
        return Message(f"{p['_cardId']} → {p['_toColumnId']}")
