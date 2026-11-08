# The Python twin (mateu-ui): the same archetype — group_of buckets the cards, a click runs
# action_on (a Message here; a route string would navigate).
from dataclasses import dataclass

from mateu_ui.uidl import Message, MessageVariant, TodoList, ui
from mateu_ui.uidl.components import ChipItem


@dataclass(frozen=True)
class Task:
    id: str
    title: str
    object: str
    bucket: str
    due: str
    priority: str


TASKS = [
    Task("T-1", "Check the humidity log — gallery 4", "Room 4", "Today", "overdue", "high"),
    Task("T-2", "Condition report before the loan", "Water Lilies", "Today", "today", "high"),
    Task("T-3", "Re-frame the Dürer print", "Melencolia I", "This week", "in 2 days", ""),
    Task("T-4", "Clean the bronze casts", "Sculpture hall", "This week", "in 4 days", "medium"),
    Task("T-5", "Order archival boxes", "Photography store", "Later", "in 3 weeks", "low"),
]


@ui("todo-list")
class ConservationTasks(TodoList):
    def rows(self, http_request):
        return TASKS

    def id_of(self, task):
        return task.id

    def title_of(self, task):
        return task.title

    def caption_of(self, task):
        return task.object

    def badges_of(self, task):
        due = ChipItem(label=task.due)
        return (due,) if not task.priority else (due, ChipItem(label=task.priority))

    def group_of(self, task):
        return task.bucket

    def group_order(self):
        return ("Today", "This week", "Later")

    def action_on(self, task, http_request):
        return Message(f"Opening “{task.title}”", MessageVariant.SUCCESS)
