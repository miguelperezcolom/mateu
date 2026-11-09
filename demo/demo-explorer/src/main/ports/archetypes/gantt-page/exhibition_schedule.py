# The Python twin (mateu-ui): the same archetype — tasks() fills the canvas, detail() docks under it
# and a bar click opens a side drawer with task_detail(task).
from datetime import date

from mateu_ui.uidl import GanttPage, title, ui
from mateu_ui.uidl.components import GanttTask, Text


@ui("gantt-page")
@title("Exhibition schedule")
class ExhibitionSchedule(GanttPage):
    def tasks(self, http_request):
        return [
            GanttTask(id="t1", title="Research & loans", start=date(2026, 9, 1), end=date(2026, 10, 15), progress=100),
            GanttTask(id="t2", title="Catalogue", start=date(2026, 10, 1), end=date(2026, 11, 30), progress=70),
            GanttTask(id="t3", title="Gallery build", start=date(2026, 11, 15), end=date(2026, 12, 20),
                      progress=30, color="#2c6e8f"),
            GanttTask(id="t4", title="Installation", start=date(2026, 12, 15), end=date(2027, 1, 10),
                      progress=0, color="#7b3f8c"),
        ]

    def detail(self, http_request):
        return Text(text="Impressions of light · opens 12 January 2027 · click a bar for its details.")

    def task_detail(self, task):
        return Text(text=f"{task.title}: {task.start} → {task.end} · {round(task.progress)}% done")
